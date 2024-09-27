// import React, { useState, useEffect } from 'react';
// import { Table } from 'antd';
// import dayjs from 'dayjs';
// import { BASE_URL, DateFormat } from './Constant';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import ApiService from './apiService'; // Import ApiService class
// dayjs.extend(customParseFormat);

// const ChildRecordTable = ({ fieldsData, childRecords, childObjectName }) => {
//   const [lookupNames, setLookupNames] = useState({});

//   // Function to fetch the lookup name
//   const fetchLookupName = async (objectName, id) => {
//     try {
//       const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
//       const responseData = await apiService.makeCall();
//       console.log(responseData); // Process the data as needed
//       return responseData.Name; // Assuming 'Name' is the field you're interested in
//     } catch (error) {
//       console.error('Error fetching lookup name:', error);
//       return ''; // Return empty string in case of error
//     }
//   }; 

//   useEffect(() => {
//     const fetchAllLookupNames = async () => {
//       const lookupNamePromises = childRecords.map(async (childRecord) => {
//         let newLookupNames = {};
//         for (const field of fieldsData) {
//           if (field.type === 'lookup' && childRecord[`${field.name.toLowerCase()}_id`]) {
//             const lookupId = childRecord[`${field.name.toLowerCase()}_id`];
//             const lookupName = await fetchLookupName(field.name, lookupId);
//             newLookupNames[lookupId] = lookupName;
//           }
//         }
//         return newLookupNames;
//       });

//       // Combine all the lookup names into one state
//       const allLookupNames = await Promise.all(lookupNamePromises);
//       const combinedLookupNames = Object.assign({}, ...allLookupNames);
//       setLookupNames(combinedLookupNames);
//     };

//     fetchAllLookupNames();
//   }, [childRecords, fieldsData, childObjectName]);

//   // Dynamically generate columns based on fieldsData (which contains labels and API names)
//   const columns = fieldsData.map((field) => ({
//     title: field.label, // Use the label as column heading
//     dataIndex: field.name, // Use the API name to map the data
//     key: field.name,
//   }));

//   // Generate dataSource from child records
//   const dataSource = childRecords.map((childRecord) => {
//     const row = {
//       key: childRecord._id,
//     };

//     // Populate fields dynamically using API names from fieldsData
//     fieldsData.forEach((field) => {
//       let value = childRecord[field.name] || ''; // Get the value from childRecord

//       if (field.type === 'lookup' && childRecord[`${field.name.toLowerCase()}_id`]) {
//         const lookupId = childRecord[`${field.name.toLowerCase()}_id`];
//         value = lookupNames[lookupId] || 'Loading...'; // Show 'Loading...' until the name is fetched
//       }

//       // Format date fields
//       if (field.type === 'Date' && value) {
//         value = dayjs(value).format(DateFormat);
//       }

//       // Handle Integer and Decimal types
//       if (field.type === 'Integer' && value === 0) {
//         value = 0;
//       }

//       if (field.type === 'decimal' && value == 0.0) {
//         value = '0.00';
//       }

//       if (field.type === 'currency') {
//         value = value === 0 ? '0.00' : `$${value}`;
//       }

//       if (field.type === 'boolean') {
//         value = value ? 'True' : 'False';
//       }

//       // Add the value to the row object for this child record
//       row[field.name] = value;
//     });

//     return row;
//   });

//   return (
//     <Table
//       dataSource={dataSource} // Display all records
//       columns={columns}
//       pagination={false} // Disable pagination for now
//       scroll={{ y: 160 }} // Set the scroll height to make the table scrollable
//     />
//   );
// };

// export default ChildRecordTable;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Tooltip, Form } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { message, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { BASE_URL, DateFormat } from './Constant';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ApiService from './apiService'; // Import ApiService class
import CreateRecordDrawer from './CreateRecordDrawer';

dayjs.extend(customParseFormat);

