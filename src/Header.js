import React, { useState } from 'react';
import { Layout, Menu, Avatar, Input, Drawer, Button } from 'antd';
import { UserOutlined, HomeOutlined, InfoCircleOutlined, PhoneOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Search } = Input;

const AppHeader = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

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

  const onSearch = value => {
    console.log(value);
  };

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        backgroundColor: '#1F4B8F',
        position: 'sticky',
        top: 0,
        zIndex: 1000, // Ensures the header stays on top of other content
        width: '100%',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Button
          className="menu-button"
          icon={<MenuOutlined />}
          onClick={showDrawer}
          style={{
            display: 'none',
            marginRight: '16px',
            color: '#fff',
          }}
        />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          style={{ flex: 1, display: 'flex', backgroundColor: 'transparent', color: '#fff' }}
          className="desktop-menu"
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/home" style={{ color: '#fff' }}>Home</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<InfoCircleOutlined />}>
            <Link to="/about" style={{ color: '#fff' }}>Detail</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<PhoneOutlined />}>
            <Link to="/contact" style={{ color: '#fff' }}>Contact</Link>
          </Menu.Item>
        </Menu>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Search
          placeholder="Search..."
          onSearch={onSearch}
          style={{
            width: '100%',
            maxWidth: '400px',
            minWidth: '200px',
            padding: '8px 16px',
            borderRadius: '24px',
            border: '1px solid #d9d9d9',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          prefix={<SearchOutlined style={{ color: '#888' }} />}
          className="search-bar"
        />
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#fff', color: '#1F4B8F' }} />
      </div>
      <Drawer
        title="Menu"
        placement="right"
        onClose={onClose}
        visible={visible}
        className="mobile-menu"
      >
        <Menu theme="light" mode="vertical" selectedKeys={[getSelectedKey()]} onClick={onClose}>
          <Menu.Item key="1" icon={<HomeOutlined style={{ color: '#1F4B8F' }} />}>
            <Link to="/home" style={{ color: '#1F4B8F' }}>Home</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<InfoCircleOutlined style={{ color: '#1F4B8F' }} />}>
            <Link to="/about" style={{ color: '#1F4B8F' }}>Detail</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<PhoneOutlined style={{ color: '#1F4B8F' }} />}>
            <Link to="/contact" style={{ color: '#1F4B8F' }}>Contact</Link>
          </Menu.Item>
        </Menu>
      </Drawer>
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-menu {
              display: none !important;
            }
            .menu-button {
              display: inline-block !important;
            }
            .search-bar {
              display: inline-block !important;
              width: 80% !important;
              margin-left: 10px;
              margin-right: 10px;
            }
          }
          @media (min-width: 769px) {
            .menu-button {
              display: none !important;
            }
            .search-bar {
              display: inline-block !important;
            }
          }
        `}
      </style>
    </Header>
  );
};

export default AppHeader;
