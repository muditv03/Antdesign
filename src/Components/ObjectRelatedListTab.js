

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, message, Spin, Space, Tooltip ,Typography} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import CreateRelatedListDrawer from '../CreateRelatedListDrawer'; 
import RelatedListEditDrawer from '../RelatedListEditDrawer'; 
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';


const { Title } = Typography;

const ObjectRelatedListTab = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const { record } = location.state || {};
  const [relatedLists, setRelatedLists] = useState([]);
  const [relatedListDrawerVisible, setRelatedListDrawerVisible] = useState(false);
  const [editRelatedListDrawerVisible, setEditRelatedListDrawerVisible] = useState(false);
  const [loadingRelatedLists, setLoadingRelatedLists] = useState(false);
  const [editingRelatedList, setEditingRelatedList] = useState(null);
  const [parentObjectName, setParentObjectName] = useState(record?.name || 'Account');

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
          list.key === editingRelatedList.key ? newRelatedList : list
        )
      );
    } else {
      setRelatedLists([...relatedLists, { ...newRelatedList, key: Date.now() }]);
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
        fields_to_display: item.related_list.fields_to_display,
        field_api_name:item.related_list.field_api_name
      }));

      setRelatedLists(formattedData);
    } catch (error) {
     console.log(error);      
    } finally {
      setLoadingRelatedLists(false);
    }
  };

  useEffect(() => {
    if (record?.name) {
      setParentObjectName(record.name);
      fetchRelatedLists();
    }
  }, [record]);

  const handleEditRelatedList = (record) => {
    
    
    setEditingRelatedList({
      ...record,
      fields_to_display: record.fields_to_display || [],
    });

    setEditRelatedListDrawerVisible(true);
  }; console.log("editingRelatedList");
  console.log(editingRelatedList);

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
          onClick={() => navigate(`/object-setup/${text}`)}
          style={{ cursor: 'pointer', color: '#1890FF' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Related Field Name',
      dataIndex: 'fields_to_display',
      key: 'fields_to_display',
      render: (fields) => fields.join(', '), // Join for display
    },
    {
      title: 'Lookup Name',
      dataIndex: 'field_api_name',
      key: 'field_api_name',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          {<Tooltip title="Edit">
            <EditOutlined
              onClick={() => handleEditRelatedList(record)}
              style={{ marginRight: 8, fontSize: '18px', cursor: 'pointer' }}
            />
          </Tooltip> }
        </Space>
      ),
    },
  ];

  return (
    <div>
       <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
      <Col>
        <Title level={3} style={{ marginTop:'10px' }}>Related Lists</Title>
      </Col>
      <Col  style={{ marginTop:'10px' }}>
        <Button type="primary" onClick={showRelatedListDrawer} style={{ marginBottom: 5 }}>
          Create Related List
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
      <RelatedListEditDrawer
        visible={editRelatedListDrawerVisible}
        onClose={closeEditRelatedListDrawer}
        record={editingRelatedList}
        parentObjectName={parentObjectName}
      />
    </div>
  );
};

export default ObjectRelatedListTab;
