import React, { useState, useEffect } from 'react';
import { Menu, Drawer, Grid, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import * as Icons from '@ant-design/icons'; // Import all icons
import axios from 'axios';

const { useBreakpoint } = Grid;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const screens = useBreakpoint();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/mt_tabs');

        const filteredItems = response.data
          .filter(item => item.icon !== null) // Only include items with a non-null icon
          .map(item => {
            const IconComponent = Icons[item.icon]; // Get the actual icon component
            return {
              key: item._id, // Use unique id as the key
              label: item.label,
              icon: IconComponent ? <IconComponent /> : null, // Render the icon component
              // Add other properties if needed, such as "children" for nested menus
            };
          });

        console.log(filteredItems); // Debugging: log the filtered items

        setItems(filteredItems);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchData();
  }, []);

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

  const onClick = (e) => {
    console.log('click', e);
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
            height: 'calc(100vh - 64px)',
            marginTop: '64px',
            position: 'fixed',
            zIndex: 1001,
            backgroundColor: '#1F4B8F',  // Ensure background color is set here
          }}
        >
          {loading ? (
            <p style={{ color: '#fff' }}>Loading...</p> // Display a loading indicator
          ) : (
            <div
              style={{
                height: '100%',
                overflowY: 'auto', // Enable vertical scrolling
                backgroundColor: '#1F4B8F', // Apply background color to the scroll area
              }}
            >
              <Menu
                onClick={onClick}
                style={{ width: '100%', height: '100%'}} // Apply background color to the Menu
                mode="vertical"
                inlineCollapsed={collapsed}
                items={items}
                theme="dark"
              />
            </div>
          )}
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
            bodyStyle={{ backgroundColor: '#1F4B8F', color: '#fff' }} // Ensure Drawer body has the correct background
          >
            {loading ? (
              <p style={{ color: '#fff' }}>Loading...</p> // Display a loading indicator
            ) : (
              <div
                style={{
                  height: '100%',
                  overflowY: 'auto', // Enable vertical scrolling
                  backgroundColor: '#1F4B8F', // Apply background color to the scroll area
                }}
              >
                <Menu
                  onClick={onClick}
                  style={{ width: '100%', height: '100%', backgroundColor: '#1F4B8F' }} // Apply background color to the Menu
                  mode="vertical"
                  items={items}
                  theme="dark"
                />
              </div>
            )}
          </Drawer>
        </>
      )}
    </>
  );
};

export default AppSidebar;
