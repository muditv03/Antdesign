import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, Typography } from 'antd';
import { BASE_URL } from './Constant';

const { Title } = Typography;

const RelatedRecord = ({ objectName, recordId }) => {
  const [groupedData, setGroupedData] = useState({});
  const [childRecordsMap, setChildRecordsMap] = useState({}); // Store child records by related list ID

  useEffect(() => {
    const fetchRelatedRecords = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/related_lists/for_object/${objectName}`);

        console.log('API response:', response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          // Group data by child_object_name
          const grouped = response.data.reduce((acc, record) => {
            if (!acc[record.child_object_name]) {
              acc[record.child_object_name] = [];
            }
            acc[record.child_object_name].push(record);
            return acc;
          }, {});

          setGroupedData(grouped);
          console.log('Grouped data:', grouped);

          // Fetch child records for each related list
          for (const childObjectName of Object.keys(grouped)) {
            for (const relatedList of grouped[childObjectName]) {
              fetchChildRecords(relatedList._id, recordId, childObjectName);
            }
          }
        } else {
          console.warn('Unexpected API response format or empty data');
        }
      } catch (err) {
        console.error('Error fetching related records', err);
      }
    };

    fetchRelatedRecords();
  }, [objectName, recordId]);

  // Fetch child records for a specific related list
  const fetchChildRecords = async (relatedListId, recordId, childObjectName) => {
    try {
      const response = await axios.get(`${BASE_URL}/related_lists/${relatedListId}/${recordId}/child_records`);

      setChildRecordsMap((prevMap) => ({
        ...prevMap,
        [relatedListId]: response.data,
      }));

      console.log(`Child records for ${childObjectName} (relatedListId: ${relatedListId}):`, response.data);
    } catch (err) {
      console.error(`Error fetching child records for ${childObjectName} (relatedListId: ${relatedListId}):`, err);
    }
  };

  const renderTable = (records, relatedListId) => {
    // Dynamically generate columns based on fields_to_display in child records
    const columns = records[0]?.fields_to_display.map((field) => ({
      title: field, // Column heading
      dataIndex: field, // Field name
      key: field,
    })) || [];

    const dataSource = (childRecordsMap[relatedListId] || []).map((childRecord) => {
      const row = {
        key: childRecord._id,
      };

      // Populate fields dynamically from the child record data
      records[0]?.fields_to_display.forEach((field) => {
        row[field] = childRecord[field] || ''; // Fill the row with the field values from the API response
      });

      return row;
    });

    console.log(`Render table for relatedListId ${relatedListId}:`, dataSource);

    return (
      <Table
        dataSource={dataSource.slice(0, 3)} // Show only 3 records
        columns={columns}
        pagination={false}
        scroll={{ y: 150 }} // Set the scroll height to make the table scrollable
      />
    );
  };

  return (
    <div>
      {Object.keys(groupedData).map((childObjectName) => (
        groupedData[childObjectName].map((relatedList) => (
          <Card
            key={relatedList._id}
            title={
              <Title level={4} style={{ margin: 0 }}>
                {childObjectName}
              </Title>
            }
            style={{ marginBottom: 16 }}
          >
            {renderTable(groupedData[childObjectName], relatedList._id)}
          </Card>
        ))
      ))}
    </div>
  );
};

export default RelatedRecord;
