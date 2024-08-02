// import React from 'react';
// import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
// import { MailOutlined } from '@ant-design/icons';

// const { Title, Text } = Typography;

// const ForgotPasswordPage = ({ onLoginClick }) => {
//   const onFinish = (values) => {
//     console.log('Received values:', values);
//     // Add logic to handle forgot password functionality
//   };

//   const styles = {
//     container: {
//       background: 'linear-gradient(to right, #ff758c, #ff7eb3)',
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
//       color: '#ff758c',
//     },
//     button: {
//       width: '100%',
//       backgroundColor: '#ff758c',
//       borderColor: '#ff758c',
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
//             <Title level={3} style={styles.title}>Forgot Password</Title>
//             <Form name="forgotPassword" layout="vertical" onFinish={onFinish}>
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
//               <Form.Item>
//                 <Button type="primary" htmlType="submit" style={styles.button}>
//                   Submit
//                 </Button>
//               </Form.Item>
//             </Form>
//             <Text style={styles.link}>
//               Remember your password? <Button type="link" onClick={onLoginClick}>Go to Login</Button>
//             </Text>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default ForgotPasswordPage;

// // src/App.js
// import React from 'react';
// import { Layout, Menu, Breadcrumb } from 'antd';
// import {
//   HomeOutlined,
//   UserOutlined,
//   SettingOutlined,
//   PieChartOutlined,
//   DesktopOutlined,
//   FileOutlined,
//   TeamOutlined,
//   MailOutlined,
//   AppstoreOutlined,
// } from '@ant-design/icons';

// const { Header, Content, Footer, Sider } = Layout;
// const { SubMenu } = Menu;

// class App extends React.Component {
//   state = {
//     collapsed: false,
//   };

//   onCollapse = (collapsed) => {
//     this.setState({ collapsed });
//   };

//   render() {
//     const { collapsed } = this.state;
//     return (
//       <Layout style={{ minHeight: '100vh' }}>
//         <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
//           <div styles={{marginRight:'50px'}}></div>
//           {/* <div className="logo" style={{ float: 'left', width: '120px', height: '31px', background: 'rgba(255, 255, 255, 0.2)', margin: '16px 24px 16px 0' }} /> */}
//           <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
//             <Menu.Item key="1" icon={<HomeOutlined />}>Home</Menu.Item>
//             <Menu.Item key="2" icon={<UserOutlined />}>About</Menu.Item>
//             <Menu.Item key="3" icon={<MailOutlined />}>Contact</Menu.Item>
//             <Menu.Item key="4" icon={<AppstoreOutlined />}>Services</Menu.Item>
//           </Menu>
//         </Header>
//         <Layout style={{ marginTop: 64 }}>
//           <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
//             <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
//               <Menu.Item key="1" icon={<PieChartOutlined />}>Dashboard</Menu.Item>
//               <Menu.Item key="2" icon={<DesktopOutlined />}>Devices</Menu.Item>
//               <SubMenu key="sub1" icon={<UserOutlined />} title="User">
//                 <Menu.Item key="3">Tom</Menu.Item>
//                 <Menu.Item key="4">Bill</Menu.Item>
//                 <Menu.Item key="5">Alex</Menu.Item>
//               </SubMenu>
//               <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
//                 <Menu.Item key="6">Team 1</Menu.Item>
//                 <Menu.Item key="8">Team 2</Menu.Item>
//               </SubMenu>
//               <Menu.Item key="9" icon={<FileOutlined />}>Files</Menu.Item>
//             </Menu>
//           </Sider>
//           <Layout>
//             <Content style={{ margin: '0 16px' }}>
//               <Breadcrumb style={{ margin: '16px 0' }}>
//                 <Breadcrumb.Item>Home</Breadcrumb.Item>
//                 <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
//               </Breadcrumb>
//               <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
//                 Welcome to the Dashboard!
//               </div>
//             </Content>
//             <Footer style={{ textAlign: 'center' }}>Ant Design ©2023 Created by Ant UED</Footer>
//           </Layout>
//         </Layout>
//       </Layout>
//     );
//   }
// }

// export default App;

// import React from 'react';
// import { Layout, Menu, Breadcrumb } from 'antd';
// import { HomeOutlined, UserOutlined, MailOutlined, AppstoreOutlined } from '@ant-design/icons';
// import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';

// const { Header, Content, Footer } = Layout;

