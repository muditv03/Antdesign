import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Layout, Typography, Spin, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useJwt } from "react-jwt";
import {jwtDecode } from "jwt-decode";
import jwtEncode from 'jwt-encode';
import axios from 'axios';
//const sign = require('jwt-encode');
import Cookies from 'js-cookie';
import { BASE_URL } from './Constant';
import ApiService from './apiService'; // Import ApiService class
    
const { Content } = Layout;
const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Generate the JWT token
      const token = jwtEncode(
        { username: values.username, password: values.password },
        'OUR_SECRET', // Replace with your actual secret key
        { algorithm: 'HS256' }
      );

      // Decode the token to verify the payload (optional)
      const decodedToken = jwtDecode(token);
      console.log('Decoded Token:', decodedToken);

      // Make the API call
      // const response = await axios.post(`${BASE_URL}/login`, {
      //   tokens: token,
      // });

      const apiService = new ApiService(`${BASE_URL}/login`, {
        'Content-Type': 'application/json', // Add any necessary headers, such as content type
      }, 'POST', {
        tokens: token,
      });

      const response = await apiService.makeCall();

      console.log('API Response:', response);
      console.log('API Response token:', response.token);

      console.log('username:', response.user.username);

      const tokenRes = response.token;
      const username = response.user.username; // Adjust based on the actual structure
      const email = response.user.email;
      const name = response.user.Name;

      console.log('token generated is '+ tokenRes);

      if (token && username && email ) {
        Cookies.set('tokenRes', tokenRes, { expires: 7 });
        Cookies.set('username', username, { expires: 7 });
        Cookies.set('email', email, { expires: 7 });
        Cookies.set('name', name, { expires: 7 });
        console.log('Token stored in cookie:', Cookies.get('tokenRes'));
        console.log('Username stored in cookie:', Cookies.get('username'));
        console.log('Email stored in cookie:', Cookies.get('email'));
        console.log('Name stored in cookie:', Cookies.get('name'));
      } else {
        console.error('Username is not available in the response');
      }

      // Handle success, navigate to home page
      setLoading(false);
      navigate('/');
    } catch (error) {
      console.error('API Error:', error);
      setLoading(false);

      message.error('Login failed! Enter Correct Credentials.');
    }
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
