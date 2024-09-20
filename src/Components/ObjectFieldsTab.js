
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Row,Col,Table, Button, message, Spin, Space } from 'antd';
import CreateFieldDrawer from '../CreateFieldDrawer'; 
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';


const ObjectFieldTab = ( object ) => {
  const location = useLocation();
  const { record } = location.state || {};
  const [fieldsData, setFieldsData] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loading, setLoading] = useState(true);

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    fetchFieldsData();
  };

  const handleAddField = (newField) => {
    setFieldsData([...fieldsData, newField]);
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
    }else{
        setLoadingFields(false);
        setLoading(false);
    }
  };

  

  useEffect(() => {
    if (record?.name) {
      fetchFieldsData();
    }
  }, [record?.name]);



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

  

  return (
    <div>  
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
        
      
    </div>
  );
};

export default ObjectFieldTab;






