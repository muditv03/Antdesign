import React, { useState, useEffect } from 'react';
import { Table, Typography, Tooltip, Button, Row, Col, Menu, message, Spin, Modal, Card, Breadcrumb, Popconfirm, List } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateObjectDrawer from './CreateObjectDrawer';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService';

const { Title } = Typography;

const DataTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [data, setData] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dependencyModalVisible, setDependencyModalVisible] = useState(false);
  const [dependencyMessage, setDependencyMessage] = useState('');
  const [dependencies, setDependencies] = useState([]);
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
      // deleteRecord(selectedRecord);
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

  const handleDelete = async (record) => {
    setLoading(true);
    try {
      const apiServiceForObject = new ApiService(
        `${BASE_URL}/delete_object`,
        { 'Content-Type': 'application/json' },
        'POST',
        JSON.stringify({ object_name: record.name })
      );
      const deletionResponse = await apiServiceForObject.makeCall();
      setData((prevData) => prevData.filter((item) => item.key !== record.key));
      message.success('Record deleted successfully.');
    } catch (error) {
      if (error.dependent_objects && error.dependent_objects.length > 0) {
        const dependencies = error.dependent_objects.map(dep => ({
          model: dep.related_model,
          field: dep.field,
          count: dep.count
        }));
        setDependencies(dependencies);
        setDependencyMessage(error.message);
        setDependencyModalVisible(true);
      } else {
        message.error(error.error);
        console.error('Error deleting record:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDependencyModalOk = () => {
    setDependencyModalVisible(false);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Edit</Menu.Item>
      {/* <Menu.Item key="2" onClick={() => deleteRecord(selectedRecord)}>Delete</Menu.Item> */}
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
        <>
          <Tooltip title="Edit">
            <EditOutlined
              onClick={() =>
                handleEdit(record)}
              style={{ marginRight: 8, fontSize: '18px', cursor: 'pointer' }}
            />
          </Tooltip>
          <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined style={{ color: 'red', marginRight: 8, fontSize: '14px', cursor: 'pointer' }} />
          </Popconfirm>
        </Tooltip>
        </>
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
      </Card>
      <Modal
        title="Cannot Delete Object"
        open={dependencyModalVisible}
        onOk={handleDependencyModalOk}
        onCancel={handleDependencyModalOk}
        centered
      >
        <p>{dependencyMessage}</p>
        <List
          dataSource={dependencies}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={`Model: ${item.model}`}
                description={`Field: ${item.field}, Count: ${item.count}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </Spin>
  );
};
 
export default DataTable;


