import React from 'react';
import { Typography, Button, Space } from 'antd';

const { Title } = Typography;

const HeaderWithActions = ({ title, buttons }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
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
    </div>
  );
};

export default HeaderWithActions;
