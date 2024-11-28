import React, { useEffect, useState } from 'react';
import { Table, Avatar, Space } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService';

const FieldHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { record } = location.state || {};
  const [arrayData, setArrayData] = useState([]);
  const [userMap, setUserMap] = useState({}); // Stores user ID -> Name mapping

  // Fetch user details and create a mapping
  const fetchUserDetails = async () => {
    try {
      const apiServiceForRecords = new ApiService(
        `${BASE_URL}/fetch_records/users`, // Replace `users` with the actual endpoint for user data
        { 'Content-Type': 'application/json' },
        'GET'
      );
      const response = await apiServiceForRecords.makeCall();

      if (response && Array.isArray(response)) {
        // Create a map of user_id to { Name, user_id }
        const userMapping = response.reduce((acc, user) => {
          acc[user._id] = { Name: user.Name || 'Unknown', userId: user._id };
          return acc;
        }, {});
        setUserMap(userMapping);
      } else {
        console.warn('Unexpected user details response format:', response);
      }
    } catch (error) {
      console.error('Error while fetching user details:', error);
    }
  };

  useEffect(() => {
    if (!record || !record._id) {
      console.error('Record not found or invalid.');
      return;
    }

    const fetchFieldHistory = async () => {
      try {
        // Fetch the field history
        const apiService = new ApiService(
          `${BASE_URL}/field_history/${record._id}`,
          'GET'
        );
        const response = await apiService.makeCall();

        if (response && Array.isArray(response)) {
          // Format the field history data
          const finalRes = response.map((item) => {
            try {
              const changedByJson = item.changed_by.replace(/=>/g, ':');
              const parsedChangedBy = JSON.parse(changedByJson);

              return {
                key: item._id,
                date: new Date(item.changed_at).toLocaleString(),
                field: item.field_name,
                user: parsedChangedBy.user_id || 'Unknown', // Replace user_id with Name later
                originalvalue: item.old_value,
                newvalue: item.new_value,
              };
            } catch (error) {
              console.error('Error parsing changed_by:', error, item);
              return null;
            }
          });

          // Remove invalid entries
          setArrayData(finalRes.filter(Boolean));
        } else {
          console.warn('Unexpected field history response format:', response);
        }
      } catch (error) {
        console.error('Error while fetching field tracking data:', error);
      }
    };

    fetchUserDetails(); // Fetch user details first
    fetchFieldHistory(); // Fetch field history
  }, [record]);

  // Replace user IDs with Names when userMap updates
  const dataWithNames = arrayData.map((item) => ({
    ...item,
    user: userMap[item.user] || { Name: item.user, userId: null }, // Replace user ID with Name
  }));

  const columns = [
    {
      title: 'Created/Updated At',
      dataIndex: 'date',
    },
    {
      title: 'Field',
      dataIndex: 'field',
    },
    {
      title: 'User',
      dataIndex: 'user',
      render: (user, record) => {
        const { Name, userId } = user;
        return (
          <Space>
            <Avatar size={25}>{(Name || 'U').charAt(0).toUpperCase()}</Avatar>
            {userId ? (
              <a href={`/record/user/${userId}`} 

              // onClick={(e) => {
              //   e.preventDefault(); // Prevent default anchor navigation if using SPA navigation
              //   navigate(`/record/user/${userId}`);
              // }}
            
              >
                {Name}
              </a>
            ) : (
              <span>{Name}</span>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Original Value',
      dataIndex: 'originalvalue',
    },
    {
      title: 'New Value',
      dataIndex: 'newvalue',
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('Table params:', pagination, filters, sorter, extra);
  };

  return (
    <div>
      <Table columns={columns} dataSource={dataWithNames} onChange={onChange} />
    </div>
  );
};

export default FieldHistory;
