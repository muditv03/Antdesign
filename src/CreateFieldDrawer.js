import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Select, Checkbox, Card, Spin } from 'antd';
import { BASE_URL } from './Constant';
import ApiService from './apiService'; // Import ApiService class

const { Option } = Select;
 
const CreateFieldDrawer = ({ visible, onClose, onAddField, mtObjectId }) => {
  const [form] = Form.useForm();
  const [fieldType, setFieldType] = useState('');
  const [picklistValues, setPicklistValues] = useState([]);
  const [availableObjects, setAvailableObjects] = useState([]);
  const [loading, setLoading] = useState(false); // Spinner state

  useEffect(() => {
    if (fieldType === 'lookup') {
      // Use ApiService for fetching objects
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

    if (values.type === 'decimal') {
      newField.decimal_places_before = values.length - values.decimal_places;
      newField.decimal_places_after = values.decimal_places;
    }

    console.log('field body' + JSON.stringify(newField));

    try {
      // Use ApiService for posting the field data
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
        ...(values.type === 'decimal' && {
          decimal_places_before: values.length - values.decimal_places,
          decimal_places_after: values.decimal_places,
        }),
      });

      message.success('Field created successfully');
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error creating field:', error);
      const errorMessage = error.response?.data?.name
        ? `Failed to create field because ${error.response.data.name[0]}`
        : `Failed to create field due to an unknown error`;
      message.error(errorMessage);
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>Create New Field</div>}
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
          <Button onClick={onClose} style={{ height: '47px', width: '120px', fontSize: '18px' }}>
            Cancel
          </Button>
          <Button 
            onClick={() => form.submit()} 
            type="primary" 
            style={{ 
              height: '47px', 
              width: '120px', 
              fontSize: '18px', 
              backgroundColor: 'white', 
              color: '#1890ff', 
              border: '1px solid #1890ff' 
            }}
          >
            Save
          </Button>
        </div>
      }
      footerStyle={{ textAlign: 'right', padding: '0' }}
    >
      <Spin spinning={loading}> {/* Spinner */}
        <Card
          style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
        >
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
                onChange={(value) => setFieldType(value)}
              >
                <Option value="String">Text</Option>
                <Option value="Integer">Number</Option>
                <Option value="decimal">Decimal</Option>
                <Option value="Date">Date</Option>
                <Option value="boolean">Boolean</Option>
                <Option value="Picklist">Picklist</Option> 
                <Option value="currency">Currency</Option>
                <Option value="lookup">Lookup</Option>
                <Option value="Text-Area">Text Area</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="name"
              label="API Name"
              rules={[{ required: true, message: 'Please enter the name' }]}
            >
              {fieldType === 'lookup' ? (
                <Select placeholder="Select an object">
                  {availableObjects.map((object) => (
                    <Option key={object.id} value={object.name}>
                      {object.name}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input placeholder="Please enter the name" />
              )}
            </Form.Item>

            <Form.Item
              name="label"
              label="Label"
              rules={[{ required: true, message: 'Please enter the label' }]}
            >
              <Input placeholder="Please enter the field label" />
            </Form.Item>

            {fieldType === 'Picklist' && (
              <Form.Item
                name="picklist_values"
                label="Picklist Values (comma separated)"
                rules={[{ required: true, message: 'Please enter picklist values' }]}
              >
                <Input placeholder="Enter values separated by commas" onChange={handlePicklistChange} />
              </Form.Item>
            )}

            {fieldType === 'decimal' && (
              <>
                <Form.Item
                  name="length"
                  label="Total Length"
                  rules={[{ required: true, message: 'Please enter the length' }]}
                >
                  <Input type="Number" placeholder="Enter Total length" />
                </Form.Item>

                <Form.Item
                  name="decimal_places"
                  label="Decimal Places"
                  rules={[{ required: true, message: 'Please enter decimal places' }]}
                >
                  <Input type="Number" placeholder="Enter decimal places" />
                </Form.Item>
              </>
            )}

            {/* <Form.Item
              name="iseditable"
              valuePropName="checked"
            >
              <Checkbox>Is Editable</Checkbox>
            </Form.Item>

            <Form.Item
              name="iswriteable"
              valuePropName="checked"
            >
              <Checkbox>Is Writeable</Checkbox>
            </Form.Item> */}
          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateFieldDrawer;
