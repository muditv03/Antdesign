import React from 'react';
import { Menu } from 'antd';

const Menubar = ({ onSelect }) => {
  const menuItems = [
    { key: 'Organisation Setup', label: 'Setup Home' },
    { key: 'Users', label: 'Users' },
    { key: 'Custom Tabs', label: 'Custom Tabs' },
  ]; 

  return (
    <Menu
      mode="inline"
      onClick={(e) => onSelect(e.key)}
      style={{ height: '100%' }}
    >
      {menuItems.map((item) => (
        <Menu.Item key={item.key}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );
};

export default Menubar;
