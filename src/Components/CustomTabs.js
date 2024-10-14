import React, { useEffect, useState } from 'react';
import { Table, Spin, message, Button,Tooltip,Popconfirm } from 'antd';
import { BASE_URL } from '../Constant';
import ApiService from '../apiService'; 
import { DownOutlined, EditOutlined, CopyOutlined, DeleteOutlined  } from '@ant-design/icons';

import CreateTabDrawer from './CreateTabDrawer'; // Import the CreateTabDrawer component

const CustomTabs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false); // State to manage drawer visibility

  const fetchTabsData = async () => {
    const apiService = new ApiService(`${BASE_URL}/mt_tabs`, {
      'Content-Type': 'application/json',
    }, 'GET');

    try {
      const response = await apiService.makeCall();
      const enrichedData = await fetchObjectNames(response); // Fetch object names for mt_object_id
      setData(enrichedData);
    } catch (err) {
      setError(err);
      message.error('Failed to fetch data.'); // Show an error message
    } finally {
      setLoading(false);
    }
  };
  const fetchObjectNames = async (tabsData) => {
    // Use Promise.all to fetch object names for each tab's mt_object_id
    const promises = tabsData.map(async (tab) => {
      if (tab.mt_object_id) {
        const apiService = new ApiService(`${BASE_URL}/mt_objects/${tab.mt_object_id}`, {
          'Content-Type': 'application/json',
        }, 'GET');
        try {
          const objectResponse = await apiService.makeCall();
          return { ...tab, objectName: objectResponse.name }; // Enrich the tab data with object name
        } catch (err) {
          console.error(`Error fetching object for ${tab.mt_object_id}:`, err);
          return { ...tab, objectName: 'N/A' }; // If the API call fails, set a default value
        }
      }
      return { ...tab, objectName: 'N/A' }; // Default value if no mt_object_id
    });

    return Promise.all(promises);
  };


  useEffect(() => {
    fetchTabsData();
  }, []);

  const deleteTab = async (tab) => {
    try {
      // Create ApiService instance for DELETE request
      console.log('tab is called');
      console.log(tab);
      const apiService = new ApiService(
        `${BASE_URL}/mt_tabs/${tab._id}`,
        {}, // Headers (if any)
        'DELETE'
      );
  
      await apiService.makeCall();
      fetchTabsData();

      message.success('Record deleted successfully.');
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }
  };

  const columns = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'API Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Object Name', // New column for object name
      dataIndex: 'objectName',
      key: 'objectName',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
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
            okText="Yes"
            cancelText="No"
            onConfirm={() =>{
              console.log('Confirm clicked'); // Add this line
               deleteTab(record)}
            }

          >
            <DeleteOutlined style={{  color: 'red',marginRight: 8, fontSize: '14px', cursor: 'pointer' }} />
          </Popconfirm>
        </Tooltip>
      </>
    ),
  });
  return (
    <div style={{  }}>
      <Button type="primary" onClick={() => setDrawerVisible(true)} 
        style={{ position: 'absolute', top: '20px', right: '20px',marginTop:'20px' }}>
        Create New Tab
      </Button>
      {loading ? (
        <Spin size="small" />
      ) : error ? (
        <div>Error loading data</div>
      ) : (
        <Table dataSource={data} columns={columns} rowKey="id" />
      )}
      <CreateTabDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} /> {/* Render the drawer */}

    </div>
  );
};

export default CustomTabs;
