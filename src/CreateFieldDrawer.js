import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Select, Card, Spin } from 'antd';
import { BASE_URL } from './Constant';
import ApiService from './apiService'; // Import ApiService class
import pluralize from 'pluralize';

const { Option } = Select;

const CreateFieldDrawer = ({ visible, onClose, onAddField, mtObjectId, editField, onSaveEdit }) => {
  const [form] = Form.useForm();
  const [fieldType, setFieldType] = useState('');
  const [picklistValues, setPicklistValues] = useState([]);
  const [availableObjects, setAvailableObjects] = useState([]);
  const [loading, setLoading] = useState(false); // Spinner state
  const isEditMode = !!editField; // Check if it's edit mode

  // Utility function to sanitize label and create API name
  const generateApiName = (label) => {
    return label
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .trim() // Remove leading and trailing spaces
      .split(/\s+/) // Split by one or more spaces
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toLowerCase() + word.slice(1); // First word lowercase
        }
        return word.charAt(0).toUpperCase() + word.slice(1); // Capitalize other words
      })
      .join(''); // Join back into a single string
  };
  

  // Handle label change and update API name
  const handleLabelChange = (e) => {
    const label = e.target.value;
    form.setFieldsValue({
      name: generateApiName(label), // Set the API name based on the sanitized label
    });
  };

  // Fetch available objects for the lookup field
  useEffect(() => {
    if (fieldType === 'lookup') {
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
    } else {
      setAvailableObjects([]);
    }
  }, [fieldType]);

  // Initialize the form in edit mode
  useEffect(() => {
    if (editField) {
      form.setFieldsValue({
        ...editField,
        length: editField.decimal_places_before + editField.decimal_places_after, // Calculate total length
        decimal_places: editField.decimal_places_after, // Set decimal places
      });
      setFieldType(editField.type); // Set field type for conditional rendering
    } else {
      form.resetFields(); // Reset fields for creating a new field
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
    };

    if (values.type === 'Picklist') {
      newField.picklist_values = picklistValues;
    }

    if (values.type === 'decimal' || values.type === 'currency') {
      newField.decimal_places_before = values.length - values.decimal_places;
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
        onAddField({
          key: Date.now(),
          label: values.label,
          name: values.name,
          type: values.type,
          iseditable: values.iseditable,
          iswriteable: values.iswriteable,
          ...(values.type === 'Picklist' && { picklist_values: picklistValues }),
          ...(values.type === 'decimal' || values.type === 'currency' && {
            decimal_places_before: values.length - values.decimal_places,
            decimal_places_after: values.decimal_places,
          }),
        });

        message.success('Field created successfully');
      }

      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error creating/updating field:', error);
      const errorMessage = error.response?.data?.name
        ? `Failed to save field because ${error.response.data.name[0]}`
        : 'Failed to save field due to an unknown error';
      message.error(errorMessage);
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{isEditMode ? 'Edit Field' : 'Create New Field'}</div>}
      width="40%"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      headerStyle={{
        padding: '20px 16px',
        background: '#20b2aa',
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
          <Button onClick={onClose} style={{ height: '34px', width: '90px', fontSize: '14px' }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
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
              name="label"
              label="Label"
              rules={[{ required: true, message: 'Please enter the label' }]}
            >
              <Input 
                placeholder="Please enter the field label" 
                onBlur={handleLabelChange} // Add onChange handler here
              />
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
              {fieldType === 'lookup' ? (
                <Select placeholder="Select an object" disabled={isEditMode}>
                  {availableObjects.map((object) => (
                    <Option key={object.id} value={object.name}>
                      {object.name}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input placeholder="Please enter the name" disabled={isEditMode} /> // Read-only in edit mode
              )}
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select the type' }]}
            >
              <Select
                placeholder="Select the field type"
                onChange={(value) => setFieldType(value)}
                disabled={isEditMode} // Disable field type selection in edit mode
              >
                <Option value="String">Text</Option>
                <Option value="Integer">Number</Option>
                <Option value="decimal">Decimal</Option>
                <Option value="currency">Currency</Option>
                <Option value="boolean">Boolean</Option>
                <Option value="Picklist">Picklist</Option>
                <Option value="lookup">Lookup</Option>
                <Option value="Date">Date</Option>
                <Option value="LongText">Long Text Area</Option>
              </Select>
            </Form.Item>

            {fieldType === 'Picklist' && (
              <Form.Item
                name="picklist_values"
                label="Picklist Values"
              >
                <Input 
                  placeholder="Enter picklist values separated by commas"
                  onChange={handlePicklistChange}
                />
              </Form.Item>
            )}

            {fieldType === 'decimal' && (
              <>
                <Form.Item
                  name="length"
                  label="Length"
                  rules={[{ required: true, message: 'Please enter the length' }]}
                >
                  <Input placeholder="Enter length" />
                </Form.Item>
                <Form.Item
                  name="decimal_places"
                  label="Decimal Places"
                  rules={[{ required: true, message: 'Please enter decimal places' },
                    {
                      validator: (_, value) => {
                        if (value === "0" || value === 0) {
                          return Promise.reject(new Error('Zero is not allowed for decimal places'));
                        }
                        return Promise.resolve();
                      }
                    }


                  ]}
                >
                  <Input placeholder="Enter decimal places" />
                </Form.Item>
              </>
            )}

            {fieldType === 'currency' && (
              <>
                <Form.Item
                  name="length"
                  label="Length"
                  rules={[{ required: true, message: 'Please enter the length' }]}
                >
                  <Input placeholder="Enter length" />
                </Form.Item>
                <Form.Item
                  name="decimal_places"
                  label="Decimal Places"
                  rules={[{ required: true, message: 'Please enter decimal places' }]}
                >
                  <Input placeholder="Enter decimal places" />
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
