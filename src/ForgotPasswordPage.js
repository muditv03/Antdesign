import React from 'react';
import { Form, Input, Button, Layout, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

const ForgotPassword = () => {
  const onFinish = (values) => {
    console.log('Success:', values);
    // Handle the password reset logic here
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const layoutStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    overflow: 'hidden',
  };

  const contentStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
  };

  const forgotPasswordContainerStyle = {
    width: '80vw',
    height: '80vh',
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  const welcomeSectionStyle = {
    flex: 1,
    background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
  };

  const welcomeTitleStyle = {
    color: '#fff',
    textAlign: 'center',
  };

  const forgotPasswordSectionStyle = {
    flex: 1,
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const forgotPasswordTextStyle = {
    marginBottom: '24px',
  };

  const formItemStyle = {
    marginBottom: '16px',
  };

  const submitButtonStyle = {
    marginTop: '16px',
  };

  return (
    <Layout style={layoutStyle}>
      <Content style={contentStyle}>
        <div style={forgotPasswordContainerStyle}>
          <div style={welcomeSectionStyle}>
            <Title level={2} style={welcomeTitleStyle}>
              Forgot Password?
            </Title>
          </div>
          <div style={forgotPasswordSectionStyle}>
            <Title level={2}>Reset Password</Title>
            <Text style={forgotPasswordTextStyle}>Please enter your email to reset your password.</Text>
            <Form
              name="forgot-password"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'The input is not valid E-mail!' },
                ]}
                style={formItemStyle}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block style={submitButtonStyle}>
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
            <Text>
              Remembered your password? <Link to="/login">Login</Link>
            </Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ForgotPassword;
