import React from 'react';
import { Layout, Menu, Avatar } from 'antd';
import { UserOutlined, HomeOutlined, InfoCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();

  const getSelectedKey = () => {
    switch (location.pathname) {
      case '/home':
        return '1';
      case '/about':
        return '2';
      case '/contact':
        return '3';
      default:
        return '1';
    }
  };

  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Menu theme="dark" mode="horizontal" selectedKeys={[getSelectedKey()]} style={{ flex: 1 }}>
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to="/home">Home</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<InfoCircleOutlined />}>
          <Link to="/about">Detail</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<PhoneOutlined />}>
          <Link to="/contact">Contact</Link>
        </Menu.Item>
      </Menu>
      <Avatar icon={<UserOutlined />} />
    </Header>
  );
};

export default AppHeader;