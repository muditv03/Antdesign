import React, { useState, useEffect } from 'react';
import { Descriptions, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const RecordComponent = () => {
  const { id, objectid, objectName } = useParams(); 
  const [record, setRecord] = useState(null);
  const [fields, setFields] = useState([]);
  
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/fetch_single_record/${objectName}/${id}`);
        setRecord(response.data);

        const fieldsResponse = await axios.get(`http://localhost:3000/mt_fields/object/${objectid}`);
        setFields(fieldsResponse.data);
        console(fieldsResponse.data)
      } catch (err) {
        console.error('Error fetching records', err);
      }
    };
    
    fetchRecords();
  }, []);

  if (!record || fields.length === 0) {
    return <p>Loading...   


        DATA
    </p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Record Details for {objectName}</Title>
      <Descriptions bordered column={1}>
        {fields.map(field => (
          <Descriptions.Item key={field.name} label={field.label || field.name}>
            {record[field.name] || 'N/A'}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </div>
  );
};

export default RecordComponent;
