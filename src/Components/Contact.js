import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { HomeOutlined, UserOutlined, MailOutlined, AppstoreOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

const Contact = () => {
  return (
  //  <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={styles.header}>
          <div style={styles.logo} styles={{marginBottom:'50px'}}>AptClouds</div>
          <Menu mode="horizontal" defaultSelectedKeys={['3']} style={styles.menu}>
            <Menu.Item key="1" icon={<HomeOutlined />}>
            
              <Link to="/home">Home</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<UserOutlined />}>
              <Link to="/about">About</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<MailOutlined />}>
              <Link to="/contact">Contact</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<AppstoreOutlined />}>
              <Link to="/services">Services</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={styles.content}>
          <Breadcrumb style={styles.breadcrumb}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </Breadcrumb>
          <div style={styles.siteLayoutContent}>
            Welcome to the Contact Page!
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
    width: '120px',
    //height: '31px',
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

export default Contact;