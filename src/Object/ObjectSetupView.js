import React, { useState, useEffect } from 'react';
import { Table, Typography, Tooltip, Button, Row, Col, Menu, message, Spin, Modal, Card, Breadcrumb } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';
import CreateObjectDrawer from './CreateObjectDrawer';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService';

const { Title } = Typography;

const DataTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const navigate = useNavigate();
 
  const fetchData = async () => {
    setLoading(true);
    try {

      const apiService = new ApiService(`${BASE_URL}/mt_objects`, {
        'Content-Type': 'application/json'
      }, 'GET'
      );

      const response = await apiService.makeCall();

      // Set the data state with the response
      setData(response.map((item) => ({
        ...item, // Keeps all fields of the item
        key: item._id,
      })));
    } catch (error) {
      console.error('Error fetching object list:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleMenuClick = (e) => {
    if (e.key === '1') {
      // Handle edit
    } else if (e.key === '2') {
      deleteRecord(selectedRecord);
    }
  };

  const handleEdit = (record) => {
    console.log('editing recorrrrrdddd');
    console.log(record);
    setEditingRecord(record);
    setDrawerVisible(true);
    setTimeout(() => {
      const drawerContent = document.querySelector('.ant-drawer-body');
      if (drawerContent) {
        drawerContent.scrollTop = 0; // Reset scroll to the top
      }
    }, 200);
  };

  const showDrawer = () => {
    setEditingRecord(null);
    setDrawerVisible(true);
    setTimeout(() => {
      const drawerContent = document.querySelector('.ant-drawer-body');
      if (drawerContent) {
        drawerContent.scrollTop = 0; // Reset scroll to the top
      }
      // Reset the page scroll position
    window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingRecord(null);
    fetchData();
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

  const showDeleteModal = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/${recordToDelete.key}`);
      setData((prevData) => prevData.filter((item) => item.key !== recordToDelete.key));
      message.success('Record deleted successfully.');
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setRecordToDelete(null);
  };

  const deleteRecord = (record) => {
    showDeleteModal(record);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Edit</Menu.Item>
      <Menu.Item key="2" onClick={() => deleteRecord(selectedRecord)}>Delete</Menu.Item>
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
      title: 'API Name',
      width: 100,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: 'Plural Label',
      dataIndex: 'pluralLabel',
      key: 'pluralLabel',
      width: 100,
    },


    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (text, record) => (
        <Tooltip title="Edit">
          <EditOutlined
            onClick={() =>
              handleEdit(record)}
            style={{ marginRight: 8, fontSize: '18px', cursor: 'pointer' }}
          />
        </Tooltip>
      ),
    },


  ];

  return (
    <Spin spinning={loading}>
      <Card>

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
              pagination={true}
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

        <Modal
          title="Delete Confirmation"
          visible={isDeleteModalVisible}
          onOk={handleDelete}
          onCancel={handleCancel}
          okText="Yes"
          cancelText="No"
          centered
        >
          <p>Are you sure you want to delete this record?</p>
        </Modal>
      </Card>
    </Spin>
  );
};
 
export default DataTable;


