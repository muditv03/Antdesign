import React, { useState } from 'react';
import { Menu, Drawer, Grid, Button } from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined, MenuOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

const items = [
  {
    key: 'sub1',
    icon: <MailOutlined />,
    label: 'Navigation One',
    children: [
      {
        key: '1-1',
        label: 'Item 1',
        type: 'group',
        children: [
          {
            key: '1',
            label: 'Option 1',
          },
          {
            key: '2',
            label: 'Option 2',
          },
        ],
      },
      {
        key: '1-2',
        label: 'Item 2',
        type: 'group',
        children: [
          {
            key: '3',
            label: 'Option 3',
          },
          {
            key: '4',
            label: 'Option 4',
          },
        ],
      },
    ],
  },
  {
    key: 'sub2',
    icon: <AppstoreOutlined />,
    label: 'Navigation Two',
    children: [
      {
        key: '5',
        label: 'Option 5',
      },
      {
        key: '6',
        label: 'Option 6',
      },
      {
        key: 'sub3',
        label: 'Submenu',
        children: [
          {
            key: '7',
            label: 'Option 7',
          },
          {
            key: '8',
            label: 'Option 8',
          },
        ],
      },
    ],
  },
  {
    key: 'sub4',
    label: 'Navigation Three',
    icon: <SettingOutlined />,
    children: [
      {
        key: '9',
        label: 'Option 9',
      },
      {
        key: '10',
        label: 'Option 10',
      },
      {
        key: '11',
        label: 'Option 11',
      },
      {
        key: '12',
        label: 'Option 12',
      },
    ],
  },
];

const onClick = (e) => {
  console.log('click', e);
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [visible, setVisible] = useState(false);
  const screens = useBreakpoint();

  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      {screens.md ? (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            width: collapsed ? '80px' : '256px',
            transition: 'width 0.2s',
            height: 'calc(100vh - 64px)', // Adjust the height to account for the header
            marginTop: '64px', // Push the sidebar below the header
            position: 'fixed',
            zIndex: 1001, // Ensure sidebar has a higher z-index than the content
            backgroundColor: '#1F4B8F', // Same background color as the header
          }}
        >
          <Menu
            onClick={onClick}
            style={{
              width: '100%',
              height: '100%',
            }}
            mode="vertical"
            inlineCollapsed={collapsed}
            items={items}
            theme="dark"
          />
        </div>
      ) : (
        <>
          <Button
            icon={<MenuOutlined />}
            onClick={showDrawer}
            style={{
              position: 'fixed',
              top: '64px', // Adjust based on header height
              left: '10px',
              zIndex: 1000,
            }}
          />
          <Drawer
            title="Menu"
            placement="left"
            onClose={onClose}
            visible={visible}
            bodyStyle={{ backgroundColor: '#1F4B8F', color: '#fff' }}
          >
            <Menu
              onClick={onClick}
              style={{
                width: '100%',
                height: '100%',
              }}
              mode="vertical"
              items={items}
              theme="dark"
            />
          </Drawer>
        </>
      )}
    </>
  );
};

export default AppSidebar;
