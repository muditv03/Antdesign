import React, { useState, useEffect } from 'react';
import { Table, Typography, Button, Row, Col, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreateObjectDrawer from './CreateObjectDrawer';
 
const { Title } = Typography; 

const DataTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/mt_objects');
        setData(response.data.map((item) => ({
          key: item._id,  // Ensure item.id exists and is the unique identifier
          label: item.label,
          name: item.name,
          plurallabel: item.pluralLabel,
        })));
      } catch (error) {
        console.error('Error fetching object list:', error);
      }
    };

    fetchData();
  }, []);

  const handleMenuClick = (e) => {
    console.log('click', e);
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleAddObject = (newObject) => {
    setData((prevData) => [...prevData, newObject]);
  };

  const handleLabelClick = (record) => {
    console.log("Record ID:", record.key); // Debugging: Check if record.key is correct
    if (record.key) {
      navigate(`/object-setup/${record.key}`, { state: { record } });
    } else {
      console.error("Record ID is undefined");
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
      render: () => (
        <Dropdown overlay={menu} trigger={['click']}>
          <a onClick={(e) => e.preventDefault()}>
            <DownOutlined />
          </a>
        </Dropdown>
      ),
    },
  ];

  return (
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
        onAddObject={handleAddObject}
      />
    </div>
  );
};

export default DataTable;
