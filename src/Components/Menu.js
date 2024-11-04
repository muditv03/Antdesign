import React from 'react';
import { Menu } from 'antd';

const Menubar = ({ onSelect,selectedItem }) => {
  const menuItems = [
    { key: 'Organisation Setup', label: 'Setup Home' },
    { key: 'Users', label: 'Users' },
    { key: 'Custom Tabs', label: 'Custom Tabs' },
    { key: 'Recycle bin', label: 'Recycle bin' },
  ]; 
 
  return (
    <Menu
      mode="inline"
      onClick={(e) => onSelect(e.key)}
      selectedKeys={[selectedItem]}  // Set the selectedKeys prop

      style={{ height: '100%' }}
    >
      {menuItems.map((item) => (
        <Menu.Item key={item.key}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );
};

export default Menubar;
