import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Typography, Button, Row, Col, Drawer, message, Dropdown, Menu, Tabs, Spin, Modal } from 'antd';
import axios from 'axios';
import CreateFieldDrawer from './CreateFieldDrawer'; // Import the CreateFieldDrawer component
import { DownOutlined } from '@ant-design/icons';
import { BASE_URL } from './Constant';
   
const { Title } = Typography;
const { TabPane } = Tabs;

const ObjectFieldDetail = () => {
  const location = useLocation();
  const { record } = location.state || {}; // Access the passed record

  const [fieldsData, setFieldsData] = useState([]); // Initialize with an empty array
  const [drawerVisible, setDrawerVisible] = useState(false); // Manage drawer visibility
  const [loading, setLoading] = useState(true); // Add loading state for spinner
  const [modalVisible, setModalVisible] = useState(false); // Manage modal visibility
  const [selectedField, setSelectedField] = useState(null); // Store the selected field to delete

  const fetchFieldsData = () => {
    if (record?.name) {
      console.log(record.name);
      setLoading(true); // Set loading state before making the API call
      axios
        .get(`${BASE_URL}/mt_fields/object/${record.name}`)
        .then((response) => {
          setFieldsData(response.data);
          console.log('field data is '+ response.data);
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
  }, [record?.name]);

  const handleMenuClick = (e, record) => {
    if (e.key === '1') {
      setSelectedField(record); // Set the selected field
      setModalVisible(true); // Show the delete confirmation modal
    }
  };

  const deleteField = async () => {
    try {
      await axios.delete(`${BASE_URL}/mt_fields/${selectedField._id}`);
      message.success('Field deleted successfully.');
      setFieldsData(fieldsData.filter((field) => field._id !== selectedField._id));
    } catch (error) {
      message.error('Failed to delete field.');
      console.error('Error deleting field:', error);
    } finally {
      setModalVisible(false); // Hide the modal after the operation
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
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '', // Capitalize first letter

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
        <TabPane tab="Properties" key="1">
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
        <TabPane tab="Details" key="2">
          <p>Details content goes here...</p>
        </TabPane>
      </Tabs>

      <Modal
        title="Confirm Delete"
        visible={modalVisible}
        onOk={deleteField}
        onCancel={() => setModalVisible(false)}
        okText="Yes"
        cancelText="No"
        centered
      >
        <p>Do you want to delete this field?</p>
      </Modal>
    </div>
  );
};

export default ObjectFieldDetail;