const ChildRecordTable = ({ fieldsData, childRecords, childObjectName, onEdit, onClone, onDelete }) => {
  const [lookupNames, setLookupNames] = useState({});
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [objectName, setObjectName] = useState(null);
  const [objectPluralName, setObjectPluralName] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fieldsDataState, setFieldsDataState] = useState([]); // Define the state for fieldsData
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [lookupOptions, setLookupOptions] = useState([]);
  const [lookupName, setLookupName] = useState('');
  const [lookupFieldName, setLookupFieldName] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Function to fetch the lookup name
  const fetchLookupName = async (objectName, id) => {
    try {
      const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
      const responseData = await apiService.makeCall();
      return responseData.Name || ''; // Assuming 'Name' is the field you're interested in
    } catch (error) {
      console.error('Error fetching lookup name:', error);
      return '';
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
      const allLookupNames = await Promise.all(lookupNamePromises);
      const combinedLookupNames = Object.assign({}, ...allLookupNames);
      setLookupNames(combinedLookupNames);
    };

    if (childRecords.length > 0) {
      fetchAllLookupNames();
    }
  }, [childRecords, fieldsData, childObjectName]);
 
  // Define columns dynamically based on fieldsData
  const columns = fieldsData.map((field,index) => ({
    title: field.label,
    dataIndex: field.name,
    key: field.name,
    render: (value, record) => {
      
      // Make the first column a clickable link
      if (index === 0) {
        return (
          <a
            href="#"
            onClick={() => {
              navigate(`/record/${childObjectName}/${record._id}`); // Use record.key directly
              window.location.reload(); // Reload the page after navigation
            }}
            >
            {value}
          </a>
        );
      }
      if (field.type === 'lookup' && record[`${field.name.toLowerCase()}_id`]) {
        const lookupId = record[`${field.name.toLowerCase()}_id`];
        return lookupNames[lookupId] || 'Loading...';
      }

      if (field.type === 'Date' && value) {
        return dayjs(value).format(DateFormat);
      }

      if (field.type === 'currency') {
        return value ? `$${value}` : '0.00';
      }

      if (field.type === 'boolean') {
        return value ? 'True' : 'False';
      }

      if (field.type === 'Integer' || field.type === 'decimal') {
        return value === 0 ? '0.00' : value;
      }

      return value;
    },
  }));

  const handleEditClick = async (record) => {
    try {
      // Fetch fields data
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${childObjectName}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );

      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsDataState(fieldsResponse); // Use the correct state setter

      const formattedRecord = { ...record };

      fieldsResponse.forEach(field => {
        if (field.type === 'Date' && record[field.name]) {
          formattedRecord[field.name] = dayjs(record[field.name]).format(DateFormat);
        }
      });

      setSelectedRecord(formattedRecord);
      form.setFieldsValue(formattedRecord);
      setDrawerVisible(true);

      const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');

      for (const lookupField of lookupFields) {
        const ob = lookupField.name;
        const objectName = lookupField.name.toLowerCase();
        const recordId = record[`${objectName}_id`];

        if (recordId) {
          const apiServiceForRecord = new ApiService(
            `${BASE_URL}/fetch_single_record/${ob}/${recordId}`,
            { 'Content-Type': 'application/json' },
            'GET'
          );

          const response = await apiServiceForRecord.makeCall();
          setLookupName(prev => ({ ...prev, [lookupField.name]: response.Name }));

          form.setFieldsValue({
            [lookupField.name]: recordId
          });
        }
      }
    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloneClick = async (record) => {
    const clonedRecord = { ...record, _id: undefined, isClone: true };

    try {
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${childObjectName}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );

      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsDataState(fieldsResponse);

      const formattedClonedRecord = { ...clonedRecord };

      fieldsResponse.forEach(field => {
        if (field.type === 'Date' && clonedRecord[field.name]) {
          formattedClonedRecord[field.name] = dayjs(clonedRecord[field.name]).format(DateFormat);
        }
      });

      setSelectedRecord(formattedClonedRecord);
      form.setFieldsValue(formattedClonedRecord);

      const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');

      for (const lookupField of lookupFields) {
        const ob = lookupField.name;
        const objectName = lookupField.name.toLowerCase();
        console.log(`${objectName}_id`)
        const recordId = record[`${objectName}_id`];
        console.log('REc')
        console.log(record)

        if (recordId) {
          const apiServiceForRecord = new ApiService(
            `${BASE_URL}/fetch_single_record/${ob}/${recordId}`,
            { 'Content-Type': 'application/json' },
            'GET'
          );

          const response = await apiServiceForRecord.makeCall();
          setLookupName(prev => ({ ...prev, [lookupField.name]: response.Name }));

          form.setFieldsValue({
            [lookupField.name]: recordId
          });
        }
      }
    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      setLoading(false);
    }

    setDrawerVisible(true);
  };

  const fetchRecords = async () => {
    // Logic to fetch records goes here
    try {
      const apiService = new ApiService(
        `${BASE_URL}/fetch_records/${childObjectName}`,
        {},
        'GET'
      );
      const recordsResponse = await apiService.makeCall();
      setRecords(recordsResponse);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleFinish = async (values) => {
    const updatedValues = {};
  
    // Iterate through the fields data to check if the field is a lookup
    fieldsData.forEach((field) => {
      const fieldName = field.name;
      if (field.type === 'lookup') {
        // Convert lookup field names to lowercase
        updatedValues[`${fieldName.toLowerCase()}`] = values[fieldName];
      } else {
        // Keep other fields unchanged
        updatedValues[fieldName] = values[fieldName];
      }
    });
  
    console.log('object is '+objectName)

    const body = {
      object_name: childObjectName,
      data: {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined, // If cloning, exclude the ID
        ...updatedValues // Use the updated values
      }
    };
  
    try {
      //setLoading(true);
      console.log('object name is '+objectName)

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
      setDrawerVisible(false);
      fetchRecords();
      form.resetFields();
    } catch (error) {
      console.error('Error saving record:', error);
  
      const errorMessage = error.response?.data?.name
        ? `Failed to create record because ${error.response.data.name[0]}`
        : `Failed to create record due to an unknown error`;
  
      message.error(errorMessage);
    } finally {
      setLoading(false); // Ensure loading is stopped regardless of success or failure
    }
  };

  const deleteRecord = async (record) => {
    try {
      const apiService = new ApiService(
        `${BASE_URL}/delete_record/${childObjectName}/${record._id}`,
        {},
        'DELETE'
      );

      await apiService.makeCall();
      message.success('Record deleted successfully.');
      fetchRecords();
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }
  };

  columns.push({
    title: 'Action',
    key: 'operation',
    render: (_, record) => (
      <>
        <Tooltip title="Edit">
          <EditOutlined
            onClick={() => handleEditClick(record)}
            style={{ marginRight: 16, fontSize: '14px', cursor: 'pointer' }}
          />
        </Tooltip>
        <Tooltip title="Clone">
          <CopyOutlined
            onClick={() => handleCloneClick(record)}
            style={{ marginRight: 16, fontSize: '14px', cursor: 'pointer' }}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure you want to delete this record?"
            onConfirm={() => deleteRecord(record)}
          >
            <DeleteOutlined
              style={{ color: 'red', fontSize: '14px', cursor: 'pointer' }}
            />
          </Popconfirm>
        </Tooltip>
      </>
    ),
  });

  return (
    <div>

    <Table
      dataSource={childRecords}
      columns={columns}
      rowKey="_id"
      pagination={false}
      loading={loading}
      />
      <CreateRecordDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onFinish={handleFinish}
        loading={loading}
        fieldsData={fieldsData}
        selectedRecord={selectedRecord}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        form={form}
      />
      </div>
  );
};

export default ChildRecordTable;
