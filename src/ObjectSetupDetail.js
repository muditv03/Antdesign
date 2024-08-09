import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography } from 'antd';

const { Title } = Typography;

const ObjectSetupDetail = () => {
  const { objectName, id } = useParams(); // Get objectName and id from the URL
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/fetch_records`, {
          params: { object_name: objectName }
        });
        setRecords(response.data);
      } catch (err) {
        setError(err.response.data.error || 'Error fetching records');
      } finally {
        setLoading(false);
      }
    };

    if (objectName) {
      fetchRecords();
    }
  }, [objectName]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Name',
      dataIndex: 'name',  // Adjust this field according to your object structure
      key: 'name',
    },
    // Add more columns as needed
  ];

  return (
    <div>
      <Title level={3}>Records for {objectName}</Title>
      <Table columns={columns} dataSource={records} rowKey="_id" />
    </div>
  );
};

export default ObjectSetupDetail;
