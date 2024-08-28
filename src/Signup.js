import React from 'react';
import { Form, Input, Button, Layout, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Title, Text } = Typography;

const Signup = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const body = {
      username: values.username,
      password: values.password,
      confirm_password: values.confirm,
      name: values.name,
      email: values.email,
      loggedIn: true,
    };

    try {
      // Make the API call to the /register endpoint
      const response = await axios.post('http://localhost:3000/register', {
        logintable: body,
      });

      // Handle successful registration
      message.success('Registration successful!');
      console.log('Success:', response.data);

      // Clear the form fields
      form.resetFields();
    } catch (error) {
      // Handle registration failure
      message.error('Registration failed. Please try again.');
      console.log('Error:', error.response?.data || error.message);
    }
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

  const signupContainerStyle = {
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

  const signupSectionStyle = {
    flex: 1,
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const signupTextStyle = {
    marginBottom: '16px',
  };

  const signupButtonStyle = {
    marginTop: '16px',
  };

  const formItemStyle = {
    marginBottom: '12px', // Reduced spacing between form items
  };

  const titleStyle = {
    marginBottom: '24px', // Added space between the title and first input field
  };

  return (
    <Layout style={layoutStyle}>
      <Content style={contentStyle}>
        <div style={signupContainerStyle}>
          <div style={welcomeSectionStyle}>
            <Title level={2} style={welcomeTitleStyle}>
              Here, Create Your New Account.
            </Title>
          </div>
          <div style={signupSectionStyle}>
            <Title level={2} style={titleStyle}>Signup</Title>
            <Form
              form={form} // Attach the form instance here
              name="signup"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
            >
              {/* Name Field */}
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input your name!' }]}
                style={formItemStyle}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              {/* Username Field */}
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
                style={formItemStyle}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              {/* Email Field */}
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

              {/* Password Field */}
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
                style={formItemStyle}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              {/* Confirm Password Field */}
              <Form.Item
                label="Confirm Password"
                name="confirm"
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
                style={formItemStyle}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              {/* Signup Button */}
              <Form.Item>
                <Button type="primary" htmlType="submit" block style={signupButtonStyle}>
                  Signup
                </Button>
              </Form.Item>
            </Form>
            <Text>
              Already have an account? <Link to="/login">Login</Link>
            </Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Signup;
