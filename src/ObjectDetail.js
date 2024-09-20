



import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Typography, Button, Row, Col, message, Tabs, Spin, Space } from 'antd';
import CreateRelatedListDrawer from './CreateRelatedListDrawer'; 
import ApiService from './apiService'; 
import { BASE_URL } from './Constant';
import ObjectFieldTab from './Components/ObjectFieldsTab';
import ObjectRelatedListTab from './Components/ObjectRelatedListTab';

const { Title } = Typography;
const { TabPane } = Tabs;

const ObjectFieldDetail = () => {
  const location = useLocation();
  const { record } = location.state || {};

  return (
    <div>
      <Title level={3}>{record?.label || 'Object Details'}</Title>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Properties" key="1">
          <ObjectFieldTab object={record} />
        </TabPane>
        <TabPane tab="Details" key="2">
          <p>Details content goes here...</p>
        </TabPane>
        <TabPane tab="Related Lists" key="3">
          <ObjectRelatedListTab object={record}/>
        </TabPane>
      </Tabs>
      
    </div>
  );
};

export default ObjectFieldDetail;






