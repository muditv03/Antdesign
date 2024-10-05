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

      // Fetch the fields for this object
      // const fieldsResponse = await axios.get(`${BASE_URL}/mt_fields/object/${objectName}`);
      // console.log('fieldresponse :', fieldsResponse.data);
      // setFields(fieldsResponse.data);

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
          const localDateTime = dayjs.utc(recordData[field.name]).local().format('DD/MM/YYYY HH:mm:ss');
          console.log('formatted date time is ' + localDateTime);
          recordData[field.name] = localDateTime;
        } 
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
      const bodyData = { ...values };
      console.log(JSON.stringify(bodyData));
      console.log(fields);
      fields.forEach(field => {
        if (field.type === 'lookup') {
        let lookupFieldName;
        if(field.name==='User'){
          lookupFieldName = field.name + '_id';
          console.log('lookup field name is '+lookupFieldName);
 
        }else{  
         lookupFieldName = field.name.toLowerCase() + '_id';
        }
          if (bodyData[field.name]) {
            console.log('body data while updating is '+bodyData[field.name])
            bodyData[lookupFieldName] = bodyData[field.name];
            delete bodyData[field.name];
          } else {
            bodyData[lookupFieldName] =initialValues[lookupFieldName]; 
          } 
        }
      });

      console.log('body data is '+JSON.stringify(bodyData));
      const body = {
        object_name: objectName,
        data: {
          _id: record?._id,
          ...bodyData,
        },
      };

      console.log('body while updating is '+ JSON.stringify(body));

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
      console.error('Error saving record'+ error.response.data[0]);
      const errorMessage = error.response?.data?.name
        ? `Failed to update record because ${error.response.data[0]}`
        : `Failed to update record due to an unknown error`;

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
          <Form.Item
            name={name}
            label={label}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
            initialValue={form.getFieldValue(name)}
            rules={validationRules}
            noStyle
          >
            {type === 'boolean' ? (
              <Checkbox>{label}</Checkbox>
            ) : type === 'Picklist' ? (
              <Select placeholder={label}>
                {picklist_values?.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            ) : type === 'lookup' ? (
              <Select allowClear placeholder={label} defaultValue={form.getFieldValue(name) || lookupNames[name]}>
                {lookupOptions[name]?.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.Name}
                  </Option>
                ))}
              </Select>
            ) : type === 'Date' ? (
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
            ): type==='DateTime'?(
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
            ) : type === 'Text-Area' ? (
              <TextArea placeholder={label} />
            ) : type === 'currency' ? (
              <Input placeholder={label} type="number" addonBefore="$" />
            ) : type === 'Email' ? (
              <Input placeholder={label} type="email" />
            ) : type === 'URL' ? (
              <Input placeholder={label} type="url" />
            ) : (
              <Input placeholder={label} type={type === 'date' ? 'date' : 'text'} />
            )}
          </Form.Item>
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
      </Tabs>
    </div>
  );
};

export default RecordDetail;