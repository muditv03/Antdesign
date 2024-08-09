import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Tabs,Table, Button, Row, Col } from 'antd';
import axios from 'axios';
import CreateFieldDrawer from './CreateFieldDrawer'; // Import the CreateFieldDrawer component

const { Title } = Typography;
const { TabPane } = Tabs;

const ObjectFieldDetail = () => {
  const location = useLocation();
  const { record } = location.state || {}; // Access the passed record

  const [fieldsData, setFieldsData] = useState([]); // Initialize with an empty array
  const [drawerVisible, setDrawerVisible] = useState(false); // Manage drawer visibility

  useEffect(() => {
    if (record?.key) {
      // Fetch all fields related to the current object_id
      axios
        .get(`http://localhost:3000/mt_fields/object/${record.key}`)
        .then((response) => {
          setFieldsData(response.data); // Set the fetched data to the fieldsData state
        })
        .catch((error) => {
          console.error('Error fetching fields:', error);
        });
    }
  }, [record?.key]); // Run the effect whenever the record key (object_id) changes

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
  ];

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
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

          <Table columns={columns} dataSource={fieldsData} pagination={false} />

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

