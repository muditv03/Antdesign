import React from 'react';
import { Layout, Typography } from 'antd';
import AppHeader from './Header';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const ContactPage = () => {
  const contentStyle = {
    padding: '0 50px',
    marginTop: '16px',
    flex: '1 0 auto',
    background: '#fff',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={contentStyle}>
        <Title level={2}>Contact Us</Title>
        <Paragraph>
          This is the contact page. You can add any content here to provide contact information or a contact form.
        </Paragraph>
      </Content>
      <Footer style={{ textAlign: 'center', flexShrink: 0, }}>
      Aptclouds ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default ContactPage;