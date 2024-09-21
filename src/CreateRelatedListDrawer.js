
import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, message } from 'antd';
import apiService from './apiService'; // Import your ApiService class
import { BASE_URL } from './Constant';
const { Option } = Select;

const CreateRelatedListDrawer = ({ visible, onClose, onCreate, record }) => {
  const [form] = Form.useForm();
  const [parentObjects, setParentObjects] = useState([]);
  const [childObjectFields, setChildObjectFields] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [fieldsToDisplay, setFieldsToDisplay] = useState([]);
  const [loadingRelatedLists, setLoadingRelatedLists] = useState(false);
  const [relatedLists, setRelatedLists] = useState([]);
  const [selectedChildName, setSelectedChildName] = useState('');
 
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

  // Fetch fields for the selected child object
  useEffect(() => {
    if (selectedChild) {
      const fetchChildObjectFields = async () => {
        const api = new apiService(`${BASE_URL}/mt_fields/object/${selectedChild}`, {}, 'GET');
        try {
          const res = await api.makeCall();
          setChildObjectFields(res);
        } catch (error) {
          message.error('Error fetching child object fields');
        }
      };

      fetchChildObjectFields();
    } else {
      setChildObjectFields([]);
    }
  }, [selectedChild]);

  // Handle parent object change
  const handleObjectChange = (value) => {
    form.setFieldsValue({ childObject: undefined, fieldsToDisplay: [] });
    setSelectedChild(''); // Reset selected child
    setFieldsToDisplay([]); // Reset fields to display
  };

  // Handle child object change
  const handleChildObjectChange = (value) => {
    setSelectedChild(value);  // Set the selected child name
    setSelectedChildName(value); // Set child name (for form submission)
    console.log('Selected Child:', value); // Debugging log to verify the value
  };

  // Handle field selection with a maximum of 5 fields
  const handleFieldChange = (value) => {
    if (value.length > 5) {
      message.error('You can select up to 5 fields.');
      return;
    }
    setFieldsToDisplay(value);
  };

  // Submit form handler
  const handleFinish = (values) => {
    const { relatedListName, parentObject } = values;
    if (!relatedListName || !parentObject || !selectedChildName) {
      message.error('Please complete all required fields.');
      return;
    }

    const data = {
      parent_object_name: parentObject,
      child_object_name: selectedChildName,
      related_list_name: relatedListName,
      fields_to_display: fieldsToDisplay,
    };

    const api = new apiService(`${BASE_URL}/create_related_list`, {}, 'POST', data);
    api.makeCall()
      .then(() => {
        message.success('Related list created successfully!');
        onClose(); // Close the drawer after successful creation
      })
      .catch(error => {
        message.error('Error creating related list');
      });
  };

  // Fetch related lists data based on parent object name
  const fetchRelatedLists = async () => {
    if (record) {
      setLoadingRelatedLists(true);
      const api = new apiService(`${BASE_URL}/related_lists/for_object/${record}`, {}, 'GET');
      try {
        const res = await api.makeCall();
        setRelatedLists(res.map(list => ({
          ...list,
          key: list._id,
        })));
      } catch (error) {
        message.error('Error fetching related lists');
      } finally {
        setLoadingRelatedLists(false);
      }
    }
  };

  useEffect(() => {
    fetchRelatedLists();
  }, [record]);

  return (
    <Drawer
      title="Create Related List"
      width={360}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
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
          <Select placeholder="Select parent object" onChange={handleObjectChange}>
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
          <Select placeholder="Select child object" onChange={handleChildObjectChange}>
            {parentObjects.map(obj => (
              <Option key={obj._id} value={obj.name}>{obj.label}</Option>
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
              value={fieldsToDisplay}
            >
              {childObjectFields.map(field => (
                <Option key={field.name} value={field.name}>{field.label}</Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default CreateRelatedListDrawer;
