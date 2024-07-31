import React from 'react';
import { Layout, Typography, Card, Row, Col, Table } from 'antd';
import AppHeader from './Header';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {
  const contentStyle = {
    padding: '0 50px',
    marginTop: '16px',
    flex: '1 0 auto',
    background: '#fff',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    margin: '16px',
  };

  const columns = [
    {
      title: 'Full Name',
      width: 100,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: 'Age',
      width: 100,
      dataIndex: 'age',
      key: 'age',
      fixed: 'left',
    },
    {
      title: 'Column 1',
      dataIndex: 'address',
      key: '1',
      width: 150,
    },
    {
      title: 'Column 2',
      dataIndex: 'address',
      key: '2',
      width: 150,
    },
    {
      title: 'Column 3',
      dataIndex: 'address',
      key: '3',
      width: 150,
    },
    {
      title: 'Column 4',
      dataIndex: 'address',
      key: '4',
      width: 150,
    },
    {
      title: 'Column 5',
      dataIndex: 'address',
      key: '5',
      width: 150,
    },
    {
      title: 'Column 6',
      dataIndex: 'address',
      key: '6',
      width: 150,
    },
    {
      title: 'Column 7',
      dataIndex: 'address',
      key: '7',
      width: 150,
    },
    {
      title: 'Column 8',
      dataIndex: 'address',
      key: '8',
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: () => <a>action</a>,
    },
  ];

  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      key: i,
      name: `Edward ${i}`,
      age: 32,
      address: `London Park no. ${i}`,
    });
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={contentStyle}>
        <Title level={2}>Welcome to Asset Management</Title>
        <Paragraph>This is the home page.</Paragraph>
        <Row gutter={16} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card title="Assets" bordered={false} style={cardStyle}>
              <p>Asset 1</p>
              <p>Asset 2</p>
              <p>Asset 3</p>
              <p>Asset 4</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card title="Orders" bordered={false} style={cardStyle}>
              <p>Order 1</p>
              <p>Order 2</p>
              <p>Order 3</p>
              <p>Order 4</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card title="Repairs" bordered={false} style={cardStyle}>
              <p>Asset in Repair 1</p>
              <p>Asset in Repair 2</p>
              <p>Asset in Repair 3</p>
              <p>Asset in Repair 4</p>
            </Card>
          </Col>
        </Row>
        <div style={{ marginTop: '16px' }}>
          <Table
            columns={columns}
            dataSource={data}
            scroll={{
              x: 1500,
              y: 300,
            }}
          />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', flexShrink: 0 }}>
        Aptclouds ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default HomePage;