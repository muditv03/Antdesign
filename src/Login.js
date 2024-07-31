// src/components/Login.js
import React from 'react';
import { Form, Input, Button, Space, Typography, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Login.css';


const { Text } = Typography;

const Login = () => {
  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h2>Login</h2>
        </div>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Login
              </Button>
              <Link to="/forgot-password">Forgot Password?</Link>
            </Space>
          </Form.Item>
        </Form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Text>New user? </Text>
          <Link to="/signup">Sign Up</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;

