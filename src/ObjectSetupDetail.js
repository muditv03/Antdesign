import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography, Button, Row, Col, Drawer, Form, Input, Checkbox, Card, Dropdown, Menu, message,Select,DatePicker,Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ObjectSetupDetail = () => {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [objectName, setObjectName] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fieldsData, setFieldsData] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [lookupOptions, setLookupOptions] = useState([]);
  const [lookupFieldName, setLookupFieldName] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/mt_objects/${id}`);
        const objName = response.data.name;
        const recordsResponse = await axios.get(`http://localhost:3000/fetch_records/${objName}`);
        setRecords(recordsResponse.data);
        setObjectName(response.data.label);

        const fieldsResponse = await axios.get(`http://localhost:3000/mt_fields/object/${id}`);
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

      setLoading(false);


    };

    fetchRecords();
  }, [id]);

  useEffect(() => {
    if (lookupFieldName) {
      const fetchLookupOptions = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/fetch_records/${lookupFieldName}`);
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
      const response = await axios.get(`http://localhost:3000/mt_fields/object/${id}`);
      setFieldsData(response.data);
    } catch (error) {
      setLoading(false);

      console.error('Error fetching API response:', error);
    }
    setLoading(false);

  };

  const handleEditClick = async (record) => {
    setSelectedRecord(record); // Set the selected record for editing
    form.setFieldsValue(record); // Populate the form with the selected record's data
    setDrawerVisible(true);
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/mt_fields/object/${id}`);
      setFieldsData(response.data);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching API response:', error);
    }
    setLoading(false);

  };
  const handleCloneClick =  (record) => {
    const clonedRecord = { ...record, _id: undefined, isClone: true };
    setSelectedRecord(clonedRecord);
    form.setFieldsValue(clonedRecord);
    setDrawerVisible(true);
  };

  const handleFinish = async (values) => {
    const body = {
      "object_name": objectName,
      "data": {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined ,// If cloning, exclude the ID
        ...values // Spread the form values
      }
    };

    try {
      setLoading(true);

      console.log('body while updating is ' + JSON.stringify(body));
      await axios.post('http://localhost:3000/insert_or_update_records', body);

      message.success(selectedRecord?._id && !selectedRecord?.isClone ? 'Record updated successfully' : 'Record created successfully');
      setDrawerVisible(false);
      form.resetFields();
      //window.location.reload();
    } catch (error) {
      setLoading(false);

      console.error('Error saving record:', error);
      message.error('Failed to save record');
    }
    setLoading(false);

  };

  const handleLabelClick = (record) => {
    if (record._id) {
      navigate(`/record/${id}/${objectName}/${record._id}`, { state: { record } });
    } else {
      console.error("Record ID is undefined");
    }
  };

  const handleMenuClick = (e) => {
    if (e.key === '1') {
      handleEditClick(selectedRecord);
    } else if (e.key === '2') {
      deleteRecord(selectedRecord);
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
      await axios.delete(`http://localhost:3000/delete_record/${objectName}/${record._id}`);
      message.success('Record deleted successfully.');
      window.location.reload();
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }
  };

  const renderFormItem = (field) => {
    switch (field.type) {
      case 'String':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `Please enter ${field.label}` }]}
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
            rules={[{ required: field.required, message: `Please select ${field.label}` }]}
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
            rules={[{ required: field.required, message: `Please select a valid ${field.label}` }]}
          >
            <DatePicker placeholder={`Select ${field.label}`} style={{ width: '100%' }} />
          </Form.Item>
        );

      case 'currency':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
          >
            <Input type="number" step="0.01" placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'decimal':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
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
          rules={[{ required: field.required, message: `Please select ${field.label}` }]}
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
            rules={[{ required: field.required, message: `Please select a ${field.label}` }]}
          >
            <Select placeholder={`Select ${field.label}`}>
              {lookupOptions.map(option => (
                <Select.Option key={option._id} value={option.Name}>
                  {option.name}
                </Select.Option>
              ))}
            </Select>
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
      if (field.type === 'Boolean') {
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
          <Title level={3}>Records for {objectName}</Title>
        </Col>
        <Col>
          <Button type="primary" onClick={handleCreateClick}>
            Create+
          </Button>
        </Col>
      </Row>
      <Table columns={columns} dataSource={records} rowKey="_id" />

      <Drawer
        title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedRecord ? 'Edit Record' : 'Create New Record'}</div>}
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
            {fieldsData?.map((field) => renderFormItem(field))}
          </Form>
        </Card>
        </Spin>
      </Drawer>
    </div>
  );
};

export default ObjectSetupDetail;