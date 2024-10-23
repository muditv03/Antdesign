import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography, Button,Tooltip, Popconfirm, Row, Col, Drawer, Form, Input, Checkbox, Card, Dropdown, Menu, message, Select, DatePicker,Spin, Modal,Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DownOutlined, EditOutlined, CopyOutlined, DeleteOutlined , SettingOutlined,CaretDownOutlined} from '@ant-design/icons';
import { BASE_URL,DateFormat } from './Constant';
import dayjs from 'dayjs';
import CreateRecordDrawer from './CreateRecordDrawer';
import CreateListViewDrawer from './Components/CreateListViewDrawer';
import ApiService from './apiService'; // Import ApiService class
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { generateBody } from './Components/Utility';
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
  const [lookupOptions, setLookupOptions] = useState([]);
  const [lookupName, setLookupName] = useState('');
  const [lookupFieldName, setLookupFieldName] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [listViews, setListViews] = useState([]);
  const [selectedView, setSelectedView] = useState('');
  const [lookupNameTable,setLookupNameTable]=useState('');
  const [lookupNames, setLookupNames] = useState({});
  const [selectedListView, setSelectedListView] = useState(null); // State to store the selected list view for editing
  const[isListViewDrawerVisible,setIsListViewDrawerVisible]=useState(false);
  const[objectForListView,setObjectForListView]=useState();
  const [ListViewInDrawer,SetListViewInDrawer]=useState();


  const fetchRecords = (selectedViewId) => {
    setError('');
    setLoading(true);
    // Fetch object details using ApiService
    const apiServiceForObject = new ApiService(
      `${BASE_URL}/mt_objects/${id}`,
      { 'Content-Type': 'application/json' },
      'GET'
    );
  
    apiServiceForObject.makeCall()
      .then(response => {
        const objName = response.name;
        setObjectForListView(response);
        console.log('Object name:', objName);
         setObjectName(objName); 
        let apiServiceForRecords;
        console.log('selected view id is '+selectedViewId);
        // Check if a selected list view exists
        if (selectedViewId) {
          console.log('id of list view is '+selectedViewId);
          // If selected list view is present, use the new API call
          apiServiceForRecords = new ApiService(
            `${BASE_URL}/mt_list_views/${selectedViewId?._id}/records`,
            { 'Content-Type': 'application/json' },
            'GET' 
          ); 

        } else {
          console.log('object name in else object')
          // Otherwise, use the default records API call
          apiServiceForRecords = new ApiService(
            `${BASE_URL}/fetch_records/${objName}`,
            { 'Content-Type': 'application/json' },
            'GET'
          );
        }
  
        const apiServiceForFields = new ApiService(
          `${BASE_URL}/mt_fields/object/${objName}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );
  
        return Promise.all([
          apiServiceForRecords.makeCall(),
          apiServiceForFields.makeCall(),
        ]).then(([recordsResponse, fieldsResponse]) => {
          setRecords(recordsResponse);
          setFieldsDataDrawer(fieldsResponse);
          console.log(fieldsResponse);
          console.log(recordsResponse);
          
        
         if(selectedViewId?._id){ 
        // Get the field names from the recordsResponse
        const recordFieldNames = Object.keys(recordsResponse[0] || {}); // First record as an example
        console.log('record field names are');
        console.log(recordFieldNames);
        console.log('fields to display of selected list view');
        console.log(selectedViewId?.fields_to_display);
        const fieldOfListView=selectedViewId?.fields_to_display;
        console.log('fields of list view are');
        
        // Filter fields from fieldsResponse based on whether their name exists in the recordFieldNames
        const matchingFields = fieldsResponse.filter(field => {
          if (field.type === 'lookup') {
            // Check if the field name is 'User', then match with fieldName + '_id'
           
            // Otherwise, match with fieldName.toLowerCase() + '_id'
            return fieldOfListView.includes(field.name + '_id');
          }
          // If not a lookup field, match directly by field name
          return fieldOfListView.includes(field.name);
        });

          // Set only the matching fields
          setFieldsData(matchingFields);
        }
        else{
          setFieldsData(fieldsResponse);

        }
          // Identify and set the lookup field name
          const lookupField = fieldsResponse.find(field => field.type === 'lookup');
          if (lookupField) {
            setLookupFieldName(lookupField.name);
          }
  
          // Set additional object details
          setObjectName(response.name);
          setobjectPluralName(response.pluralLabel);
        });
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Error fetching records');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const fetchListViews = async () => {
    console.log('object name is '+objectName);
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
        setLoading(false); // Set loading to false after the API call
    }
  };
  

  useEffect(() => {
    fetchRecords(selectedView);
  }, [id]);

  useEffect(() => {
    if (objectName) {
      fetchListViews();
    }
  }, [objectName]); // Use only the necessary dependencies
  

  const handleViewChange = (value) => {
    console.log('id of view is ');
    console.log(value);
    console.log(listViews);
    const matchedView = listViews.find(view => view._id === value);
    console.log('list view');
    console.log(matchedView);

    setSelectedListView(matchedView);
    
    setSelectedView(value);
    console.log(value);
    if (value) {
      console.log('console in handle view change');
      fetchRecords(matchedView); // Fetch records for the selected list view
    } else {
      fetchRecords(); // Fetch all records if "All Records" is selected
    }
  };


  useEffect(() => {
    const fetchAllLookupOptions = async () => {
      const lookupFields = fieldsDataDrawer.filter(field => field.type === 'lookup');
      const lookupOptionsObj = {};
  
      for (const lookupField of lookupFields) {
        try {
          const apiServiceForLookup = new ApiService(
            `${BASE_URL}/fetch_records/${lookupField.name}`,
            { 'Content-Type': 'application/json' },
            'GET'
          );
          const response = await apiServiceForLookup.makeCall();
          lookupOptionsObj[lookupField.name] = response; // Store options for each lookup field
        } catch (error) {
          console.error(`Error fetching lookup options for ${lookupField.name}:`, error);
        }
      }
      setLookupOptions(lookupOptionsObj); // Store all lookup options in state
    };
  
    if (fieldsDataDrawer.some(field => field.type === 'lookup')) {
      fetchAllLookupOptions();
    }
  }, [fieldsDataDrawer]);
  
  const handleCreateClick = async () => {
    setSelectedRecord(null); // Ensure no record is selected when creating a new record
    form.resetFields(); // Clear the form fields
    setDrawerVisible(true);
  
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
      setLoading(false); // Stop the spinner regardless of success or failure
    }
  };
  

  const handleEditClick = async (record) => {
    // Fetch fields data first to check for date fields
    try {
      //setLoading(true);
  
      const apiServiceforCurrentRecord= new ApiService(
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
  
      const recordResponse=await apiServiceforCurrentRecord.makeCall();
      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsDataDrawer(fieldsResponse);
  
      // Format date fields in the record before setting them in the form
      const formattedRecord = { ...recordResponse };
  
      // Iterate over the record to identify and format date fields
      fieldsResponse.forEach(field => {

        if (field.type === 'Address' && formattedRecord[field.name]) {
          console.log(recordResponse[field.name]['street']);
          // Set individual address fields
          formattedRecord[`${field.name}_street`] = recordResponse[field.name]['street'] || '';
          formattedRecord[`${field.name}_city`] = recordResponse[field.name]['city'] || '';

          formattedRecord[`${field.name}_state`] = recordResponse[field.name]['state'] || '';

          formattedRecord[`${field.name}_country`] = recordResponse[field.name]['country'] || '';

          formattedRecord[`${field.name}_postalcode`] = recordResponse[field.name]['postal_code'] || '';

         
        }

        if (field.type === 'Date' && record[field.name]) {
          // Format date to DD/MM/YYYY if the field is of Date type
          formattedRecord[field.name] = dayjs(record[field.name]).format(DateFormat);
        }
        if (field.type === 'DateTime' && record[field.name]) {
          // Format date to DD/MM/YYYY if the field is of Date type
          formattedRecord[field.name] = dayjs(record[field.name]).format('DD/MM/YYYY HH:mm:ss');
        }
      }); 
  
      setSelectedRecord(formattedRecord);
      form.setFieldsValue(formattedRecord);
      setDrawerVisible(true);
  
      // Fetch all lookup field values and prefill in the form
      const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');
  
      for (const lookupField of lookupFields) {
        const ob = lookupField.name;
        let objectName='';
        
        objectName = lookupField.name;

             
        const recordId = recordResponse[`${objectName}_id`];
  
        if (recordId) {
          // Create an instance of ApiService for fetching the single record
          const apiServiceForRecord = new ApiService(
            `${BASE_URL}/fetch_single_record/${ob}/${recordId}`,
            { 'Content-Type': 'application/json' },
            'GET' // Specify the method as 'GET'
          );
  
          const response = await apiServiceForRecord.makeCall();
          console.log('lookup record name is ' + response.Name);
  
          // Store the name in a state to display it in the UI
          setLookupName(prev => ({ ...prev, [lookupField.name]: response.Name }));
  
          // Set the lookup ID in the form
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
    // Clone the record and remove the ID, set isClone to true
  
    try {
      //setLoading(true);
  
      const apiServiceforCurrentRecord= new ApiService(
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
  
      const recordResponse=await apiServiceforCurrentRecord.makeCall();
      const fieldsResponse = await apiServiceForFields.makeCall();
      setFieldsDataDrawer(fieldsResponse);
      const clonedRecord = { ...recordResponse, _id: undefined, isClone: true };

      // Format date fields in the cloned record before setting them in the form
      const formattedClonedRecord = { ...clonedRecord };
  
      // Iterate over the fields to identify and format date fields
      fieldsResponse.forEach(field => {

        if (field.type === 'Address' && clonedRecord[field.name]) {
          // Set individual address fields
          formattedClonedRecord[`${field.name}_street`] = clonedRecord[field.name]['street'] || '';
          formattedClonedRecord[`${field.name}_city`] = clonedRecord[field.name]['city'] || '';

          formattedClonedRecord[`${field.name}_state`] = clonedRecord[field.name]['state'] || '';

          formattedClonedRecord[`${field.name}_country`] = clonedRecord[field.name]['country'] || '';

          formattedClonedRecord[`${field.name}_postalcode`] = clonedRecord[field.name]['postal_code'] || '';

          
        }
        if (field.type === 'Date' && clonedRecord[field.name]) {
          // Format date to DD/MM/YYYY if the field is of Date type
          formattedClonedRecord[field.name] = dayjs(clonedRecord[field.name]).format(DateFormat);
        }
        if (field.type === 'DateTime' && clonedRecord[field.name]) {
          // Format date to DD/MM/YYYY if the field is of Date type
          formattedClonedRecord[field.name] = dayjs(clonedRecord[field.name]).format('DD/MM/YYYY HH:mm:ss');
        }
      });
  
      // Set the formatted cloned record values in the form
      setSelectedRecord(formattedClonedRecord);
      form.setFieldsValue(formattedClonedRecord); 
  
      // Prefill all lookup fields
      const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');
  
      for (const lookupField of lookupFields) {
        const ob = lookupField.name;
        let objectName='';
       
        objectName = lookupField.name;

        
        const recordId = record[`${objectName}_id`];
  
        if (recordId) {
          // Create an instance of ApiService for fetching the single record
          const apiServiceForRecord = new ApiService(
            `${BASE_URL}/fetch_single_record/${ob}/${recordId}`,
            { 'Content-Type': 'application/json' },
            'GET' // Specify the method as 'GET'
          );
  
          const response = await apiServiceForRecord.makeCall();
          console.log('lookup record name is ' + response.Name);
  
          // Store the name in a state to display it in the UI
          setLookupName(prev => ({ ...prev, [lookupField.name]: response.Name }));
  
          // Set the lookup ID in the form
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
  
    setDrawerVisible(true); // Open the drawer after setting the values
  };
  
  

  const handleFinish = async (values) => {
    console.log('values are ');
    console.log(values);
    const updatedValues=generateBody(fieldsDataDrawer,values);
    console.log('value of lookup is');  
    console.log(values['lookup']);
    const body = {
      object_name: objectName,
      data: {
        _id: selectedRecord?._id && !selectedRecord?.isClone ? selectedRecord._id : undefined, // If cloning, exclude the ID
        ...updatedValues // Use the updated values
      }
    }; 
    console.log('body before is ');
    console.log(body);
   
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
      fetchRecords(selectedView);
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
  

  const handleLabelClick = (record) => {
    if (record._id) {
      navigate(`/record/${objectName}/${record._id}`, { state: { record } });
    } else {
      console.error("Record ID is undefined");
    }
  };

  const handleMenuClick = (e) => {
    if (e.key === '1') {
      handleEditClick(selectedRecord);
    } else if (e.key === '2') {
      setIsDeleteModalVisible(true);
    }else if (e.key === '3') {
      handleCloneClick(selectedRecord);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Edit</Menu.Item>
      <Menu.Item key="3">Clone</Menu.Item> {/* Add Clone option here */}
      <Menu.Item key="2">Delete</Menu.Item>

    </Menu>
  );

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
      fetchRecords(selectedView);
    } catch (error) {
      message.error('Failed to delete record.');
      console.error('Error deleting record:', error);
    }
  };
  

 
 
  const confirmDelete = async () => {
    deleteRecord(selectedRecord);

    setIsDeleteModalVisible(false);

  };
 
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const numberOfFieldsToShow = 5;

  // Filter fields, but always include the auto-number field
  const filteredFieldsData = fieldsData.filter(field => 
    field.name !== 'recordCount'
  );

  // Separate the "Name" and "Auto-number" fields
  const nameField = filteredFieldsData.find(field => field.name === 'Name');

  // Get other fields, excluding "Name" and "Auto-number" fields
  const otherFields = filteredFieldsData
    .filter(field => field.name !== 'Name' && !field.is_auto_number)
    .slice(0, numberOfFieldsToShow);

  // Combine columns in the desired sequence: Name, Auto-number, other fields
  const fieldsToShow = [nameField, ...otherFields].filter(Boolean); // filter(Boolean) removes undefined

    
  const fetchLookupName = async (objectName, id) => {
    const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
    const responseData = await apiService.makeCall();
    return responseData.Name || '';
  };


  const columns =  fieldsToShow.map((field, index)  => ({
    title: field.label,
    dataIndex: field.name,
    key: field.name,
    render: (text, record) => {
      if (field.type === 'boolean') {
        return text ? 'True' : 'False';
      } else if (field.type === 'Date') {
        return text ? dayjs(text).format(DateFormat) : ''; // Format date as DD-MM-YYYY
      }else if (field.type === 'DateTime') {
        return text ? dayjs(text).utc().format('DD/MM/YYYY HH:mm:ss') : ''; // Format DateTime as DD/MM/YYYY HH:mm:ss
      } 
      else if (field.type === 'currency') {
        return text ? `$${text.toFixed(2)}` : ''; // Format as currency with dollar sign
      }else if (field.type === 'Integer') {
        return text === undefined || text === null ? '' : text === 0 ? '0' : text; // Show 0 for blank or zero values
      }else if (field.type === 'decimal') {
        return text === undefined || text === null || text === '0' ? '' : Number(text).toFixed(2); // Show 0.00 for blank values
      }else if (field.type === 'Email') {
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
      }else if (field.type === 'lookup') {
        let lookupId='';
        
        lookupId = record[field.name + '_id'];
        console.log('lookup is ');
        console.log(field.name);
        
        const objectName = field.parent_object_name;
        if(lookupId){
        // Check if the name has already been fetched and stored
        if (lookupNames[lookupId]) {
          return lookupNames[lookupId]; // Return the cached name if available
        } else {
          // Fetch the name if not cached
          fetchLookupName(objectName, lookupId).then(name => {
            setLookupNames(prevState => ({ ...prevState, [lookupId]: name }));
          });
          return 'Loading...'; // Placeholder while fetching
        }
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
    console.log(listView);
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
      console.log('selected view in editing is');
      console.log(selectedListView);
      showCreateListDrawer(selectedListView);
    } else if (key === 'clone') {
      if (selectedListView) {
        // Clone the selected list view without the id and modify the name
        const clonedListView = {
          ...selectedListView, // clone the selected list view
          _id: undefined, // remove the id
          list_view_name: `Cloned by ${selectedListView?.list_view_name}`, // replace name with the cloned name
        };
        console.log('Cloning selected list view:');
        console.log(clonedListView);
  
        // Show the drawer with the cloned list view
        showCreateListDrawer(clonedListView);
      }
    }
    else if (key === 'delete') {
      console.log('Clone clicked');
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

  
  return (
    <Card>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
      <Col>
        <Title level={3} style={{ marginTop:'10px' }}>Records for {objectPluralName}</Title>
        <Select value={selectedView} onChange={handleViewChange} style={{ width: 200, marginBottom: 16 }}>
        <Option value="">All Records</Option>
        {listViews.map(view => (
          <Option key={view._id} value={view._id}>{view.list_view_name}</Option>
        ))}
      </Select>

      <Dropdown overlay={listViewMenu} trigger={['click']}>
          <Button
            type="text"
            style={{ marginLeft: 10, marginBottom: 16,border: '1px solid #d9d9d9', 
            }}
          >
            <SettingOutlined />
            <CaretDownOutlined style={{ marginLeft: 4 }} />
          </Button>
        </Dropdown>

      </Col>
      <Col  style={{ marginTop:'10px' }}>
        <Button type="primary" onClick={handleCreateClick} style={{ marginBottom: 5,marginRight:'5px' }}>
          Create Record
        </Button>
        
      </Col>
    </Row>
    <div style={{ flex: 1, overflow: 'auto' }}>

      <Table columns={columns} dataSource={records} rowKey="_id" />
      </div>
      
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

      <CreateListViewDrawer
        visible={isListViewDrawerVisible}
        onClose={closeCreateListDrawer}
        object={objectForListView}
        fetchListViews={fetchListViews}
        selectedListView={ListViewInDrawer} // Pass selected list view for editing

      />

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
    </Card>

  );
};

export default ObjectSetupDetail;