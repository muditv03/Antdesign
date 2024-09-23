import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button } from 'antd';
import { BASE_URL } from './Constant';
import ChildRecordTable from './RecordTable'; // Import the new component
import ApiService from './apiService'; // Import ApiService class
  
const { Title } = Typography;

const RelatedRecord = ({ objectName, recordId }) => {
  const [groupedData, setGroupedData] = useState({});
  const [childRecordsMap, setChildRecordsMap] = useState({}); // Store child records by related list ID
  const [fieldsDataMap, setFieldsDataMap] = useState({}); // Store fields data for each related list

  // Fetch related records using ApiService
  const fetchRelatedRecords = async () => {
    try {
      // Use ApiService to fetch related lists
      const relatedListService = new ApiService(
        `${BASE_URL}/related_lists/for_object/${objectName}`, // Endpoint
        {}, // Headers (none in this case)
        'GET' // HTTP method
      );
      const response = await relatedListService.makeCall(); // Make the API call
 
      console.log('API response:', response);

      if (Array.isArray(response) && response.length > 0) {
        // Group data by related_list_name
        const grouped = response.reduce((acc, record) => {
          const relatedListName = record.related_list.related_list_name;

          // Store related list and fields data separately
          if (!acc[relatedListName]) {
            acc[relatedListName] = [];
          }
          acc[relatedListName].push(record.related_list);

          // Store fields data mapped by related list ID
          setFieldsDataMap((prevMap) => ({
            ...prevMap,
            [record.related_list._id]: record.fields_data,
          }));

          return acc;
        }, {});

        setGroupedData(grouped);
        console.log('Grouped data:', grouped);

        // Fetch child records for each related list
        Object.keys(grouped).forEach((relatedListName) => {
          grouped[relatedListName].forEach((relatedList) => {
            fetchChildRecords(relatedList._id, recordId, relatedListName);
          });
        });
      } else {
        console.warn('Unexpected API response format or empty data');
      }
    } catch (err) {
      console.error('Error fetching related records', err);
    }
  };

  // Fetch child records using ApiService
  const fetchChildRecords = async (relatedListId, recordId, relatedListName) => {
    try {
      // Use ApiService to fetch child records
      const childRecordsService = new ApiService(
        `${BASE_URL}/related_lists/${relatedListId}/${recordId}/child_records`, // Endpoint
        {}, // Headers (none in this case)
        'GET' // HTTP method
      );
      const response = await childRecordsService.makeCall(); // Make the API call

      setChildRecordsMap((prevMap) => ({
        ...prevMap,
        [relatedListId]: response,
      }));

      console.log(`Child records for ${relatedListName} (relatedListId: ${relatedListId}):`, response);
    } catch (err) {
      console.error(`Error fetching child records for ${relatedListName} (relatedListId: ${relatedListId}):`, err);
    }
  };

  useEffect(() => {
    fetchRelatedRecords(); // Call the function when component mounts
  }, [objectName, recordId]);

  return (
    <div>
      {Object.keys(groupedData).map((relatedListName) => (
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
                  <Button type="primary">New</Button>
                </Col>
              </Row>
            }
            style={{ marginBottom: 16 }}
          >
            <ChildRecordTable 
              records={groupedData[relatedListName]} 
              fieldsToDisplay={relatedList.fields_to_display} 
              childRecords={childRecordsMap[relatedList._id] || []} 
              fieldsData={fieldsDataMap[relatedList._id] || []} // Pass the fields data
            />
          </Card>
        ))
      ))}
    </div>
  );
};

export default RelatedRecord;
