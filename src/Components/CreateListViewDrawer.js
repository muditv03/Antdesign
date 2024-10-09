import React, { useState,useEffect } from 'react';
import { Drawer, Form, Input, Button, Select,message,Card,Row,Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';

const { Option } = Select;

const CreateListViewDrawer = ({ visible, onClose, object,fetchListViews }) => {
  const [form] = Form.useForm();
  const [objectName, setObjectName] = useState([]);
  const [fields, setFields] = useState([]); // State to store fetched fields
  const [selectedFields, setSelectedFields] = useState([]); 
  const [filters, setFilters] = useState([{ field: '', value: '' }]); // For managing filters
  const [lookupOptions, setLookupOptions] = useState([]); // For storing lookup options



  const fetchFields = async () => {
    try {
      const apiService = new ApiService(
        `${BASE_URL}/mt_fields/object/${object.name}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );
      const response = await apiService.makeCall();
      
      // Assuming the API returns an array of field objects with 'name' and 'label' keys
        const filteredFields = response.filter(field => field.name !== 'recordCount'); // Filter out 'recordCount'

        // Update the state with the filtered fields
        setFields(filteredFields); // Adjust as per API response structure
      console.log(fields);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

    // Function to fetch records for the lookup field
    const fetchLookupRecords = async (objectName) => {
        try {
          const apiServiceForRecords = new ApiService(
            `${BASE_URL}/fetch_records/${objectName}`,
            { 'Content-Type': 'application/json' },
            'GET'
          );
          const response = await apiServiceForRecords.makeCall();
          // Assuming response is an array of records with _id and Name fields
          const records = response.map(record => ({
            value: record._id, // Set _id as value
            label: record.Name, // Set Name as label
          }));
          setLookupOptions(records); // Set options for the lookup field
        } catch (error) {
          console.error('Error fetching lookup records:', error);
        }
      };

  const handleFieldChange = (value) => {
    if (value.length > 7) {
      message.error('You can select up to 7 fields.');
      return;
    }
    setSelectedFields(value);
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', value: '' }]);
  };

  const handleRemoveFilter = (index) => {
    const updatedFilters = [...filters];
    updatedFilters.splice(index, 1);
    setFilters(updatedFilters);
  };

  // Handle value change for filters
  const handleValueChange = (index, value) => {
    const updatedFilters = [...filters];
    updatedFilters[index].value = value;
    setFilters(updatedFilters);
  };

  const handleFilterChange = (index, key, value) => {
    const updatedFilters = [...filters];
    updatedFilters[index][key] = value;

    // If field type is 'lookup', fetch records for that field's object
    const selectedField = fields.find(field => field.name === value);
    if (selectedField && selectedField.type === 'lookup') {
      fetchLookupRecords(selectedField.name); // Pass object name to fetch records
    }
    setFilters(updatedFilters);
  };


  const onFinish = async (values) => {

    const filterObj = filters.reduce((acc, filter) => {
        if (filter.field && filter.value) {
          acc[filter.field] = filter.value;
        }
        return acc;
      }, {});
  

    console.log('Form Values: ', values);

    // Map the selected fields and adjust based on the field type
    const adjustedFields = selectedFields.map((field) => {
    
    const selectedField = fields.find((f) => f.name === field);

    if (selectedField && selectedField.type === 'lookup') {
      if (selectedField.name.toLowerCase() === 'user') {
        return `${selectedField.name}_id`; // If field name is 'User'
      } else {
        return `${selectedField.name.toLowerCase()}_id`; // For other lookup fields
      }
    }

    return field; // If not a lookup, return field as is
  });

    const body = {
      list_view: {
        object_name: objectName,
        list_view_name: values.list_view_name,
        filters: filterObj, // Pass filters
        fields_to_display: adjustedFields,
        sort_by: values.sort_by,
        sort_order: values.sort_order,
      },
    };

    // Make the API call
    try {
      const apiService = new ApiService(
        `${BASE_URL}/create_list_view`, 
        { 'Content-Type': 'application/json' },
        'POST',
        body // Pass the request body
      ); 
      const response = await apiService.makeCall();
      message.success('List view created successfully!');
      console.log('Response:', response); // Log the response if needed
      fetchListViews();
    } catch (error) {
      console.error('Error creating list view:', error);
      message.error('Failed to create list view. Please try again.');
      fetchListViews();
    }
    form.resetFields();
    onClose(); // Close drawer after submit
  };


  useEffect(() => {
    console.log(JSON.stringify(object));
    console.log(object.name);
    setObjectName(object.name);
    fetchFields(); // Call to fetch fields on object name change

    
  },[]);

  return (
    <Drawer
      title="Create List View"
      width="40%"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => form.submit()} type="primary">
            Submit
          </Button>
        </div>
      }
    >
    <Card 
        style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
      <Form form={form} layout="vertical" onFinish={onFinish} >
        <Form.Item name="object_name" label="Object Name" >
          <Input value={objectName} /> {/* Prefilled and disabled */}
        </Form.Item>

        <Form.Item name="list_view_name" label="List View Name" rules={[{ required: true, message: 'Please enter a list view name' }]}>
          <Input placeholder="Enter list view name" />
        </Form.Item>

        <Form.Item
            name="fieldsToDisplay"
            label="Fields to Display"
            rules={[{ required: true, message: 'Please select at least one field' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select fields to display"
              onChange={handleFieldChange}
              value={selectedFields}
              options={fields
                .filter((field) => !selectedFields.includes(field.name))
                .map((field) => ({ value: field.name, label: field.label }))} // Ensure unique options
            />
          </Form.Item>

        <Form.Item name="sort_by" label="Sort By">
          <Select placeholder="Select sort field">
            <Option value="created_at">Created At</Option>
            <Option value="Name">Name</Option>
          </Select>
        </Form.Item>

        <Form.Item name="sort_order" label="Sort Order">
          <Select placeholder="Select sort order">
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Select>
        </Form.Item>

          {/* Filter Section */}
          <h3>Filters</h3>
          {filters.map((filter, index) => (
            <Row key={index} gutter={16} align="middle" style={{ marginBottom: '10px' }}>
              <Col span={10}>
                <Select
                  allowClear
                  placeholder="Select field"
                  value={filter.field}
                  onChange={(value) => handleFilterChange(index, 'field', value)}
                  style={{ width: '100%' }} // Ensuring full width for the select field
                  options={fields.map((field) => ({ value: field.name, label: field.label }))}
                />
              </Col>
              <Col span={10}>
              {fields.find((f) => f.name === filter.field)?.type === 'lookup' ? (
                  <Select
                    allowClear
                    placeholder="Select value"
                    value={filter.value}
                    onChange={(value) => handleValueChange(index, value)}
                    options={lookupOptions}
                  />
                ) : (
                  <Input
                    placeholder="Enter value"
                    value={filter.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                  />
                )}
              </Col>
              <Col span={4}>
                <MinusCircleOutlined onClick={() => handleRemoveFilter(index)} />
              </Col>
            </Row>
          ))}
          <Button type="dashed" onClick={handleAddFilter} block icon={<PlusOutlined />}>
            Add Filter
          </Button>


       
      </Form>
      </Card>
    </Drawer>
  );
};

export default CreateListViewDrawer;
