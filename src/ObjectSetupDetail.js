import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';


const { Title } = Typography;

const ObjectSetupDetail = () => {
  const {  id } = useParams(); // Get objectName and id from the URL
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [objectName, setObjectName] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    console.log('Object Name ' + id)
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/mt_objects/${id}`);
        var objName = response.data.name;
        console.log(response.data.name)
        const records = await axios.get(`http://localhost:3000/fetch_records/${objName}`)
        var allRecords = records.data
        setRecords(allRecords)
        setObjectName(response.data.label);
      } catch (err) {
        setError(err.response.data.error || 'Error fetching records');
      } finally {
        setLoading(false);
      }
    };
      fetchRecords();
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
      render: (text, record) => (
        
        <a onClick={() => handleLabelClick(record)}>{text}</a>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'Name',  // Adjust this field according to your object structure
      key: 'Name',
    },
    // Add more columns as needed
  ];

  const handleLabelClick = (record) => {
    console.log(record)
    console.log("Record ID:", record._id); // Debugging: Check if record.key is correct
    if (record._id) {
      navigate(`/record/${id}/${objectName}/${record._id}`, { state: { record } });
    } else {
      console.error("Record ID is undefined");
    }
  };

  return (
    <div>
      <Title level={3}>Records for {objectName}</Title>
      <Table columns={columns} dataSource={records} rowKey="_id" />
    </div>
  );
};

export default ObjectSetupDetail;

