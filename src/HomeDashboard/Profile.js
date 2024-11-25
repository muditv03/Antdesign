import React, { useState, useEffect } from 'react';
import { Layout, Input, Form, Avatar, Typography, Row, Col, Card } from 'antd';
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
    title: '',
    companyName: '',
    manager: '',
  });

  useEffect(() => {
    // Retrieve profile data from cookies
    const storedProfile = {
      username: Cookies.get('username') || 'Aptclouds',
      email: Cookies.get('email') || 'user@example.com',
      Name: Cookies.get('name') || '',
      address: Cookies.get('address') || '',
      phone: Cookies.get('phone') || '',
      title: Cookies.get('title') || 'Software Engineer',
      companyName: Cookies.get('companyName') || 'AptClouds',
    };
    setProfile(storedProfile);
    form.setFieldsValue(storedProfile);
  }, [form]);

  const onFinish = (values) => {
    console.log('Profile Data:', values);
    // Save the updated profile data
  };

  const layoutStyle = {
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    padding: '20px',
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f4f6f9',
    padding: '20px',
  };

  const avatarStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Layout style={{ backgroundColor: '#f4f6f9' }}>
      <Content style={{ maxWidth: '100%', padding: '20px' }}>
        <Card bordered={false} style={{ marginBottom: '20px' }}>
          <div style={headerStyle} >
            <div style={avatarStyle}>
              <Avatar size={80} icon={<UserOutlined />} style={{ marginRight: '20px' }} />
              <div>
                <Title level={2}>{profile.Name || 'Name'}</Title>
                <Text type="secondary">{profile.email}</Text>
              </div>
            </div>
          </div>
        </Card>

        <Row gutter={16}>
          <Col span={24}>
            {/* Expanded Details Card to full width */}
            <Card title="Details" bordered={false} style={cardStyle}>
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Name">
                      <Input value={`${profile.Name} `} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Email">
                      <Input value={profile.email} disabled />
                    </Form.Item>
                  </Col>

                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="User Name">
                      <Input value={profile.username} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Title">
                      <Input value={profile.title} disabled />
                    </Form.Item>
                  </Col>


                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Manager">
                      <Input value={profile.manager} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Company Name">
                      <Input value={profile.companyName} disabled />
                    </Form.Item>
                  </Col>

                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ProfilePage;
