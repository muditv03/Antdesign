// src/components/ForgotPassword.js
import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import './ForgotPassword.css';

const { Text } = Typography;

const ForgotPassword = () => {
  const onFinish = (values) => {
    console.log('Reset Password Request:', values);
  };

  return (
    <div className="forgot-password-container">
      <Card className="forgot-password-card">
        <div className="forgot-password-header">
          <h2>Reset Password</h2>
        </div>
        <Form
          name="forgot-password"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
