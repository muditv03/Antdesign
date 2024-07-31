import React from 'react';
import { Layout, Typography } from 'antd';
import AppHeader from './Header';
import DetailPage from './DetailPage';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const AboutPage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '0 50px', marginTop: '16px', background: '#fff' }}>
        
        {/* Render DetailPage component */}
        <DetailPage />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Aptclouds ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default AboutPage;
