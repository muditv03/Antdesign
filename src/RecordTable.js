import React from 'react';
import { Table } from 'antd';

const ChildRecordTable = ({ fieldsToDisplay, childRecords }) => {
  // Dynamically generate columns based on fields_to_display
  const columns = fieldsToDisplay.map((field) => ({
    title: field, // Column heading
    dataIndex: field, // Field name
    key: field,
  }));

  // Generate dataSource from child records
  const dataSource = childRecords.map((childRecord) => {
    const row = {
      key: childRecord._id,
    };

    // Populate fields dynamically from the child record data
    fieldsToDisplay.forEach((field) => {
      row[field] = childRecord[field] || ''; // Fill the row with the field values from the API response
    });

    return row;
  });

  return (
    <Table
      dataSource={dataSource} // Display all records, with initial scroll showing 3 records
      columns={columns}
      pagination={false} // Disable pagination to allow scroll-based viewing
      scroll={{ y: 150 }} // Set the scroll height to make the table scrollable
    />
  );
};

export default ChildRecordTable;
