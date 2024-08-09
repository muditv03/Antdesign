import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Tabs, Table, Button, Modal, Form, Input, Row, Col } from 'antd';
import CreateObjectDrawer from './CreateObjectDrawer'; // Import the CreateObjectDrawer component

const { Title } = Typography;
const { TabPane } = Tabs;

const ObjectSetupDetail = () => {
  const location = useLocation();
  const { record } = location.state || {}; // Access the passed record

  const [fieldsData, setFieldsData] = useState([
    { key: '1', fieldName: 'Field 1', fieldType: 'String' },
    { key: '2', fieldName: 'Field 2', fieldType: 'Number' },
  ]);

  const [drawerVisible, setDrawerVisible] = useState(false); // Manage drawer visibility

  const columns = [
    {
      title: 'Field Name',
      dataIndex: 'fieldName',
      key: 'fieldName',
    },
    {
      title: 'Field Type',
      dataIndex: 'fieldType',
      key: 'fieldType',
    },
  ];

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const handleAddObject = (newObject) => {
    // Handle adding the new object (e.g., updating state, making API calls)
    setFieldsData([...fieldsData, newObject]); // Example of updating state with the new object
  };

  return (
    <div>
      <Title level={3}>{record?.label || 'Object Details'}</Title>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Fields" key="1">
          <Row justify="end" style={{ marginBottom: '16px' }}>
            <Col>
              <Button type="primary" onClick={showDrawer}>
                Create +
              </Button>
            </Col>
          </Row>

          <Table columns={columns} dataSource={fieldsData} pagination={false} />

          <CreateObjectDrawer
            visible={drawerVisible}
            onClose={closeDrawer}
            onAddObject={handleAddObject}
          />
        </TabPane>
        <TabPane tab="Properties" key="2">
          <p>Properties content goes here...</p>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ObjectSetupDetail;
    