import React from 'react';
import { Typography, Button, Space, Affix ,Layout} from 'antd';

const { Title } = Typography;
const { Header } = Layout;


const HeaderWithActions = ({ title, buttons }) => {
  return (
   
   
    <Header
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      backgroundColor: '#F5F5F5', // Dark theme background
      position: 'fixed',
      top:64,
      right:45,
      width: '90.5%',
      zIndex: 1000,
    }}
  >
      {/* Title Section */}
      <Title level={2} style={{ margin: 0 }}>
        {title}
      </Title>

      {/* Buttons Section */}
      <Space>
        {buttons.map((button, index) => (
          <Button
            key={index}
            type={button.type || 'default'}
            onClick={button.onClick}
            loading={button.loading || false}
            style={button.style || {}}
          >
            {button.label}
          </Button>
        ))}
      </Space>
    </Header>
  );
};

export default HeaderWithActions;
