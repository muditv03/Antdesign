import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Select, Card, Spin, Checkbox,Tooltip,Row,Col } from 'antd';
import { BASE_URL } from './Constant';
import { InfoCircleOutlined } from '@ant-design/icons'; // Import the InfoCircle icon

import ApiService from './apiService'; // Import ApiService class
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
  const [fieldForFormula,setFieldsforFormula]=useState([]);
  const [formula,setFormula]=useState('');
  const [isValidFormula, setIsValidFormula] = useState(null); // null means not checked yet
  const [validationMessage, setValidationMessage] = useState('');



  // Utility function to sanitize label and create API name
  const generateApiName = (label) => {
    return label
      .replace(/[^a-zA-Z]/g, '') // Remove all characters except letters (a-z, A-Z)
      .replace(/\s+/g, '')       // Remove all spaces
      .trim();     
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
      form.setFieldsValue({
        ...editField,
        length: editField.decimal_places_before + editField.decimal_places_after, // Calculate total length
        decimal_places: editField.decimal_places_after, // Set decimal places
        format:editField.auto_number_format,
        startingPoint:editField.auto_number_starting
      });
      setFieldType(editField.type); // Set field type for conditional rendering
      setIsAutoNumber(editField.is_auto_number || false); // Set auto number state if editing
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
    setLoading(true); // Show spinner
 
    const newField = {
      label: values.label,
      name: values.name,
      type: values.type,
      mt_object_id: mtObjectId,
      iseditable: values.iseditable || true,
      iswriteable: values.iswriteable || true,
      is_auto_number: isAutoNumber, 
      is_formula:isFormula
      
    };

    if(values.type=='lookup'){
      newField.parent_object_name=values.parent_object_name;
      newField.relationship_name=values.relationship_name;
    }
    // Include starting and ending points if isAutoNumber is true
    if (isAutoNumber) {
      newField.auto_number_format = values.format; // Add starting point
      newField.auto_number_starting = values.startingPoint;     // Add ending point
    }

    console.log('formula is ');
    console.log(isFormula);
    if(isFormula){
      newField.formula=formula;
    }

    if (values.type === 'Picklist') {
      newField.picklist_values = picklistValues;
    }

    if (values.type === 'decimal' || values.type === 'currency') {
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
          is_formula:isFormula,
          is_auto_number: isAutoNumber,
          ...(isAutoNumber && { auto_number_format: values.format, auto_number_starting: values.startingPoint }),
          ...(values.type === 'Picklist' && { picklist_values: picklistValues }),
          ...(values.type === 'decimal' || values.type === 'currency' && {
            decimal_places_before: values.length,
            decimal_places_after: values.decimal_places,
          }),
          ...(values.type==='lookup' && {
            parent_object_name:values.parent_object_name,
            relationship_name:values.relationship_name
           }), 
          ...(isFormula  && {formula:formula}) 
         
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

  const handleFetchFeildsFromOjbect =async (object)=>{
    console.log(object);
    const fieldCallout = new ApiService(`${BASE_URL}/mt_fields/object/${object}`, {}, 'GET');
    const fieldsResponse = await fieldCallout.makeCall();
    const filteredFields = fieldsResponse.filter(field => field.name !== 'recordCount');
    console.log(filteredFields);
    setFieldsforFormula(filteredFields);
  };

  
  const handleFormulaChange = (value)=>{
    console.log(value);
    console.log(formula.concat(value));
    setFormula(formula.concat(value));
  };

  const validateFormula = (value) => {
    console.log('final formula is ');
    console.log(value);
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
          <Button onClick={onClose} disabled={loading} style={{ height: '34px', width: '90px', fontSize: '14px' }}>
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
                <Option value="URL">URL</Option>
                <Option value="Picklist">Picklist</Option>
                <Option value="lookup">Lookup</Option>
                <Option value="Text-Area">Text Area</Option>
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
                >
                  Auto Number
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="is_formula">
                <Checkbox
                  checked={isFormula}
                  onChange={(e) => setIsFormula(e.target.checked)}
                >
                  Is Formula
                </Checkbox>
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
              <Select placeholder="Insert Field" onChange={(e)=> handleFormulaChange(e)}>
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

                <Select  placeholder="Inset Operator" onChange={(e)=> handleFormulaChange(e)}>
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

               
              <TextArea label="Formula" value={formula} onChange={e=> setFormula(e.target.value)} placeholder="Enter formula" />
                <Button type="primary" onClick={validateFormula(formula)} style={{ marginRight: 8 }}>
                  Check Status
                </Button>

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

            {fieldType === 'Picklist' && ( // Only show for Picklist type
              <Form.Item
                name="picklist_values"
                label="Picklist Values (comma separated)"
                rules={[{ required: true, message: 'Please input the picklist values!' }]}
              >
                <Input placeholder="Enter picklist values" onChange={handlePicklistChange} />
              </Form.Item>
            )}

            {fieldType === 'decimal' || fieldType === 'currency' ? ( // Only show for decimal and currency types
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

            {fieldType==='lookup' && (
              <>
            <Form.Item
            name="parent_object_name"
            label="Parent Object Name"
            rules={[{ required: true, message: 'Please enter parent object name' }]}
             
              >
                <Select placeholder="Select an object" disabled={isEditMode}>
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
              rules={[{ required: true, message: 'Please enter parent object name' }]}>
              <Input placeholder="Please enter relationship name" /> 

              </Form.Item>

            </>
            )}
           

          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateFieldDrawer;
