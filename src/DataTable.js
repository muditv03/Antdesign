import React, { useState, useEffect } from 'react';
import { Table, Typography, Button, Row, Col, Dropdown, Menu, Drawer, Form, Input, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const DataTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  // Fetch existing records when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/mt_objects');
        setData(response.data.map((item, index) => ({
          key: index,
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

  const onClose = () => {
    setDrawerVisible(false);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    console.log('Form Values:', values);

    // Prepare data for API callout
    const formData = {
      label: values.label,
      name: values.name,
      pluralLabel: values.plurallabel,
    };

    try {
      const response = await axios.post('http://localhost:3000/mt_objects', {
        mt_object: formData,
      });
      console.log('response is ', response);

      // Add the new data to the table
      setData((prevData) => [
        ...prevData,
        {
          key: prevData.length,
          label: values.label,
          name: values.name,
          plurallabel: values.plurallabel,
        },
      ]);

      message.success('Object created successfully');
      setDrawerVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating object:', error);
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
      width: 150,
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      width: 20,
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
      <Drawer
        title="Create New Object"
        width="30%"
        onClose={onClose}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={form}
          layout="vertical"
          hideRequiredMark
          onFinish={handleFinish}
        >
          <Form.Item
            name="label"
            label="Label"
            rules={[{ required: true, message: 'Please enter the label' }]}
          >
            <Input placeholder="Please enter the label" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Please enter the name" />
          </Form.Item>
          <Form.Item
            name="plurallabel"
            label="Plural Label"
            rules={[{ required: true, message: 'Please enter the plural label' }]}
          >
            <Input placeholder="Please enter the plural label" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Save
            </Button>
            <Button onClick={onClose}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default DataTable;
