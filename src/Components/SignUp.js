import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
//import LoginPage from './loginPage.js';
import {BrowserRouter, Link, Switch, Route,Routes} from 'react-router-dom';



const { Title } = Typography;

const SignUp = () => {
 // const [login, setLogin] = useState(true);

  const handleClick = () => {
    console.log('button is clicked component calling...');
    //setLogin(false);
  };

  const [form] = Form.useForm();

  useEffect(() => {
    // Retrieve stored data from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      form.setFieldsValue(JSON.parse(storedUser));
    }
  }, [form]);

  const onFinish = (values) => {
    // Store form values in local storage
    localStorage.setItem('user', JSON.stringify(values));
    console.log('Received values:', values);
    alert('User data stored in local storage');
  };

  return (
    <div>
      {/* {login ? ( */}
        <div style={styles.container}>
          <Row justify="center" align="middle" style={{ height: '100vh' }}>
            <Col>
              <Card style={styles.card}>
                <div style={styles.header}>
                  <Title level={3} style={styles.title}>Sign Up</Title>
                </div>
                <Form form={form} name="signup" layout="vertical" onFinish={onFinish}>
                  <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input your name!' }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please input your phone number!' }]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                  <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input your password!' }]}>
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('The two passwords that you entered do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" style={styles.button}>
                    <Link  to='/login'>Sign Up</Link>
                    </Button>
                  </Form.Item>
                </Form>
                <div style={styles.loginbutton}>
                  Already have an account? <Link to="/login">Login</Link>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
   
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(to right, #ff7e5f, #feb47b)',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 400,
    borderRadius: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    backgroundColor: '#ffffffd9',
  },
  header: {
    textAlign: 'center',
  },
  title: {
    color: 'black',
  },
  button: {
    width: '100%',
    backgroundColor: '#ff7e5f',
    borderColor: '#ff7e5f',
  },
  loginbutton: {
    textAlign: 'center',
  },
  onbutton: {
    fontWeight: 'bold',
  },
};

export default SignUp;





// import React from 'react';
// import { Form, Input, Button, Layout, Typography } from 'antd';
// import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
// import { Link } from 'react-router-dom';
// const { Content } = Layout;
// const { Title, Text } = Typography;
// const Signup = () => {
//   const onFinish = (values) => {
//     console.log('Success:', values);
//   };
//   const onFinishFailed = (errorInfo) => {
//     console.log('Failed:', errorInfo);
//   };
//   const layoutStyle = {
//     minHeight: '100vh',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F0F2F5',
//     overflow: 'hidden',
//   };
//   const contentStyle = {
//     flex: 1,
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: '24px',
//   };
//   const signupContainerStyle = {
//     width: '80vw',
//     height: '80vh',
//     display: 'flex',
//     justifyContent: 'space-between',
//     backgroundColor: '#fff',
//     borderRadius: '8px',
//     boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
//   };
//   const welcomeSectionStyle = {
//     flex: 1,
//     background: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)',
//     borderTopLeftRadius: '8px',
//     borderBottomLeftRadius: '8px',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: '24px',
//   };

//   const welcomeTitleStyle = {
//     color: '#fff',
//     textAlign: 'center',
//   };
//   const signupSectionStyle = {
//     flex: 1,
//     padding: '48px',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//   };
//   const signupTextStyle = {
//     marginBottom: '16px',
//   };
//   const signupButtonStyle = {
//     marginTop: '16px',
//   };
//   const formItemStyle = {
//     marginBottom: '16px',
//   };
//   return (
//     <Layout style={layoutStyle}>
//       <Content style={contentStyle}>
//         <div style={signupContainerStyle}>
//           <div style={welcomeSectionStyle}>
//             <Title level={2} style={welcomeTitleStyle}>
//               Here, Create Your New Account.
//             </Title>
//           </div>
//           <div style={signupSectionStyle}>
//             <Title level={2}>Signup</Title>
//             <Form
//               name="signup"
//               initialValues={{ remember: true }}
//               onFinish={onFinish}
//               onFinishFailed={onFinishFailed}
//               layout="vertical"
//             >
//               <Form.Item
//                 label="User Name"
//                 name="username"
//                 rules={[{ required: true, message: 'Please input your username!' }]}
//                 style={formItemStyle}
//               >
//                 <Input prefix={<UserOutlined />} />
//               </Form.Item>
//               <Form.Item
//                 label="Email"
//                 name="email"
//                 rules={[
//                   { required: true, message: 'Please input your email!' },
//                   { type: 'email', message: 'The input is not valid E-mail!' },
//                 ]}
//                 style={formItemStyle}
//               >
//                 <Input prefix={<MailOutlined />} />
//               </Form.Item>
//               <Form.Item
//                 label="Phone Number"
//                 name="phone"
//                 rules={[{ required: true, message: 'Please input your phone number!' }]}
//                 style={formItemStyle}
//               >
//                 <Input prefix={<PhoneOutlined />} />
//               </Form.Item>
//               <Form.Item
//                 label="Password"
//                 name="password"
//                 rules={[{ required: true, message: 'Please input your password!' }]}
//                 style={formItemStyle}
//               >
//                 <Input.Password prefix={<LockOutlined />} />
//               </Form.Item>
//               <Form.Item
//                 label="Confirm Password"
//                 name="confirm"
//                 rules={[
//                   { required: true, message: 'Please confirm your password!' },
//                   ({ getFieldValue }) => ({
//                     validator(_, value) {
//                       if (!value || getFieldValue('password') === value) {
//                         return Promise.resolve();
//                       }
//                       return Promise.reject(new Error('The two passwords do not match!'));
//                     },
//                   }),
//                 ]}
//                 style={formItemStyle}
//               >
//                 <Input.Password prefix={<LockOutlined/>} />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit" block style={signupButtonStyle}>
//                   Signup
//                 </Button>
//               </Form.Item>
//             </Form>
//             <Text>
//               Already have an account? <Link to="/login">Login</Link>
//             </Text>
//           </div>
//         </div>
//       </Content>
//     </Layout>
//   );
// };
// export default Signup;