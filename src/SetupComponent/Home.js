// Home.js
import React, { useState } from 'react';
import { Layout } from 'antd';
import Menubar from './Menu';
import MenuContent from './MenuContent';

const { Sider, Content: AntContent } = Layout;

const Home = () => {
  const [selectedItem, setSelectedItem] = useState('Organisation Setup');

  return (
    <Layout style={{ height: '100vh', width: '100%' }}>
      <Sider width="20%" style={{ backgroundColor: '#f0f2f5' }}>
        <Menubar onSelect={setSelectedItem} selectedItem={selectedItem} />
      </Sider>
      <AntContent style={{ padding: '24px', backgroundColor: '#fff', width: '80%' }}>
        <MenuContent selectedItem={selectedItem} />
      </AntContent>
    </Layout>
  );
};

export default Home;
