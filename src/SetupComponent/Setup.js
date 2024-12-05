import React, { useEffect, useState } from 'react';
import { Tabs, Breadcrumb } from 'antd';
import Home from './Home'; // Import your Home component
import Datable from '../Object/ObjectSetupView'; // Import your Object Setup component
import { useLocation } from 'react-router-dom';


const { TabPane } = Tabs;


const SetupPage = () => {
  const [activeKey, setActiveKey] = useState('home');
  const location = useLocation();


  // Handle tab change 
  const handleTabChange = (key) => {
    setActiveKey(key); // Set the active tab key
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    // Set the active tab based on the query parameter
    if (tab === 'objectManager') {
      setActiveKey('setup/objectManager');
    } else {
      setActiveKey('home');
    }

  }, [location.search]);

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
