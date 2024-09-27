// OrganisationSetup.js
import React, { useState } from 'react';
import { Form, Input, Select, Button } from 'antd';

const OrganisationSetup = () => {
  const [form] = Form.useForm(); // Initialize the Ant Design form
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode

  const onFinish = (values) => {
    console.log('Form values:', values);
    // Handle form submission logic here (e.g., API call)
    setIsEditing(false); // Exit edit mode after saving
  };

  return (
    <div style={{ marginTop: '1px', position: 'relative' }}> {/* Adjust margin as needed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Organisation Setup</h2>
        {!isEditing && (
          <Button type="primary" onClick={() => setIsEditing(true)}>Edit</Button> // Edit button
        )}
      </div>
      {isEditing ? ( // Show form if in edit mode
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish} // Handle form submission
        >
          <Form.Item
            label="Default Currency"
            name="currency"
            rules={[{ required: true, message: 'Please input the default currency!' }]} // Validation rule
          >
            <Input placeholder="Enter default currency" defaultValue="Dollar" />
          </Form.Item>
          
          <Form.Item
            label="Local"
            name="local"
            rules={[{ required: true, message: 'Please select a local!' }]} // Validation rule
          >
            <Select placeholder="Select local" defaultValue="USD">
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="INR">INR</Select.Option>
              <Select.Option value="EUR">EUR</Select.Option>
              {/* Add more options as needed */}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
            <Button style={{ marginLeft: '10px' }} onClick={() => setIsEditing(false)}>Cancel</Button> {/* Cancel button */}
          </Form.Item>
        </Form>
      ) : (
        <div>
          <p>Default Currency: Dollar</p>
          <p>Local: USD</p>
        </div>
      )}
    </div>
  );
};

export default OrganisationSetup;
