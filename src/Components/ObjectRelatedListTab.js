
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Table, Button, Row, Col, message, Spin, Space, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons'; // Import the Edit icon
import CreateRelatedListDrawer from '../CreateRelatedListDrawer'; 
import RelatedListEditDrawer from '../RelatedListEditDrawer'; 
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';

const ObjectRelatedListTab = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Define navigate
  const { record } = location.state || {};
  const [relatedLists, setRelatedLists] = useState([]);
  const [relatedListDrawerVisible, setRelatedListDrawerVisible] = useState(false);
  const [editRelatedListDrawerVisible, setEditRelatedListDrawerVisible] = useState(false);
  const [loadingRelatedLists, setLoadingRelatedLists] = useState(false);
  const [editingRelatedList, setEditingRelatedList] = useState(null);
  const [parentObjectName, setParentObjectName] = useState(record?.name || 'Account');
  const [parentObjects, setParentObjects] = useState([]); // Define your state here

  const showRelatedListDrawer = () => {
    setEditingRelatedList(null);
    setRelatedListDrawerVisible(true);
  };

  const closeRelatedListDrawer = () => {
    setRelatedListDrawerVisible(false);
    fetchRelatedLists();
  };

  const closeEditRelatedListDrawer = () => {
    setEditRelatedListDrawerVisible(false);
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

  const fetchRelatedLists = async () => {
    setLoadingRelatedLists(true);
    try {
      const apiService = new ApiService(
        `${BASE_URL}/related_lists/for_object/${parentObjectName}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );
      const response = await apiService.makeCall();
      const formattedData = response.map((item) => ({
        key: item.related_list._id,
        related_list_name: item.related_list.related_list_name,
        child_object_name: item.related_list.child_object_name,
        fields_to_display: item.related_list.fields_to_display.join(', '),
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
      setParentObjectName(record.name); // Ensure the parent object name is set
      fetchRelatedLists();
    }
  }, [record]);
  const handleEditRelatedList = (record) => {
    setEditingRelatedList(record);
    setEditRelatedListDrawerVisible(true);
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
      render: (text) => (
        <a
          onClick={() => navigate(`/object-setup/${text}`)} // Now navigate is correctly scoped
          style={{ cursor: 'pointer', color: '#1890FF' }} // Add some styles to make it look like a link
        >
          {text}
        </a>
      ),
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
          <Tooltip title="Edit">
            <EditOutlined
              onClick={() => handleEditRelatedList(record)}
              style={{ marginRight: 8, fontSize: '18px', cursor: 'pointer' }}
            />
          </Tooltip>
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
        parentObjectName={parentObjectName} // Pass the parent object name
        editingRelatedList={editingRelatedList}
      />
     <RelatedListEditDrawer
  visible={editRelatedListDrawerVisible}
  onClose={closeEditRelatedListDrawer}
  record={editingRelatedList}
  parentObjects={parentObjects}
  parentObjectName={parentObjectName} // Pass the parent object name here
/>

    </div>
  );
};

export default ObjectRelatedListTab;