// const App = () => {
//   return (
//   //  <Router>
//       <Layout style={{ minHeight: '100vh' }}>
//         <Header style={styles.header}>
//           <div style={styles.logo} styles={{marginBottom:'50px'}}>AptClouds</div>
//           <Menu mode="horizontal" defaultSelectedKeys={['1']} style={styles.menu}>
//             <Menu.Item key="1" icon={<HomeOutlined />}>
            
//               <Link to="/home">Home</Link>
//             </Menu.Item>
//             <Menu.Item key="2" icon={<UserOutlined />}>
//               <Link to="/about">About</Link>
//             </Menu.Item>
//             <Menu.Item key="3" icon={<MailOutlined />}>
//               <Link to="/contact">Contact</Link>
//             </Menu.Item>
//             <Menu.Item key="4" icon={<AppstoreOutlined />}>
//               <Link to="/services">Services</Link>
//             </Menu.Item>
//           </Menu>
//         </Header>
//         <Content style={styles.content}>
//           <Breadcrumb style={styles.breadcrumb}>
//             <Breadcrumb.Item>Home</Breadcrumb.Item>
//             <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
//           </Breadcrumb>
//           <div style={styles.siteLayoutContent}>
//             Welcome to the Home Page!
//           </div>
//         </Content>
//         <Footer style={styles.footer}>
//           ©2024 AptClouds. All Rights Reserved.
//         </Footer>
//       </Layout>
//    // </Router>
//   );
// };

// const styles = {
//   header: {
//     position: 'fixed',
//     zIndex: 1,
//     width: '100%',
//     display: 'flex',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     boxShadow: '0 2px 8px #f0f1f2',
//   },
//   logo: {
//     float: 'left',
//     width: '120px',
//     height: '31px',
//     color: '#1890ff',
//     fontSize: '20px',
//     fontWeight: 'bold',
//     //margin: '16px 24px 16px 0',
//     textAlign: 'center',
//   },
//   menu: {
//     flex: 1,
//     lineHeight: '64px',
//     backgroundColor: '#ffffff',
//     borderBottom: 'none',
//     display: 'flex',
//     justifyContent: 'flex-end',
//   },
//   content: {
//     padding: '0 50px',
//     marginTop: 64,
//   },
//   breadcrumb: {
//     margin: '16px 0',
//   },
//   siteLayoutContent: {
//     padding: 24,
//     background: '#fff5e6',
//     minHeight: 380,
//     borderRadius: '8px',
//     boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
//   },
//   footer: {
//     textAlign: 'center',
//   },
// };

// export default App;





// import React from 'react';
// import ReactDOM from 'react-dom';
// import {BrowserRouter, Link, Switch, Route,Routes} from 'react-router-dom';
// //import Hello from './Components/Hello';
//  import SignUp from './Components/SignUp';
//  import Login from './Components/loginPage';
//  import ErrorPage from './Components/ForgotPassword';
//  import HomePage from './Components/HomePage';
//  import About from './Components/About';
//  import Contact from './Components/Contact';
//  import Services from './Components/Services';
//  //import CardBox from './Components/CardBox';

// function App(){  
//   console.log("hello app")
//   return(
//     <>

//      <BrowserRouter>
//         <Routes>
//         <Route path="/" element ={<SignUp/>}></Route>
//         <Route path="/login" element ={<Login/>}></Route>
//         <Route path="/signup" element ={<SignUp/>}></Route>
//         <Route path="/forgotPassword" element ={<ErrorPage/>}></Route>
//         <Route path="/home" element ={<HomePage/>}></Route>
//         <Route path="/about" element ={<About/>}></Route>
//         <Route path="/contact" element ={<Contact/>}></Route>
//         <Route path="/services" element ={<Services/>}></Route>
        
//         </Routes>
//         </BrowserRouter> 
//         </>
//   )
// }

