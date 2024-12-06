import React, { useEffect, useState } from 'react';
import { Table, Avatar, Space, Tooltip } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService';

const FieldHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { record } = location.state || {};
  const [arrayData, setArrayData] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1); // Track pagination state

  // Fetch user details and create a mapping
  const fetchUserDetails = async () => {
    try {
      const apiServiceForRecords = new ApiService(
        `${BASE_URL}/fetch_records/users`,
        { 'Content-Type': 'application/json' },
        'GET'
      );
      const response = await apiServiceForRecords.makeCall();

      if (response && Array.isArray(response)) {
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
        const apiService = new ApiService(
          `${BASE_URL}/field_history/${record._id}`,
          'GET'
        );
        const response = await apiService.makeCall();

        if (response && Array.isArray(response)) {
          const finalRes = response.map((item) => ({
            key: item._id,
            date: new Date(item.changed_at).toLocaleString(),
            field: item.field_name,
            user: item.changed_by || 'Unknown',
            originalvalue: item.old_value,
            newvalue: item.new_value,
          }));
          setArrayData(finalRes.filter(Boolean));
        } else {
          console.warn('Unexpected field history response format:', response);
        }
      } catch (error) {
        console.error('Error while fetching field tracking data:', error);
      }
    };

    fetchUserDetails();
    fetchFieldHistory();
  }, [record]);

  // Replace user IDs with Names when userMap updates
  const dataWithNames = arrayData
    .map((item) => ({
      ...item,
      user: userMap[item.user] || { Name: item.user, userId: null },
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by descending date

    const columns = [
      {
        title: 'Created/Updated At',
        dataIndex: 'date',
        width: 150,
      },
      {
        title: 'Field',
        dataIndex: 'field',
        width: 120,
      },
      {
        title: 'User',
        dataIndex: 'user',
        width: 200,
        render: (user) => {
          const { Name, userId } = user;
          return (
            <Space>
              <Avatar size={25}>{(Name || 'U').charAt(0).toUpperCase()}</Avatar>
              {userId ? (
                <a
                  href={`/record/user/${userId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/record/user/${userId}`);
                  }}
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
        width: 250,
        render: (text) => (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {text}
          </div>
        ),
      },
      {
        title: 'New Value',
        dataIndex: 'newvalue',
        width: 250,
        render: (text) => (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {text}
          </div>
        ),
      },
    ];
    

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataWithNames}
        pagination={{
          current: currentPage,
          pageSize: 10,
          onChange: (page) => setCurrentPage(page),
        }}
      />
    </div>
  );
};

export default FieldHistory;
