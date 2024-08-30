import React, { useState, useEffect } from 'react';
import { Table, Typography, Button, Row, Col, Dropdown, Menu, message, Spin } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreateObjectDrawer from './CreateObjectDrawer';
  
const { Title } = Typography;

const DataTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);  // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);  // Start spinner
      try {
        const response = await axios.get('http://localhost:3000/mt_objects');
        setData(response.data.map((item) => ({
          key: item._id,
          label: item.label,
          name: item.name,
          plurallabel: item.pluralLabel,
        })));
      } catch (error) {
        console.error('Error fetching object list:', error);
      } finally {
        setLoading(false);  // Stop spinner
      }
    };

    fetchData();
  }, []);

  const handleMenuClick = (e) => {
    if (e.key === '1') {  // Assuming 'Edit' is key '1'
      //setEditingRecord(selectedRecord);
      //setDrawerVisible(true);
    } else if (e.key === '2') {  // Assuming 'Delete' is key '2'
      deleteRecord(selectedRecord);
    }
  };

  const showDrawer = () => {
    setEditingRecord(null);  // Clear editingRecord for a fresh new form
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingRecord(null);
  };

  const handleAddOrEditObject = (updatedObject) => {
    setData((prevData) =>
      prevData.map((item) => (item.key === updatedObject.key ? updatedObject : item))
    );
  };

  const handleLabelClick = (record) => {

    if (record.key) {
      navigate(`/object-setup/${record.key}`, { state: { record } });
    } else {
      console.error("Record ID is undefined");
    }
  };

  const deleteRecord = async (record) => {
    setLoading(true);  // Start spinner
    try {
      await axios.delete(`http://localhost:3000/mt_objects/${record.key}`);
      setData((prevData) => prevData.filter((item) => item.key !== record.key));
      message.success('Record deleted successfully.');
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    } finally {
      setLoading(false);  // Stop spinner
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Edit</Menu.Item>
      <Menu.Item key="2">Delete</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Label',
      width: 100,
      dataIndex: 'label',
      key: 'label',
      fixed: 'left',
      render: (text, record) => (
        <a onClick={() => handleLabelClick(record)}>{text}</a>
      ),
    },
    {
      title: 'Name',
      width: 100,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: 'Plural Label',
      dataIndex: 'plurallabel',
      key: 'plurallabel',
      width: 100,
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      width: 50,
      render: (_, record) => (
        <Dropdown
          overlay={menu}
          trigger={['click']}
          onVisibleChange={() => setSelectedRecord(record)}
        >
          <a onClick={(e) => e.preventDefault()}>
            <DownOutlined />
          </a>
        </Dropdown>
      ),
    },
  ];

  return (
    <Spin spinning={loading}> {/* Spinner */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Object Setup</Title>
          </Col>
          <Col>
            <Button type="primary" onClick={showDrawer}>Create +</Button>
          </Col>
        </Row>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Table
            columns={columns}
            dataSource={data}
            scroll={{ x: 1500, y: 'calc(100vh - 200px)' }}
            pagination={false}
            style={{ width: '100%' }}
          />
        </div>
        <CreateObjectDrawer
          visible={drawerVisible}
          onClose={onCloseDrawer}
          onAddOrEditObject={handleAddOrEditObject}
          editingRecord={editingRecord}
        />
      </div>
    </Spin>
  );
};
export default DataTable;












