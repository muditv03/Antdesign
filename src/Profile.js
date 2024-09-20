






import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Form, Avatar, Typography, Divider } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
const { Content } = Layout;
const { Title, Text } = Typography;
const ProfilePage = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
  });
  useEffect(() => {
    // Retrieve profile data from cookies
    const storedProfile = {
      username: Cookies.get('username') || 'Aptclouds',
      email: Cookies.get('email') || 'user@example.com',
      firstName: Cookies.get('firstName') || '',
      lastName: Cookies.get('lastName') || '',
      address: Cookies.get('address') || '',
      phone: Cookies.get('phone') || '',
    };
    setProfile(storedProfile);
    // Set initial values in the form
    form.setFieldsValue(storedProfile);
  }, [form]);
  const onFinish = (values) => {
    console.log('Profile Data:', values);
    // Save the updated profile data
  };
  const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#E6F7FF',
  };
  const labelStyle = {
    fontWeight: 'bold',
  };
  const cardStyle = {
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
  const headerContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px 0',
  };
  const headerStyle = {
    backgroundColor: '#1890FF', // Any shade of blue you prefer
    color: '#FFFFFF',
    textAlign: 'center',
    padding: '5px 20px', // Reduced padding
    fontSize: '24px',
    fontWeight: 'bold',
    borderRadius: '5px',
  };
  const layoutStyle = {
    minHeight: '100vh',
    backgroundColor: '#AFEEEE', // Black background color
    padding: '20px',
  };
  return (
    <Layout style={layoutStyle}>
      {/* Hello text header */}
      <div style={headerContainerStyle}>
        <div style={headerStyle}>Hello</div>
      </div>
      <Content
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Sidebar Card */}
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: '20px' }} />
              <Title level={3}>{profile.username || 'User Name'}</Title>
              <Text type="secondary">{profile.email}</Text>
              <div style={{ marginTop: '20px' }}>
                <Button type="primary" style={{ marginRight: '10px' }}>Follow</Button>
                <Button>Message</Button>
              </div>
            </div>
            <Divider />
          </div>
          {/* Main Profile Information */}
          <div style={cardStyle}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                username: profile.username,
                email: profile.email,
                fullName: `${profile.firstName} ${profile.lastName}`,
                phone: profile.phone,
                address: profile.address,
              }}
            >
              {/* Username Field */}
              <Form.Item
                label={<span style={labelStyle}>Username</span>}
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input placeholder="Username" style={inputStyle} />
              </Form.Item>
              <Form.Item
                label={<span style={labelStyle}>Full Name</span>}
                name="fullName"
              >
                <Input placeholder="Full Name" style={inputStyle} />
              </Form.Item>
              <Form.Item
                label={<span style={labelStyle}>Email</span>}
                name="email"
                rules={[{ required: true, message: 'Please input your email!' }]}
              >
                <Input type="email" placeholder="Email" style={inputStyle} disabled />
              </Form.Item>
              <Form.Item
                label={<span style={labelStyle}>Phone</span>}
                name="phone"
                rules={[{ required: true, message: 'Please input your phone number!' }]}
              >
                <Input placeholder="Phone" style={inputStyle} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
    </Layout>
  );
};
export default ProfilePage;