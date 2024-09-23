import React from 'react';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { BASE_URL,DateFormat } from './Constant';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);     

const ChildRecordTable = ({ fieldsData, childRecords }) => {
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

      console.log('field type is '+field.type);
      // Check if the field type is Date and format accordingly
      // Check for field type and apply the necessary formatting
      if (field.type === 'Date' && value) {
        // Format date value
        console.log('console in Date');
        value = dayjs(value).format(DateFormat);
      } 
      if (field.type === 'Integer' && value==0) {
        //console.log('field type is '+field.type);
        console.log('value when integer is '+value);
        // Display 0 if the value is explicitly 0 for number fields
        value = 0;
      }
       if ((field.type === 'decimal' ) && value == 0.0) {
        // Show 0.00 if value is 0 for decimal or currency fields
        value = '0.00';
      } 
      if (field.type === 'currency') {
        if (value == 0) {
          value = '0.00';
        }
        value = `$${value}`; // Add the $ prefix to the currency value
      }
      if(field.type==='boolean' &&value){
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