//  export default App;
import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { HomeOutlined, UserOutlined, MailOutlined, AppstoreOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';
import { Card } from 'antd';
import CardBox from './Components/CardBox.js';

const { Header, Content, Footer } = Layout;

const HomePage = () => {
  return (
  //  <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={styles.header}>
        <div style={styles.logo} styles={{marginBottom:'50px'}}>Asset Management</div>
         {/* <div style={styles.logo} styles={{marginBottom:'50px'}}>AptClouds</div> */}
          <Menu mode="horizontal" defaultSelectedKeys={['1']} style={styles.menu}>
            <Menu.Item key="1" icon={<HomeOutlined />}>
            
              {/* <Link to="/home">Home</Link> */}
            </Menu.Item>
            <Menu.Item key="2" icon={<UserOutlined />}>
              {/* <Link to="/about">About</Link> */}
            </Menu.Item>
            <Menu.Item key="3" icon={<MailOutlined />}>
              {/* <Link to="/contact">Contact</Link> */}
            </Menu.Item>
            <Menu.Item key="4" icon={<AppstoreOutlined />}>
              {/* <Link to="/services">Services</Link> */}
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={styles.content}>
          <Breadcrumb style={styles.breadcrumb}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </Breadcrumb>
          <div style={styles.siteLayoutContent}>
            Welcome to the Home Page!
           
          </div>
          
        </Content>
        <Footer style={styles.footer}>
          ©2024 AptClouds. All Rights Reserved.
        </Footer>
      </Layout>
   // </Router>
  );
};

const styles = {
  header: {
    position: 'fixed',
    zIndex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px #f0f1f2',
  },
  logo: {
    float: 'left',
    //width: '120px',
   // height: '31px',
    color: '#1890ff',
    fontSize: '20px',
    fontWeight: 'bold',
    //margin: '16px 24px 16px 0',
    textAlign: 'center',
  },
  menu: {
    flex: 1,
    lineHeight: '64px',
    backgroundColor: '#ffffff',
    borderBottom: 'none',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  content: {
    padding: '0 50px',
    marginTop: 64,
  },
  breadcrumb: {
    margin: '16px 0',
  },
  siteLayoutContent: {
    padding: 24,
    background: '#fff5e6',
    minHeight: 380,
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  footer: {
    textAlign: 'center',
  },
};

export default HomePage;


// import React, { useEffect } from 'react';
// import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
// import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';

// const { Title } = Typography;

// const SignupPage = () => {
//   const [form] = Form.useForm();

//   useEffect(() => {
//     // Retrieve stored data from local storage
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       form.setFieldsValue(JSON.parse(storedUser));
//     }
//   }, [form]);

//   const onFinish = (values) => {
//     // Store form values in local storage
//     localStorage.setItem('user', JSON.stringify(values));
//     console.log('Received values:', values);
//     alert('User data stored in local storage');
//   };

//   return (
//     <div style={styles.container}>
//       <Row justify="center" align="middle" style={{ height: '100vh' }}>
//         <Col>
//           <Card style={styles.card}>
//             <div style={styles.header}>
//               <Title level={3} style={styles.title}>Sign Up</Title>
//             </div>
//             <Form
//               form={form}
//               name="signup"
//               layout="vertical"
//               onFinish={onFinish}
//             >
//               <Form.Item
//                 name="name"
//                 label="Name"
//                 rules={[{ required: true, message: 'Please input your name!' }]}
//               >
//                 <Input prefix={<UserOutlined />} />
//               </Form.Item>
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
//                 name="phone"
//                 label="Phone Number"
//                 rules={[{ required: true, message: 'Please input your phone number!' }]}
//               >
//                 <Input prefix={<PhoneOutlined />} />
//               </Form.Item>
//               <Form.Item
//                 name="password"
//                 label="Password"
//                 rules={[{ required: true, message: 'Please input your password!' }]}
//               >
//                 <Input.Password prefix={<LockOutlined />} />
//               </Form.Item>
//               <Form.Item
//                 name="confirmPassword"
//                 label="Confirm Password"
//                 dependencies={['password']}
//                 hasFeedback
//                 rules={[
//                   { required: true, message: 'Please confirm your password!' },
//                   ({ getFieldValue }) => ({
//                     validator(_, value) {
//                       if (!value || getFieldValue('password') === value) {
//                         return Promise.resolve();
//                       }
//                       return Promise.reject(new Error('The two passwords that you entered do not match!'));
//                     },
//                   }),
//                 ]}
//               >
//                 <Input.Password prefix={<LockOutlined />} />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit" style={styles.button}>
//                   Sign Up
//                 </Button>
//               </Form.Item>
//             </Form>
//             <div style={{textAlign:'center'}}>Already have a Account ? <button>Login</button></div>
//           </Card>
//           {/* <div>Already have a acoount?</div> */}
//         </Col>
//       </Row>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     background: 'linear-gradient(to right, #ff7e5f, #feb47b)',
//     height: '100vh',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   card: {
//     width: 400,
//     borderRadius: 8,
//     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//     overflow: 'hidden',
//     backgroundColor: '#ffffffd9',
//   },
//   header: {
//     textAlign: 'center',
//   },
//   image: {
//     width: '100%',
//     height: 'auto',
//     marginBottom: 10,
//   },
//   title: {
//     color: 'black',
//   },
//   button: {
//     width: '100%',
//     backgroundColor: '#ff7e5f',
//     borderColor: '#ff7e5f',
//   },
// };

// export default SignupPage;
