import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Button, Row, Col, message, Spin, Space } from 'antd';
import CreateRelatedListDrawer from '../CreateRelatedListDrawer'; 
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';

const ObjectRelatedListTab = () => {
  const location = useLocation();
  const { record } = location.state || {};
  const [relatedLists, setRelatedLists] = useState([]);
  const [relatedListDrawerVisible, setRelatedListDrawerVisible] = useState(false);
  const [loadingRelatedLists, setLoadingRelatedLists] = useState(false);
  const [editingRelatedList, setEditingRelatedList] = useState(null);
  const [selectedRelatedList, setSelectedRelatedList] = useState(null);
  const [parentObjectName, setParentObjectName] = useState(record?.name || 'Account');

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

  // Modified fetchRelatedLists function
  const fetchRelatedLists = async () => {
    setLoadingRelatedLists(true);
    try {
      const apiService = new ApiService(
        `${BASE_URL}/related_lists/for_object/${parentObjectName}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );
      const response = await apiService.makeCall();

      // Mapping response to match table structure
      const formattedData = response.map((item) => ({
        key: item.related_list._id, // unique key for each row
        related_list_name: item.related_list.related_list_name,
        child_object_name: item.related_list.child_object_name,
        fields_to_display: item.related_list.fields_to_display.join(', '), // join fields into a single string
      }));

      setRelatedLists(formattedData);
    } catch (error) {
      console.error('Error fetching related lists:', error);
      message.error('Error fetching related lists');
    } finally {
      setLoadingRelatedLists(false);
    }
  };

  useEffect(() => {
    if (record?.name) {
      fetchRelatedLists();
    }
  }, [record?.name]);

  const handleEditRelatedList = (record) => {
    setEditingRelatedList(record);
    setRelatedListDrawerVisible(true);
  };

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
          <Button onClick={() => { setSelectedRelatedList(record);  }} danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
    </div>
  );
};

export default ObjectRelatedListTab;
