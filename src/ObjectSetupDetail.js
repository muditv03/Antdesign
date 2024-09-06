import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography, Button, Row, Col, Drawer, Form, Input, Checkbox, Card, Dropdown, Menu, message, Select, DatePicker,Spin, Modal,Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
import { BASE_URL } from './Constant';
import dayjs from 'dayjs';
 
           
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


  
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/mt_objects/${id}`);
      const objName = response.data.name;
      const recordsResponse = await axios.get(`${BASE_URL}/fetch_records/${objName}`);
      setRecords(recordsResponse.data);
      setObjectName(response.data.label);
      setobjectPluralName(response.data.pluralLabel)

      const fieldsResponse = await axios.get(`${BASE_URL}/mt_fields/object/${objName}`);
      setFieldsData(fieldsResponse.data.slice(0, 5)); // Get the first 5 fields

      // Identify and set the lookup field name
      const lookupField = fieldsResponse.data.find(field => field.type === 'lookup');
      if (lookupField) {
        setLookupFieldName(lookupField.name);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response.data.error || 'Error fetching records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [id]);

  useEffect(() => {
    if (lookupFieldName) {
      const fetchLookupOptions = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/fetch_records/${lookupFieldName}`);
          setLookupOptions(response.data);
        } catch (error) {
          console.error(`Error fetching lookup options for ${lookupFieldName}:`, error);
        }
      };

      fetchLookupOptions();
    }
  }, [lookupFieldName]);

  const handleCreateClick = async () => {
    setSelectedRecord(null); // Ensure no record is selected when creating a new record
    form.resetFields(); // Clear the form fields
    setDrawerVisible(true);
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/mt_fields/object/${objectName}`);
      setFieldsData(response.data);
    } catch (error) {
      setLoading(false);

      console.error('Error fetching API response:', error);
    }
    setLoading(false);

  };

  const handleEditClick = async (record) => {
    setSelectedRecord(record); 
    form.setFieldsValue(record); 
    setDrawerVisible(true);

    try {
      setLoading(true);

      const fieldsResponse = await axios.get(`${BASE_URL}/mt_fields/object/${objectName}`);
      
      setFieldsData(fieldsResponse.data);

      const lookupField = fieldsResponse.data.find(field => field.type === 'lookup');
      if (lookupField) {
        const ob = lookupField.name;
        const objectName = lookupField.name.toLowerCase();
        const recordId = record[`${objectName}_id`];

        if (recordId) {
          const response = await axios.get(`${BASE_URL}/fetch_single_record/${ob}/${recordId}`);
          console.log('lookup record name is ' + response.data.Name);

          // Store the name in a state to display it in the UI
          setLookupName(response.data.Name);
          
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
  const handleCloneClick =  (record) => {
    const clonedRecord = { ...record, _id: undefined, isClone: true };
    setSelectedRecord(clonedRecord);
    form.setFieldsValue(clonedRecord);
    setDrawerVisible(true);
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

    const body = {
      "object_name": objectName,
      "data": {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined, // If cloning, exclude the ID
        ...updatedValues // Use the updated values
      }
    };

    try {
      setLoading(true);

      console.log('body while updating is ' + JSON.stringify(body));
      await axios.post(`${BASE_URL}/insert_or_update_records`, body);

      message.success(selectedRecord?._id && !selectedRecord?.isClone ? 'Record updated successfully' : 'Record created successfully');
      setDrawerVisible(false);
      fetchRecords();
      form.resetFields();
    } catch (error) {
      setLoading(false);

      console.error('Error saving record:', error);
      const errorMessage = error.response?.data?.name
      ? `Failed to create record because ${error.response.data.name[0]}`
      : `Failed to create record due to an unknown error`;


    message.error(errorMessage);    
   }
    setLoading(false);
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
      await axios.delete(`${BASE_URL}/delete_record/${objectName}/${record._id}`);
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

  const renderFormItem = (field,selectedDate, setSelectedDate) => {
    const validationRules = [{ required: true, message: `Please enter ${field.label}` }]; // Ensuring all fields are required


    switch (field.type) {
      case 'String':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: true, message: `Please enter ${field.label}` }]}
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
            rules={[{ required: true, message: `Please enter ${field.label}` }]}

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
            rules={[{ required: true, message: `Please select ${field.label}` }]}
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
            rules={[{ required: true, message: `Please select a valid ${field.label}` }]}
          >
            <Space>
            <DatePicker
             placeholder={`Select ${field.label}`}
             style={{ width: '100%' }}
             format="YYYY-MM-DD"

             value={selectedDate || (form.getFieldValue(field.name) ? dayjs(form.getFieldValue(field.name)) : null)}
                onChange={(date, dateString) => {
                  console.log('Selected Date:', dateString); // Debugging - check if the correct date is selected

                  // Update both the form and local state
                  setSelectedDate(date ? dayjs(dateString) : null);  // Update local state
                  form.setFieldsValue({ [field.name]: dateString });        // Update form value
                }}           
            />
            </Space>
          </Form.Item>
          
          );

      case 'currency':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: true, message: `Please enter ${field.label}` }]}

          >
            <Input type="number" step="0.01" placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );
      case 'Picklist':
      console.log('Picklist Values:', field); // Log the picklist values

      return (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={[{ required: true, message: `Please select ${field.label}` }]}
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
            rules={[{ required: true, message: `Please select a ${field.label}` }]}
          >
            <Select placeholder={`Select ${field.label}`}>
              {lookupOptions.map(option => (
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
              rules={[
                { required: true, message: `Please enter ${field.label}` },
                {
                  pattern: decimalPattern,
                  message: `Enter a valid number with up to ${decimalPlacesBefore} digits before the decimal and ${decimalPlacesAfter} digits after the decimal.`,
                },
              ]}
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
              rules={[{ required: true, message: `Please enter ${field.label}` }]}
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
      <Dropdown
        overlay={menu}
        trigger={['click']}
        onVisibleChange={() => setSelectedRecord(record)}
      >
        <a onClick={(e) => e.preventDefault()}>
          <DownOutlined />
        </a>
      </Dropdown>
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