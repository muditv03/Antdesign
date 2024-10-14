import React, { useState, useEffect } from 'react';
import { Form, Card,Input, Button, Row, Col, Typography, Avatar, Select, Tabs, Checkbox, message, Space, DatePicker } from 'antd';
import { useParams } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';
import RelatedRecord from './RelatedRecords';
import { BASE_URL,DateFormat } from './Constant';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ApiService from './apiService'; // Import ApiService class
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ActivityComponent from './ActivityComponent';
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone); 
     
const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;
 
const RecordDetail = () => {
  const { id, objectid, objectName } = useParams();
  const [form] = Form.useForm();
  const [record, setRecord] = useState(null);
  const [fields, setFields] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [lookupOptions, setLookupOptions] = useState({});
  const [lookupNames, setLookupNames] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [recordName, setRecordName] = useState('');

 
 
  const fetchRecords = async () => {
    try {
      // Fetch the record data
      const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
      const responseData = await apiService.makeCall();
      console.log('record fetched is '+JSON.stringify(responseData)); // Process the data as needed
      const recordData = responseData;
      setRecordName(responseData.Name);


      const fieldCallout = new ApiService(`${BASE_URL}/mt_fields/object/${objectName}`, {}, 'GET');
      const fieldsResponse = await fieldCallout.makeCall();
      const filteredFields = fieldsResponse.filter(field => field.name !== 'recordCount');

      console.log('fieldresponse :', fieldsResponse);
      setFields(filteredFields);
      console.log(JSON.stringify(responseData));
      // Format date fields in recordData
      fieldsResponse.forEach(field => {
        if (field.type === 'Date' && recordData[field.name]) {
          // Format the date using dayjs to 'DD/MM/YYYY'
          recordData[field.name] = dayjs(recordData[field.name]).format(DateFormat);
        }
        if (field.type === 'DateTime' && recordData[field.name]) {
          // Assuming recordData[field.name] is in UTC
          console.log(recordData[field.name]);
          const localDateTime = dayjs(recordData[field.name]).utc().format('DD/MM/YYYY HH:mm:ss'); // Convert to local time
          //console.log('formatted date time is ' + localDateTime.format('DD/MM/YYYY HH:mm:ss'));
          recordData[field.name] = localDateTime; // Store formatted date-time
      }
      // if(field.type==='Address'){
      //   const address=recordData[field.name];
      //   console.log('helu');
      //   console.log(address);
      //   console.log(address.street);
        
      // }
       
      }); 

     
      // Process lookup fields to fetch names
      const lookupPromises = fieldsResponse
        .filter(field => field.type === 'lookup' &&(recordData[field.name+ '_id'] || recordData[field.name.toLowerCase()+ '_id']))
        .map(async field => {
          let lookupId;
        if(field.name==='User'){
          lookupId = recordData[field.name+ '_id'];
          console.log('lookup id after updating is '+lookupId);
        }else{
          lookupId = recordData[field.name.toLowerCase() + '_id'];

        }
          // const lookupResponse = await axios.get(`${BASE_URL}/fetch_single_record/${field.name}/${lookupId}`);

          const fetchSingleRec = new ApiService(`${BASE_URL}/fetch_single_record/${field.name}/${lookupId}`, {}, 'GET');
          const lookupResponse = await fetchSingleRec.makeCall();

          return { [field.name]: lookupResponse.Name };
        });

      const lookupResults = await Promise.all(lookupPromises);
      const lookupNamesMap = lookupResults.reduce((acc, lookupName) => ({ ...acc, ...lookupName }), {});
      setLookupNames(lookupNamesMap);

      // Set the form values with transformed data
      setRecord(recordData);
      form.setFieldsValue(recordData);

      // Store initial values
      setInitialValues(recordData);

      // Fetch lookup field options
      const lookupFieldPromises = fieldsResponse
        .filter(field => field.type === 'lookup' )
        .map(async field => {
          const lookupFieldName = field.name;
          // const lookupResponse = await axios.get(`${BASE_URL}/fetch_records/${lookupFieldName}`);

          const fetchRec = new ApiService(`${BASE_URL}/fetch_records/${lookupFieldName}`, {}, 'GET');
          const lookupResponse = await fetchRec.makeCall();

          return { [lookupFieldName]: lookupResponse };
        });

      const lookupOptionsResults = await Promise.all(lookupFieldPromises);
      const lookupOptionsMap = lookupOptionsResults.reduce((acc, lookupOption) => ({ ...acc, ...lookupOption }), {});
      setLookupOptions(lookupOptionsMap);

    } catch (err) {
      console.error('Error fetching records', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [id, objectid, objectName]);
 
  const onFinish = async (values) => {
    try {
      console.log(values);
      const bodyData = Object.assign({},values);
      
      fields.forEach(field => {
        if (field.type === 'lookup') {
          let lookupFieldName;
          if(field.name==='User'){
            lookupFieldName = field.name + '_id';
          }else{  
          lookupFieldName = field.name.toLowerCase() + '_id';
          }
          bodyData[lookupFieldName] = bodyData[field.name];
          delete bodyData[field.name];
            
          
        }

        if(field.type==='Address'){
          console.log('Checking Address Values')
          console.log(values)
          bodyData[field.name] = {
            street: bodyData[field.name]['street'] || '',
            city: bodyData[field.name]['city'] || '',
            state: bodyData[field.name]['state'] || '',
            postal_code: bodyData[field.name]['postal_code'] || '',
            country: bodyData[field.name]['country'] || '',
          };
   
        }
        
        
      });

      console.log(bodyData);
      var data = Object.assign(bodyData)
      data['_id'] = record?._id;
      const body = {
        object_name: objectName,
        data: data
      };

      console.log(body);
 
      const apiService = new ApiService(`${BASE_URL}/insert_or_update_records`, {
        'Content-Type': 'application/json', // Add any necessary headers, such as content type
      }, 'POST', body);
      await apiService.makeCall();
      message.success('Record saved successfully');

      // Update initial values
      //setInitialValues(values);
      setIsEditable(false);
      fetchRecords();
    } catch (error) {
      //console.error('Error saving record'+ error.response.data[0]);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update record due to an unknown error';
      console.log('Full error:', JSON.stringify(error));

      message.error(errorMessage);  
    }
     
  };

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleCancelClick = () => {
    form.setFieldsValue(initialValues); // Reset to initial values
    setIsEditable(false);
  };

  const renderFieldWithEdit = (field, selectedDate, setSelectedDate) => {
    const { name, label, type, picklist_values, isTextArea } = field;
  
    const validationRules = [];
    if (name === 'recordCount') {
      return null;
    }

  
    if (type === 'Integer') {
      validationRules.push({
        type: 'number',
        transform: (value) => Number(value),
        min: 0,
        message: 'Please enter a valid integer.',
      });
    } else if (type === 'decimal') {
      validationRules.push({
        type: 'number',
        transform: (value) => Number(value),
        min: 0,
        precision: field.decimal_places_after || 2,
        message: 'Please enter a valid decimal number.',
      });
    } else if (type === 'Date') {
      validationRules.push({
        type: 'Date',
        message: 'Please enter a valid date.',
      });
    } else if (type === 'currency') {
      validationRules.push({
        type: 'number',
        transform: (value) => Number(value),
        min: 0,
        message: 'Please enter a valid currency value.',
      });
    } else if (type === 'Email') {
      validationRules.push(
        { type: 'email', message: 'The input is not valid E-mail!' }
      );
    }

    const isFieldEditable = !field.is_auto_number && isEditable;
 
    const   handleAddressChange =(parentField, childField, value)  =>{
     

      console.log(parentField);
      console.log(childField);
      const currentAddress = form.getFieldValue(parentField);
      const newAddress = {
        ...currentAddress,
        [childField]: value,
      };


      console.log(newAddress);
      // form.setFieldValue({parentField:newAddress, childField: undefined});
    }
   
    return (
      <div
        className="editable-field-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: !isEditable ? '1px solid #ddd' : 'none',
          paddingBottom: 0,
          marginBottom: 20,
          position: 'relative', // Added to position the icon correctly
        }}
      >
        {isFieldEditable ? (
          <>
            {type === 'boolean' ? (
              <Form.Item
              name={name}
              label={label}
              key={name}
              valuePropName={type === 'boolean' ? 'checked' : 'value'}
              initialValue={form.getFieldValue(name)}
              rules={validationRules}
              noStyle
            >
              <Checkbox>{label}</Checkbox>
              </Form.Item>
            ) : type === 'Picklist' ? (
              <Form.Item
            name={name}
            label={label}
            key={name}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
              <Select placeholder={label}>
                {picklist_values?.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
              </Form.Item>
            ) : type === 'lookup' ? (
              <Form.Item
            name={name}
            label={label}
            key={name}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
              <Select 
                allowClear 
                placeholder={label} 
                defaultValue={form.getFieldValue(name) || lookupNames[name]}
                onChange={(value) => {
                  // If cleared, set the value to null for this specific field
                  if (!value) {
                    form.setFieldsValue({ [name]: null });
                  } else {
                    form.setFieldsValue({ [name]: value });
                  }
                }}>
                {lookupOptions[name]?.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.Name}
                  </Option>
                ))}
              </Select>
              </Form.Item>
            ) : type === 'Date' ? (
              <Form.Item
            name={name}
            label={label}
            key={name}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
              <Space>
                <DatePicker
                  placeholder={`Select ${field.label}`}
                  style={{ width: '100%' }}
                  format={DateFormat}
                  value={form.getFieldValue(field.name) ? dayjs(form.getFieldValue(field.name), DateFormat) : null}
                  onChange={(date, dateString) => {
                    setSelectedDate(date ? dayjs(dateString, DateFormat) : null);
                    form.setFieldsValue({ [field.name]: dateString });
                  }}
                />
              </Space>
              </Form.Item>
               ) : type === 'Address' ? (
                <Form.Item 
                key={name}
 // This shows "Address" as the label
              >
                <Row gutter={16} style={{ marginBottom: '16px' }}> {/* Add margin-bottom for spacing between rows */}
                  <Col span={12}>
                  <Form.Item
                   name={[name, 'street']}
                   
                   label="Street"
                   //initialValue={form.getFieldValue(name).street}
                   >

                  <Input placeholder="Street" 
                  // onChange={(e) => handleAddressChange(name, 'street', e.target.value)}

                  />
                  </Form.Item>
                    
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      name={[name, 'city']}
                      
                      label="City"
                     // initialValue={form.getFieldValue(name).city}

                    >
                      <Input placeholder="City" 
                      // onChange={(e) => {
                        
                      //   handleAddressChange(name, 'city', e.target.value)}}

                     />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '16px' }}> {/* Add margin-bottom for spacing between rows */}
                  <Col span={12}>
                    <Form.Item 
                   name={[name, 'state']}
                   label="State" 
                     // initialValue={form.getFieldValue(name).state}

                    >
                      <Input placeholder="State"
                      onChange={(e) => handleAddressChange(name, 'state', e.target.value)}

                       /> 
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                   name={[name, 'postal_code']}
                   label="Postal Code" 
                   // initialValue={form.getFieldValue(name).postal_code}

                    >
                      <Input placeholder="Postal Code" 
                      //  onChange={(e) => handleAddressChange(name, 'postal_code', e.target.value)}
/>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '16px' }}> {/* Add margin-bottom for spacing between rows */}
                  <Col span={12}>
                    <Form.Item 
                      name={[name, 'country']}
                      label="Country" 
                     // initialValue={form.getFieldValue(name).country}
                    >
                      <Input placeholder="Country" />
                    </Form.Item>
                  </Col>
                </Row>
                </Form.Item>
              
            ): type==='DateTime'?(
              <Form.Item
            name={name}
            label={label}
            key={name}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
              <Space>
              <DatePicker
                showTime
                placeholder={`Select ${field.label}`}
                style={{ width: '100%' }}
                format="DD/MM/YYYY HH:mm:ss"
                value={form.getFieldValue(field.name) ? dayjs(form.getFieldValue(field.name),"DD/MM/YYYY HH:mm:ss") : null}
                onChange={(date, dateString) => {
                  setSelectedDate(date ? dayjs(dateString,"DD/MM/YYYY HH:mm:ss") : null);
                  form.setFieldsValue({ [field.name]: dateString });
                }}
              />
              </Space>
              </Form.Item>
           
            ) : type === 'Text-Area' ? (
              <Form.Item
            name={name}
            label={label}
            key={name}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
              <TextArea placeholder={label} />
              </Form.Item>
            ) : type === 'currency' ? (
              <Form.Item
                name={name}
                label={label}
                key={name}
                valuePropName={type === 'boolean' ? 'checked' : 'value'}
                initialValue={form.getFieldValue(name)}
                rules={validationRules}
                noStyle
              >
              <Input placeholder={label} type="number" addonBefore="$" />
              </Form.Item>
            ) : type === 'Email' ? (
              <Form.Item
            name={name}
            label={label}
            key={name}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
              <Input placeholder={label} type="email" />
              </Form.Item>
            ) : type === 'URL' ? (
              <Form.Item
            name={name}
            label={label}
            key={name}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
              <Input placeholder={label} type="url" />
              </Form.Item>
            ) : (
              <Form.Item
            name={name}
            label={label}
            key={name}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
              <Input placeholder={label} type={type === 'date' ? 'date' : 'text'} />
              </Form.Item>
            )}
          </>
        ) : (
          <div
            style={{
              flex: 1,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxWidth: '100%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              overflowWrap: 'break-word',
              fontSize:'16px',
              fontWeight:500
            }}
          >
             {type === 'boolean'
              ? form.getFieldValue(name)
                ? "True"
                : "False"
                : type === 'currency'
                ? `$${form.getFieldValue(name) !== undefined && form.getFieldValue(name) !== null ? parseFloat(form.getFieldValue(name)).toFixed(2) : ''}`
                : type === 'String'
                ? form.getFieldValue(name) || ''
                : type === 'Integer'
                ? form.getFieldValue(name) !== undefined && form.getFieldValue(name) !== null ? form.getFieldValue(name) : ''
                : type === 'Decimal'
                ? form.getFieldValue(name) !== undefined && form.getFieldValue(name) !== null ? form.getFieldValue(name) : ''
                
                : type === 'Email'
                ? form.getFieldValue(name) && (
                    <a href={`mailto:${form.getFieldValue(name)}`}>
                      {form.getFieldValue(name)}
                     </a>
                  )
                  : type === 'URL'
                  ? form.getFieldValue(name) && (
                    <a href={form.getFieldValue(name).startsWith('http') ? form.getFieldValue(name) : `http://${form.getFieldValue(name)}`} target="_blank" rel="noopener noreferrer">
                        {form.getFieldValue(name)}
                      </a>
                    )
                  : type === 'Address'
                  ?form.getFieldValue(name) && ( `${form.getFieldValue(name).street}, ${form.getFieldValue(name).city}, ${form.getFieldValue(name).state}, ${form.getFieldValue(name).postal_code}, ${form.getFieldValue(name).country}`)
                : lookupNames[name] || form.getFieldValue(name)}
          </div>
        )}
        {!isEditable && (
          <Avatar
            icon={<EditOutlined />}
            size={24}
            className="edit-icon"
            style={{
              marginLeft: 8,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'black',
            }}
            onClick={handleEditClick}
          />
        )}
      </div>
    );
  };

  if (!record || fields.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', overflowY: 'auto', }}>
      <Title level={2} style={{  marginTop: '0px' }}>
        {recordName}
      </Title>
      <Tabs defaultActiveKey="1" >
        <TabPane tab="Detail" key="1">
          <Card>
          <Form form={form} layout="vertical" onFinish={onFinish} style={{position: 'relative'}}>
            <Title level={3} style={{ marginTop: '0px' }}>Record Details</Title>
            <Row gutter={24} style={{marginBottom:'0px'}}>
              {fields.map((field, index) => (
                <Col key={index} xs={24} sm={12} style={{marginBottom:-5}}>
                  <Form.Item label={field.label} style={{ marginBottom: -1,padding:'0px' }}>
                    {renderFieldWithEdit(field,selectedDate, setSelectedDate)}
                    </Form.Item>
                  
                </Col>
              ))}
            </Row>
            {isEditable && (
              
              <Row justify="end" style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                  Save
                </Button>
                <Button onClick={handleCancelClick}>
                  Cancel
                </Button>
              </Row>
              
               
            )}
          </Form>
          </Card>
        </TabPane>
        <TabPane tab="Related" key="2">
          <RelatedRecord objectName={objectName} recordId={id} />
        </TabPane>
        <TabPane tab="Activity" key="3">
          <ActivityComponent/>
        </TabPane>

      </Tabs>
    </div>
  );
};

export default RecordDetail;