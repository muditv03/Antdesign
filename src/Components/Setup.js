import React, { useEffect, useState } from 'react';
import { Tabs,Breadcrumb } from 'antd';
import Home from './Home'; // Import your Home component
import Datable from '../ObjectSetupView'; // Import your Object Setup component

const { TabPane } = Tabs;

const SetupPage = () => {
  const [activeKey, setActiveKey] = useState('home');

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveKey(key); // Set the active tab key
  };

  useEffect(() => {
    // Automatically set the active tab to 'home' on initial load
    setActiveKey('home');
  }, []);

  return (
    <div style={{ padding: '5px' }}>

      

      {/* Tabs navigation */}
      <Tabs activeKey={activeKey} onChange={handleTabChange}>
        <TabPane tab="Home" key="home">
          {/* Render Home component directly inside Home tab */}
          <Home />
        </TabPane>
        <TabPane tab="Object Setup" key="setup/objectManager">
          {/* Render Object Setup component directly inside Object Setup tab */}
          <Datable />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SetupPage;
