import React, { useState, useEffect } from 'react';
import {  Typography, Tabs,Card,Col,Row, message, Button } from 'antd';
import { useParams } from 'react-router-dom';
import RelatedRecord from './RelatedRecords';
import { useLocation } from 'react-router-dom';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService'; // Import ApiService class
import ActivityComponent from '../Activity/ActivityComponent';
import RecordDetails from './RecordDetail'; // Import the new RecordDetails component
import CompactLayout from './CompactLayoutDisplay';


const { Title } = Typography;
const { TabPane } = Tabs;

 

const RecordDetail = () => {
  const location = useLocation(); 
  const { id, objectName } = useParams();
  const { objectid } = location.state || '';  
  const [record, setRecord] = useState([]);
  const [compactlayout,setCompactLayout]=useState([]);
  const [ loading, setLoading ] = useState(false);


  const fetchRecords = async () => {
    try {
      // Fetch the record data
      const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
      const responseData = await apiService.makeCall();
      console.log('real response data is');
      console.log(responseData);
      setRecord(responseData);
      const getlayout= new ApiService(`${BASE_URL}/get_compact_layout/${objectName}`, {}, 'GET');
      const res=await getlayout.makeCall();
      setCompactLayout(res[0]);
    } catch (err) {
      console.error('Error fetching records', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [id, objectid, objectName]);

   

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <CompactLayout compactlayout={compactlayout} record={record} object={objectName} />
      
      <Tabs defaultActiveKey="1" >
        <TabPane tab="Detail" key="1">
      
        {record && Object.keys(record).length > 0 && (
          <RecordDetails
            objectName={objectName}
            id={id}
            fetchRecordData={fetchRecords}
            recordDetails={record}
          />
        )}
          
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