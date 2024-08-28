import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <Footer style={{ textAlign: 'center', padding: '10px 50px', backgroundColor: '#001529', color: '#fff' }}>
      <div style={{ marginBottom: '10px' }}>
        {/* Links to important sections */}
        <a href="/terms" style={{ color: '#fff', margin: '0 10px' }}>Terms of Service</a>
        <a href="/privacy" style={{ color: '#fff', margin: '0 10px' }}>Privacy Policy</a>
        <a href="/contact" style={{ color: '#fff', margin: '0 10px' }}>Contact Us</a>
        <a href="/about" style={{ color: '#fff', margin: '0 10px' }}>About Us</a>
      </div>
      {/* Copyright information */}
      <div>
        © {currentYear} APT CLOUDS. All Rights Reserved.
      </div>
    </Footer>
  );
};

export default AppFooter;
