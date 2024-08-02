import React from 'react';
import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage = () => {
  const onFinish = (values) => {
    console.log('Received values:', values);
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
    title: {
      textAlign: 'center',
      marginBottom: 24,
      color: 'black',
    },
    button: {
      width: '100%',
      backgroundColor: '#ff7e5f',
      borderColor: '#ff7e5f',
    },
    link: {
      textAlign: 'center',
      display: 'block',
      marginTop: 16,
    },
  };

  return (
    <div style={styles.container}>
      <Row justify="center" align="middle" style={{ height: '100vh' }}>
        <Col>
          <Card style={styles.card}>
            <Title level={3} style={styles.title}>Login</Title>
            <Form
              name="login"
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={styles.button}>
                <Link  to='/home'>Login</Link>
                </Button>
              </Form.Item>
            </Form>
            
          
            <Text style={styles.link}>
              Forgot Password <Link to="/forgotPassword">Error Page</Link>
            </Text>
            
            <Text style={styles.link}>
            New user? <Link to="/signup">Signup Page</Link>
            </Text>
            
           

          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;





// import React from 'react';
// import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
// import { MailOutlined, LockOutlined } from '@ant-design/icons';
// import {BrowserRouter, Link, Switch, Route,Routes} from 'react-router-dom';


// const { Title, Text } = Typography;

// const LoginPage = ({ onSignupClick }) => {
//   const onFinish = (values) => {
//     console.log('Received values:', values);
//   };

//   const styles = {
//     container: {
//       background: 'linear-gradient(to right, #ff7e5f, #feb47b)',
//       height: '100vh',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     card: {
//       width: 400,
//       borderRadius: 8,
//       boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//       overflow: 'hidden',
//       backgroundColor: '#ffffffd9',
//     },
//     title: {
//       textAlign: 'center',
//       marginBottom: 24,
//       color: '#36d1dc',
//     },
//     button: {
//       width: '100%',
//       backgroundColor: '#36d1dc',
//       borderColor: '#36d1dc',
//     },
//     link: {
//       textAlign: 'center',
//       display: 'block',
//       marginTop: 16,
//     },
//   };

//   return (
//     <div style={styles.container}>
//       <Row justify="center" align="middle" style={{ height: '100vh' }}>
//         <Col>
//           <Card style={styles.card}>
//             <Title level={3} style={styles.title}>Login</Title>
//             <Form name="login" layout="vertical" onFinish={onFinish}>
//               <Form.Item
//                 name="email"
//                 label="Email"
//                 rules={[
//                   { required: true, message: 'Please input your email!' },
//                   { type: 'email', message: 'Please enter a valid email!' }
//                 ]}
//               >
//                 <Input prefix={<MailOutlined />} />
//               </Form.Item>
//               <Form.Item
//                 name="password"
//                 label="Password"
//                 rules={[{ required: true, message: 'Please input your password!' }]}
//               >
//                 <Input.Password prefix={<LockOutlined />} />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit" style={styles.button}>
//                   Login
//                 </Button>
//               </Form.Item>
//             </Form>
//             <Text style={styles.link}>
//               New user? <Button><Link to="/signup"></Link>SignUp</Button>
//             </Text>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default LoginPage;
