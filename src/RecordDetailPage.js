import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Typography, Avatar, Select, Tabs, Checkbox, message, Space, DatePicker } from 'antd';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { EditOutlined } from '@ant-design/icons';
import RelatedRecord from './RelatedRecords';
import { BASE_URL } from './Constant';
import dayjs from 'dayjs';
import ApiService from './apiService'; // Import ApiService class
 
    
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


  const fetchRecords = async () => {
    try {
      // Fetch the record data
      const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
      const responseData = await apiService.makeCall();
      console.log(responseData); // Process the data as needed
      const recordData = responseData;

      // Fetch the fields for this object
      // const fieldsResponse = await axios.get(`${BASE_URL}/mt_fields/object/${objectName}`);
      // console.log('fieldresponse :', fieldsResponse.data);
      // setFields(fieldsResponse.data);

      const fieldCallout = new ApiService(`${BASE_URL}/mt_fields/object/${objectName}`, {}, 'GET');
      const fieldsResponse = await fieldCallout.makeCall();

      console.log('fieldresponse :', fieldsResponse);
      setFields(fieldsResponse);

      // Process lookup fields to fetch names
      const lookupPromises = fieldsResponse
        .filter(field => field.type === 'lookup' && recordData[field.name.toLowerCase() + '_id'])
        .map(async field => {
          const lookupId = recordData[field.name.toLowerCase() + '_id'];
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
        .filter(field => field.type === 'lookup')
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
      fields.forEach(field => {
        if (field.type === 'lookup') {
          const lookupFieldName = field.name.toLowerCase() + '_id';
          if (bodyData[field.name]) {
            bodyData[lookupFieldName] = bodyData[field.name];
            delete bodyData[field.name];
          } else {
            // Retain the original lookup ID if not edited
            bodyData[lookupFieldName] = initialValues[lookupFieldName];
          }
        }
      });

      const body = {
        object_name: objectName,
        data: {
          _id: record?._id,
          ...bodyData,
        },
      };

      // await axios.post(`${BASE_URL}/insert_or_update_records`, body);

      const apiService = new ApiService(`${BASE_URL}/insert_or_update_records`, {
        'Content-Type': 'application/json', // Add any necessary headers, such as content type
      }, 'POST', body);
      const response = await apiService.makeCall();
      message.success('Record saved successfully');

      // Update initial values
      setInitialValues(values);
      setIsEditable(false);
      fetchRecords();
    } catch (error) {
      console.error('Error saving record', error);
      const errorMessage = error.response?.data?.name
        ? `Failed to update record because ${error.response.data.name[0]}`
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

 
  const renderFieldWithEdit = (field,selectedDate, setSelectedDate) => {
    const { name, label, type, picklist_values, isTextArea } = field;


    const validationRules = [];
    

    if (type === 'Integer') {
      validationRules.push({
        type: 'number',
        transform: value => Number(value),
        min: 0,
        message: 'Please enter a valid integer.',
      });
    } else if (type === 'decimal') {
      validationRules.push({
        type: 'number',
        transform: value => Number(value),
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
        transform: value => Number(value),
        min: 0,
        message: 'Please enter a valid currency value.',
      });
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: !isEditable ? '1px solid #ddd' : 'none',
          paddingBottom: 8,
          marginBottom: 5,
        }}
      >
        {isEditable ? (
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
              <Select placeholder={label} defaultValue={form.getFieldValue(name) || lookupNames[name]}>
                {lookupOptions[name]?.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.Name}
                  </Option>
                ))}
              </Select>
            ) : type === 'Date' ? (
              <Space>
              <DatePicker
                format="DD-MM-YYYY"
                placeholder={label}
                value={selectedDate || (form.getFieldValue(name) ? dayjs(form.getFieldValue(name)) : null)}
                onChange={(date, dateString) => {
                  console.log('Selected Date:', dateString); // Debugging - check if the correct date is selected

                  // Update both the form and local state
                  setSelectedDate(date ? dayjs(dateString) : null);  // Update local state
                  form.setFieldsValue({ [name]: dateString });        // Update form value
                }}
              />
            </Space>
            ) : type === 'Text-Area' ? (
              <TextArea placeholder={label} />
            ) : type === 'currency' ? (
              <Input
                placeholder={label}
                type="number"
                addonBefore="$"
              />
            ) : (
              <Input placeholder={label} type={type === 'date' ? 'date' : 'text'} />
            )}
          </Form.Item>
        ) : (
          <div style={{
            flex: 1,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxWidth: '100%',
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            overflowWrap: 'break-word'
          }}>
            {type === 'boolean'
              ? form.getFieldValue(name)
                ? "True"
                : "False"
              : type === 'currency'
              ? `$${form.getFieldValue(name) || '0.00'}`
              :type === 'Date'
              ? dayjs(form.getFieldValue(name)).format('DD-MM-YYYY')  // Format date to DD-MM-YYYY
              : type === 'String'
              ? form.getFieldValue(name) || ''
              : type === 'Integer'
              ? form.getFieldValue(name) || '0'
              : type === 'Decimal'
              ? form.getFieldValue(name) || '0.00'
              : lookupNames[name] || form.getFieldValue(name)}
          </div>
          
        
        )}
        {!isEditable && (
          <Avatar
            icon={<EditOutlined />}
            size={16}
            style={{ marginLeft: 8, cursor: 'pointer' }}
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
        {objectName}
      </Title>
      <Tabs defaultActiveKey="1" >
        <TabPane tab="Detail" key="1">
          <Form form={form} layout="vertical" onFinish={onFinish}>
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
        </TabPane>
        <TabPane tab="Related" key="2">
          <RelatedRecord objectName={objectName} recordId={id} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RecordDetail;
