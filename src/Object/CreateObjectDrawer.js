import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Card, Checkbox, Select, Spin, Row, Col } from 'antd';
import * as Icons from '@ant-design/icons';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService'; // Import ApiService class
import eventBus from '../Components/eventBus'; // Import the event bus

const { Option } = Select;

const CreateObjectDrawer = ({ visible, onClose, onAddOrEditObject, editingRecord }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [isallowSearch, setIsAllowSearch] = useState(false); // State for auto number checkbox
  const [isTrackActivities, setIsTrackActivities] = useState(false); // State for auto number checkbox
  const [isTrackFieldHistory, setIsTrackFieldHistory] = useState(false); // State for auto number checkbox
  const [isAllowFileUpload, setIsAllowFileUpload] = useState(false);

  useEffect(() => {
    if (editingRecord) {
      console.log(editingRecord);
      form.setFieldsValue(editingRecord); // Pre-fill form with existing data if editing
      setInitialValues(editingRecord); // Store initial values
       setIsAllowSearch(editingRecord.allow_search);
      setIsTrackActivities(editingRecord.track_activities);
      setIsTrackFieldHistory(editingRecord.track_field_history);
      setIsAllowFileUpload(editingRecord.allow_files);
    } else {
      form.resetFields();
      setInitialValues({});
      setIsAllowSearch(false);
      setIsTrackActivities(false);
      setIsTrackFieldHistory(false);
      setIsAllowFileUpload(false);
    }
  }, [visible, editingRecord, form]);

  const generateApiName = (label) => {
    return label.replace(/[^a-zA-Z]/g, '').replace(/\s+/g, '').trim();
  };

  const handleLabelChange = (e) => {
    const label = e.target.value;
    const currentName = form.getFieldValue('name');

    if (!currentName) {
      form.setFieldsValue({
        name: generateApiName(label),
      });
    }
  };

  const handleFinish = async (values) => {
    console.log('values are', JSON.stringify(values, null, 2));
    setLoading(true); // Start the spinner

    // Create a payload with only the changed fields
    const formData = {};
    for (const key in values) {
      if (values[key] !== initialValues[key]) {
        formData[key] = values[key];
      }
    }

    // Include checkbox states if they have changed and the record is not a system record
    if (!editingRecord?.is_system) {
      if (isallowSearch !== initialValues.allow_search) {
        formData.allow_search = isallowSearch;
      }
      if (isTrackActivities !== initialValues.track_activities) {
        formData.track_activities = isTrackActivities;
      }
      if (isTrackFieldHistory !== initialValues.track_field_history) {
        formData.track_field_history = isTrackFieldHistory;
      }
      if (isAllowFileUpload !== initialValues.allow_files) {
        formData.allow_files = isAllowFileUpload;
      }
   }

   console.log('form data is', JSON.stringify(formData, null, 2));
    
    try {
      let response;
      if (editingRecord && editingRecord.key) {
        // Update existing record using ApiService
        const apiService = new ApiService(
          `${BASE_URL}/mt_objects/${editingRecord.key}`,
          { 'Content-Type': 'application/json' },
          'PUT',
          { mt_object: formData }
        );
        response = await apiService.makeCall();
        message.success('Object updated successfully');
        onAddOrEditObject({ ...editingRecord, ...formData }); // Update the object in the parent component

        // Handle newTab creation if addObjectTab is true
        if (formData.addObjectTab) {
          const newTab = {
            label: values.label,
            name: values.name,
            description: 'All Accounts',
            mt_object_id: editingRecord.key, // Use the existing object ID
            icon: values.icon,
            addObjectTab: values.addObjectTab,
          };
          if (newTab.icon && newTab.addObjectTab) {
            const apiServiceForTab = new ApiService(
              `${BASE_URL}/mt_tabs`,
              { 'Content-Type': 'application/json' },
              'POST',
              { mt_tab: newTab }
            );
            const tabResponse = await apiServiceForTab.makeCall();
            if (!tabResponse || !tabResponse._id) {
              throw new Error('Failed to create a new tab');
            }
          }
        }
      } else {
        // Create new record using ApiService
        const apiService = new ApiService(
          `${BASE_URL}/mt_objects`,
          { 'Content-Type': 'application/json' },
          'POST',
          { mt_object: formData }
        );
        response = await apiService.makeCall();
        if (response && response._id) {
          message.success('Object created successfully');
        } else {
          throw new Error('Invalid response from server');
        }
        // Create newTab only when object is created successfully
        const newTab = {
          label: values.label,
          name: values.name,
          description: 'All Accounts',
          mt_object_id: response._id, // Use the new object ID from the response
          icon: values.icon,
          addObjectTab: values.addObjectTab,
        };
        if (newTab.icon && newTab.addObjectTab) {
          const apiServiceForTab = new ApiService(
            `${BASE_URL}/mt_tabs`,
            { 'Content-Type': 'application/json' },
            'POST',
            { mt_tab: newTab }
          );
          const tabResponse = await apiServiceForTab.makeCall();
          if (!tabResponse || !tabResponse._id) {
            throw new Error('Failed to create a new tab');
          }
        }
        // Update the list of objects in the parent component
        onAddOrEditObject({
          key: response._id, // Use the ID from the response
          ...formData
         });
      }
      eventBus.emit('objectCreatedOrUpdated'); // Notify that object was created or updated
      onClose(); // Close the drawer upon success
      form.resetFields();
    } catch (error) {
      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save object due to an unknown error';
      message.error(errorMessage);
    } finally {
      setLoading(false); // Stop the spinner
    }
  };

  const iconOptions = Object.keys(Icons)
    .filter((iconName) => iconName[0] >= 'A' && iconName[0] <= 'T')
    .map((iconName) => {
      const IconComponent = Icons[iconName];
      return (
        <Option key={iconName} value={iconName} label={iconName}>
          <span>
            {React.createElement(IconComponent, null)}
            <span style={{ marginLeft: 8 }}>{iconName}</span>
          </span>
        </Option>
      );
    });

    const isEditingSystemRecord = editingRecord && editingRecord.is_system;

  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{editingRecord ? 'Edit Object' : 'Create New Object'}</div>}
      width="40%"
      onClose={!loading ? onClose : null}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => form.submit()} disabled={loading} type="primary">Save</Button>
        </div>
      }
    >
      <Spin spinning={loading} tip="Loading...">
        <Card style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Form
            form={form}
            layout="vertical"
            hideRequiredMark
            onFinish={handleFinish}
          >
            <Form.Item
              name="label"
              label="Label"
              rules={[{ required: true, message: 'Please enter the label' }]}
            >
              <Input placeholder="Please enter the field label" onBlur={handleLabelChange} />
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
            
                    // Check if the value contains only alphabets without spaces
                    if (!/^[a-zA-Z]+$/.test(value)) {
                      return Promise.reject(new Error('Name should only contain alphabets without spaces.'));
                    }
            
                    // Check if the first letter is capitalized
                    if (!/^[A-Z]/.test(value)) {
                      return Promise.reject(new Error('Name should start with a capital letter.'));
                    }
            
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Please enter the name" disabled={!!editingRecord} />
            </Form.Item>
            <Form.Item
              name="pluralLabel"
              label="Plural Label"
              rules={[{ required: true, message: 'Please enter the plural label' }]}
            >
              <Input placeholder="Please enter the plural label" disabled={isEditingSystemRecord} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Object Description"
            >
              <Input placeholder="Please enter the object description" disabled={isEditingSystemRecord} />
            </Form.Item>

            <Form.Item name="icon" label="Icon">
              <Select allowClear placeholder="Select an icon" optionLabelProp="label" showSearch filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }  disabled={isEditingSystemRecord}>
                {iconOptions}
              </Select>

            </Form.Item>


            {!editingRecord && (
              <Form.Item name="addObjectTab" valuePropName="checked">
                <Checkbox disabled={isEditingSystemRecord}>Add Object Tab</Checkbox>
              </Form.Item>
            )}


            <Form.Item name="allowSearch" >
              <Checkbox
                checked={isallowSearch}
                onChange={(e) => setIsAllowSearch(e.target.checked)}
                disabled={isEditingSystemRecord}
              >Allow Search</Checkbox>
            </Form.Item>
            <Form.Item name="trackActivities"
            >
              <Checkbox
                checked={isTrackActivities}
                onChange={(e) => setIsTrackActivities(e.target.checked)}
                disabled={isEditingSystemRecord}
              >Track Activities</Checkbox>
            </Form.Item>
            <Form.Item name="trackFieldHistory">
              <Checkbox
                checked={isTrackFieldHistory}
                onChange={(e) => setIsTrackFieldHistory(e.target.checked)}
                disabled={isEditingSystemRecord}
              >Track Field History</Checkbox>
            </Form.Item>

            <Form.Item name="allowFileUpload">
              <Checkbox
                checked={isAllowFileUpload}
                onChange={(e) => setIsAllowFileUpload(e.target.checked)}
                disabled={isEditingSystemRecord}
              >Allow File Upload</Checkbox>
            </Form.Item>


          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateObjectDrawer;
