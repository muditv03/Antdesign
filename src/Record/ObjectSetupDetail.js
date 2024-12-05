import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography, Button, Tooltip, Popconfirm, Row, Col, Drawer, Form, Input, Checkbox, Card, Dropdown, Menu, message, Select, DatePicker, Spin, Modal, Space, Upload, Avatar, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DownOutlined, EditOutlined, CopyOutlined, DeleteOutlined, ImportOutlined, SettingOutlined, CaretDownOutlined, PhoneOutlined, FilterOutlined } from '@ant-design/icons';
import { BASE_URL, DateFormat } from '../Components/Constant';
import dayjs from 'dayjs';
import CreateRecordDrawer from './CreateRecordDrawer';
import CreateListViewDrawer from '../Object/CreateListViewDrawer';
import ApiService from '../Components/apiService'; // Import ApiService class
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { generateBody, formatRecordData, fetchLookupData, colors, getUniqueColor } from '../Components/Utility';

dayjs.extend(customParseFormat);

const { Title } = Typography;
const { Option } = Select;


const ObjectSetupDetail = () => {

  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [objectName, setObjectName] = useState(null);
  const [objectPluralName, setobjectPluralName] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fieldsData, setFieldsData] = useState([]);
  const [fieldsDataDrawer, setFieldsDataDrawer] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [lookupName, setLookupName] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [listViews, setListViews] = useState([]);
  const [selectedView, setSelectedView] = useState('');
  const [selectedListView, setSelectedListView] = useState(null); // State to store the selected list view for editing
  const [isListViewDrawerVisible, setIsListViewDrawerVisible] = useState(false);
  const [objectForListView, setObjectForListView] = useState();
  const [ListViewInDrawer, SetListViewInDrawer] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Number of records per page
  const [totalRecords, setTotalRecords] = useState(0); // Total number of records
  const [isMetadataFetched, setIsMetadataFetched] = useState(false); // Track metadata fetching



  useEffect(() => {
    setIsMetadataFetched(false);
    setError('');
    setRecords([]);
    setTotalRecords('');
    // setLoading(true);

    console.log('id is ');
    console.log(id);

    const fetchmetadata = async () => {
      try {
        const apiServiceForObject = new ApiService(
          `${BASE_URL}/mt_objects/${id}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );
        const objectResponse = await apiServiceForObject.makeCall();
        console.log('in the fetch metadata for object', objectResponse?.name);

        setObjectForListView(objectResponse);
        setObjectName(objectResponse?.name);
        setobjectPluralName(objectResponse?.pluralLabel);

        const apiServiceForFields = new ApiService(
          `${BASE_URL}/mt_fields/object/${objectResponse?.name}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );

        const getFieldsResponse = await apiServiceForFields.makeCall();
        setFieldsDataDrawer(getFieldsResponse);

        // Mark metadata as fetched
        setIsMetadataFetched(true);
        // setLoading(false);
      } catch (error) {
        console.error('Error fetching metadata:', error);
        setLoading(false);

      }
    };

    fetchmetadata();
  }, [id]);

  useEffect(() => {
    setRecords([]);
    if (isMetadataFetched) {
      setCurrentPage(1); // Reset to the first page
      setSelectedListView(null); // Clear selected view
      setSelectedView(''); // Reset selected view state
      fetchRecords('', 1); // Fetch records with updated metadata
    }
  }, [id, isMetadataFetched]); // Trigger only when metadata is fetched

  const fetchRecords = async (selectedViewId, page = currentPage) => {
    setLoading(true);

    console.log('object name is in fetch records method');
    console.log(objectName);
    const offsetvalue = (page - 1) * pageSize; // Calculate offset for API
    // setOffSet(offsetvalue);
    const limit = pageSize;
    let apiServiceForRecords;

    try {
      if (selectedViewId) {
        apiServiceForRecords = new ApiService(
          `${BASE_URL}/mt_list_views/${selectedViewId?._id}/records/${limit}/${offsetvalue}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );

      } else {
        apiServiceForRecords = new ApiService(
          `${BASE_URL}/fetch_records/${objectName}/${limit}/${offsetvalue}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );
      }

      const recordsResponse = await apiServiceForRecords.makeCall();
      console.log('records response are');
      console.log(recordsResponse);
      if (recordsResponse.records) {
        setRecords(recordsResponse.records);
      }
      else {
        setRecords(recordsResponse);
      }
      setTotalRecords(recordsResponse.total);

      if (selectedViewId?._id) {
        // Get the field names from the recordsResponse
        const recordFieldNames = Object.keys(recordsResponse[0] || {}); // First record as an example
        const fieldOfListView = selectedViewId?.fields_to_display;

        // Filter fields from fieldsResponse based on whether their name exists in the recordFieldNames
        const matchingFields = fieldsDataDrawer.filter(field => {
          return fieldOfListView.includes(field.name);
        });

        // Set only the matching fields
        setFieldsData(matchingFields);
      }
      else {
        console.log('fields which are setting are');
        console.log(fieldsDataDrawer);
        setFieldsData(fieldsDataDrawer);

      }
    }
    catch (err) {
      console.log(err);
      const errorMessage = err && typeof err === 'object'
        ? Object.entries(err).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save record due to an unknown error';
      setError(err.response?.data?.error || errorMessage);
    }
    finally {
      setLoading(false);
    }
    setCurrentPage(page);
  }

  useEffect(() => {
    setCurrentPage(1);
    if (objectName) {
      fetchListViews();
    }
  }, [objectName]);


  const fetchListViews = async () => {
    const apiService = new ApiService(
      `${BASE_URL}/list-views/${objectName}`,
      { 'Content-Type': 'application/json' },
      'GET'
    );
    try {
      const response = await apiService.makeCall();
      setListViews(response.list_views); // Update state with fetched data
      console.log(listViews);

    } catch (error) {
      console.error("Error fetching list views:", error); // Log any errors
    } finally {
      // setLoading(false); // Set loading to false after the API call
    }
  };


  const handleViewChange = (value) => {
    console.log('id of view is ');
    console.log(value);
    if (value == "All Records") {

    }
    console.log(listViews);
    const matchedView = listViews.find(view => view._id === value);
    console.log('list view');
    console.log(matchedView);

    setSelectedListView(matchedView);

    setSelectedView(value);
    console.log(value);
    if (value) {
      console.log('console in handle view change');
      fetchRecords(matchedView, 1); // Fetch records for the selected list view
    } else {
      fetchRecords(); // Fetch all records if "All Records" is selected
    }
  };


  const handleCreateClick = async () => {
    setSelectedRecord(null); // Ensure no record is selected when creating a new record
    form.resetFields(); // Clear the form fields
    setDrawerVisible(true);
    setTimeout(() => {
      const drawerContent = document.querySelector('.ant-drawer-body');
      if (drawerContent) {
        drawerContent.scrollTop = 0; // Reset scroll to the top
      }
    }, 200);

    try {
      //setLoading(true);

      // Create an instance of ApiService for fetching fields data
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${objectName}`,
        { 'Content-Type': 'application/json' },
        'GET' // Specify the method as 'GET'
      );

      // Fetch the fields data
      const response = await apiServiceForFields.makeCall();
      setFieldsDataDrawer(response);

    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      // setLoading(false); // Stop the spinner regardless of success or failure
    }
  };


  const handleEditClick = async (record) => {
    // Fetch fields data first to check for date fields
    try {
      //setLoading(true);

      const apiServiceforCurrentRecord = new ApiService(
        `${BASE_URL}/fetch_single_record/${objectName}/${record._id}`,
        { 'Content-Type': 'application/json' },
        'GET' // Specify the method as 'GET'
      );
      // Create an instance of ApiService for fetching fields data
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${objectName}`,
        { 'Content-Type': 'application/json' },
        'GET' // Specify the method as 'GET'
      );

      const recordResponse = await apiServiceforCurrentRecord.makeCall();
      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsDataDrawer(fieldsResponse);

      // Format date fields in the record before setting them in the form
      const formattedRecord = await formatRecordData(recordResponse, fieldsResponse, BASE_URL);
      setSelectedRecord(formattedRecord);
      form.setFieldsValue(formattedRecord);
      setDrawerVisible(true);

      setTimeout(() => {
        const drawerContent = document.querySelector('.ant-drawer-body');
        if (drawerContent) {
          drawerContent.scrollTop = 0; // Reset scroll to the top
        }
      }, 300);

      // Fetch lookup data
      fetchLookupData(recordResponse, fieldsResponse, BASE_URL, setLookupName, form);

      console.log('form');
      console.log(form.getFieldValue('Account'));

    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      // setLoading(false);
    }
  };



  const handleCloneClick = async (record) => {
    try {
      // Fetch the original record data
      const apiServiceforCurrentRecord = new ApiService(
        `${BASE_URL}/fetch_single_record/${objectName}/${record._id}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );

      const recordResponse = await apiServiceforCurrentRecord.makeCall();

      // Fetch fields data
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${objectName}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );

      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsDataDrawer(fieldsResponse);

      // Clone and remove ID and set isClone to true
      const clonedRecord = { ...recordResponse, _id: undefined, isClone: true };

      // Format the cloned record data
      const formattedClonedRecord = await formatRecordData(clonedRecord, fieldsResponse, BASE_URL);
      setSelectedRecord(formattedClonedRecord);
      form.setFieldsValue(formattedClonedRecord);

      // Fetch and set lookup data
      fetchLookupData(clonedRecord, fieldsResponse, BASE_URL, setLookupName, form);

    } catch (error) {
      console.error('Error fetching API response:', error);
    } finally {
      // setLoading(false);
    }

    setDrawerVisible(true); // Open the drawer after setting the values
  };



  const handleFinish = async (values) => {
    console.log(values);
    const updatedValues = generateBody(fieldsDataDrawer, values);
    const body = {
      object_name: objectName,
      data: {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined, // If cloning, exclude the ID
        ...updatedValues // Use the updated values
      }
    };
    console.log('body is');
    console.log(body);

    try {
      //setLoading(true);


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
      fetchRecords(selectedView);
      form.resetFields();
    } catch (error) {
      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save record due to an unknown error';
      message.error(errorMessage);
    } finally {
      // setLoading(false); // Ensure loading is stopped regardless of success or failure
    }
  };


  const handleLabelClick = (record) => {
    console.log(id);
    if (record._id) {
      navigate(`/record/${objectName}/${record._id}`, { state: { record, objectid: id } });
    } else {
      console.error("Record ID is undefined");
    }
  };



  const deleteRecord = async (record) => {
    try {
      // Create ApiService instance for DELETE request
      const apiService = new ApiService(
        `${BASE_URL}/delete_record/${objectName}/${record._id}`,
        {}, // Headers (if any)
        'DELETE'
      );

      await apiService.makeCall();
      message.success('Record deleted successfully.');
      fetchRecords(selectedView, currentPage);
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }
  };


  const confirmDelete = async () => {
    deleteRecord(selectedRecord);

    setIsDeleteModalVisible(false);

  };

  // if (loading) {
  //   return <p>Loading...</p>;
  // }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const numberOfFieldsToShow = 5;

  // Filter fields, but always include the auto-number field
  const filteredFieldsData = fieldsData.filter(
    field => !['recordCount', 'CreatedBy', 'LastModifiedBy'].includes(field.name)
  );

  // Separate the "Name" and "Auto-number" fields
  const nameField = filteredFieldsData.find(field => field.name === 'Name');

  // Get other fields, excluding "Name" and "Auto-number" fields
  const otherFields = filteredFieldsData
    .filter(field => field.name !== 'Name' && !field.is_auto_number)
    .slice(0, numberOfFieldsToShow);

  // Combine columns in the desired sequence: Name, Auto-number, other fields
  const fieldsToShow = [nameField, ...otherFields].filter(Boolean); // filter(Boolean) removes undefined



  const columns = fieldsToShow.map((field, index) => ({
    title: field.label,
    dataIndex: field.name,
    key: field.name,
    sorter: field.name === 'Name' ? (a, b) => (a[field.name]?.localeCompare(b[field.name]) || 0) : undefined,

    render: (text, record) => {
      if (field.type === 'boolean') {
        return <Checkbox checked={text} disabled />;
      } else if (field.type === 'Date') {
        return text ? dayjs(text).format(DateFormat) : ''; // Format date as DD-MM-YYYY
      } else if (field.type === 'DateTime') {
        return text ? dayjs(text).utc().format('DD/MM/YYYY HH:mm:ss') : ''; // Format DateTime as DD/MM/YYYY HH:mm:ss
      }
      else if (field.type === 'currency') {
        return text ? `$${text.toFixed(2)}` : ''; // Format as currency with dollar sign
      } else if (field.type === 'Integer') {
        return text === undefined || text === null ? '' : text === 0 ? '0' : text; // Show 0 for blank or zero values
      } else if (field.type === 'percentage') {
        return text ? `${text * 100}%` : ''; // Format as currency with dollar sign
      }
      else if (field.type === 'decimal') {
        return text === undefined || text === null || text === '0' ? '' : Number(text).toFixed(2); // Show 0.00 for blank values
      } else if (field.type === 'Email') {
        return text ? (
          <a href={`mailto:${text}`} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : '';
      } else if (field.type === 'URL') {
        return text ? (
          <a href={text.startsWith('http') ? text : `http://${text}`} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : '';
      } else if (field.type === 'lookup') {

        let lookupId = '';

        lookupId = record[field.name];
        const ob = field.parent_object_name;

        if (!record[field.name + '_id']) {
          return '';
        }
        else {
          return (
            <a
              href={`/record/${ob}/${lookupId?._id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <Avatar
                size='small'
                style={{
                  backgroundColor: '#87d068',
                  marginRight: 8,
                }}
              >
                {lookupId?.Name.charAt(0).toUpperCase()}
              </Avatar>
              {lookupId?.Name}
            </a>

          );
        }
      }
      else if (field.type === 'Address') {
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
      } else if (field.type === 'Phone' && text) {
        // Add PhoneOutlined for phone numbers
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ marginRight: 8 }} />
            {text || ''}
          </div>
        );
      }

      else if (field.type === 'Rich-Text') {
        console.log('Text-Area filed')
        return (
          <div dangerouslySetInnerHTML={{ __html: text }} />
        );
      }
      else if (field.type === 'MultiSelect') {
        // Check if text is an array (i.e., the MultiSelect field has multiple values)
        return Array.isArray(text) ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {text.map((value, index) => (
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
          text || ''
        );
      }




      return index === 0 ? (
        <a onClick={() => handleLabelClick(record)}>{text}</a>
      ) : (
        text || ''
      );
    }
  }));

  columns.push({
    title: 'Action',
    key: 'operation',
    render: (_, record) => (
      <>
        <Tooltip title="Edit">
          <EditOutlined
            onClick={() => handleEditClick(record)}
            style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
          />
        </Tooltip>

        <Tooltip title="Clone">
          <CopyOutlined
            onClick={() => handleCloneClick(record)}
            style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
          />
        </Tooltip>

        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => deleteRecord(record)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined style={{ color: 'red', marginRight: 8, fontSize: '14px', cursor: 'pointer' }} />
          </Popconfirm>
        </Tooltip>
      </>
    ),
  });

  const showCreateListDrawer = (listView) => {
    SetListViewInDrawer(listView); // Set the selected list view for editing
    setIsListViewDrawerVisible(true); // Show the drawer
  };

  const closeCreateListDrawer = () => {
    setIsListViewDrawerVisible(false); // Hide the drawer
  };

  const handleListViewMenuClick = ({ key }) => {
    if (key === 'create') {
      showCreateListDrawer();
    } else if (key === 'edit') {
      showCreateListDrawer(selectedListView);
    } else if (key === 'clone') {
      if (selectedListView) {
        // Clone the selected list view without the id and modify the name
        const clonedListView = {
          ...selectedListView, // clone the selected list view
          _id: undefined, // remove the id
          list_view_name: `Cloned by ${selectedListView?.list_view_name}`, // replace name with the cloned name
        };
        console.log(clonedListView);

        // Show the drawer with the cloned list view
        showCreateListDrawer(clonedListView);
      }
    }
    else if (key === 'delete') {
      console.log('delete clicked');
    }
  };

  const listViewMenu = (
    <Menu onClick={handleListViewMenuClick}>
      <Menu.Item key="create">Create</Menu.Item>
      <Menu.Item key="edit" disabled={!selectedListView}>Edit</Menu.Item>
      <Menu.Item key="clone" disabled={!selectedListView}>Clone</Menu.Item>
      <Menu.Item key="delete" disabled={!selectedListView}>Delete</Menu.Item>

    </Menu>
  );

  const handleFileUpload = () => {
    navigate(`/import`);
  };

  const mapOperator = (operator) => {
    switch (operator) {
      case "$gt":
        return ">";
      case "$gte":
        return ">=";
      case "$lt":
        return "<";
      case "$lte":
        return "<=";
      case "$ne":
        return "!=";
      default:
        return operator; // Fallback for unknown operators
    }
  };


  return (
  
    <Card>
      {/* <Spin spinning={loading} tip="Loading..." size="small"> */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
            <Col>
              <Title level={3} style={{ marginTop: '10px' }}>Records for {objectPluralName}</Title>
              <Select value={selectedView} onChange={handleViewChange} style={{ width: 200, marginBottom: 16 }}>
                <Option value="">All Records</Option>
                {listViews.map(view => (
                  <Option key={view._id} value={view._id}>{view.list_view_name}</Option>
                ))}
              </Select>

              <Dropdown overlay={listViewMenu} trigger={['click']}>
                <Button
                  type="text"
                  style={{
                    marginLeft: 10, marginBottom: 16, border: '1px solid #d9d9d9',
                  }}
                >
                  <SettingOutlined />
                  <CaretDownOutlined style={{ marginLeft: 4 }} />
                </Button>
              </Dropdown>

              {selectedListView?.conditions && (
                <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 10 }}>
                  <FilterOutlined style={{ fontSize: '14px', marginRight: 5 }} />
                  {Object.entries(selectedListView?.conditions).map(([key, condition]) => (
                    <Tag key={key} color="blue" style={{ marginRight: 5 }}>
                      {/* Display field and value appropriately */}
                      {condition.field} {typeof condition.value === 'object'
                        ? Object.entries(condition.value).map(([operator, value]) => `${mapOperator(operator)} ${value}`).join(', ')
                        : `= ${condition.value.toString()}`}
                    </Tag>
                  ))}
                </div>
              )}

            </Col>

            <Col style={{ marginTop: '10px' }}>
              <Button icon={<ImportOutlined />} onClick={handleFileUpload} style={{ marginBottom: 5, marginRight: '5px' }}>
                Import Records
              </Button>
              <Button type="primary" onClick={handleCreateClick} style={{ marginBottom: 5, marginRight: '5px' }}>
                Create Record
              </Button>

            </Col>
          </Row>
          <div style={{ flex: 1, overflow: 'auto' }}>
          <Spin spinning={loading} tip="Loading..." size="small">
          <Table columns={columns}
              dataSource={records}
              rowKey="_id"
              pagination={{
                current: currentPage,
                pageSize: 10, // Number of records per page
                total: totalRecords, // Total records for pagination
                onChange: (page) => {
                  fetchRecords(selectedListView, page); // Fetch records for the selected page
                },
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`, // Display range and total

              }}
            />
            </Spin>
          </div>


           {(drawerVisible &&      
          <CreateRecordDrawer
            visible={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            onFinish={handleFinish}
            loading={loading}
            fieldsData={fieldsDataDrawer}
            selectedRecord={selectedRecord}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            form={form}
          />
        )}

          {(isListViewDrawerVisible &&     
          <CreateListViewDrawer
            visible={isListViewDrawerVisible}
            onClose={closeCreateListDrawer}
            object={objectForListView}
            fetchListViews={fetchListViews}
            selectedListView={ListViewInDrawer} // Pass selected list view for editing
           
          />
        ) }

          <Modal
            title="Confirm Deletion"
            visible={isDeleteModalVisible}
            onOk={confirmDelete}
            onCancel={() => setIsDeleteModalVisible(false)}
            okText="Delete"
            cancelText="Cancel"
            centered
          >
            <p>Are you sure you want to delete this record?</p>
          </Modal>
        </div>
      {/* </Spin> */}
    </Card>
 

  );
};

export default ObjectSetupDetail;
