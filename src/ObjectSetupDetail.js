import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography, Button,Tooltip, Popconfirm, Row, Col, Drawer, Form, Input, Checkbox, Card, Dropdown, Menu, message, Select, DatePicker,Spin, Modal,Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DownOutlined, EditOutlined, CopyOutlined, DeleteOutlined  } from '@ant-design/icons';
import { BASE_URL,DateFormat } from './Constant';
import dayjs from 'dayjs';
import CreateRecordDrawer from './CreateRecordDrawer';
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
    setError('');
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
          console.log(recordsResponse);
  
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
      //setLoading(true);
  
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
      //setLoading(true);
  
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
        if (field.type === 'DateTime' && record[field.name]) {
          // Format date to DD/MM/YYYY if the field is of Date type
          formattedRecord[field.name] = dayjs(record[field.name]).format('DD/MM/YYYY HH:mm:ss');
        }
      }); 
  
      setSelectedRecord(formattedRecord);
      form.setFieldsValue(formattedRecord);
      setDrawerVisible(true);
  
      // Fetch all lookup field values and prefill in the form
      const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');
  
      for (const lookupField of lookupFields) {
        const ob = lookupField.name;
        let objectName='';
        if(lookupField.name=='User'){
        objectName = lookupField.name;

        }else{
          objectName = lookupField.name.toLowerCase();

        }        
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
      //setLoading(true);
  
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
        if (field.type === 'DateTime' && clonedRecord[field.name]) {
          // Format date to DD/MM/YYYY if the field is of Date type
          formattedClonedRecord[field.name] = dayjs(clonedRecord[field.name]).format('DD/MM/YYYY HH:mm:ss');
        }
      });
  
      // Set the formatted cloned record values in the form
      setSelectedRecord(formattedClonedRecord);
      form.setFieldsValue(formattedClonedRecord); 
  
      // Prefill all lookup fields
      const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');
  
      for (const lookupField of lookupFields) {
        const ob = lookupField.name;
        let objectName='';
        if(lookupField.name=='User'){
        objectName = lookupField.name;

        }else{
          objectName = lookupField.name.toLowerCase();

        }
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
        if(field.name=='User'){
          updatedValues[`${fieldName}`] = values[fieldName];

        }else{
          updatedValues[`${fieldName.toLowerCase()}`] = values[fieldName];
 
        }
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
      //setLoading(true);
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
 
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  
  const numberOfFieldsToShow = 5;

// Filter fields, but always include the auto-number field
const filteredFieldsData = fieldsData.filter(field => 
  field.type !== 'lookup' && field.name !== 'recordCount'
);

// Separate the "Name" and "Auto-number" fields
const nameField = filteredFieldsData.find(field => field.name === 'Name');
const autoNumberField = filteredFieldsData.find(field => field.is_auto_number);

// Get other fields, excluding "Name" and "Auto-number" fields
const otherFields = filteredFieldsData
  .filter(field => field.name !== 'Name' && !field.is_auto_number)
  .slice(0, numberOfFieldsToShow);

// Combine columns in the desired sequence: Name, Auto-number, other fields
const fieldsToShow = [nameField, autoNumberField, ...otherFields].filter(Boolean); // filter(Boolean) removes undefined

 
  const columns = fieldsToShow.map((field, index) => ({
    title: field.label,
    dataIndex: field.name,
    key: field.name,
    render: (text, record) => {
      if (field.type === 'boolean') {
        return text ? 'True' : 'False';
      } else if (field.type === 'Date') {
        return text ? dayjs(text).format(DateFormat) : ''; // Format date as DD-MM-YYYY
      }else if (field.type === 'DateTime') {
        return text ? dayjs(text).format('DD/MM/YYYY HH:mm:ss') : ''; // Format DateTime as DD/MM/YYYY HH:mm:ss
      } 
      else if (field.type === 'currency') {
        return text ? `$${text.toFixed(2)}` : ''; // Format as currency with dollar sign
      }else if (field.type === 'Integer') {
        return text === undefined || text === null ? '' : text === 0 ? '0' : text; // Show 0 for blank or zero values
      }else if (field.type === 'decimal') {
        return text === undefined || text === null || text === '0' ? '' : Number(text).toFixed(2); // Show 0.00 for blank values
      }else if (field.type === 'Email') {
        return text ? (
          <a href={`mailto:${text}`} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : '';
      } else if (field.type === 'URL') {
        return text ? (
          <a href={text.startsWith('http') ? text : `http://${text}`} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : '';
      }

      return index === 0 ? (
        <a onClick={() => handleLabelClick(record)}>{text}</a>
      ) : (
        text || ''
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
            style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
          />
        </Tooltip>
  
        <Tooltip title="Clone">
          <CopyOutlined
            onClick={() => handleCloneClick(record)}
            style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
          />
        </Tooltip>
  
        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => deleteRecord(record)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined style={{ color: 'red', marginRight: 8, fontSize: '14px', cursor: 'pointer' }} />
          </Popconfirm>
        </Tooltip>
      </>
    ),
  });


  return (
    <Card>

<div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
      <Col>
        <Title level={3} style={{ marginTop:'10px' }}>Records for {objectPluralName}</Title>
      </Col>
      <Col  style={{ marginTop:'10px' }}>
        <Button type="primary" onClick={handleCreateClick} style={{ marginBottom: 5 }}>
          Create+
        </Button>
      </Col>
    </Row>
    <div style={{ flex: 1, overflow: 'auto' }}>

      <Table columns={columns} dataSource={records} rowKey="_id" />
      </div>
     
      <CreateRecordDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onFinish={handleFinish}
        loading={loading}
        fieldsData={fieldsData}
        selectedRecord={selectedRecord}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        form={form}
      />

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
    </Card>

  );
};

export default ObjectSetupDetail;










