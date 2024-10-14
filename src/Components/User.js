import React, { useState, useEffect } from 'react';
import { Table, Spin,Tooltip,Popconfirm,message  } from 'antd';
import { BASE_URL } from '../Constant';
import ApiService from '../apiService'; 
import { DownOutlined, EditOutlined, CopyOutlined, DeleteOutlined  } from '@ant-design/icons';
 

const UserComponent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Set loading to true initially

  const fetchUsers = async () => {
    const apiServiceForLookup = new ApiService(
      `${BASE_URL}/fetch_records/User`,
      { 'Content-Type': 'application/json' },
      'GET'
    );

    try {
      const response = await apiServiceForLookup.makeCall();
      setUsers(response); // Adjust based on the response structure
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchUsers(); // Call fetchUsers when the component mounts
  }, []); // Dependency array to re-fetch if lookupField.name changes

  
  const deleteRecord = async (record) => {
    try {
      // Create ApiService instance for DELETE request
      const apiService = new ApiService(
        `${BASE_URL}/delete_record/User/${record._id}`,
        {}, // Headers (if any)
        'DELETE'
      );
  
      await apiService.makeCall();
      message.success('Record deleted successfully.');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    // Add more columns as needed based on user data
  ];

  columns.push({
    title: 'Action',
    key: 'operation',
    render: (_, record) => (
      <>
        <Tooltip title="Edit">
          <EditOutlined
        
            style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() =>deleteRecord(record)}
            
            
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined style={{  color: 'red',marginRight: 8, fontSize: '14px', cursor: 'pointer' }} />
          </Popconfirm>
        </Tooltip>
      </>
    ),
  });
  return (
    <div>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <Table  title={() => (
          <div style={{ fontWeight: 'bold', fontSize: '24px' }}>User List</div>
        )} // Add bold and size styling here
        dataSource={users} columns={columns} rowKey="id" />
      )}
    </div>
  );
};

export default UserComponent;
