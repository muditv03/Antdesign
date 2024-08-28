
import React, { useState, useEffect } from 'react';
import { Menu, Drawer, Grid, Button, Tooltip } from 'antd';
import { MenuOutlined, PushpinOutlined } from '@ant-design/icons';
import * as Icons from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { useBreakpoint } = Grid;


const AppSidebar = ({ onSidebarToggle, collapsedWidth, expandedWidth }) => {

  const [collapsed, setCollapsed] = useState(true);
  const [fixed, setFixed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedKey, setSelectedKey] = useState(null); // Initialize as null

  const screens = useBreakpoint();
  const navigate = useNavigate();

  useEffect(() => {
    const clearSelectionOnLogin = () => {
      // Clear the selected key from localStorage when the component mounts
      localStorage.removeItem('selectedKey');
      setSelectedKey(null); // Ensure no tab is selected initially
    };

    clearSelectionOnLogin(); // Call the function when component mounts

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/mt_tabs');
        const filteredItems = response.data
          .filter((item) => item.icon !== null)
          .map((item) => {
            const IconComponent = Icons[item.icon];
            return {
              key: item.mt_object_id,
              label: item.label,
              icon: IconComponent ? <IconComponent /> : null,
              objectName: item.object_name || item.label.toLowerCase(),
            };
          });

        setItems(filteredItems);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = (e) => {

    const clickedItem = items.find(item => item.key === e.key);
  

    if (clickedItem && clickedItem.objectName) {
      setSelectedKey(e.key); // Update selected key in state
      localStorage.setItem('selectedKey', e.key); // Store selected key in localStorage
      navigate(`/object/${e.key}`);
    }
  };

  const handleMouseEnter = () => {
    if (!fixed) {
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!fixed) {
      setCollapsed(true);
    }
  };

  const toggleFixed = () => {
    setFixed(!fixed);
    setCollapsed(!fixed ? false : true);
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };


  // Notify parent component about sidebar width changes
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(collapsed ? collapsedWidth : expandedWidth);
    }
  }, [collapsed, collapsedWidth, expandedWidth, onSidebarToggle]);

  const handleLogout = () => {
    // Clear the selected key from localStorage on logout
    localStorage.removeItem('selectedKey');
    
    // Implement the rest of your logout logic here (e.g., clearing tokens, redirecting to login page)
  };


  return (
    <div style={{ display: 'flex' }}>
      {screens.md ? (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            width: collapsed ? collapsedWidth : expandedWidth,
            transition: 'width 0.2s',
            height: 'calc(100vh - 64px)',
            marginTop: '64px',
            position: 'fixed',
            zIndex: 1001,
            backgroundColor: '#1F4B8F',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {loading ? (
            <p style={{ color: '#fff' }}>Loading...</p>
          ) : (
            <div
              style={{
                height: '100%',
                overflowY: 'auto',
                backgroundColor: '#1F4B8F',
              }}
            >
              <Menu
                onClick={handleClick}

                selectedKeys={[selectedKey]} // Highlight the selected key

                style={{ width: '100%', height: '100%' }}
                mode="vertical"
                inlineCollapsed={collapsed}
                items={items}
                theme="dark"
              />
            </div>
          )}
          <Tooltip title={fixed ? 'Keep navigation closed' : 'Keep navigation opened'}>
            <Button
              onClick={toggleFixed}
              icon={<PushpinOutlined />}
              style={{
                margin: '10px',
                backgroundColor: fixed ? '#ff4d4f' : '#fff',
                borderRadius: '50%',
              }}
            />
          </Tooltip>
        </div>
      ) : (
        <>
          <Button
            icon={<MenuOutlined />}
            onClick={showDrawer}
            style={{
              position: 'fixed',
              top: '64px',
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
            {loading ? (
              <p style={{ color: '#fff' }}>Loading...</p>
            ) : (
              <div
                style={{
                  height: '100%',
                  overflowY: 'auto',
                  backgroundColor: '#1F4B8F',
                }}
              >
                <Menu
                  onClick={handleClick}

                  selectedKeys={[selectedKey]} // Highlight the selected key

                  style={{ width: '100%', height: '100%', backgroundColor: '#1F4B8F' }}
                  mode="vertical"
                  items={items}
                  theme="dark"
                />
              </div>
            )}
          </Drawer>
        </>
      )}
      <div style={{ flexGrow: 1 }}></div>
    </div>
  );
};

export default AppSidebar;


