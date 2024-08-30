import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Typography, Button, Row, Col, Drawer, message, Dropdown, Menu, Tabs, Spin } from 'antd';
import axios from 'axios';
import CreateFieldDrawer from './CreateFieldDrawer'; // Import the CreateFieldDrawer component
import { DownOutlined } from '@ant-design/icons';
  
const { Title } = Typography;
const { TabPane } = Tabs;
 
const ObjectFieldDetail = () => {
  const location = useLocation();
  const { record } = location.state || {}; // Access the passed record

  const [fieldsData, setFieldsData] = useState([]); // Initialize with an empty array
  const [drawerVisible, setDrawerVisible] = useState(false); // Manage drawer visibility
  const [loading, setLoading] = useState(true); // Add loading state for spinner

  const fetchFieldsData = () => {
    if (record?.key) {
      setLoading(true); // Set loading state before making the API call
      axios
        .get(`http://localhost:3000/mt_fields/object/${record.key}`)
        .then((response) => {
          setFieldsData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching fields:', error);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchFieldsData();
  }, [record?.key]);

  const handleMenuClick = (e, record) => {
    if (e.key === '1') {
      deletefield(record);
    }
  };

  const deletefield = async (record) => {
    try {
      await axios.delete(`http://localhost:3000/mt_fields/${record._id}`);
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Is Editable',
      dataIndex: 'iseditable',
      key: 'iseditable',
      render: (value) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Is Writeable',
      dataIndex: 'iswriteable',
      key: 'iswriteable',
      render: (value) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      width: 50,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu onClick={(e) => handleMenuClick(e, record)}>
              <Menu.Item key="1">Delete</Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <a onClick={(e) => e.preventDefault()}>
            <DownOutlined />
          </a>
        </Dropdown>
      ),
    },
  ];

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    fetchFieldsData();
  };

  const handleAddField = (newField) => {
    // Handle adding the new field to the table data
    setFieldsData([...fieldsData, newField]);
  };

  return (
    <div>
      <Title level={3}>{record?.label || 'Object Details'}</Title>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Details" key="1">
          <Row justify="end" style={{ marginBottom: '16px' }}>
            <Col>
              <Button type="primary" onClick={showDrawer}>
                Create +
              </Button>
            </Col>
          </Row>

          <Spin spinning={loading}> {/* Wrap the table with Spin for loading state */}
            <Table columns={columns} dataSource={fieldsData} pagination={false} />
          </Spin>

          <CreateFieldDrawer
            visible={drawerVisible}
            onClose={closeDrawer}
            onAddField={handleAddField}
            mtObjectId={record?.key} // Pass mt_object_id to CreateFieldDrawer
          />
        </TabPane>
        <TabPane tab="Properties" key="2">
          <p>Properties content goes here...</p>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ObjectFieldDetail;

