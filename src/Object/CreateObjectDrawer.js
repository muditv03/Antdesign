import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Card, Checkbox, Select, Spin,Row,Col } from 'antd';
import * as Icons from '@ant-design/icons';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService'; // Import ApiService class
import eventBus from '../Components/eventBus'; // Import the event bus
 
const { Option } = Select;

const CreateObjectDrawer = ({ visible, onClose, onAddOrEditObject, editingRecord }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isallowSearch, setIsAllowSearch] = useState(false); // State for auto number checkbox
  const [isTrackActivities, setIsTrackActivities] = useState(false); // State for auto number checkbox
  const [isTrackFieldHistory, setIsTrackFieldHistory] = useState(false); // State for auto number checkbox
  const [isAllowFileUpload,setIsAllowFileUpload]=useState(false);

  useEffect(() => {
    if (editingRecord) {
      console.log(editingRecord);
      form.setFieldsValue(editingRecord); // Pre-fill form with existing data if editing
      console.log('editing record is ');
      console.log(editingRecord);
      setIsAllowSearch(editingRecord.allow_search);
      setIsTrackActivities(editingRecord.track_activities);
      setIsTrackFieldHistory(editingRecord.track_field_history);
      setIsAllowFileUpload(editingRecord.allow_files);
    } else {
      form.resetFields(); 
    }
  }, [editingRecord, form]);

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
    setLoading(true); // Start the spinner
    const formData = {
      label: values.label,
      name: values.name,
      pluralLabel: values.pluralLabel,
      addObjectTab: values.addObjectTab,
      icon: values.icon,
      description: values.description,
      allow_search: isallowSearch,
      track_activities: isTrackActivities,
      track_field_history: isTrackFieldHistory,
      allow_files:isAllowFileUpload
    }; 
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
        message.success('Object updated successfully');
        onAddOrEditObject({ ...editingRecord, ...formData }); // Update the object in the parent component
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
          label: values.label,
          name: values.name,
          plurallabel: values.plurallabel,
          addObjectTab: values.addObjectTab,
          icon: values.icon,
          description: values.description,
          allow_search: isallowSearch,
          track_activities: isTrackActivities,
          track_field_history: isTrackFieldHistory,
          allow_files:isAllowFileUpload

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
                  validator: (_, value) => /^[a-zA-Z]+$/.test(value)
                    ? Promise.resolve()
                    : Promise.reject('Name should only contain alphabets without spaces.'),
                },
              ]}
            >
              <Input placeholder="Please enter the name" disabled={!!editingRecord}/>
            </Form.Item>
            <Form.Item
              name="pluralLabel"
              label="Plural Label"
              rules={[{ required: true, message: 'Please enter the plural label' }]}
            >
              <Input placeholder="Please enter the plural label" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Object Description"
            >
              <Input placeholder="Please enter the object description" />
            </Form.Item>

            <Form.Item name="icon" label="Icon">
                  <Select allowClear placeholder="Select an icon" optionLabelProp="label" showSearch filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                    {iconOptions}
                  </Select>

                </Form.Item>

           
                <Form.Item name="addObjectTab" valuePropName="checked">
                  <Checkbox>Add Object Tab</Checkbox>
                </Form.Item>
             

            <Form.Item name="allowSearch" >
              <Checkbox
               checked={isallowSearch}
               onChange={(e) => setIsAllowSearch(e.target.checked)}
              >Allow Search</Checkbox>
            </Form.Item>
            <Form.Item name="trackActivities"
            >
              <Checkbox
               checked={isTrackActivities}
               onChange={(e) => setIsTrackActivities(e.target.checked)}
              >Track Activities</Checkbox>
            </Form.Item>
            <Form.Item name="trackFieldHistory">
              <Checkbox
               checked={isTrackFieldHistory}
               onChange={(e) => setIsTrackFieldHistory(e.target.checked)}
              >Track Field History</Checkbox>
            </Form.Item>
          
            <Form.Item name="allowFileUpload">
              <Checkbox
               checked={isAllowFileUpload}
               onChange={(e) => setIsAllowFileUpload(e.target.checked)}
              >Allow File Upload</Checkbox>
            </Form.Item>
          
           
          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateObjectDrawer;
