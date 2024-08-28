import React, { useState } from 'react';
import { Layout, Input, Button, Form, Avatar, Typography, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Profile Data:', values);
  };

  const inputStyle = {
    padding: '10px', // Increase padding for larger input
    fontSize: '16px', // Increase font size for a bigger input box
    backgroundColor: '#E6F7FF', // Light blue background
  };

  const labelStyle = {
    fontWeight: 'bold', // Make labels bold
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          padding: '20px',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '800px' }}>
          {/* Profile Image and Form Heading */}
          <Title level={2} style={{ textAlign: 'left' }}>
            Profile Image
          </Title>
          
          {/* Avatar positioned above the form */}
          <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: '20px' }} />

          {/* Form for user details */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              phoneNumber: '123-456-7890',
            }}
          >
            <Form.Item
              label={<span style={labelStyle}>First Name</span>}
              name="firstName"
              rules={[{ required: true, message: 'Please input your first name!' }]}
            >
              <Input placeholder="First Name" style={inputStyle} />
            </Form.Item>

            <Form.Item
              label={<span style={labelStyle}>Last Name</span>}
              name="lastName"
              rules={[{ required: true, message: 'Please input your last name!' }]}
            >
              <Input placeholder="Last Name" style={inputStyle} />
            </Form.Item>

            <Form.Item
              label={<span style={labelStyle}>Email</span>}
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input type="email" placeholder="Email" style={inputStyle} />
            </Form.Item>

            <Form.Item
              label={<span style={labelStyle}>Phone Number</span>}
              name="phoneNumber"
              rules={[{ required: true, message: 'Please input your phone number!' }]}
            >
              <Input placeholder="Phone Number" style={inputStyle} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default ProfilePage;






