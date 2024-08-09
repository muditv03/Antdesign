import React, { useState, useEffect } from 'react';
import { Menu, Drawer, Grid, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import * as Icons from '@ant-design/icons'; // Import all icons
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const { useBreakpoint } = Grid;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const screens = useBreakpoint();
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/mt_tabs');
  
        const filteredItems = response.data
          .filter(item => item.icon !== null)
          .map(item => {
            const IconComponent = Icons[item.icon];
  
            console.log('Mapping Item:', item);  // Log each item
  
            return {
              key: item._id,
              label: item.label,
              icon: IconComponent ? <IconComponent /> : null,
              objectName: item.object_name || item.label.toLowerCase(),  // Use item.object_name if available, fallback to lowercased label
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
  
    console.log('Clicked Item:', clickedItem);  // Log to ensure the objectName is correct
  
    if (clickedItem && clickedItem.objectName) {
      navigate(`/object-setup/${clickedItem.objectName}/${e.key}`);
    } else {
      console.error('Object name is missing for the selected item');
    }
  };
  

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
            height: 'calc(100vh - 64px)',
            marginTop: '64px',
            position: 'fixed',
            zIndex: 1001,
            backgroundColor: '#1F4B8F',
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
                onClick={handleClick} // Attach handleClick function here
                style={{ width: '100%', height: '100%' }}
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
                  onClick={handleClick} // Attach handleClick function here
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
    </>
  );
};

export default AppSidebar;
