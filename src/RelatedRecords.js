import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Form,message } from 'antd';







import { BASE_URL } from './Constant';
import ChildRecordTable from './RecordTable';
import ApiService from './apiService';
import CreateRecordDrawer from './CreateRecordDrawer';
const { Title } = Typography;
const RelatedRecord = ({ objectName, recordId }) => {
  const [groupedData, setGroupedData] = useState({}); // Make sure this is an object, as `Object.keys()` is used
  const [childRecordsMap, setChildRecordsMap] = useState({});
  const [fieldsDataMap, setFieldsDataMap] = useState({});
  const [currentChildObjectName, setCurrentChildObjectName] = useState(''); // For the current clicked object
  const [currentFieldsData, setCurrentFieldsData] = useState([]); // Store fields from child object for drawer form
  const [isDrawerVisible, setIsDrawerVisible] = useState(false); // Drawer visibility state
  const [form] = Form.useForm(); // Form instance
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
            [record.related_list._id]: record.fields_data || [], // Make sure fields_data is an array
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

  // Fetch fields for the child object
  const fetchFieldsForChildObject = async (childObjectName) => {
    console.log('fetching fields....')
    try {
      const fieldsService = new ApiService(
        `${BASE_URL}/mt_fields/object/${childObjectName}`,
        {},
        'GET'
      );
      const response = await fieldsService.makeCall();
      console.log('response is '+JSON.stringify(response));
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
        [relatedListId]: response || [], // Ensure it's an array
      }));
    } catch (err) {
      console.error(`Error fetching child records for ${relatedListName}:`, err);
    }
  };
  const handleFinish = async (values) => {
    const updatedValues = {};
    
    console.log('field data is '+JSON.stringify(currentFieldsData));
    // Iterate through the fields data to check if the field is a lookup
    currentFieldsData.forEach((field) => {
      const fieldName = field.name;
      console.log(fieldName);
      if (field.type === 'lookup') {
        // Convert lookup field names to lowercase
        updatedValues[`${fieldName.toLowerCase()}`] = values[fieldName];
      } else {
        // Keep other fields unchanged
        updatedValues[fieldName] = values[fieldName];
      }
    });
  
    console.log('object is '+currentChildObjectName)

    const body = {
      object_name: currentChildObjectName,
      data: {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined, // If cloning, exclude the ID
        ...updatedValues // Use the updated values
      }
    };
  
    try {
      console.log('object name is '+currentChildObjectName)

      console.log('body while updating is ' + JSON.stringify(body));
  
      // Create an instance of ApiService for the POST request
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
    } finally {
    }
  };
  // Open drawer for the selected related list
  const handleNewButtonClick = async (relatedList) => {
    setCurrentChildObjectName(relatedList.child_object_name); // Set the child object name
    await fetchFieldsForChildObject(relatedList.child_object_name); // Fetch the fields for the child object
    setIsDrawerVisible(true); // Show the drawer after fetching fields
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false); // Close the drawer
    setCurrentFieldsData([]); // Clear form data after closing
  };
 

  return (
    <div>
      {Object.keys(groupedData).length > 0 ? ( // Ensure groupedData is not empty
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
                fieldsToDisplay={relatedList.fields_to_display || []} // Ensure it's an array
                childRecords={childRecordsMap[relatedList._id] || []} // Ensure it's an array
                fieldsData={fieldsDataMap[relatedList._id] || []} // Ensure it's an array
                childObjectName={relatedList.child_object_name}
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
        fieldsData={currentFieldsData || []} // Ensure it's an array
        form={form}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
};
export default RelatedRecord;
