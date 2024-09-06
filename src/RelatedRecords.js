import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, List, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { BASE_URL } from './Constant';
 
const { Title } = Typography;

const RelatedRecord = ({ objectName, recordId }) => {
  const [relatedData, setRelatedData] = useState(null);

  useEffect(() => {
    const fetchRelatedRecords = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/related_lists/get_all_children/${objectName}/${recordId}`);
        setRelatedData(response.data);
      } catch (err) {
        console.error('Error fetching related records', err);
      }
    };

    fetchRelatedRecords();
  }, [objectName, recordId]);

  if (!relatedData) {
    return <p>Loading...</p>;
  }

  const { child_records: childRecords } = relatedData;

  return (
    <div style={{ padding: '20px', maxHeight: '600px', overflowY: 'auto', overflowX: 'auto' }}>
      {Object.keys(childRecords).map((childObjectName) => (
        <Card
          key={childObjectName}
          title={<Title level={4}>{childObjectName}</Title>}
          bordered={false}
          style={{ marginBottom: '20px' }}
        >
          <List
            itemLayout="horizontal"
            dataSource={childRecords[childObjectName]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Link to={`/record/${childObjectName}/${item._id}`} style={{ color: '#0096FF' }}>
                      {item.Name}
                    </Link>
                  }
                  // description={`ID: ${item._id}`}
                />
              </List.Item>
            )}
          />
        </Card>
      ))}
    </div>
  );
};

export default RelatedRecord;
