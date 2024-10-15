import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, message,Card } from 'antd';
import apiService from './apiService'; // Import your ApiService class
import { BASE_URL } from './Constant';

const { Option } = Select;

const CreateRelatedListDrawer = ({ visible, onClose, onAddRelatedList, parentObjectName, editingRelatedList }) => {
  const [form] = Form.useForm();
  const [parentObjects, setParentObjects] = useState([]);
  const [childObjectFields, setChildObjectFields] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedFields, setSelectedFields] = useState([]); 
  // Fetch parent objects
  useEffect(() => {
    const fetchParentObjects = async () => {
      const api = new apiService(`${BASE_URL}/mt_objects`, {}, 'GET');
      try {
        const res = await api.makeCall();
        setParentObjects(res);
      } catch (error) {
        message.error('Error fetching parent objects');
      }
    };

    fetchParentObjects();
  }, []);

  // Pre-populate the form when editing a related list
  useEffect(() => {
    if (editingRelatedList) {
      form.setFieldsValue({
        relatedListName: editingRelatedList.related_list_name,
        parentObject: editingRelatedList.parent_object_name,
        childObject: editingRelatedList.child_object_name,
        fieldsToDisplay: editingRelatedList.fields_to_display,
      });
      setSelectedChild(editingRelatedList.child_object_name);
      setSelectedFields(editingRelatedList.fields_to_display || []);
    } else {
      form.resetFields();
      form.setFieldsValue({ parentObject: parentObjectName }); // Set the parent object when creating a new related list
    }
  }, [editingRelatedList, parentObjectName, form]);

  // Fetch fields for the selected child object
  useEffect(() => {
    if (selectedChild) {
      const fetchChildObjectFields = async () => {
        const api = new apiService(`${BASE_URL}/mt_fields/object/${selectedChild}`, {}, 'GET');
        try {
          const res = await api.makeCall();
          setChildObjectFields(res
            .filter((field) => field.name !== 'recordCount')
          );
        } catch (error) {
          message.error('Error fetching child object fields');
        }
      };
      fetchChildObjectFields();
    } else {
      setChildObjectFields([]);
    }
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
 
  // Submit form handler
  const handleFinish = (values) => {
    const { relatedListName, parentObject } = values;
    if (!relatedListName || !parentObject || !selectedChild) {
      message.error('Please complete all required fields.');
      return;
    }

    const data = {
      parent_object_name: parentObject,
      child_object_name: selectedChild,
      related_list_name: relatedListName,
      fields_to_display: selectedFields,
    }; 

    const api = new apiService(`${BASE_URL}/create_related_list`, {}, 'POST', data);
    api.makeCall()
      .then(() => {
        message.success('Related list created successfully!');
        form.resetFields();
        onClose(); // Close the drawer after successful creation
        onAddRelatedList(); // Callback to refresh related lists
      })
   
      .catch(err => {
        if(err){
          message.error('Error creating related list');
        }
      })
  };

  return (
    <Drawer
      title={editingRelatedList ? "Edit Related List" : "Create Related List"}
      width="40%"
      onClose={onClose}
      visible={visible}
      headerStyle={{ backgroundColor: '#f0f2f5' }}  // Set background for the header
      footerStyle={{ backgroundColor: '#f0f2f5' }}  // Set background for the footer
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
          <Select placeholder="Select parent object" disabled value={parentObjectName}>
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
          <Select placeholder="Select child object" onChange={handleChildObjectChange} value={selectedChild}>
            {parentObjects.map(obj => (
              <Option key={obj.name} value={obj.name}>{obj.label}</Option>
            ))}
          </Select>
        </Form.Item>

        {selectedChild && (
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
              options={childObjectFields
                .filter((field) => !selectedFields.includes(field.name))
                .map((field) => ({ value: field.name, label: field.label }))} // Ensure unique options
            />
          </Form.Item>
        )}
      </Form>
      </Card>
    </Drawer>
  );
};

export default CreateRelatedListDrawer;
