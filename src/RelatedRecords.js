import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Row, Col, Button, Form, message } from 'antd';
import { BASE_URL } from './Constant';
import ChildRecordTable from './RecordTable';
import ApiService from './apiService';
import CreateRecordDrawer from './CreateRecordDrawer';

const { Title } = Typography;

const RelatedRecord = ({ objectName, recordId }) => {
  const [groupedData, setGroupedData] = useState({});
  const [childRecordsMap, setChildRecordsMap] = useState({});
  const [fieldsDataMap, setFieldsDataMap] = useState({});
  const [currentChildObjectName, setCurrentChildObjectName] = useState('');
  const [currentFieldsData, setCurrentFieldsData] = useState([]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch related records
  const fetchRelatedRecords = async () => {
    try {
      const relatedListService = new ApiService(
        `${BASE_URL}/related_lists/for_object/${objectName}`,
        {},
        'GET'
      );
      const response = await relatedListService.makeCall();
      if (Array.isArray(response) && response.length > 0) {
        const grouped = response.reduce((acc, record) => {
          const relatedListName = record.related_list.related_list_name;
          if (!acc[relatedListName]) {
            acc[relatedListName] = [];
          }
          acc[relatedListName].push(record.related_list);
          setFieldsDataMap((prevMap) => ({
            ...prevMap,
            [record.related_list._id]: record.fields_data || [],
          }));
          return acc;
        }, {});
        setGroupedData(grouped);
        // Fetch child records for each related list
        Object.keys(grouped).forEach((relatedListName) => {
          grouped[relatedListName].forEach((relatedList) => {
            fetchChildRecords(relatedList._id, recordId, relatedListName);
          });
        });
      }
    } catch (err) {
      console.error('Error fetching related records', err);
    }
  };

  useEffect(() => {
    fetchRelatedRecords();
  }, [objectName, recordId]);

  const handleDeleteChildRecord = useCallback(
    async (childObjectName, childRecordId) => {
      try {
        const apiService = new ApiService(
          `${BASE_URL}/delete_record/${childObjectName}/${childRecordId}`,
          {},
          'DELETE'
        );
        await apiService.makeCall();
        message.success('Record deleted successfully');

        // Refresh child records after deletion
        fetchRelatedRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        message.error('Failed to delete record');
      }
    },
    [fetchRelatedRecords]
  );

  // Fetch fields for the child object
  const fetchFieldsForChildObject = async (childObjectName) => {
    try {
      const fieldsService = new ApiService(
        `${BASE_URL}/mt_fields/object/${childObjectName}`,
        {},
        'GET'
      );
      const response = await fieldsService.makeCall();
      setCurrentFieldsData(response);
    } catch (err) {
      console.error('Error fetching fields for child object:', err);
    }
  };

  const fetchChildRecords = async (relatedListId, recordId, relatedListName) => {
    try {
      const childRecordsService = new ApiService(
        `${BASE_URL}/related_lists/${relatedListId}/${recordId}/child_records`,
        {},
        'GET'
      );
      const response = await childRecordsService.makeCall();
      setChildRecordsMap((prevMap) => ({
        ...prevMap,
        [relatedListId]: response || [],
      }));
    } catch (err) {
      console.error(`Error fetching child records for ${relatedListName}:`, err);
    }
  };

  const handleFinish = async (values) => {
    const updatedValues = {};
    
    currentFieldsData.forEach((field) => {
      const fieldName = field.name;
      if (field.type === 'lookup') {
        updatedValues[`${fieldName.toLowerCase()}`] = values[fieldName];
      } else {
        updatedValues[fieldName] = values[fieldName];
      }
    });

    const body = {
      object_name: currentChildObjectName,
      data: {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined,
        ...updatedValues,
      }
    };

    try {
      const apiService = new ApiService(
        `${BASE_URL}/insert_or_update_records`,
        { 'Content-Type': 'application/json' },
        'POST',
        body
      );
      await apiService.makeCall();
      message.success(selectedRecord?._id && !selectedRecord?.isClone ? 'Record updated successfully' : 'Record created successfully');
      setIsDrawerVisible(false);
      fetchRelatedRecords();
      form.resetFields();
    } catch (error) {
      console.error('Error saving record:', error);
      const errorMessage = error.response?.data?.name
        ? `Failed to create record because ${error.response.data.name[0]}`
        : `Failed to create record due to an unknown error`;
      message.error(errorMessage);
    }
  };

  // Open drawer for the selected related list
  const handleNewButtonClick = async (relatedList) => {
    setCurrentChildObjectName(relatedList.child_object_name);
    await fetchFieldsForChildObject(relatedList.child_object_name);
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setCurrentFieldsData([]);
  };

  return (
    <div>
      {Object.keys(groupedData).length > 0 ? (
        Object.keys(groupedData).map((relatedListName) =>
          groupedData[relatedListName].map((relatedList) => (
            <Card
              key={relatedList._id}
              title={
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={4} style={{ margin: 0 }}>
                      {relatedListName}
                    </Title>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      onClick={() => handleNewButtonClick(relatedList)}
                    >
                      New
                    </Button>
                  </Col>
                </Row>
              }
              style={{ marginBottom: 16 }}
            >
              <ChildRecordTable
                records={groupedData[relatedListName]}
                fieldsToDisplay={relatedList.fields_to_display || []}
                childRecords={childRecordsMap[relatedList._id] || []}
                fieldsData={fieldsDataMap[relatedList._id] || []}
                childObjectName={relatedList.child_object_name}
                onDelete={handleDeleteChildRecord} // Pass the delete function
                relatedListId={relatedList._id} // Pass related list ID for deletion
                currentRecordId={recordId} // Pass the current record ID
                currentObjectName={objectName} // Pass the current object name
              />
            </Card>
          ))
        )
      ) : (
        <p>No related records found</p>
      )}
      <CreateRecordDrawer
        visible={isDrawerVisible}
        onClose={handleDrawerClose}
        onFinish={handleFinish}
        loading={false}
        fieldsData={currentFieldsData || []}
        form={form}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
};

export default RelatedRecord;
