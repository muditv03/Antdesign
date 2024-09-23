import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { BASE_URL, DateFormat } from './Constant';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ApiService from './apiService'; // Import ApiService class
dayjs.extend(customParseFormat);

const ChildRecordTable = ({ fieldsData, childRecords, childObjectName }) => {
  const [lookupNames, setLookupNames] = useState({});

  // Function to fetch the lookup name
  const fetchLookupName = async (objectName, id) => {
    try {
      const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
      const responseData = await apiService.makeCall();
      console.log(responseData); // Process the data as needed
      return responseData.Name; // Assuming 'Name' is the field you're interested in
    } catch (error) {
      console.error('Error fetching lookup name:', error);
      return ''; // Return empty string in case of error
    }
  };

  useEffect(() => {
    const fetchAllLookupNames = async () => {
      const lookupNamePromises = childRecords.map(async (childRecord) => {
        let newLookupNames = {};
        for (const field of fieldsData) {
          if (field.type === 'lookup' && childRecord[`${field.name.toLowerCase()}_id`]) {
            const lookupId = childRecord[`${field.name.toLowerCase()}_id`];
            const lookupName = await fetchLookupName(field.name, lookupId);
            newLookupNames[lookupId] = lookupName;
          }
        }
        return newLookupNames;
      });

      // Combine all the lookup names into one state
      const allLookupNames = await Promise.all(lookupNamePromises);
      const combinedLookupNames = Object.assign({}, ...allLookupNames);
      setLookupNames(combinedLookupNames);
    };

    fetchAllLookupNames();
  }, [childRecords, fieldsData, childObjectName]);

  // Dynamically generate columns based on fieldsData (which contains labels and API names)
  const columns = fieldsData.map((field) => ({
    title: field.label, // Use the label as column heading
    dataIndex: field.name, // Use the API name to map the data
    key: field.name,
  }));

  // Generate dataSource from child records
  const dataSource = childRecords.map((childRecord) => {
    const row = {
      key: childRecord._id,
    };

    // Populate fields dynamically using API names from fieldsData
    fieldsData.forEach((field) => {
      let value = childRecord[field.name] || ''; // Get the value from childRecord

      if (field.type === 'lookup' && childRecord[`${field.name.toLowerCase()}_id`]) {
        const lookupId = childRecord[`${field.name.toLowerCase()}_id`];
        value = lookupNames[lookupId] || 'Loading...'; // Show 'Loading...' until the name is fetched
      }

      // Format date fields
      if (field.type === 'Date' && value) {
        value = dayjs(value).format(DateFormat);
      }

      // Handle Integer and Decimal types
      if (field.type === 'Integer' && value === 0) {
        value = 0;
      }

      if (field.type === 'decimal' && value == 0.0) {
        value = '0.00';
      }

      if (field.type === 'currency') {
        value = value === 0 ? '0.00' : `$${value}`;
      }

      if (field.type === 'boolean') {
        value = value ? 'True' : 'False';
      }

      // Add the value to the row object for this child record
      row[field.name] = value;
    });

    return row;
  });

  return (
    <Table
      dataSource={dataSource} // Display all records
      columns={columns}
      pagination={false} // Disable pagination for now
      scroll={{ y: 160 }} // Set the scroll height to make the table scrollable
    />
  );
};

export default ChildRecordTable;
