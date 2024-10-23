import React, { useState } from 'react';
import { Form, Input, Button, Layout, Typography } from 'antd';
import { MailOutlined,LockOutlined,KeyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

const ForgotPassword = () => {

  const [isOTP,SetIsOTP]=useState(false);


  const onFinish = (values) => {
    console.log('values are');
    console.log( values);
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

  const handlesendOTP=()=>{
    SetIsOTP(true);
  }

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

              {!isOTP && (
                <>
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
                <Button type="primary" onClick={handlesendOTP} block style={submitButtonStyle}>
                  Send OTP
                </Button>

              </Form.Item>
              </>
            )}

            {isOTP && (
              <>

              <Form.Item
                label="Enter OTP"
                name="OTP"
                style={formItemStyle}
                rules={[{ required: true, message: 'Please enter OTP' }]}

              >
                <Input prefix={<KeyOutlined />}  />
              </Form.Item>  

              <Form.Item
                label="New Password"
                name="newpassword"
                rules={[{ required: true, message: 'Please input your password!' }]}
                style={formItemStyle}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              {/* Confirm Password Field */}
              <Form.Item
                label="Confirm New Password"
                name="confirmnew"
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newpassword') === value) {
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

              <Form.Item>
                <Button type="primary" htmlType='submit'  block style={submitButtonStyle}>
                  Set New Password
                </Button>

              </Form.Item>
              </>
            )}
            </Form>

            {isOTP &&( 
            <div style={{ position: 'relative' }}> 
              <Text>
                Didn't received OTP?   
              </Text>
              <Button
                type="text"
                style={{color:'#4096ff',padding:2}}
                onClick={() => SetIsOTP(false)}
                >
                Resend OTP
              </Button>
            </div>
            )}

           
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
