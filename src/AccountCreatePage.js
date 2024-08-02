import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Layout, Typography, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Success:', values);
    setLoading(true); // Start loading spinner
    setTimeout(() => {
      setLoading(false); // Stop loading spinner before navigating (optional)
      navigate('/home'); // Navigate to the home page upon successful login
    }, 2000); // Simulate a delay for demonstration
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const layoutStyle = {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  };

  const contentStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    position: 'relative',
  };

  const spinnerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  const loginContainerStyle = {
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

  const loginSectionStyle = {
    flex: 1,
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const loginTextStyle = {
    marginBottom: '24px',
  };

  const formItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  };

  const linkStyle = {
    marginLeft: 'auto',
  };

  const loginButtonStyle = {
    marginTop: '24px',
  };

  return (
    <Layout style={layoutStyle}>
      <Content style={contentStyle}>
        {loading ? (
          <Spin size="large" style={spinnerStyle} />
        ) : (
          <div style={loginContainerStyle}>
            <div style={welcomeSectionStyle}>
              <Title level={2} style={welcomeTitleStyle}>
                Welcome Back!
              </Title>
            </div>
            <div style={loginSectionStyle}>
              <Title level={2}>Login</Title>
              <Text style={loginTextStyle}>Please login to your account.</Text>
              <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
              >
                <Form.Item
                  label="User Name"
                  name="username"
                  rules={[{ required: true, message: 'Please input your username!' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <div style={formItemStyle}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Remember Me</Checkbox>
                    </Form.Item>
                    <Link to="/forgot-password" style={linkStyle}>
                      Forgot Password?
                    </Link>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block style={loginButtonStyle}>
                    Login
                  </Button>
                </Form.Item>
              </Form>
              <Text>
                New User? <Link to="/signup">Signup</Link>
              </Text>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Login;
