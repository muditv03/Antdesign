import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Card, Checkbox, Select, Spin } from 'antd';
import * as Icons from '@ant-design/icons';
import { BASE_URL } from './Constant';
import ApiService from './apiService'; // Import ApiService class
import pluralize from 'pluralize';
import eventBus from './eventBus'; // Import the event bus

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

  // Utility function to sanitize label and create API name
  const generateApiName = (label) => {
    return label
    .replace(/[^a-zA-Z]/g, '') // Remove all characters except letters (a-z, A-Z)
    .replace(/\s+/g, '')       // Remove all spaces
    .trim();        // .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      // .trim() // Remove leading and trailing spaces
      // .split(/\s+/) // Split by one or more spaces
      // .map((word, index) => {
      //   if (index === 0) {
      //     return word.charAt(0).toLowerCase() + word.slice(1); // First word lowercase
      //   }
      //   return word.charAt(0).toUpperCase() + word.slice(1); // Capitalize other words
      // })
      // .join(''); // Join back into a single string
  };
  

  // Handle label change and update API name
  const handleLabelChange = (e) => {
    const label = e.target.value;
    const currentName = form.getFieldValue('name');
  
    // Only auto-populate the name if it's empty
    if (!currentName) {
      form.setFieldsValue({
        name: generateApiName(label), // Set the API name based on the sanitized label
      });
    }
  };
    

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
      if (editingRecord && editingRecord.key) {
        // Update existing record using ApiService
        const apiService = new ApiService(
          `${BASE_URL}/mt_objects/${editingRecord.key}`,
          { 'Content-Type': 'application/json' },
          'PUT',
          { mt_object: formData }
        );

        response = await apiService.makeCall();

        const newTab = {
          label: values.label,
          name: values.name,
          description: 'All Accounts',
          mt_object_id: response._id, // Use the new object ID from the response
          icon: values.icon,
          addObjectTab: values.addObjectTab,
        };

        if (newTab.icon && newTab.addObjectTab) {
          const apiServiceForTab = new ApiService(
            `${BASE_URL}/mt_tabs`,
            { 'Content-Type': 'application/json' },
            'POST',
            { mt_tab: newTab }
          );

          const tabResponse = await apiServiceForTab.makeCall();

          if (!tabResponse || !tabResponse._id) {
            throw new Error('Failed to create a new tab');
          }
        }
        message.success('Object updated successfully');
        onAddOrEditObject({ ...editingRecord, ...formData }); // Update the object in the parent component
      } else {
        // Create new record using ApiService
        const apiService = new ApiService(
          `${BASE_URL}/mt_objects`,
          { 'Content-Type': 'application/json' },
          'POST',
          { mt_object: formData }
        );

        response = await apiService.makeCall();
        if (response && response._id) {
          message.success('Object created successfully');
        } else {
          throw new Error('Invalid response from server');
        }

        // Create newTab only when object is created successfully
        const newTab = {
          label: values.label,
          name: values.name,
          description: 'All Accounts',
          mt_object_id: response._id, // Use the new object ID from the response
          icon: values.icon,
          addObjectTab: values.addObjectTab,
        };

        if (newTab.icon && newTab.addObjectTab) {
          const apiServiceForTab = new ApiService(
            `${BASE_URL}/mt_tabs`,
            { 'Content-Type': 'application/json' },
            'POST',
            { mt_tab: newTab }
          );

          const tabResponse = await apiServiceForTab.makeCall();

          if (!tabResponse || !tabResponse._id) {
            throw new Error('Failed to create a new tab');
          }
        }

        // Update the list of objects in the parent component
        onAddOrEditObject({
          key: response._id, // Use the ID from the response
          label: values.label,
          name: values.name,
          plurallabel: values.plurallabel,
          addObjectTab: values.addObjectTab,
          icon: values.icon,
        });
      }
      eventBus.emit('objectCreatedOrUpdated'); // Notify that object was created or updated

      onClose(); // Close the drawer upon success
      form.resetFields();
    } catch (error) {
      const errorMessage = error && typeof error === 'object'
      ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
      : 'Failed to save object due to an unknown error';
      message.error(errorMessage);
    } finally {
      setLoading(false); // Stop the spinner
    }
  };
 
  const iconOptions = Object.keys(Icons)
  .filter((iconName) => iconName[0] >= 'A' && iconName[0] <= 'T') // Filter icons from A to T
  .map((iconName) => {
    const IconComponent = Icons[iconName];
    return (
      <Option key={iconName} value={iconName} label={iconName}>
        <span>
          {React.createElement(IconComponent, null)} {/* Render the icon */}
          <span style={{ marginLeft: 8 }}>{iconName}</span> {/* Display icon name */}
        </span>
      </Option>
    );
  });

   

  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{editingRecord ? 'Edit Object' : 'Create New Object'}</div>}
      width="40%"
      onClose={!loading ? onClose : null} // Prevent drawer from closing when loading is true

      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      headerStyle={{
        padding: '20px 16px',
        //background: '#20b2aa',
        background: '#f0f2f5',
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
          <Button onClick={onClose} 
                  disabled={loading} 
                  style={{ height: '34px', width: '90px', fontSize: '14px' }}>
            Cancel
          </Button>
          <Button 
            onClick={() => form.submit()}
            disabled={loading}
            type="primary"
            style={{
              height: '34px',
              width: '90px',
              fontSize: '14px',
              // backgroundColor: 'white',
              // color: '#1890ff',
              border: '1px solid #1890ff',
            }}
          >
            {editingRecord ? 'Save' : 'Save'}
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
              <Input 
                placeholder="Please enter the field label" 
                onBlur={handleLabelChange} // Add onChange handler here
              />
            </Form.Item>
 
            <Form.Item
              name="name"
              label="API Name"
              rules={[
                { required: true, message: 'Please enter the name' },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }

                    // Check for non-alphabetic characters (including numbers, special characters, and spaces)
                    const alphabetOnlyRegex = /^[a-zA-Z]+$/;
                    if (!alphabetOnlyRegex.test(value)) {
                      return Promise.reject(new Error('Name should only contain alphabets without spaces.'));
                    }
                    if (pluralize.isPlural(value)) {
                      return Promise.reject(new Error('API name cannot be plural.'));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Please enter the name" disabled={!!editingRecord}/>
            </Form.Item>
            <Form.Item
              name="plurallabel"
              label="Plural Label"
              rules={[{ required: true, message: 'Please enter the plural label' }]}
            >
              <Input placeholder="Please enter the plural label" />
            </Form.Item>

           
              <>
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
              </>
          
          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateObjectDrawer;
