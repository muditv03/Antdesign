
import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, Select, message } from 'antd';
import apiService from '../Components/apiService';
import { BASE_URL } from '../Components/Constant';

const { Option } = Select;

const RelatedListEditDrawer = ({ visible, onClose, record, parentObjectName }) => {
  const [form] = Form.useForm();
  const [parentObjects, setParentObjects] = useState([]);
  const [childObjectFields, setChildObjectFields] = useState([]);
  const [allChildObjects, setAllChildObjects] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedFields, setSelectedFields] = useState([]); // Track selected fields
  const [lookupFields, setLookupFields] = useState([]); // New state for lookup fields


  // Fetch parent objects
  useEffect(() => {
    const fetchParentObjects = async () => {
      const api = new apiService(`${BASE_URL}/mt_objects`, {}, 'GET');
      try {
        const res = await api.makeCall();
        setParentObjects(res);
        setAllChildObjects(res);
      } catch (error) {
        message.error('Error fetching parent objects');
      }
    };

    fetchParentObjects();
  }, []);

  // Prepopulate form and set selected child
  useEffect(() => {
    if (record && visible) {
      form.setFieldsValue({
        relatedListName: record.related_list_name,
        parentObject: record.parent_object_name || parentObjectName,
        childObject: record.child_object_name,
        fieldsToDisplay: record.fields_to_display || [],
        fieldapiname:record.field_api_name

      }); 
      setSelectedChild(record.child_object_name);
      setSelectedFields(record.fields_to_display || []);
    }
  }, [record, visible, form, parentObjectName]);

  // Fetch fields for the selected child object
  useEffect(() => {
    const fetchChildObjectFields = async () => {
      if (selectedChild) {
        const api = new apiService(`${BASE_URL}/mt_fields/object/${selectedChild}`, {}, 'GET');
        try {
          const res = await api.makeCall();
          setChildObjectFields(res
            .filter((field) => field.name !== 'recordCount')
          );
          const lookupFieldsFiltered = res.filter(
            (field) => field.type === 'lookup' && field.parent_object_name === parentObjectName
          );
          setLookupFields(lookupFieldsFiltered);

        } catch (error) {
          message.error('Error fetching child object fields');
        }
      } else {
        setChildObjectFields([]); // Clear fields if no child is selected
      }
    };

    fetchChildObjectFields();
  }, [selectedChild]);

  // Handle child object selection
  const handleChildObjectChange = (value) => {
    setSelectedChild(value);
    setSelectedFields([]); // Reset selected fields when a new child object is chosen
  };

  // Handle field selection with a maximum of 7 fields
  const handleFieldChange = (value) => {
    if (value.length > 7) {
      message.error('You can select up to 7 fields.');
      return;
    }
    setSelectedFields(value);
  };

  const handleFinish = async(values) => {
    const { relatedListName, parentObject, fieldsToDisplay,fieldapiname } = values;

    if (!relatedListName || !parentObject || !selectedChild) {
      message.error('Please complete all required fields.');
      return;
    }

    const data = {
      related_list_name: relatedListName,
      parent_object_name: parentObject,
      child_object_name: selectedChild,
      fields_to_display: fieldsToDisplay,
      field_api_name:fieldapiname

    };


    try {
      const apiServiceForTab = new apiService(
          `${BASE_URL}/related_lists/${record.key}`,
          { 'Content-Type': 'application/json' },
          'PUT',
          data
      );

      await apiServiceForTab.makeCall();
      message.success('Related list updated successfully!');
      form.resetFields();
      onClose(); // Close the drawer after successful creation
  } catch (error) {
      const errorMessage = error && typeof error === 'object'
      ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
      : 'Failed to update related list due to an unknown error';
      message.error(errorMessage);       
    } 

   
  };

  return (
    <Drawer
      title="Edit Related List"
      width={360}
      onClose={onClose}
      visible={visible}
      
      headerStyle={{ backgroundColor: '#f0f2f5' }} // Header background color
      footerStyle={{ backgroundColor: '#f0f2f5' }} // Footer background color
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}> {/* Flexbox layout */}
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button onClick={() => form.submit()} type="primary">
            Submit
          </Button>
        </div>
      }
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          name="relatedListName"
          label="Related List Name"
          rules={[{ required: true, message: 'Please enter the related list name' }]}
        >
          <Input placeholder="Enter related list name" />
        </Form.Item>

        <Form.Item
          name="parentObject"
          label="Parent Object"
          rules={[{ required: true, message: 'Please select a parent object' }]}
 
        > 
          <Select placeholder="Select parent object" value={parentObjectName} disabled onChange={(value) => form.setFieldsValue({ parentObject: value })}> 
            {parentObjects.map(obj => (
              <Option key={obj.name} value={obj.name}>{obj.label}</Option>

            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="childObject"
          label="Child Object"
          rules={[{ required: true, message: 'Please select a child object' }]}
        >
          <Select
            placeholder="Select child object"
            onChange={handleChildObjectChange}
            value={selectedChild}
          >
            {allChildObjects.map((obj) => (
              <Option key={obj._id} value={obj.name}>
                {obj.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedChild && (
          <>
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
            >
              {childObjectFields
                .filter((field) => !selectedFields.includes(field.name))
                .map((field) => (
                  <Option key={field.name} value={field.name}>
                    {field.label}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
          name="fieldapiname"
          label="Lookup Name"
          rules={[{ required: true, message: 'Please select a lookup field' }]}
          >
          <Select placeholder="Select a lookup field" defaultValue={form.getFieldValue('fieldapiname')}>
            {lookupFields.map(field => (
              <Option key={field.name} value={field.name}>{field.label}</Option>
            ))}
          </Select>
          </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
};

export default RelatedListEditDrawer;
