import React, { useState } from 'react';
import { Table, Row, Col, Typography, Button, Card } from 'antd';
import CreateApprovalProcessDrawer from './CreateApprovalProcessDrawer';

const { Title } = Typography;

const ApprovalProcess = ({ object }) => {
  // State to manage the visibility of the drawer
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Placeholder data for the table
  const [approvalProcesses, setApprovalProcesses] = useState([
    {
      key: '1',
      name: 'Build Approval',
    },
    { 
      key: '2',
      name: 'Deploy Approval',
    },
  ]);

  // Columns for the table
  const columns = [
    {
      title: 'Approval Process Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Typography.Text>{text}</Typography.Text>,
    },
  ];

  // Function to open the drawer
  const openDrawer = () => {
    setDrawerVisible(true);
  };

  // Function to close the drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
        <Col>
          <Title level={3} style={{ marginTop: '10px' }}>
            Approval Process
          </Title>
        </Col>
        <Col style={{ marginTop: '10px' }}>
          <Button type="primary" style={{ marginBottom: 5 }} onClick={openDrawer}>
            Create
          </Button>
        </Col>
      </Row>

      {/* Ant Design Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={approvalProcesses}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* CreateApprovalProcessDrawer */}
      <CreateApprovalProcessDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        object={object}
      />
    </div>
  );
};

export default ApprovalProcess;
