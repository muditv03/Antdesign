



import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, Select, message } from 'antd';
import apiService from './apiService';
import { BASE_URL } from './Constant';

const { Option } = Select;

const RelatedListEditDrawer = ({ visible, onClose, record, parentObjectName }) => {
  const [form] = Form.useForm();
  const [parentObjects, setParentObjects] = useState([]);
  const [childObjectFields, setChildObjectFields] = useState([]);
  const [allChildObjects, setAllChildObjects] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');

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
      });
      console.log("fields to display "+  record.fields_to_display);
     
      setSelectedChild(record.child_object_name);
    }
    console.log('file');
  }, [record, visible, form, parentObjectName]);

  // Fetch fields for the selected child object
  useEffect(() => {
    const fetchChildObjectFields = async () => {
      if (selectedChild) {
        const api = new apiService(`${BASE_URL}/mt_fields/object/${selectedChild}`, {}, 'GET');
        try {
          const res = await api.makeCall();
          setChildObjectFields(res);
        } catch (error) {
          message.error('Error fetching child object fields');
        }
      } else {
        setChildObjectFields([]); // Clear fields if no child is selected
      }
    };

    fetchChildObjectFields();
  }, [selectedChild]);

  const handleFinish = (values) => {
    const { relatedListName, parentObject,fieldsToDisplay } = values;

    if (!relatedListName || !parentObject || !selectedChild) {
      message.error('Please complete all required fields.');
      return;
    }

    
    console.log(record);
    const data = {
      related_list_name: relatedListName,
      parent_object_name: parentObject,
      child_object_name: selectedChild,
      fields_to_display: fieldsToDisplay,
      
    };
    console.log("after edit "+fieldsToDisplay);

    const api = new apiService(
      `${BASE_URL}/related_lists/${record.key}`,
      {},
      'PUT',
      data
    );

    api.makeCall()
      .then(() => {
        message.success('Related list updated successfully!');
        onClose();
      })
      .catch((error) => {
        console.error("Error updating related list:", error);
        message.error('Error updating related list');
      });
  };

  return (
    <Drawer
      title="Edit Related List"
      width={360}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
          <Button onClick={() => form.submit()} type="primary">Submit</Button>
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
          <Select placeholder="Select parent object" value={parentObjectName} onChange={(value) => form.setFieldsValue({ parentObject: value })}>
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
          <Select placeholder="Select child object" onChange={setSelectedChild} value={selectedChild}>
            {allChildObjects.map(obj => (
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
              onChange={value => form.setFieldsValue({ fieldsToDisplay: value })}
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

export default RelatedListEditDrawer;










