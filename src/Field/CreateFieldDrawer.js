import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Select, Card, Spin, Checkbox, Tooltip, Row, Col, Cascader } from 'antd';
import { BASE_URL, helpTextFormula } from '../Components/Constant';
import { InfoCircleOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'; // Import the InfoCircle icon

import ApiService from '../Components/apiService'; // Import ApiService class
import pluralize from 'pluralize';
import TextArea from 'antd/es/input/TextArea';

const { Option } = Select;

const CreateFieldDrawer = ({ visible, onClose, onAddField, mtObjectId, editField, onSaveEdit }) => {
  const [form] = Form.useForm();
  const [fieldType, setFieldType] = useState('');
  const [isAutoNumber, setIsAutoNumber] = useState(false); // State for auto number checkbox
  const [isFormula, setIsFormula] = useState(false); // State for auto number checkbox
  const [picklistValues, setPicklistValues] = useState([]);
  const [availableObjects, setAvailableObjects] = useState([]);
  const [loading, setLoading] = useState(false); // Spinner state
  const isEditMode = !!editField; // Check if it's edit mode
  const [fieldForFormula, setFieldsforFormula] = useState([]);
  const [formula, setFormula] = useState('');
  const [isValidFormula, setIsValidFormula] = useState(null); // null means not checked yet
  const [validationMessage, setValidationMessage] = useState(null);
  const [selectedCC, setSelectedCC] = useState([]);
  const [isRequired, setIsRequired] = useState(false); // State for auto number checkbox
  const [isUnique, setIsUnique] = useState(false); // State for auto number checkbox
  const [isExternalId, setIsExternalID] = useState(false); // State for auto number checkbox
  const [isFieldTrackingEnabled,setIsFieldTrackingEnabled] = useState(false);
  const [ParentObjectFields,setParentObjectFields]=useState([]);

  const [logic, setLogic] = useState('');
  const [operator, setOperator] = useState('AND');
  const [isLogicEditable, setIsLogicEditable] = useState(false);
  const [filters, setFilters] = useState([{ 1: { field: '', value: '', displayValue: '' } }]); // For managing filters
  const [valueOperator, SetValueOperator] = useState('');
  const [parentfieldlookupOptions, setParentFieldLookupOptions] = useState([]); // For storing lookup options



  // Utility function to sanitize label and create API name
  const generateApiName = (label) => {
    return label
      .replace(/[^a-zA-Z]/g, '') // Remove all characters except letters (a-z, A-Z)
      .replace(/\s+/g, '')       // Remove all spaces
      .trim();
  };
  //To reset form and call the onClose method from parent..
  const handleCancel = () => {
    console.log('inside handlecancel');
    setIsRequired(false);
    setIsExternalID(false);
    setIsUnique(false);
    setIsFieldTrackingEnabled(false);
    form.resetFields(); // Reset fields when the cancel button is clicked
    onClose(); // Close the drawer
  };

  // Handle label change and update API name
  const handleLabelChange = (e) => {
    const label = e.target.value;
    const currentApiName = form.getFieldValue('name');


    // Only set the name if the field is not a lookup
    if (!isEditMode && !currentApiName) {
      form.setFieldsValue({
        name: generateApiName(label), // Set the API name based on the sanitized label
      });
    }
  };

  // Fetch available objects for the lookup field
  useEffect(() => {
    const fetchAvailableObjects = async () => {
      try {
        const objectService = new ApiService(`${BASE_URL}/mt_objects`, {}, 'GET');
        const response = await objectService.makeCall();
        setAvailableObjects(response);
      } catch (error) {
        console.error('Error fetching objects:', error);
        message.error('Failed to fetch objects');
      }
    };
    fetchAvailableObjects();

  }, [fieldType]);


  // Initialize the form in edit mode
  useEffect(() => {
    if (editField) {


      const existingFilters = editField.lookup_config?.filter_criteria
        ? Object.entries(editField.lookup_config?.filter_criteria).map(([key, { field, value }]) => {

          console.log('inside the filters');
          console.log(editField.lookup_config.filter_criteria);
          console.log(field);
          console.log(value);
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


      console.log('filters in editing');
      console.log(existingFilters);

      form.setFieldsValue({
        ...editField,
        length: editField.decimal_places_before + editField.decimal_places_after, // Calculate total length
        decimal_places: editField.decimal_places_after, // Set decimal places
        format:editField.auto_number_format,
        startingPoint:editField.auto_number_starting,
        description:editField.description,
        helpText:editField.help_text,
        defaultValue:editField.default_value,
        required:editField.required,
        unique:editField.unique,
        external_id:editField.external_id,
        field_Tracking:editField.track_field_history,
        fieldsToDisplay:editField.lookup_config?.display_fields,
        SearchLayout:editField.lookup_config?.search_layout,
      }); 
      setFilters(existingFilters || {});
      setLogic(editField.lookup_config?.logic_string)
      setIsFormula(editField.is_formula)
      setFormula(editField.formula)
      setSelectedCC(editField.compliance_categorization)
      setFieldType(editField.type); // Set field type for conditional rendering
      setIsAutoNumber(editField.is_auto_number || false); // Set auto number state if editing
      setIsRequired(editField.required || false); // Set auto number state if editing
      setIsUnique(editField.unique || false); // Set auto number state if editing
      setIsExternalID(editField.external_id || false); // Set auto number state if editing
      setIsFieldTrackingEnabled(editField.track_field_history)
      handleParentObjectChange(editField.parent_object_name);
    } else {
      form.resetFields(); // Reset fields for creating a new field
      setIsAutoNumber(false); // Reset auto number state
    }
  }, [editField, form]);

  const handlePicklistChange = (event) => {
    const values = event.target.value.split(',').map(value => value.trim());
    setPicklistValues(values);
  };

  const handleFinish = async (values) => {


    const filterObj = filters.reduce((acc, filter, index) => {
      if (filter.field) {
        acc[index + 1] = {
          field: filter.field,
          value: filter.value
        };
      }
      return acc;
    }, {});

    console.log('filters are');
    console.log(filterObj);

    console.log(values.fieldsToDisplay);
    console.log(values.SearchLayout);
    console.log(logic);


    const lookupConfig = {
      display_fields: values.fieldsToDisplay,
      search_layout: values.SearchLayout,
      logic_string: logic,
      filter_criteria: filters.reduce((acc, filter, index) => {
        if (filter.field) {
          acc[index + 1] = {
            field: filter.field,
            value: filter.value
          };
        }
        return acc;
      }, {})
    };

    console.log('lookup config is ');
    console.log(lookupConfig);
    console.log('finish');
    console.log(isFormula);
    if (isFormula) {
      const error = validateFormulaSyntax(formula);
      console.log(error);
      if (error) {
        message.error(`Formula syntax is invalid. ${error}`);
        return;
      }
    }

    setLoading(true); // Show spinner


    const newField = {
      label: values.label,
      name: values.name,
      type: values.type,
      mt_object_id: mtObjectId,
      iseditable: values.iseditable || true,
      iswriteable: values.iswriteable || true,
      is_auto_number: isAutoNumber, 
      is_formula:isFormula,
      description:values.description,
      help_text:values.helpText,
      default_value:values.defaultValue,
      required:isRequired,
      unique:isUnique,
      external_id:isExternalId,
      track_field_history: isFieldTrackingEnabled
        };

    if (values.type === 'String' || values.type === 'Picklist') {
      newField.compliance_categorization = selectedCC
    }

    if (values.type == 'lookup') {
      newField.parent_object_name = values.parent_object_name;
      newField.relationship_name = values.relationship_name;
      newField.lookup_config = lookupConfig;
    }
    // Include starting and ending points if isAutoNumber is true
    if (isAutoNumber) {
      newField.auto_number_format = values.format; // Add starting point
      newField.auto_number_starting = values.startingPoint;     // Add ending point
    }

    console.log('formula is ');
    console.log(isFormula);
    if (isFormula) {
      newField.formula = formula;
    }

    if (values.type === 'Picklist' || values.type === 'MultiSelect') {
      newField.picklist_values = picklistValues;
    }

    if (values.type === 'decimal' || values.type === 'currency' || values.type === 'percentage') {
      newField.decimal_places_before = values.length;
      newField.decimal_places_after = values.decimal_places;
    }

    console.log('field body', JSON.stringify(newField));

    try {
      if (isEditMode) {
        // Update field logic (PUT request)
        const fieldService = new ApiService(`${BASE_URL}/mt_fields/${editField._id}`, {}, 'PUT', {
          mt_field: newField,
        });
        const response = await fieldService.makeCall();
        onSaveEdit({ ...editField, ...values }); // Update the field in the parent component

        message.success('Field updated successfully');
      } else {
        console.log(newField);
        // Create new field logic (POST request)
        const fieldService = new ApiService(`${BASE_URL}/mt_fields`, {}, 'POST', {
          mt_field: newField,
        });
        const response = await fieldService.makeCall();
        console.log('is formula before sending is ');
        console.log(isFormula);
        onAddField({
          key: Date.now(),
          label: values.label,
          name: values.name,
          type: values.type,
          iseditable: values.iseditable,
          iswriteable: values.iswriteable,
          is_formula: isFormula,
          is_auto_number: isAutoNumber,
          description:values.description,
          help_text:values.helpText,
          default_value:values.defaultValue,
          required:isRequired,
          unique:isUnique,
          external_id:isExternalId,
          track_field_history:isFieldTrackingEnabled,
          ...((values.type==='Picklist' || values.type==='String') && {
            compliance_categorization:selectedCC
          }),
          ...(isAutoNumber && { auto_number_format: values.format, auto_number_starting: values.startingPoint }),
          ...(values.type === 'Picklist' || values.type === 'MultiSelect' && { picklist_values: picklistValues }),
          ...(values.type === 'decimal' || values.type === 'percentage' || values.type === 'currency' && {
            decimal_places_before: values.length,
            decimal_places_after: values.decimal_places,
          }),
          ...(values.type === 'lookup' && {
            parent_object_name: values.parent_object_name,
            relationship_name: values.relationship_name,
            lookup_config: lookupConfig,
          }),
          ...(isFormula && { formula: formula })

        });

        message.success('Field created successfully');
      }

      onClose();
      form.resetFields();
    } catch (error) {
      console.log('error while creating field is')
      console.log(error);
      console.error('Error creating/updating field:', error);
      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save field due to an unknown error';
      message.error(errorMessage);
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  const handleFetchFeildsFromOjbect = async (object) => {
    console.log(object);
    const fieldCallout = new ApiService(`${BASE_URL}/mt_fields/object/${object}`, {}, 'GET');
    const fieldsResponse = await fieldCallout.makeCall();
    const filteredFields = fieldsResponse.filter(field => field.name !== 'recordCount');
    console.log(filteredFields);
    setFieldsforFormula(filteredFields);
  };


  const validateFormulaSyntax = (formula) => {
    // Check balanced parentheses
    const stack = [];
    for (const char of formula) {
      if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
        if (stack.length === 0) {
          return "Unbalanced parentheses.";
        }
        stack.pop();
      }
    }
    if (stack.length > 0) {
      return "Unbalanced parentheses.";
    }

    // Check for invalid operator placement
    const operatorRegex = /[\+\-\*\/]/;
    if (operatorRegex.test(formula[0]) || operatorRegex.test(formula[formula.length - 1])) {
      return "Formula cannot start or end with an operator.";
    }
    if (/[\+\-\*\/]{2,}/.test(formula)) {
      return "Operators cannot be consecutive.";
    }

    // If all checks pass
    return null;
  };



  const handleFormulaChange = (value) => {
    console.log(value);
    console.log(formula.concat(value));
    setFormula(formula.concat(value));
  };

  const validateFormula = () => {
    const error = validateFormulaSyntax(formula);
    if (error) {
      setValidationMessage(error);
      setIsValidFormula(false);
    } else {
      setValidationMessage("Formula syntax is correct.");
      setIsValidFormula(true);
    }
  };

  const handleComplianceCategorizationChange = (value) => {

    console.log('cc value is');
    console.log(value);
    setSelectedCC(value);
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
    const selectedField = ParentObjectFields.find(field => value.includes(field.name));
    console.log(selectedField);
    if (selectedField && selectedField.type === 'lookup') {
      console.log('lookup field is selected');
      console.log(selectedField);
      fetchLookupRecordsForParent(selectedField.parent_object_name); // Pass object name to fetch records

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



  const handleParentObjectChange = async (value) => {
    try {

      console.log(value);
      const apiService = new ApiService(
        `${BASE_URL}/mt_fields/object/${value}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );
      const response = await apiService.makeCall();
      const filteredFields = response.filter(field => field.name !== 'recordCount' && field.type !== 'lookup' && !field.is_formula); // Filter out 'recordCount'

      setParentObjectFields(filteredFields);
      console.log(response);
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };

  // Function to fetch records for the lookup field
  const fetchLookupRecordsForParent = async (objectName) => {
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

      setParentFieldLookupOptions(records); // Set options for the lookup field
    } catch (error) {
      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save field due to an unknown error';
      message.error(errorMessage);
    }
  };


  const generateLogic = (filtersArray, operatorType) => {

    const logicstr = filtersArray.map((filter, index) => index + 1).join(` ${operatorType} `);
    return logicstr;
  };



  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{isEditMode ? 'Edit Field' : 'Create New Field'}</div>}
      width="40%"
      onClose={!loading ? onClose : null} // Prevent drawer from closing when loading is true
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      headerStyle={{
        padding: '20px 16px',
        background: '#f0f2f5',
        borderBottom: '1px solid #e8e8e8',
      }}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 16px',
            background: '#f0f2f5',
            borderTop: '1px solid #e8e8e8',
          }}
        >
          <Button onClick={handleCancel} disabled={loading} style={{ height: '34px', width: '90px', fontSize: '14px' }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            disabled={loading}
            style={{
              height: '34px',
              width: '90px',
              fontSize: '14px',
              border: '1px solid #1890ff',
            }}
          >
            Save
          </Button>
        </div>
      }
      footerStyle={{ textAlign: 'right', padding: '0' }}
    >
      <Spin spinning={loading}> {/* Spinner */}
        <Card style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Form
            form={form}
            layout="vertical"
            hideRequiredMark
            onFinish={handleFinish}
            style={{ fontSize: '16px' }}
          >
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select the type' }]}
            >
              <Select
                showSearch
                placeholder="Select the field type"
                onChange={(value) => {
                  setFieldType(value);
                  if (value !== 'String') {
                    setIsAutoNumber(false); // Reset auto number checkbox if type is not String
                  }
                }}
              >
                <Option value="String">Text</Option>
                <Option value="Integer">Number</Option>
                <Option value="decimal">Decimal</Option>
                <Option value="Email">Email</Option>
                <Option value="currency">Currency</Option>
                <Option value="boolean">Boolean</Option>
                <Option value="Address">Address</Option>
                <Option value="Date">Date</Option>
                <Option value="DateTime">Date Time</Option>
                <Option value="percentage">Percentage (%)</Option>
                <Option value="Phone">Phone</Option>
                <Option value="Picklist">Picklist</Option>
                <Option value="MultiSelect">Multi-Select Picklist</Option>
                <Option value="lookup">Lookup</Option>
                <Option value="Text-Area">Text Area</Option>
                <Option value="URL">URL</Option>
                <Option value="Rich-Text">Rich-Text</Option>

              </Select>
            </Form.Item>


            <Form.Item
              name="label"
              label="Label"
              rules={[{ required: true, message: 'Please enter a label' }]}
            >
              <Input onBlur={handleLabelChange} placeholder="Enter label" />
            </Form.Item>
            <Form.Item
              name="name"
              label="API Name"
              rules={[
                { required: true, message: 'Please enter the name' },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const alphabetOnlyRegex = /^[a-zA-Z]+$/;
                    if (!alphabetOnlyRegex.test(value)) {
                      return Promise.reject(new Error('Name should only contain alphabets without spaces.'));
                    }
                    if (!/^[A-Z]/.test(value)) {
                      return Promise.reject(new Error('Name should start with a capital letter.'));
                    }
                    if (pluralize.isPlural(value)) {
                      return Promise.reject(new Error('API name cannot be plural.'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >

              <Input placeholder="Please enter the name" disabled={isEditMode} />

            </Form.Item>

            {fieldType === 'String' && ( // Only show for String type
              <>

                <Form.Item
                  name="autoNumber">
                  <Checkbox
                    checked={isAutoNumber}
                    onChange={(e) => setIsAutoNumber(e.target.checked)}
                    disabled={isFormula}

                  >
                    Auto Number
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name="is_formula">
                  <Checkbox
                    checked={isFormula}
                    onChange={(e) => setIsFormula(e.target.checked)}
                    disabled={isAutoNumber}
                  >
                    Is Formula
                  </Checkbox >
                </Form.Item>

              </>
            )}

            {isFormula && (
              <>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="object_for_formula"
                      label="Select Object">
                      <Select placeholder="Select an object" onChange={(e) => handleFetchFeildsFromOjbect(e)}>
                        {availableObjects.map((object) => (
                          <Option key={object.id} value={object.name}>
                            {object.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="field_for_formula"
                      label="Insert field"
                    >
                      <Select placeholder="Insert Field" onChange={(e) => handleFormulaChange(e)}>
                        {fieldForFormula.map((field) => (
                          <Option key={field.id} value={field.name}>
                            {field.name}
                          </Option>
                        ))}

                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="operator_for_formula"
                      label="Insert Operator"
                    >

                      <Select placeholder="Inset Operator" onChange={(e) => handleFormulaChange(e)}>
                        <Option value="+">+ Add</Option>
                        <Option value="-">- Subtract</Option>
                        <Option value="*">* Multiply</Option>
                        <Option value="/">/ Divide</Option>
                        <Option value="^">^ Exponentiation</Option>
                        <Option value="(">( Open Paranthesis</Option>
                        <Option value=")">) Close Paranthesis</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                </Row>

                <Row align="middle" gutter={8}>
                  <Col flex="auto">
                    <TextArea value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="Enter formula" />
                  </Col>
                  <Col>
                    <Tooltip title={helpTextFormula} placement="right">
                      <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                    </Tooltip>
                  </Col>
                </Row>
                <Button type="default" onClick={validateFormula} style={{ marginRight: 8, marginTop: 4 }}>
                  Check Status
                </Button>

                {isValidFormula !== null && (
                  <div style={{ marginTop: '10px', color: isValidFormula ? 'green' : 'red' }}>
                    {validationMessage}
                  </div>
                )}


              </>
            )}

            {isAutoNumber && ( // Only show these fields if isAutoNumber is checked
              <>
                <Form.Item
                  name="format"
                  label={
                    <span>
                      Format&nbsp;
                      <Tooltip title="Enter the format using placeholders like {0000} for the auto-incremented number. Example: INV-{0000} for invoice numbers.">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </span>
                  } rules={[
                    { required: true, message: 'Please enter the format!' },
                    {
                      pattern: /^[^\{\}]*\{0+\}$/,
                      message: 'Format should follow the pattern INV-{0000}!'
                    }
                  ]}
                >
                  <Input placeholder="Enter format" />
                </Form.Item>
                <Form.Item
                  name="startingPoint"
                  label="Starting Point"
                  rules={[{ required: true, message: 'Please enter the starting point!' }]}
                >
                  <Input type="number" placeholder="Enter starting point" />
                </Form.Item>
              </>
            )}


            {(fieldType === 'Picklist' || fieldType==='MultiSelect') && ( // Only show for Picklist type
              <Form.Item
                name="picklist_values"
                label="Picklist Values (comma separated)"
                rules={[{ required: true, message: 'Please input the picklist values!' }]}
              >
                <Input placeholder="Enter picklist values" onChange={handlePicklistChange} />
              </Form.Item>
            )}
            {fieldType === 'decimal' || fieldType === 'percentage' || fieldType === 'currency' ? ( // Only show for decimal and currency types
              <>
                <Form.Item
                  name="length"
                  label="Length"
                  rules={[{ required: true, message: 'Please enter the length!' }]}
                >
                  <Input placeholder="Enter total length" type="number" />
                </Form.Item>
                <Form.Item
                  name="decimal_places"
                  label="Decimal Places"
                  rules={[{ required: true, message: 'Please enter the decimal places!' }]}
                >
                  <Input placeholder="Enter decimal places" type="number" />
                </Form.Item>
              </>
            ) : null}

            {fieldType === 'lookup' && (
              <>
                <Form.Item
                  name="parent_object_name"
                  label="Parent Object Name"
                  rules={[{ required: true, message: 'Please enter parent object name' }]}


                >
                  <Select placeholder="Select an object" disabled={isEditMode} onChange={(e) => handleParentObjectChange(e)}>
                    {availableObjects.map((object) => (
                      <Option key={object.id} value={object.name}>
                        {object.name}
                      </Option>
                    ))}
                  </Select>

                </Form.Item>

                <Form.Item
                  name="relationship_name"
                  label="Relationship Name"
                  rules={[
                    { required: true, message: 'Please enter the name' },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        const alphabetOnlyRegex = /^[a-zA-Z]+$/;
                        if (!alphabetOnlyRegex.test(value)) {
                          return Promise.reject(new Error('Name should only contain alphabets without spaces.'));
                        }
                        if (pluralize.isPlural(value)) {
                          return Promise.reject(new Error('API name cannot be plural.'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder="Please enter relationship name" />

                </Form.Item>

                <Form.Item
                  name="fieldsToDisplay"
                  label="Fields to Display"
                  rules={[{ required: true, message: 'Please select at least one field' }]}
                >
                  <Select mode="multiple" placeholder="Select fields to display" >
                    {ParentObjectFields.map((field) => (
                      <Option key={field.id} value={field.name}>
                        {field.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="SearchLayout"
                  label="Search layout"
                  rules={[{ required: true, message: 'Please select at least one field' }]}
                >
                  <Select mode="multiple" placeholder="Select fields to display" >
                    {ParentObjectFields.map((field) => (
                      <Option key={field.id} value={field.name}>
                        {field.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>


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
                        options={ParentObjectFields.map((field) =>
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
                      {ParentObjectFields.find((f) => f.name === filter.field)?.type === 'lookup' ? (
                        <Select
                          allowClear
                          placeholder="Select value"
                          value={filter.displayValue}
                          style={{ width: '100%' }} // Ensuring full width for the select field
                          onChange={(value) => handleValueChange(index, value)}
                          options={parentfieldlookupOptions}

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
                  style={{ marginBottom: '10px' }}
                  label="Enter logic"
                  defaultValue={logic}
                  value={logic}
                  onChange={(e) => setLogic(e.target.value)}
                  disabled={!isLogicEditable}
                  placeholder="Logic"
                />

              </>
            )}

          {!isAutoNumber &&
            (fieldType === 'String' || fieldType === 'Picklist' ) && (
              <Form.Item
                name="complianceCategorization"
                label="Compliance Categorization"
              >
                <Select
                  mode="multiple"
                  placeholder="Select compliance categorization"
                  onChange={handleComplianceCategorizationChange}
                  defaultValue={selectedCC}
                  value={selectedCC}
                >
                  <Option value="PII">PII</Option>
                  <Option value="HIPAA">HIPAA</Option>
                  <Option value="GDPR">GDPR</Option>
                  <Option value="PCI">PCI</Option>
                  <Option value="COPPA">COPPA</Option>
                  <Option value="CCPA">CCPA</Option>
                </Select>
              </Form.Item>
            )}

            {!isFormula && !isAutoNumber && (
              <>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input.TextArea placeholder="Enter description" />
                </Form.Item>

                <Form.Item
                  name="helpText"
                  label="Help Text"
                >
                  <Input.TextArea placeholder="Enter help text" />
                </Form.Item>

                <Form.Item
                  name="defaultValue"
                  label="Default Value"
                >
                  <Input placeholder="Enter default value" type="text" />
                </Form.Item>


                <Form.Item name="required" >
                  <Checkbox
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                  >Required
                  </Checkbox>
                </Form.Item>

                {(fieldType!=='Picklist' && fieldType!=='MultiSelect' &&
                <>
                <Form.Item name="unique"
                >
                  <Checkbox
                    checked={isUnique}
                    onChange={(e) => setIsUnique(e.target.checked)}
                  >Unique</Checkbox>
                </Form.Item>
                <Form.Item name="external_id" >
                  <Checkbox
                    checked={isExternalId}
                    onChange={(e) => setIsExternalID(e.target.checked)}
                  >External Id</Checkbox>
                </Form.Item>
                </>
                 )}

                {(fieldType!=='Rich-Text' &&  fieldType!=='Text-Area') && (
                    <Form.Item name="field_Tracking" >
                      <Checkbox
                      checked={isFieldTrackingEnabled}
                      onChange={(e) => setIsFieldTrackingEnabled(e.target.checked)}
                      >Enable Field Tracking</Checkbox>
                    </Form.Item>
                 ) }
                </>
         )}
             
          </Form>

        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateFieldDrawer;
