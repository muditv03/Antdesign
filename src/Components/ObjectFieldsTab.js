import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Table, Button, message, Spin, Tooltip,Typography,Popconfirm } from 'antd';
import CreateFieldDrawer from '../CreateFieldDrawer'; 
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';
import { EditOutlined,DeleteOutlined,InfoCircleOutlined } from '@ant-design/icons';

const {Title}=Typography;

const ObjectFieldTab = () => {
  const location = useLocation();
  const { record } = location.state || {};
  const [fieldsData, setFieldsData] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null); // Track the field being edited

  const handleEdit = (field) => {
    setEditField(field); // Pass the field to the drawer
    showDrawer(); // Open the drawer
  };

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditField(null); // Reset the edit field when drawer is closed
    fetchFieldsData(); // Fetch the updated fields after the drawer is closed
  };

  const handleAddField = (newField) => {
    setFieldsData([...fieldsData, newField]);
  };

  const handleUpdateField = (updatedField) => {
    // Update the specific field in the fieldsData array after editing
    setFieldsData((prevFields) =>
      prevFields.map((field) =>
        field._id === updatedField._id ? updatedField : field
      )
    );
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
        setFieldsData(response
          .filter((field) => field.name !== 'recordCount')
          .map((field) => ({ ...field, key: field._id })));
      } catch (error) {
        console.error('Error fetching fields:', error);
      } finally {
        setLoadingFields(false);
        setLoading(false);
      }
    } else {
      setLoadingFields(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (record?.name) {
      fetchFieldsData();
    }
  }, [record?.name]);

  const deleteField= async (record)=>{

    console.log('id is ');
    console.log(record._id);

    try {
      // Create ApiService instance for DELETE request
      const apiService = new ApiService(
        `${BASE_URL}/mt_fields/${record._id}`,
        {}, // Headers (if any)
        'DELETE'
      );
  
      await apiService.makeCall();
      fetchFieldsData();
      message.success('Record deleted successfully.');
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }

  }

  const fieldColumns = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'API Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (value) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '',
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (text, record) => (
        <>
        <Tooltip title="Edit">
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8, fontSize: '18px', cursor: 'pointer' }}
          />
        </Tooltip> 

        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure you want to delete this field?"
            onConfirm={() => deleteField(record)}
            okText="Yes"
            cancelText="No"
          >
            
           
            <DeleteOutlined style={{ color: 'red', marginRight: 8, fontSize: '14px', cursor: 'pointer' }} />
          </Popconfirm>
        </Tooltip>

        </>

        
      ),

    },
   
  ];

  console.log(fieldsData);

  return (
    <div>  
      <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
      <Col>
        <Title level={3} style={{ marginTop:'10px' }}>Properties</Title>
      </Col>
      <Col  style={{ marginTop:'10px' }}>
        <Button type="primary" onClick={showDrawer} style={{ marginBottom: 5 }}>
          Create Field
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
        editField={editField} // Pass the field being edited
        onSaveEdit={handleUpdateField} // Function to handle saving edited field
      />
    </div>
  );
};

export default ObjectFieldTab;
