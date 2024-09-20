import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography, Button,Tooltip, Popconfirm, Row, Col, Drawer, Form, Input, Checkbox, Card, Dropdown, Menu, message, Select, DatePicker,Spin, Modal,Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DownOutlined, EditOutlined, CopyOutlined, DeleteOutlined  } from '@ant-design/icons';
import { BASE_URL,DateFormat } from './Constant';
import dayjs from 'dayjs';
import ApiService from './apiService'; // Import ApiService class
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
        

      
           
const { Title } = Typography;

const ObjectSetupDetail = () => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [objectName, setObjectName] = useState(null);
  const [objectPluralName, setobjectPluralName] = useState(null);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fieldsData, setFieldsData] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [lookupOptions, setLookupOptions] = useState([]);
  const [lookupName, setLookupName] = useState('');
  const [lookupFieldName, setLookupFieldName] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchRecords = () => {
    setLoading(true);
  
    // Fetch object details using ApiService
    const apiServiceForObject = new ApiService(
      `${BASE_URL}/mt_objects/${id}`,
      { 'Content-Type': 'application/json' },
      'GET'
    );
  
    apiServiceForObject.makeCall()
      .then(response => {
        const objName = response.name;
        console.log('Object name:', objName);
  
        // Fetch records and fields in parallel
        const apiServiceForRecords = new ApiService(
          `${BASE_URL}/fetch_records/${objName}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );
  
        const apiServiceForFields = new ApiService(
          `${BASE_URL}/mt_fields/object/${objName}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );
  
        return Promise.all([
          apiServiceForRecords.makeCall(),
          apiServiceForFields.makeCall(),
        ]).then(([recordsResponse, fieldsResponse]) => {
          setRecords(recordsResponse);
          setFieldsData(fieldsResponse.slice(0, 5)); // Get the first 5 fields
  
          // Identify and set the lookup field name
          const lookupField = fieldsResponse.find(field => field.type === 'lookup');
          if (lookupField) {
            setLookupFieldName(lookupField.name);
          }
  
          // Set additional object details
          setObjectName(response.name);
          setobjectPluralName(response.pluralLabel);
        });
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Error fetching records');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  

  useEffect(() => {
    fetchRecords();
  }, [id]);

  useEffect(() => {
    const fetchAllLookupOptions = async () => {
      const lookupFields = fieldsData.filter(field => field.type === 'lookup');
      const lookupOptionsObj = {};
  
      for (const lookupField of lookupFields) {
        try {
          const apiServiceForLookup = new ApiService(
            `${BASE_URL}/fetch_records/${lookupField.name}`,
            { 'Content-Type': 'application/json' },
            'GET'
          );
          const response = await apiServiceForLookup.makeCall();
          lookupOptionsObj[lookupField.name] = response; // Store options for each lookup field
        } catch (error) {
          console.error(`Error fetching lookup options for ${lookupField.name}:`, error);
        }
      }
      setLookupOptions(lookupOptionsObj); // Store all lookup options in state
    };
  
    if (fieldsData.some(field => field.type === 'lookup')) {
      fetchAllLookupOptions();
    }
  }, [fieldsData]);
  
  

  const handleCreateClick = async () => {
    setSelectedRecord(null); // Ensure no record is selected when creating a new record
    form.resetFields(); // Clear the form fields
    setDrawerVisible(true);
  
    try {
      setLoading(true);
  
      // Create an instance of ApiService for fetching fields data
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${objectName}`,
        { 'Content-Type': 'application/json' },
        'GET' // Specify the method as 'GET'
      );
  
      // Fetch the fields data
      const response = await apiServiceForFields.makeCall();
      setFieldsData(response); // Set the response data to fieldsData
  
    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      setLoading(false); // Stop the spinner regardless of success or failure
    }
  };
  

  const handleEditClick = async (record) => {
    // Fetch fields data first to check for date fields
    try {
      setLoading(true);
  
      // Create an instance of ApiService for fetching fields data
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${objectName}`,
        { 'Content-Type': 'application/json' },
        'GET' // Specify the method as 'GET'
      );
  
      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsData(fieldsResponse);
  
      // Format date fields in the record before setting them in the form
      const formattedRecord = { ...record };
  
      // Iterate over the record to identify and format date fields
      fieldsResponse.forEach(field => {
        if (field.type === 'Date' && record[field.name]) {
          // Format date to DD/MM/YYYY if the field is of Date type
          formattedRecord[field.name] = dayjs(record[field.name]).format(DateFormat);
        }
      });
  
      setSelectedRecord(formattedRecord);
      form.setFieldsValue(formattedRecord);
      setDrawerVisible(true);
  
      // Fetch all lookup field values and prefill in the form
      const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');
  
      for (const lookupField of lookupFields) {
        const ob = lookupField.name;
        const objectName = lookupField.name.toLowerCase();
        const recordId = record[`${objectName}_id`];
  
        if (recordId) {
          // Create an instance of ApiService for fetching the single record
          const apiServiceForRecord = new ApiService(
            `${BASE_URL}/fetch_single_record/${ob}/${recordId}`,
            { 'Content-Type': 'application/json' },
            'GET' // Specify the method as 'GET'
          );
  
          const response = await apiServiceForRecord.makeCall();
          console.log('lookup record name is ' + response.Name);
  
          // Store the name in a state to display it in the UI
          setLookupName(prev => ({ ...prev, [lookupField.name]: response.Name }));
  
          // Set the lookup ID in the form
          form.setFieldsValue({
            [lookupField.name]: recordId
          });
        }
      }
  
    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const handleCloneClick = async (record) => {
    // Clone the record and remove the ID, set isClone to true
    const clonedRecord = { ...record, _id: undefined, isClone: true };
  
    try {
      setLoading(true);
  
      // Create an instance of ApiService for fetching fields data
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${objectName}`,
        { 'Content-Type': 'application/json' },
        'GET' // Specify the method as 'GET'
      );
  
      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsData(fieldsResponse);
  
      // Format date fields in the cloned record before setting them in the form
      const formattedClonedRecord = { ...clonedRecord };
  
      // Iterate over the fields to identify and format date fields
      fieldsResponse.forEach(field => {
        if (field.type === 'Date' && clonedRecord[field.name]) {
          // Format date to DD/MM/YYYY if the field is of Date type
          formattedClonedRecord[field.name] = dayjs(clonedRecord[field.name]).format(DateFormat);
        }
      });
  
      // Set the formatted cloned record values in the form
      setSelectedRecord(formattedClonedRecord);
      form.setFieldsValue(formattedClonedRecord); 
  
      // Prefill all lookup fields
      const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');
  
      for (const lookupField of lookupFields) {
        const ob = lookupField.name;
        const objectName = lookupField.name.toLowerCase();
        const recordId = record[`${objectName}_id`];
  
        if (recordId) {
          // Create an instance of ApiService for fetching the single record
          const apiServiceForRecord = new ApiService(
            `${BASE_URL}/fetch_single_record/${ob}/${recordId}`,
            { 'Content-Type': 'application/json' },
            'GET' // Specify the method as 'GET'
          );
  
          const response = await apiServiceForRecord.makeCall();
          console.log('lookup record name is ' + response.Name);
  
          // Store the name in a state to display it in the UI
          setLookupName(prev => ({ ...prev, [lookupField.name]: response.Name }));
  
          // Set the lookup ID in the form
          form.setFieldsValue({
            [lookupField.name]: recordId
          });
        }
      }
  
    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      setLoading(false);
    }
  
    setDrawerVisible(true); // Open the drawer after setting the values
  };
  
  

  const handleFinish = async (values) => {
    const updatedValues = {};
  
    // Iterate through the fields data to check if the field is a lookup
    fieldsData.forEach((field) => {
      const fieldName = field.name;
      if (field.type === 'lookup') {
        // Convert lookup field names to lowercase
        updatedValues[`${fieldName.toLowerCase()}`] = values[fieldName];
      } else {
        // Keep other fields unchanged
        updatedValues[fieldName] = values[fieldName];
      }
    });
  
    console.log('object is '+objectName)

    const body = {
      object_name: objectName,
      data: {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined, // If cloning, exclude the ID
        ...updatedValues // Use the updated values
      }
    };
  
    try {
      setLoading(true);
      console.log('object name is '+objectName)

      console.log('body while updating is ' + JSON.stringify(body));
  
      // Create an instance of ApiService for the POST request
      const apiService = new ApiService(
        `${BASE_URL}/insert_or_update_records`,
        { 'Content-Type': 'application/json' },
        'POST',
        body
      );
  
      await apiService.makeCall();
  
      message.success(selectedRecord?._id && !selectedRecord?.isClone ? 'Record updated successfully' : 'Record created successfully');
      setDrawerVisible(false);
      fetchRecords();
      form.resetFields();
    } catch (error) {
      console.error('Error saving record:', error);
  
      const errorMessage = error.response?.data?.name
        ? `Failed to create record because ${error.response.data.name[0]}`
        : `Failed to create record due to an unknown error`;
  
      message.error(errorMessage);
    } finally {
      setLoading(false); // Ensure loading is stopped regardless of success or failure
    }
  };
  

  const handleLabelClick = (record) => {
    if (record._id) {
      navigate(`/record/${objectName}/${record._id}`, { state: { record } });
    } else {
      console.error("Record ID is undefined");
    }
  };

  const handleMenuClick = (e) => {
    if (e.key === '1') {
      handleEditClick(selectedRecord);
    } else if (e.key === '2') {
      setIsDeleteModalVisible(true);
    }else if (e.key === '3') {
      handleCloneClick(selectedRecord);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Edit</Menu.Item>
      <Menu.Item key="3">Clone</Menu.Item> {/* Add Clone option here */}
      <Menu.Item key="2">Delete</Menu.Item>

    </Menu>
  );

  const deleteRecord = async (record) => {
    try {
      // Create ApiService instance for DELETE request
      const apiService = new ApiService(
        `${BASE_URL}/delete_record/${objectName}/${record._id}`,
        {}, // Headers (if any)
        'DELETE'
      );
  
      await apiService.makeCall();
      message.success('Record deleted successfully.');
      fetchRecords();
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }
  };
  

  const confirmDelete = async () => {
    deleteRecord(selectedRecord);

    setIsDeleteModalVisible(false);

  };
  
  //const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];

 const renderFormItem = (field,selectedDate, setSelectedDate) => {


    switch (field.type) {
      case 'String':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            //rules={[{ required: true, message: `Please enter ${field.label}` }]}
          >
            <Input placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'Integer':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            //rules={[{ required: true, message: `Please enter ${field.label}` }]}

          >
            <Input type="number" placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            valuePropName="checked"
            initialValue={false}
            //rules={[{ required: true, message: `Please select ${field.label}` }]}
          >
            <Checkbox>{field.label}</Checkbox>
          </Form.Item>
        );

        case 'Date':
          return (
            <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            //rules={[{ required: true, message: `Please select a valid ${field.label}` }]}
          >
            <Space>
            <DatePicker
             placeholder={`Select ${field.label}`}
             style={{ width: '100%' }}
             format={DateFormat}
             value={(form.getFieldValue(field.name) ? dayjs(form.getFieldValue(field.name),DateFormat) : null)}
                onChange={(date, dateString) => {
                  console.log('Selected Date:', dateString); // Debugging - check if the correct date is selected

                  // Update both the form and local state

                  setSelectedDate(date ? dayjs(dateString,DateFormat) : null); 
                  console.log('date which is selected is '+selectedDate); // Update local state
                  form.setFieldsValue({ [field.name]: dateString });        // Update form value
                }}           
            />
            </Space>
          </Form.Item>
          
          );


          case 'currency':
            const currencyDecimalPlacesBefore = field.decimal_places_before;
            const currencyDecimalPlacesAfter = field.decimal_places_after;
            console.log('decimal places before for currency is '+ currencyDecimalPlacesBefore);
            console.log('decimal places after for currency is '+ currencyDecimalPlacesAfter);

            // Regex pattern to allow up to 'currencyDecimalPlacesBefore' digits before decimal
            // and 'currencyDecimalPlacesAfter' digits after decimal.
            const regexPattern = new RegExp(`^\\d{1,${currencyDecimalPlacesBefore}}(\\.\\d{0,${currencyDecimalPlacesAfter}})?$`);
            
            // Handler to validate input as per the pattern
            const handleCurrencyInput = (event) => {
              const inputValue = event.target.value;
          
              // Validate using regex pattern
              if (!regexPattern.test(inputValue)) {
                event.preventDefault();
              }
            };
          
            return (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
              >
                <Input
                  addonBefore="$"
                  placeholder={`Enter ${field.label}`}
                  onInput={handleCurrencyInput}
                  maxLength={currencyDecimalPlacesBefore + currencyDecimalPlacesAfter + 1} // Allow max length based on input
                />
              </Form.Item>
            );

      case 'Picklist':
      console.log('Picklist Values:', field); // Log the picklist values

      return (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          //rules={[{ required: true, message: `Please select ${field.label}` }]}
        >
          <Select placeholder={`Select ${field.label}`}>
            {field.picklist_values.map((value) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      );

      case 'lookup':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            //rules={[{ required: true, message: `Please select a ${field.label}` }]}
          >
             <Select
            placeholder={`Select ${field.label}`}
            showSearch
            allowClear
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {lookupOptions[field.name]?.map((option) => (
              <Select.Option key={option._id} value={option._id}>
                {option.Name}
              </Select.Option>
            ))}
          </Select>
          </Form.Item>
        );
        case 'decimal':
          const decimalPlacesBefore = field.decimal_places_before ;
          const decimalPlacesAfter = field.decimal_places_after ;
          console.log('decimal before'+decimalPlacesBefore);
          console.log('decimal after'+decimalPlacesAfter);
    
          const decimalPattern = new RegExp(`^\\d{1,${decimalPlacesBefore}}(\\.\\d{0,${decimalPlacesAfter}})?$`);
    
          return (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              // rules={[
              //   { required: true, message: `Please enter ${field.label}` },
              //   {
              //     pattern: decimalPattern,
              //     message: `Enter a valid number with up to ${decimalPlacesBefore} digits before the decimal and ${decimalPlacesAfter} digits after the decimal.`,
              //   },
              // ]}
            >
              <Input
                placeholder={`Enter ${field.label}`}
                maxLength={decimalPlacesBefore + decimalPlacesAfter + 1} 
              />
            </Form.Item>
          );
    
        case 'Text-Area':
          return (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              //rules={[{ required: true, message: `Please enter ${field.label}` }]}
            >
              <Input.TextArea
                placeholder={`Enter ${field.label}`}
              />
            </Form.Item>
          );

      default:
        return null;
    }
  };


  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  
  const filteredFieldsData = fieldsData.filter(field => field.type !== 'lookup');

  const numberOfFieldsToShow = 5;

  const columns = filteredFieldsData.slice(0, numberOfFieldsToShow).map((field, index) => ({
    title: field.label,
    dataIndex: field.name,
    key: field.name,
    render: (text, record) => {
      if (field.type === 'boolean') {
        return text ? 'True' : 'False';
      } else if (field.type === 'Date') {
        return text ? dayjs(text).format(DateFormat) : 'N/A'; // Format date as DD-MM-YYYY
      }else if (field.type === 'currency') {
        return text ? `$${text.toFixed(2)}` : '$0.00'; // Format as currency with dollar sign
      }else if (field.type === 'Integer') {
        return text === undefined || text === null ? '0' : text === 0 ? '0' : text; // Show 0 for blank or zero values
      }else if (field.type === 'decimal') {
        return text === undefined || text === null || text === '' ? '0.00' : Number(text).toFixed(2); // Show 0.00 for blank values
      }
      return index === 0 ? (
        <a onClick={() => handleLabelClick(record)}>{text}</a>
      ) : (
        text || 'N/A'
      );
    }
  }));

  columns.push({
    title: 'Action',
    key: 'operation',
    render: (_, record) => (
      <>
        <Tooltip title="Edit">
          <EditOutlined
            onClick={() => handleEditClick(record)}
            style={{ marginRight: 8, fontSize: '18px', cursor: 'pointer' }}
          />
        </Tooltip>
  
        <Tooltip title="Clone">
          <CopyOutlined
            onClick={() => handleCloneClick(record)}
            style={{ marginRight: 8, fontSize: '18px', cursor: 'pointer' }}
          />
        </Tooltip>
  
        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => deleteRecord(record)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined style={{ marginRight: 8, fontSize: '18px', cursor: 'pointer' }} />
          </Popconfirm>
        </Tooltip>
      </>
    ),
  });


  return (
    <div>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Records for {objectPluralName}</Title>
        </Col>
        <Col>
          <Button type="primary" onClick={handleCreateClick}>
            Create+
          </Button>
        </Col>
      </Row>
      <Table columns={columns} dataSource={records} rowKey="_id" />

      <Drawer
        title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>
           {selectedRecord?.isClone ? 'Clone Record' : selectedRecord ? 'Edit Record' : 'Create New Record'}

          </div>}
        width="40%"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        headerStyle={{
          padding: '20px 16px',
          background: '#20b2aa',
          borderBottom: '1px solid #e8e8e8',
        }}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 16px',
              background: '#f0f2f5',
              borderTop: '1px solid #e8e8e8',
            }}
          >
            <Button onClick={() => setDrawerVisible(false)} style={{ height: '47px', width: '120px', fontSize: '18px' }}>
              Cancel
            </Button>
            <Button
              onClick={() => form.submit()}
              type="primary"
              style={{
                height: '47px',
                width: '120px',
                fontSize: '18px',
                backgroundColor: 'white',
                color: '#1890ff',
                border: '1px solid #1890ff'
              }}
            >
              Save
            </Button>
          </div>
        }
        footerStyle={{ textAlign: 'right', padding: '0' }}
      >
        <Spin spinning={loading} tip="Loading...">

        <Card
          style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            hideRequiredMark
            onFinish={handleFinish}
            style={{ fontSize: '16px' }}
          >
            {fieldsData?.map((field) => renderFormItem(field,selectedDate, setSelectedDate))}
          </Form>
        </Card>
        </Spin> 
      </Drawer>

      <Modal
        title="Confirm Deletion"
        visible={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        centered
      >
        <p>Are you sure you want to delete this record?</p>
      </Modal>
    </div>
  );
};

export default ObjectSetupDetail;










