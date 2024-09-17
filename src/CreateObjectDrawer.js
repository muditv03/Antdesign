import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Card, Checkbox, Select, Spin } from 'antd';
import axios from 'axios';
import * as Icons from '@ant-design/icons';
import { BASE_URL } from './Constant';
import ApiService from './apiService'; // Import ApiService class
    
const { Option } = Select;

const CreateObjectDrawer = ({ visible, onClose, onAddOrEditObject, editingRecord }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue(editingRecord); // Pre-fill form with existing data if editing
    } else {
      form.resetFields(); // Reset form for new object creation
    }
  }, [editingRecord, form]);

  const handleFinish = async (values) => {
    setLoading(true); // Start the spinner
    const formData = {
      label: values.label,
      name: values.name,
      pluralLabel: values.plurallabel,
      addObjectTab: values.addObjectTab,
      icon: values.icon,
    };
  
    try {
      let response;
      if (editingRecord) {
        // Update existing record using ApiService
        const apiService = new ApiService(
          `${BASE_URL}/mt_objects/${editingRecord.key}`,
          {
            'Content-Type': 'application/json',
          },
          'PUT',
          {
            mt_object: formData,
          }
        );
  
        response = await apiService.makeCall(); 
        message.success('Object updated successfully');
        
      } else {
        // Create new record using ApiService
        const apiService = new ApiService(
          `${BASE_URL}/mt_objects`,
          {
            'Content-Type': 'application/json',
          },
          'POST',
          {
            mt_object: formData,
          }
        );
      
        response = await apiService.makeCall();
        
        console.log("API Response:", response); // Log the response for debugging
  
        if (response && response._id) { 
          message.success('Object created successfully');
        } else {
          throw new Error("Invalid response from server");
        }
  
        // Create newTab only when object is created successfully
        const newTab = {
          label: values.label,
          name: values.name,
          description: "All Accounts",
          mt_object_id: response._id, // Use the new object ID from the response
          icon: values.icon,
          addObjectTab: values.addObjectTab,
        };
  
        if (newTab.icon && newTab.addObjectTab) {
          // Create a new instance of ApiService for the tab creation callout
          const apiServiceForTab = new ApiService(
            `${BASE_URL}/mt_tabs`,
            {
              'Content-Type': 'application/json',
            },
            'POST',
            { mt_tab: newTab }
          );
  
          const tabResponse = await apiServiceForTab.makeCall();
  
          // Check if the tab creation was successful
          if (!tabResponse || !tabResponse._id) {
            throw new Error("Failed to create a new tab");
          }
        }
  
        // Update the list of objects
        onAddOrEditObject({
          key: response._id, // Use the ID from the response
          label: values.label,
          name: values.name,
          plurallabel: values.plurallabel,
          addObjectTab: values.addObjectTab,
          icon: values.icon,
        });
      }
  
      onClose(); // Close the drawer upon success
      form.resetFields();
    } catch (error) {
      console.error('Error creating/updating object:', error);
      const errorMessage = error.response?.data?.name
        ? `Failed to create object because ${error.response.data.name[0]}`
        : `Failed to create object due to an unknown error`;
      message.error(errorMessage);
    } finally {
      setLoading(false); // Stop the spinner
    }
  };
  

  const iconOptions = Object.keys(Icons).map((iconName) => {
    const IconComponent = Icons[iconName];
    return (
      <Option key={iconName} value={iconName} label={iconName}>
        <IconComponent /> {iconName}
      </Option>
    );
  });

  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{editingRecord ? 'Edit Object' : 'Create New Object'}</div>}
      width="40%"
      onClose={onClose}
      visible={visible}
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
          <Button onClick={onClose} style={{ height: '47px', width: '120px', fontSize: '18px' }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            disabled={loading}
            type="primary"
            style={{
              height: '47px',
              width: '120px',
              fontSize: '18px',
              backgroundColor: 'white',
              color: '#1890ff',
              border: '1px solid #1890ff',
            }}
          >
            {editingRecord ? 'Save Changes' : 'Save'}
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
            <Form.Item
              name="label"
              label="Label"
              rules={[{ required: true, message: 'Please enter the label' }]}
            >
              <Input placeholder="Please enter the label" />
            </Form.Item>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter the name' }]}
            >
              <Input placeholder="Please enter the name" />
            </Form.Item>
            <Form.Item
              name="plurallabel"
              label="Plural Label"
              rules={[{ required: true, message: 'Please enter the plural label' }]}
            >
              <Input placeholder="Please enter the plural label" />
            </Form.Item>
            <Form.Item
              name="addObjectTab"
              valuePropName="checked"
            >
              <Checkbox>Add Object Tab</Checkbox>
            </Form.Item>
            <Form.Item
              name="icon"
              label="Icon"
            >
              <Select
                placeholder="Select an icon"
                optionLabelProp="label"
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {iconOptions}
              </Select>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateObjectDrawer;
