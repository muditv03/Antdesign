import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <Footer
      style={{
        textAlign: 'center',
        backgroundColor: 'transparent',
        color: '#000',
        padding: '10px 0', // Adjusts the height of the footer
      }}
    >
      {/* Container that holds the content and the line above it */}
      <div
        style={{
          display: 'inline-block', // Shrinks to the width of its content
          textAlign: 'center',
        }}
      >
        {/* Line above the footer content */}
        <div
          style={{
            borderTop: '1px solid #ccc', // Adds a line above the content
            marginBottom: '10px',
            width: '100%', // Makes the line span the width of the content
          }}
        ></div>

        <div
          style={{
            marginBottom: '5px',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap', // Allows items to wrap to the next line if needed
          }}
        >
          {/* Links to important sections */}
          <a href="/terms" style={{ color: '#000', margin: '0 5px' }}>Terms of Service</a>
          <a href="/privacy" style={{ color: '#000', margin: '0 5px' }}>Privacy Policy</a>
          <a href="/contact" style={{ color: '#000', margin: '0 5px' }}>Contact Us</a>
          <a href="/about" style={{ color: '#000', margin: '0 5px' }}>About Us</a>
        </div>
        {/* Copyright information */}
        <div style={{ fontSize: '14px' }}>
          © {currentYear} APT CLOUDS. All Rights Reserved.
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;
