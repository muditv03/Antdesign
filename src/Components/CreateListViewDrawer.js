import React, { useState,useEffect } from 'react';
import { Drawer, Form, Input, Button, Select,message,Card } from 'antd';
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';

const { Option } = Select;

const CreateListViewDrawer = ({ visible, onClose, object,fetchListViews }) => {
  const [form] = Form.useForm();
  const [objectName, setObjectName] = useState([]);
  const [fields, setFields] = useState([]); // State to store fetched fields
  const [selectedFields, setSelectedFields] = useState([]); 

  const fetchFields = async () => {
    try {
      const apiService = new ApiService(
        `${BASE_URL}/mt_fields/object/${object.name}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );
      const response = await apiService.makeCall();
      
      // Assuming the API returns an array of field objects with 'name' and 'label' keys
      setFields(response); // Adjust as per API response structure
      console.log(fields);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const handleFieldChange = (value) => {
    if (value.length > 7) {
      message.error('You can select up to 7 fields.');
      return;
    }
    setSelectedFields(value);
  };

  const onFinish = async (values) => {
    console.log('Form Values: ', values);

    // Construct the request body
    const body = {
      list_view: {
        object_name: objectName,
        list_view_name: values.list_view_name,
        filters: { status: values.filters }, // Assuming you only have a status filter
        fields_to_display: selectedFields,
        sort_by: values.sort_by,
        sort_order: values.sort_order,
      },
    };

    // Make the API call
    try {
      const apiService = new ApiService(
        `${BASE_URL}/create_list_view`, 
        { 'Content-Type': 'application/json' },
        'POST',
        body // Pass the request body
      );
      const response = await apiService.makeCall();
      message.success('List view created successfully!');
      console.log('Response:', response); // Log the response if needed
      fetchListViews();
    } catch (error) {
      console.error('Error creating list view:', error);
      message.error('Failed to create list view. Please try again.');
      fetchListViews();
    }
    form.resetFields();
    onClose(); // Close drawer after submit
  };


  useEffect(() => {
    console.log(JSON.stringify(object));
    console.log(object.name);
    setObjectName(object.name);
    fetchFields(); // Call to fetch fields on object name change

    
  },[]);

  return (
    <Drawer
      title="Create List View"
      width="40%"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => form.submit()} type="primary">
            Submit
          </Button>
        </div>
      }
    >
    <Card 
        style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
      <Form form={form} layout="vertical" onFinish={onFinish} >
        <Form.Item name="object_name" label="Object Name" >
          <Input value={objectName} /> {/* Prefilled and disabled */}
        </Form.Item>

        <Form.Item name="list_view_name" label="List View Name" rules={[{ required: true, message: 'Please enter a list view name' }]}>
          <Input placeholder="Enter list view name" />
        </Form.Item>

        <Form.Item name="filters" label="Filters (Status)">
          <Input placeholder="Active" />
        </Form.Item>

        <Form.Item
            name="fieldsToDisplay"
            label="Fields to Display"
            rules={[{ required: true, message: 'Please select at least one field' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select fields to display"
              onChange={handleFieldChange}
              value={selectedFields}
              options={fields
                .filter((field) => !selectedFields.includes(field.name))
                .map((field) => ({ value: field.name, label: field.label }))} // Ensure unique options
            />
          </Form.Item>

        <Form.Item name="sort_by" label="Sort By">
          <Select placeholder="Select sort field">
            <Option value="created_at">Created At</Option>
            <Option value="Name">Name</Option>
          </Select>
        </Form.Item>

        <Form.Item name="sort_order" label="Sort Order">
          <Select placeholder="Select sort order">
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Select>
        </Form.Item>


       
      </Form>
      </Card>
    </Drawer>
  );
};

export default CreateListViewDrawer;
