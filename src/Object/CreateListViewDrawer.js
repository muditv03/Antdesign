import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, message, Card, Row, Col, Cascader } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import ApiService from '../Components/apiService';
import { BASE_URL } from '../Components/Constant';

const { Option } = Select;

const CreateListViewDrawer = ({ visible, onClose, object, fetchListViews, selectedListView }) => {
  const [form] = Form.useForm();
  const [objectName, setObjectName] = useState([]);
  const [fields, setFields] = useState([]); // State to store fetched fields
  const [selectedFields, setSelectedFields] = useState([]);
  const [lookupOptions, setLookupOptions] = useState([]); // For storing lookup options
  const [logic, setLogic] = useState('');
  const [operator, setOperator] = useState('AND');
  const [isLogicEditable, setIsLogicEditable] = useState(false);
  const [filters, setFilters] = useState([{ 1: { field: '', value: '', displayValue: '' } }]); // For managing filters
  const [valueOperator, SetValueOperator] = useState('');


  const generateLogic = (filtersArray, operatorType) => {

    const logicstr = filtersArray.map((filter, index) => index + 1).join(` ${operatorType} `);
    return logicstr;
  };

  useEffect(() => {
    setObjectName(object.name);
    fetchFields();
  }, [object]);


  const isValidParentheses = (logic) => {
    let stack = [];
    for (let char of logic) {
      if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
        if (stack.length === 0) {
          return false; // Unmatched closing parenthesis
        }
        stack.pop(); // Match found, pop the last open parenthesis
      }
    }
    return stack.length === 0; // Ensure all parentheses are closed
  };

  useEffect(() => {
    form.setFieldsValue({
      logic: logic, // Setting the field value whenever logic updates
    });
  }, [logic]);

  useEffect(() => {

    if (selectedListView) {
      // Set form values if editing an existing list view
      const transformedFields = (selectedListView.fields_to_display || []).map((field) => {
        if (field.endsWith('_id')) {
          const fieldWithoutId = field.replace('_id', '');
          return fieldWithoutId; // Capitalize first letter
        }
        return field; // Return the field as is if no '_id' suffix
      });


      form.setFieldsValue({
        list_view_name: selectedListView.list_view_name,
        object_name: selectedListView.object_name,
        logic: selectedListView.logic_string,
        fieldsToDisplay: transformedFields || [],
        sort_by: selectedListView.sort_by,
        sort_order: selectedListView.sort_order,
      });
      setSelectedFields(transformedFields || []);
      setLogic(selectedListView.logic_string);

      // Populate filters

      const existingFilters = selectedListView.conditions
        ? Object.entries(selectedListView.conditions).map(([key, { field, value }]) => {

          let operator = '';
          let actualValue = '';

          if (Object.keys(value)[0] !== "0") {
            operator = Object.keys(value)[0];
            actualValue = value[operator];

          } else {
            actualValue = value; // Extract the actual value (e.g., '50')

          }
          let op = '';
          if (operator !== '') {
            try {
              SetValueOperator(operator.replace('$', ''));
              op = operator.replace('$', '');
            } catch (error) {
              // Handle the error gracefully
              SetValueOperator(''); // or any default value
            }
          } else {
            op = '';
          }
          return {
            field,
            value: value,
            displayValue: actualValue,
            operator: op
          };
        })
        : [{ field: '', value: '', operator: '' }];
      setFilters(existingFilters); // Set filters state here
      fetchLookupRecordsForExistingFilters(existingFilters); // Fetch lookup records for existing filters
    } else {
      // Reset form and filters if creating a new list view
      form.resetFields();
      setFilters([{ field: '', value: '', displayValue: '' }]); // Reset filters state
      setLogic(''); // Reset logic when creating a new view
    }
  }, [selectedListView, form]);



  const fetchFields = async () => {
    try {
      console.log('calling api for fields ');

      const apiService = new ApiService(
        `${BASE_URL}/mt_fields/object/${object.name}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );
      apiService.makeCall()
        .then(response => {
          console.log('response is ');
          console.log(response);
          // Assuming the API returns an array of field objects with 'name' and 'label' keys
          const filteredFields = response.filter(field => field.name !== 'recordCount'); // Filter out 'recordCount'

          // Update the state with the filtered fields
          setFields(filteredFields); // Adjust as per API response structure

        })
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };


  // New function to fetch lookup records based on existing filters
  const fetchLookupRecordsForExistingFilters = (existingFilters) => {

    existingFilters.forEach(filter => {
      const selectedField = fields.find(field => field.name === filter.field);
      if (selectedField && selectedField.type === 'lookup') {

        fetchLookupRecords(selectedField.parent_object_name); // Fetch records for lookup fields
      }
    });
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
      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save field due to an unknown error';
      message.error(errorMessage);
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
    const len = filters.length + 1;
    SetValueOperator('');
    setFilters([...filters, { len: { field: '', value: '', displayValue: '' } }]);
    setLogic(generateLogic(filters, operator));
  };

  const handleRemoveFilter = (index) => {
    console.log('index after removing is ');
    console.log(index);
    const updatedFilters = [...filters];
    updatedFilters.splice(index, 1);
    SetValueOperator('');
    setFilters(updatedFilters);
    setLogic(generateLogic(updatedFilters, operator));
  };

  const handleValueOpertorChange = (index, value) => {
    const updatedFilters = [...filters];
    updatedFilters[index]["operator"] = value;
    updatedFilters[index]["value"] = '';
    updatedFilters[index]["displayValue"] = '';
    SetValueOperator(value);
    setFilters(updatedFilters);
  }

  // Handle value change for flters
  const handleValueChange = (index, value) => {
    const updatedFilters = [...filters];
    if (valueOperator) {
      updatedFilters[index]["value"] = { [`$${valueOperator}`]: value };
      updatedFilters[index]["displayValue"] = value;
      updatedFilters[index]["operator"] = valueOperator;
    } else {
      updatedFilters[index]["value"] = value;
      updatedFilters[index]["displayValue"] = value;
      updatedFilters[index]["operator"] = '';
    }
    setFilters(updatedFilters);
  };

  const handleFilterChange = (index, key, value) => {

    console.log('handle filter change is called');
    const updatedFilters = [...filters];
    console.log(updatedFilters);
    console.log(value);
    console.log(updatedFilters[index][key]);
    updatedFilters[index][key] = value[value.length - 1];
    console.log(updatedFilters);
    console.log('field while consoling value is ');

    // If field type is 'lookup', fetch records for that field's object
    console.log('fields in handle filter change is ');
    console.log(fields);
    const selectedField = fields.find(field => value.includes(field.name));
    console.log('selected field is ');
    console.log(selectedField);
    if (selectedField && selectedField.type === 'lookup') {
      console.log('lookup field is selected');
      console.log(selectedField);
      fetchLookupRecords(selectedField.parent_object_name); // Pass object name to fetch records
    }
    setFilters(updatedFilters);
    setLogic(generateLogic(filters, operator));

  };

  const handleOperatorChange = (value) => {
    setOperator(value);
    if (value !== 'custom') {
      setLogic(generateLogic(filters, value));

      setIsLogicEditable(false);
    } else {
      setIsLogicEditable(true);
    }
  };

  const onFinish = async (values) => {
    //Check if any filter is missing either field or value

    if (logic && !isValidParentheses(logic)) {
      message.error('Invalid logic: Parentheses are not balanced.');
      return; // Stop submission if parentheses are not balanced
    }


    let isValid = true;
    filters.forEach((filter, index) => {
      if (!filter.field) {
        isValid = false;
        // Show error message for the respective filter
        message.error(`Please enter field for filter ${index + 1}`);
      }
      //  else if(filter.operator && !filter.value){
      //   isValid = false;
      //   // Show error message for the respective filter
      //   message.error(`Please enter value for filter ${index + 1}`);
      //  }
    });

    if (!isValid) {
      return; // Stop the submission if validation fails
    }



    const filterObj = filters.reduce((acc, filter, index) => {
      if (filter.field) {
        acc[index + 1] = {
          field: filter.field,
          value: filter.value
        };
      }
      return acc;
    }, {});



    const adjustedFields = selectedFields.map((field) => {
      const selectedField = fields.find((f) => f.name === field);
      if (selectedField && selectedField.type === 'lookup') {
        return `${selectedField.name}_id`;
      }
      return field;
    });

    const body = {
      mt_list_view: {
        object_name: objectName,
        list_view_name: values.list_view_name,
        logic_string: logic,
        conditions: filterObj,
        fields_to_display: adjustedFields,
        sort_by: values.sort_by,
        sort_order: values.sort_order,
      },
    };

    console.log('body is ');
    console.log(body);

    try {

      if (selectedListView?._id) {
        // For updating an existing list view
        const apiServiceEdit = new ApiService(
          `${BASE_URL}/edit_list_view/${selectedListView?._id}`,
          { 'Content-Type': 'application/json' },
          'PATCH',
          body // Pass the request body
        );
        await apiServiceEdit.makeCall();
        message.success('List view updated successfully!');
      }
      else {
        // For creating a new list view

        const apiService = new ApiService(
          `${BASE_URL}/create_list_view`,
          { 'Content-Type': 'application/json' },
          'POST',
          body // Pass the request body
        );
        await apiService.makeCall();

        message.success('List view created successfully!');
      }
      fetchListViews(); // Refresh the list views
    } catch (error) {
      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save list view due to an unknown error';
      message.error(errorMessage);
    }

    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={selectedListView?._id ? 'Edit List View' : 'Create List View'}
      width="40%"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={() => {
            form.resetFields(); // Reset form fields when Cancel is clicked
            onClose(); // Close the drawer
          }}>
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
            <Input defaultValue={object.name} />
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
              defaultValue={selectedFields}
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
              <Col span={1} style={{ width: '100%' }}>{index + 1}.</Col> {/* Display the filter number */}
              <Col span={7}>
                <Cascader

                  placeholder="Select field"
                  value={filter.field}
                  allowClear={false} // Disable the clear option

                  onChange={(value) =>

                    handleFilterChange(index, 'field', value)}
                  style={{ width: '100%' }}
                  options={fields.map((field) =>
                    field.type === 'Address'
                      ? {
                        label: field.label, // Show the Address field
                        value: field.name, // Value is the field name
                        children: [  // Add children options for Address fields
                          { value: `${field.name}.street`, label: 'Street' },
                          { value: `${field.name}.city`, label: 'City' },
                          { value: `${field.name}.state`, label: 'State' },
                          { value: `${field.name}.postalcode`, label: 'Postal Code' },
                          { value: `${field.name}.country`, label: 'Country' },
                        ],
                      }
                      : { value: field.name, label: field.label }
                  )}
                />
              </Col>
              <Col span={7}>
                <Select
                  name="ValueOperator"
                  Label="Select operator"
                  placeholder="Select operator"
                  style={{ width: '100%' }}
                  onChange={(e) => handleValueOpertorChange(index, e)}
                  value={filter.operator}

                >
                  <Option value='gt'>Greater than</Option>
                  <Option value='gte'>Greater than equal to</Option>
                  <Option value='lt'>Less than</Option>
                  <Option value='lte'>Less than equal to</Option>
                  <Option value=''>Equal to</Option>
                  <Option value='ne'>Not Equal to</Option>
                </Select>
              </Col>
              <Col span={7}>
                {fields.find((f) => f.name === filter.field)?.type === 'lookup' ? (
                  <Select
                    allowClear
                    placeholder="Select value"
                    value={filter.displayValue}
                    style={{ width: '100%' }} // Ensuring full width for the select field
                    onChange={(value) => handleValueChange(index, value)}
                    options={lookupOptions}
                  />
                ) : (
                  <Input
                    placeholder="Enter value"
                    value={filter.displayValue}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                  />
                )}
              </Col>

              <Col span={1}>
                <MinusCircleOutlined onClick={() => handleRemoveFilter(index)} />
              </Col>

            </Row>
          ))}

          <Button type="dashed" onClick={handleAddFilter} block icon={<PlusOutlined />}>
            Add Filter
          </Button>


          <h3>Operator</h3>
          <Form.Item name="operator" label="Operator">
            <Select defaultValue="AND" onChange={handleOperatorChange}>
              <Option value="AND">AND</Option>
              <Option value="OR">OR</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>

          <Input
            label="Enter logic"
            defaultValue={logic}
            value={logic}
            onChange={(e) => setLogic(e.target.value)}
            disabled={!isLogicEditable}
            placeholder="Logic"
          />
        </Form>
      </Card>
    </Drawer>
  );
};

export default CreateListViewDrawer;
