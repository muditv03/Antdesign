import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table } from 'antd';


const ObjectPage = () => {
  const { id } = useParams();
  const [objectData, setObjectData] = useState(null);

  useEffect(() => {
    console.log(id);
    const fetchObjectData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/mt_tabs/${id}`);
        setObjectData(response.data); // Set the object data directly
        console.log(response.data); // Log the response data
      } catch (error) {
        console.error('Error fetching object data:', error);
      }
    };

    fetchObjectData();
  }, [id]);

  
  const tableData = [
    { key: '1', column1: 'Data 1', column2: 'Info 1' },
    { key: '2', column1: 'Data 2', column2: 'Info 2' },
    { key: '3', column1: 'Data 3', column2: 'Info 3' },
  ];

  // Define columns for the table
  const columns = [
    {
      title: 'Column 1',
      dataIndex: 'column1',
      key: 'column1',
    },
    {
      title: 'Column 2',
      dataIndex: 'column2',
      key: 'column2',
    },
  ];

  return (
    <div>
    <Table columns={columns} dataSource={tableData} rowKey="key" />
    </div>
  );
};

export default ObjectPage;
