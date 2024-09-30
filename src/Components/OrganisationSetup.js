// OrganisationSetup.js
import React, { useState } from 'react';
import { Form, Input, Select, Button, Row, Col, Card, Typography } from 'antd';

const { Title } = Typography;

const OrganisationSetup = () => {
  const [form] = Form.useForm(); // Initialize the Ant Design form
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode

  // Sample initial values
  const initialValues = {
    currency: 'Dollar', // Replace with your default value
    local: 'Local',      // Replace with your default value
  };

  // Function to handle form submission
  const onFinish = (values) => {
    console.log('Form values:', values);
    // Handle form submission logic here (e.g., API call)
    setIsEditing(false); // Exit edit mode after saving
  };

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0, fontSize: '24px' }}>Organisation Setup</Title>
        </Col>
        <Col>
          {!isEditing && (
            <Button 
              type="primary" 
              onClick={() => setIsEditing(true)} 
              style={{ marginRight: '8px' }}
            >
              Edit
            </Button>
          )}
        </Col>
      </Row>
      <Form 
        form={form} 
        layout="vertical" 
        style={{ position: 'relative' }} 
        initialValues={initialValues} // Set initial values
        onFinish={onFinish} // Handle form submission
      >
        <Row gutter={24} style={{ marginBottom: '0px' }}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Default Currency"
              labelCol={{ span: 6 }} // Adjust label column width
              wrapperCol={{ span: 18 }} // Adjust wrapper column width
              style={{ marginBottom: '8px',borderBottom: '1px solid  #ddd' }} // Remove border styling
            >
              {isEditing ? (
                <Select defaultValue={initialValues.currency} style={{ border: 'none', boxShadow: 'none' }}>
                  <Select.Option value="Dollar">Dollar</Select.Option>
                  <Select.Option value="Euro">Euro</Select.Option>
                  <Select.Option value="Pound">Pound</Select.Option>
                  {/* Add more options as needed */}
                </Select>
              ) : (
                <span style={{ fontWeight: 500 }}>{initialValues.currency}</span>
              )}
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Local"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              style={{ marginBottom: '8px',borderBottom: '1px solid  #ddd' }} // Remove border styling
            >
              {isEditing ? (
                <Input defaultValue={initialValues.local} style={{ border: 'none', boxShadow: 'none' }} />
              ) : (
                <span style={{ fontWeight: 500 }}>{initialValues.local}</span>
              )}
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons for Cancel and Save at the bottom */}
        {isEditing && (
          <Row justify="end" style={{ marginTop: '16px' }}>
            <Button 
              style={{ marginRight: '8px' }} 
              onClick={() => setIsEditing(false)} // Cancel button
            >
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}> 
              Save
            </Button>
          </Row>
        )}
      </Form>
    </Card>
  );
};

export default OrganisationSetup;
