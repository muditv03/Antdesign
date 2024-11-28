import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Tooltip, Form,Tag } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { message, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { BASE_URL, DateFormat } from '../Components/Constant';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ApiService from '../Components/apiService'; // Import ApiService class
import CreateRecordDrawer from './CreateRecordDrawer';
import { generateBody, formatRecordData, fetchLookupData } from '../Components/Utility';
dayjs.extend(customParseFormat);

const colors = ['blue', 'green', 'red', 'purple', 'orange', 'volcano', 'gold', 'cyan', 'lime', 'pink'];

const getUniqueColor = (index) => {
    // Assign a color based on the index, wrapping around if there are more values than colors
    return colors[index % colors.length];
};

const ChildRecordTable = ({ fieldsData, childRecords, childObjectName, onEdit, onClone, onDelete, relatedListId, currentRecordId, currentObjectName, refreshRecords }) => {

  //console.log('id is '+currentRecordId);
  //console.log('object name is'+currentObjectName);
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
          if (field.type === 'lookup' && childRecord[`${field.name}_id`]) {
            const lookupId = childRecord[`${field.name}_id`];
            const lookupName = await fetchLookupName(field.parent_object_name, lookupId);
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
  const columns = fieldsData.map((field, index) => ({
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

      if (field.name === 'recordCount') {
        return null;
      }
      if (field.type === 'lookup' && record[`${field.name}_id`]) {
        const lookupId = record[`${field.name}_id`];
        const lookupName = lookupNames[lookupId] || 'Loading...';

        if (field.name === 'user') {
          return lookupName; // Simply return the name without a link if it's 'user'
        } else {
          return (
            <a href={`/record/${field.parent_object_name}/${lookupId}`} target="_blank" rel="noopener noreferrer">
              {lookupName}
            </a>
          ); // Otherwise, make it a link
        }

      }
      if (field.type === 'Address') {
        // Ensure the address is properly constructed from the record
        const address = record[field.name]; // Access the address object
        if (address) {
          // Combine address fields into a single string
          const { street, city, state, country, postal_code } = address;
          return [
            street,
            city,
            state,
            country,
            postal_code,
          ].filter(Boolean).join(', '); // Join non-empty fields with a comma
        }
        return ''; // Return an empty string if the address is not available
      }
     
       if (field.type === 'MultiSelect' && value) {
        // Check if text is an array (i.e., the MultiSelect field has multiple values)
        return Array.isArray(value) ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {value.map((value, index) => (
              <Tag
                key={index}
                color={getUniqueColor(index)} // Get a unique color for each tag
                style={{
                  fontSize: '14px', // Adjust font size for better readability
                  padding: '6px 12px', // Adjust padding for larger size
                  borderRadius: '8px', // Rounded corners for aesthetic appeal
                  lineHeight: '1.5', // Adjust line height for better spacing
                }}
              >
                {value}
              </Tag>
            ))}
          </div>
        ) : (
          value || ''
        );
      }

      if (field.type === 'Date' && value) {
        return dayjs(value).format(DateFormat);
      }
      if (field.type === 'DateTime' && value) {
        return dayjs(value).utc().format('DD/MM/YYYY HH:mm:ss');
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
      setFieldsDataState(fieldsResponse);

      // Format the record data
      const formattedRecord = await formatRecordData(record, fieldsResponse, BASE_URL);
      setSelectedRecord(formattedRecord);
      form.setFieldsValue(formattedRecord);
      setDrawerVisible(true);

      // Fetch lookup data
      await fetchLookupData(record, fieldsResponse, BASE_URL, setLookupName, form);

      refreshRecords();
    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloneClick = async (record) => {
    const clonedRecord = { ...record, _id: undefined, isClone: true };

    try {
      // Fetch fields data
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${childObjectName}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );

      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsDataState(fieldsResponse);
      console.log('Field response while cloning is:', JSON.stringify(fieldsResponse));

      // Format the cloned record data
      const formattedClonedRecord = await formatRecordData(clonedRecord, fieldsResponse, BASE_URL);
      setSelectedRecord(formattedClonedRecord);
      form.setFieldsValue(formattedClonedRecord);

      // Fetch and set lookup data
      await fetchLookupData(clonedRecord, fieldsResponse, BASE_URL, setLookupName, form);

      refreshRecords(); // Refresh records if needed

    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      setLoading(false);
    }

    setDrawerVisible(true); // Open the drawer after setting the values
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
    const updatedValues = generateBody(fieldsDataState, values);
    const body = {
      object_name: childObjectName,
      data: {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined, // If cloning, exclude the ID
        ...updatedValues // Use the updated values
      }
    };

    try {
      //setLoading(true);
      console.log('object name is ' + objectName)

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
      refreshRecords();
      form.resetFields();
    } catch (error) {
      console.error('Error saving record:', error);

      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save record due to an unknown error';
      message.error(errorMessage);
    } finally {
      setLoading(false); // Ensure loading is stopped regardless of success or failure
    }
  };

  const deleteRecord = async (record) => {
    try {
      onDelete(childObjectName, record._id); // Call the delete function passed as a prop

      fetchRecords();
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }
  };

  columns.push({
    title: 'Action',
    key: 'operation',
    width: 130,

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
        expandable={{
          expandedRowRender: (record) => (
            <p
              style={{
                margin: 0,
              }}
            >
              This is sample record description
            </p>
          ),
          rowExpandable: (record) => record.name !== 'Not Expandable',
        }}
        pagination={false}
        loading={loading}
        scroll={{
          x: 'max-content',
        }}

      />
      <CreateRecordDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onFinish={handleFinish}
        loading={loading}
        fieldsData={fieldsDataState}
        selectedRecord={selectedRecord}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        form={form}
      />
    </div>
  );
};

export default ChildRecordTable;
