import React from 'react';
import { useLocation ,useNavigate,Link} from 'react-router-dom';
import { Table, Form, message,Card, Button, Row, Col, Typography, Tabs,Breadcrumb} from 'antd';
import ObjectFieldTab from '../Field/ObjectFieldsTab';
import CreateListView from './CreateListView';
import ObjectRelatedListTab from './ObjectRelatedListTab';
import { useState,useEffect } from 'react';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService'; 
import CreateObjectDrawer from './CreateObjectDrawer';
import CreateLayout from './CreateLayout';
import SearchLayout from './SearchLayout';


const { Title } = Typography;
const { TabPane } = Tabs;

const ObjectFieldDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { record } = location.state || {};
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  // const [fieldsData, setFieldsData] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Determines whether the user is editing or viewing
  const [allFields, setAllFields] = useState([]); // Holds all fields fetched from the API

  const handleAddOrEditObject = (updatedObject) => {
    // Logic to update the object in state
  };
  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      try {
        const apiServiceForAllFields = new ApiService(
          `${BASE_URL}/mt_fields/object/${record.name}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );
        const getSelectedValuesApiService = new ApiService(
          `${BASE_URL}/mt_objects/${record._id}`,
          { 'Content-Type': 'application/json' },
          'GET',
        );
        let responseForSelectedValues = await getSelectedValuesApiService.makeCall();
        const selectedFieldNames = responseForSelectedValues.search_layout_fields || [];
        setSelectedFields(
          selectedFieldNames.map((name) => ({ name, isSelected: false }))
        );
  
        // setSelectedFields(responseForSelectedValues.search_layout_fields);
        console.log('selected values');
        console.log(selectedFields);
        // console.log(responseForSelectedValues.search_layout_fields);
        const response = await apiServiceForAllFields.makeCall();
        const allFields = response
        .filter((field) => field.name !== 'recordCount')
        .map((field) => ({ ...field, key: field._id, isSelected: false }));

        const availableFieldsFiltered = allFields.filter(
          (field) => !selectedFieldNames.includes(field.name)
        );
  
        setAvailableFields(availableFieldsFiltered);

          console.log('all values respons');
          console.log(availableFields);

      } catch (error) {
        const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to fetch fields due to an unknown error';
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);
  
  const handleAddToSelected = () => {
    const selected = availableFields.filter((field) => field.isSelected);
    setSelectedFields([...selectedFields, ...selected]);
    console.log(selectedFields);
    setAvailableFields(availableFields.filter((field) => !field.isSelected));
    console.log('handleaddtoselected');
  };

  // Move selected field from Selected to Available
  const handleRemoveFromSelected = () => {
    const unselected = selectedFields.filter((field) => field.isSelected);
    setAvailableFields([...availableFields, ...unselected]);
    setSelectedFields(selectedFields.filter((field) => !field.isSelected));
    console.log(selectedFields);

    console.log('handleremovefromselected');
  };

  // Toggle field selection
  const toggleSelection = (field, list, setList) => {
    if (!isEditMode) return;
    setList(
      list.map((item) =>
        item.name === field.name
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  // Save selected fields
  const handleSave = () => {
    const selectedArray = selectedFields.map((field) => field.name);
    console.log('Selected Fields:', selectedArray);
    sendSelectedValues(selectedArray);
    setIsEditMode(false);
    // Send selectedArray to the backend if needed
  };
  const sendSelectedValues = async (values)=>{
    console.log('inside sendselval');
    const requestBody = {
        search_layout_fields: values,
    };  
    const apiService = new ApiService(
      `${BASE_URL}/mt_objects/${record._id}`,
      { 'Content-Type': 'application/json' },
      'PUT',
      { mt_object: requestBody }
    );
    let response = await apiService.makeCall();
    if (response && response._id) {
      message.success('Fields Updated Successfully');
    } else {
      throw new Error('Invalid Response From Server');
    }
  }
  const handleEdit = () => {
    setIsEditMode(true); // Switch to edit mode
  };
  const styles = {
    listContainer: {
      border: '1px solid #ddd',
      padding: '10px',
      width: '300px',
      maxHeight: '400px', // Set a maximum height
      overflowY: 'auto', // Add vertical scrollbar if content exceeds height
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '100px'
    },
  };
  

  const dataset = [
    {
      key: record?.key || 'N/A',
      label: record?.label || 'N/A',
      name: record?.name || 'N/A',
      plurallabel: record?.pluralLabel || 'N/A',
    },
  ];

  const createTab = () => {
    setDrawerVisible(true);
    setEditingRecord(record);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingRecord(null);
  };

  return (
    <div>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/setup?tab=objectManager" style={{ fontWeight: 'bold' }}>
            Object Manager
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{record?.label || 'Object Details'}</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={3}>{record?.label || 'Object Details'}</Title>
      <Tabs defaultActiveKey="1" tabPosition='left'>
        <TabPane tab="Details" key="1">

          <Card>
            <Row justify="end" style={{ marginBottom: '16px' }}>

            </Row>
            <Form form={form} layout="vertical" style={{ position: 'relative' }}>
              <Title level={3} style={{ marginTop: '0px' }}>Details</Title>
              <Row gutter={24} style={{ marginBottom: '0px' }}>
                {dataset.map((field, index) => (
                  <React.Fragment key={index}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Label"
                        labelCol={{ span: 6 }} // Adjust label column width
                        wrapperCol={{ span: 18 }} // Adjust wrapper column width
                        style={{ marginBottom: '8px', borderBottom: '1px solid  #ddd' }} // Decrease bottom margin
                      >
                        <span style={{ fontWeight: 500 }}>{field.label}</span>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Name"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ marginBottom: '8px', borderBottom: '1px solid  #ddd' }}
                      >
                        <span style={{ fontWeight: 500 }}>{field.name}</span>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Plural Label"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ marginBottom: '8px', borderBottom: '1px solid  #ddd' }}
                      >
                        <span style={{ fontWeight: 500 }}>{field.plurallabel}</span>
                      </Form.Item>
                    </Col>
                  </React.Fragment>
                ))}
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Properties" key="2">
          <Card>
            <ObjectFieldTab object={record} />
          </Card>
        </TabPane>
        <TabPane tab="Related Lists" key="3">
          <Card>
            <ObjectRelatedListTab object={record} />
          </Card>
        </TabPane>
        <TabPane tab="Create List View" key="4">
          <Card>
            <CreateListView object={record} />
          </Card>
        </TabPane>
      <TabPane tab="Layouts" key="5">
          <Card>
            <CreateLayout object={record} />
          </Card>
        </TabPane>
        <TabPane tab="Search Result Layout" key="6">
          <Card>
          <h2>Search Result Layout</h2>
            <SearchLayout setAvailableFields={setAvailableFields}  setIsEditMode={setIsEditMode} setSelectedFields={setSelectedFields} availableFields={availableFields} selectedFields ={selectedFields} loading= {loading} isEditMode={isEditMode} toggleSelection={toggleSelection} handleSave={handleSave} handleEdit={handleEdit} />
        </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ObjectFieldDetail;
