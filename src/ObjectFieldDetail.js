



import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Typography, Button, Row, Col, Drawer, message, Tabs, Spin, Modal, Space } from 'antd';
import axios from 'axios';
import CreateFieldDrawer from './CreateFieldDrawer'; 
import CreateRelatedListDrawer from './CreateRelatedListDrawer'; 
import ApiService from './apiService'; 
import { BASE_URL } from './Constant';

const { Title } = Typography;
const { TabPane } = Tabs;

const ObjectFieldDetail = () => {
  const location = useLocation();
  const { record } = location.state || {};
  const [fieldsData, setFieldsData] = useState([]);
  const [relatedLists, setRelatedLists] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [relatedListDrawerVisible, setRelatedListDrawerVisible] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingRelatedLists, setLoadingRelatedLists] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [editingRelatedList, setEditingRelatedList] = useState(null);
  const [selectedRelatedList, setSelectedRelatedList] = useState(null);
  const [parentObjectName, setParentObjectName] = useState(record?.name || 'Account');
  const [loading, setLoading] = useState(true);

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    fetchFieldsData();
  };

  const handleAddField = (newField) => {
    setFieldsData([...fieldsData, newField]);
  };

  const showRelatedListDrawer = () => {
    setEditingRelatedList(null);
    setRelatedListDrawerVisible(true);
  };

  const closeRelatedListDrawer = () => {
    setRelatedListDrawerVisible(false);
    fetchRelatedLists();
  };

  const handleAddRelatedList = (values) => {
    const newRelatedList = {
      name: values.relatedListName,
      related_object_name: values.relatedObjectType,
      related_field_name: values.relatedFieldType,
    };
    if (editingRelatedList) {
      setRelatedLists((prev) =>
        prev.map((list) =>
          list.name === editingRelatedList.name ? newRelatedList : list
        )
      );
    } else {
      setRelatedLists([...relatedLists, newRelatedList]);
    }
    closeRelatedListDrawer();
  };

  const fetchFieldsData = async () => {
    if (record?.name) {
      setLoadingFields(true);
      setLoading(true);
      try {
        const apiService = new ApiService(
          `${BASE_URL}/mt_fields/object/${record.name}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );
        const response = await apiService.makeCall();
        setFieldsData(response.map((field) => ({ ...field, key: field._id })));
      } catch (error) {
        console.error('Error fetching fields:', error);
      } finally {
        setLoadingFields(false);
        setLoading(false);
      }
    }
  };

  const fetchRelatedLists = async () => {
    setLoadingRelatedLists(true);
    try {
      const apiService = new ApiService(
        `${BASE_URL}/related_lists/for_object/${parentObjectName}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );
      const response = await apiService.makeCall();
      setRelatedLists(response.map((list) => ({ ...list, key: list.name })));
    } catch (error) {
      console.error('Error fetching related lists:', error);
      message.error('Error fetching related lists');
    } finally {
      setLoadingRelatedLists(false);
    }
  };

  useEffect(() => {
    if (record?.name) {
      fetchFieldsData();
      fetchRelatedLists();
    }
  }, [record?.name]);

  const deleteRelatedList = async () => {
    try {
      const apiService = new ApiService(
        `${BASE_URL}/mt_related_lists/${selectedRelatedList.name}`,
        {},
        'DELETE'
      );
      await apiService.makeCall();
      message.success('Related list deleted successfully.');
      setRelatedLists(relatedLists.filter((list) => list.name !== selectedRelatedList.name));
    } catch (error) {
      message.error('Failed to delete related list.');
      console.error('Error deleting related list:', error);
    } finally {
      setModalVisible(false);
    }
  };

  const deleteField = async () => {
    try {
      const apiService = new ApiService(
        `${BASE_URL}/mt_fields/${selectedField._id}`,
        {},
        'DELETE'
      );
      await apiService.makeCall();
      message.success('Field deleted successfully.');
      setFieldsData(fieldsData.filter((field) => field._id !== selectedField._id));
    } catch (error) {
      message.error('Failed to delete field.');
      console.error('Error deleting field:', error);
    } finally {
      setModalVisible(false);
    }
  };

  const handleEditRelatedList = (record) => {
    setEditingRelatedList(record);
    setRelatedListDrawerVisible(true);
  };

  const fieldColumns = [
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
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '',
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

  const relatedListColumns = [
    {
      title: 'Related List Name',
      dataIndex: 'related_list_name',
      key: 'related_list_name',
    },
    {
      title: 'Related Object Name',
      dataIndex: 'child_object_name',
      key: 'child_object_name',
    },
    {
      title: 'Related Field Name',
      dataIndex: 'fields_to_display',
      key: 'fields_to_display',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => handleEditRelatedList(record)}>Edit</Button>
          <Button onClick={() => { setSelectedRelatedList(record); setModalVisible(true); }} danger>Delete</Button>
        </Space>
      ),
    },
  ];

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
          <Spin spinning={loadingFields || loading}>
            <Table columns={fieldColumns} dataSource={fieldsData} pagination={false} />
          </Spin>
          <CreateFieldDrawer
            visible={drawerVisible}
            onClose={closeDrawer}
            onAddField={handleAddField}
            mtObjectId={record?.key}
          />
        </TabPane>
        <TabPane tab="Details" key="2">
          <p>Details content goes here...</p>
        </TabPane>
        <TabPane tab="Related Lists" key="3">
          <Row justify="end" style={{ marginBottom: '16px' }}>
            <Col>
              <Button type="primary" onClick={showRelatedListDrawer}>
                Add Related List
              </Button>
            </Col>
          </Row>
          <Spin spinning={loadingRelatedLists}>
            <Table columns={relatedListColumns} dataSource={relatedLists} pagination={false} />
          </Spin>
          <CreateRelatedListDrawer
            visible={relatedListDrawerVisible}
            onClose={closeRelatedListDrawer}
            onAddRelatedList={handleAddRelatedList}
            parentObjectName={parentObjectName}
            editingRelatedList={editingRelatedList}
          />
        </TabPane>
      </Tabs>
      <Modal
        title="Confirmation"
        visible={modalVisible}
        onOk={deleteRelatedList} // Confirm deletion
        onCancel={() => setModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this related list?</p>
      </Modal>
      <Modal
        title="Confirm Delete"
        visible={modalVisible && selectedField !== null}
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






