import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table, Switch, message, Spin, Space, Tooltip, Popconfirm, Typography,Affix } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateFieldDrawer from './CreateFieldDrawer';
import { useLocation } from 'react-router-dom';
import ApiService from '../Components/apiService';
import { BASE_URL } from '../Components/Constant';

const { Title } = Typography;

const ObjectFieldTab = () => {
  const [fieldsData, setFieldsData] = useState([]);
  const [originalFieldsData, setOriginalFieldsData] = useState([]); // Store original data for cancel
  const location = useLocation();
  const { record } = location.state || {};
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null); // Track the field being edited

  const [showTracking, setShowTracking] = useState(true); // State to toggle visibility of tracking column
  const [isModified, setIsModified] = useState(false); // Track if any toggle was modified

  // Fetch fields data from the API
  const handleAddField = (newField) => {
    setFieldsData([...fieldsData, newField]);
  };
  const fetchFieldsData = async () => {
    if (record?.name) {
      setLoadingFields(true);
      setLoading(true);
      try {
        const apiService = new ApiService(
          `${BASE_URL}/mt_fields/object/${record.name}`, // Use record.name for API call
          { 'Content-Type': 'application/json' },
          'GET'
        );
        const response = await apiService.makeCall();
  
        // Filter out unwanted fields (this is the same filter as before)
        const filteredFields = response.filter(
          field => !['recordCount', 'CreatedBy', 'LastModifiedBy'].includes(field.name)
        ).map((field) => ({ ...field, key: field._id }));
  
        setFieldsData(filteredFields);
        setOriginalFieldsData(filteredFields); // Save the filtered fields as original data
        console.log('originalFields Data:::'+JSON.stringify(originalFieldsData));
      } catch (error) {
        message.error('Failed to fetch fields data');
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
    fetchFieldsData();
  }, [record?.name]); // Fetch data when record name changes

  // Handle toggle switch change
  const handleToggleChange = (fieldId, value) => {
    setFieldsData((prevFields) =>
      prevFields.map((field) =>
        field._id === fieldId ? { ...field, track_field_history: value } : field
      )
    );
    setIsModified(true); // Mark as modified when a toggle is changed
  };

  
  // Save the modified changes
  const saveChanges = async () => {
    try {
      // Construct the payload with only modified fields
      const modifiedFields = fieldsData.filter((field, index) => {
        const originalField = originalFieldsData[index];
        return (
          field.track_field_history !== originalField.track_field_history ||
          field.label !== originalField.label ||
          field.description !== originalField.description
        );
      });
      console.log('modifiedFields'+JSON.stringify(modifiedFields));
      const payload = {
        fields: modifiedFields.map((field) => ({
          id: field._id,
          track_field_history: field.track_field_history,
        })),
      };
      console.log('payloads::::'+JSON.stringify(payload));
      // Send API request
      const apiService = new ApiService(
        `${BASE_URL}/bulk_field_update`,
        { 'Content-Type': 'application/json' },
        'PATCH',
        payload
      );
      const response = await apiService.makeCall();
  
      message.success('Changes saved successfully!');
      setOriginalFieldsData(fieldsData); // Update original data
      setIsModified(false); // Reset modified state
      // setShowTracking(false); // Hide tracking
      console.log('response after saving for field tracking data bulkk'+response);
    } catch (error) {
      message.error('Failed to save changes.');
      console.error('Error while saving changes:', error);
    }
  };
  

  // Cancel changes and revert to original data
  const cancelChanges = () => {
    setFieldsData(originalFieldsData); // Revert to original data
    setIsModified(false); // Reset modified flag
    // setShowTracking(false); // Hide tracking
    message.info('Changes reverted');
  };

  // Create Field button click handler
  const showDrawer = () => {
    setTimeout(() => {

      const drawerContent = document.querySelector('.ant-drawer-body');

      if (drawerContent) {

        drawerContent.scrollTop = 0; // Reset scroll to the top

      }

    }, 200); 

    setDrawerVisible(true);  };

  // Handle closing the Create Field Drawer
  const closeDrawer = () => {
    setEditField(null); // Reset edit field on drawer close
    setDrawerVisible(false);
    fetchFieldsData(); // Refresh data after closing the drawer
    setTimeout(() => {
      const drawerContent = document.querySelector('.ant-drawer-body');
      if (drawerContent) {
        drawerContent.scrollTop = 0; // Reset scroll to the top
      }
      // Reset the page scroll position
    window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  // Handle editing of a field
  const handleEdit = (field) => {
    setEditField(field); // Set the field to be edited
    setDrawerVisible(true); // Open the create field drawer
  };

  // Handle deleting a field
  const deleteField = async (record) => {
    try {
      const apiService = new ApiService(
        `${BASE_URL}/mt_fields/${record._id}`,
        {},
        'DELETE'
      );
      await apiService.makeCall();
      fetchFieldsData(); // Refresh fields data
      message.success('Field deleted successfully.');
    } catch (error) {
      message.error('Failed to delete field.');
    }
  };

  // Column definition for the table
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
    ...(showTracking
      ? [
          {
            title: 'Field Tracking History',
            key: 'track_field_history',
            render: (text, record) => {
              const disallowedTypes = ['Rich-Text', 'Text-Area', 'Formula', 'Auto Number'];
              const isDisallowed =
                disallowedTypes.includes(record.type) ||
                record.is_auto_number ||
                record.is_formula;
  
              return isDisallowed ? (
                <Tooltip title="Field tracking not available for this datatype">
                  <Switch checked={false} disabled />
                </Tooltip>
              ) : (
                <Switch
                  checked={record.track_field_history}
                  onChange={(value) => handleToggleChange(record._id, value)}
                />
              );
            },
          },
        ]
      : []),
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
              <DeleteOutlined
                style={{ color: 'red', marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
              />
            </Popconfirm>
          </Tooltip>
        </>
      ),
    },
  ];
  
  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
        <Col>
          <Title level={3}>Properties</Title>
        </Col>
        <Col>
          <Space>
            <Button type="primary" onClick={() => showDrawer()} style={{ marginBottom: 5 }}>
              Create Field
            </Button>
            {/* <Button
              type="primary"
              onClick={() => setShowTracking(!showTracking)}
              disabled={isModified} // Disable "Show Tracking" if changes are not saved
              style={{ marginBottom: 5 }}
            >
              {showTracking ? 'Hide Tracking' : 'Manage Field Tracking'}
            </Button> */}
          </Space>
        </Col>
      </Row>

      <Spin spinning={loadingFields || loading}>
        <Table
          columns={fieldColumns}
          dataSource={fieldsData}
          pagination={false}
          rowKey="key"
        />
      </Spin>

      {isModified && (
        <Affix offsetBottom={0}>
        <div style={{
            width: '80%',
            // left:'20px',
            padding: '10px 0',
            background: 'rgba(240, 242, 245, 0.9)', // Slightly transparent background
            position: 'fixed',
            bottom: '0px',
            left: '300px',
        }}>
          <Row justify="center">
          <Button type="default" onClick={cancelChanges} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={saveChanges}>
            Save
          </Button>
        </Row>
        </div>
        </Affix>
      )}

      <CreateFieldDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        onAddField={handleAddField}
        mtObjectId={record?.key}
        editField={editField} // Pass editField to populate form
        onSaveEdit={fetchFieldsData} // Refresh after edit
      />
    </div>
  );
};

export default ObjectFieldTab;
