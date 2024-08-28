// RelatedRecords.js
import React, { useState, useEffect } from 'react';
import { List, Typography, Spin } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const RelatedRecords = ({ lookupField }) => {
  const [relatedRecords, setRelatedRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('lookup field name is '+JSON.stringify(lookupField.objectName));
  console.log('lookup field name is '+JSON.stringify(lookupField.recordId));


  useEffect(() => {
    const fetchRelatedRecords = async () => {

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/fetch_single_record/${lookupField.objectName}/${lookupField.recordId}`);
        setRelatedRecords(response.data);
      } catch (err) {
        console.error('Error fetching related records', err);
      } finally {
        setLoading(false);
      }
    };

    if (lookupField.objectName && lookupField.recordId) {
      fetchRelatedRecords();
    }
  }, [lookupField]);

  return (
    <div>
      <Title level={3}>Related Records</Title>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <List
          bordered
          dataSource={relatedRecords}
          renderItem={item => (
            <List.Item>
              <div>{item.name}</div> {/* Customize as needed */}
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default RelatedRecords;
