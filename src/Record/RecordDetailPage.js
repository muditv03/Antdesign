import React, { useState, useEffect } from 'react';
import {  Typography, Tabs } from 'antd';
import { useParams } from 'react-router-dom';
import RelatedRecord from './RelatedRecords';
import { useLocation } from 'react-router-dom';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService'; // Import ApiService class
import ActivityComponent from '../Activity/ActivityComponent';
import RecordDetails from './RecordDetail'; // Import the new RecordDetails component


const { Title } = Typography;
const { TabPane } = Tabs;



const RecordDetail = () => {
  const location = useLocation(); 
  const { id, objectName } = useParams();
  const { objectid } = location.state || '';  
  const [recordName, setRecordName] = useState('');


  const fetchRecords = async () => {
    try {
      // Fetch the record data
      const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
      const responseData = await apiService.makeCall();
      setRecordName(responseData.Name);
    } catch (err) {
      console.error('Error fetching records', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [id, objectid, objectName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Title level={2} style={{ marginTop: '0px' }}>
        {recordName}
      </Title>

      <Tabs defaultActiveKey="1" style={{ flex: 1, overflow: 'hidden' }}>
        <TabPane tab="Detail" key="1">
          <RecordDetails
            objectName={objectName}
            id={id}
          />
        </TabPane>
        <TabPane tab="Related" key="2">
          <RelatedRecord objectid={objectid} objectName={objectName} recordId={id} />
        </TabPane>
        <TabPane tab="Activity" key="3">
          <ActivityComponent objectName={objectName} recordId={id} />
        </TabPane>
      </Tabs>
    </div>


  );

};

export default RecordDetail;