import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Card, Checkbox, Select, Spin } from 'antd';
import axios from 'axios';
import * as Icons from '@ant-design/icons';

const { Option } = Select;

const CreateObjectDrawer = ({ visible, onClose, onAddOrEditObject, editingRecord }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue(editingRecord); // Pre-fill form with existing data if editing
    } else {
      form.resetFields(); // Reset form for new object creation
    }
  }, [editingRecord, form]);

  const handleFinish = async (values) => {
    setLoading(true); // Start the spinner
    const formData = {
      label: values.label,
      name: values.name,
      pluralLabel: values.plurallabel,
      addObjectTab: values.addObjectTab,
      icon: values.icon,
    };

    try {
      let response;
      if (editingRecord) {
        // Update existing record
        response = await axios.put(`http://localhost:3000/mt_objects/${editingRecord.key}`, {
          mt_object: formData,
        });
        message.success('Object updated successfully');
      } else {
        // Create new record
        response = await axios.post('http://localhost:3000/mt_objects', {
          mt_object: formData,
        });
        message.success('Object created successfully');
      }

      const newTab = {
        label: values.label,
        name: values.name,
        description: "All Accounts",
        mt_object_id: editingRecord ? editingRecord.key : response.data._id,
        icon: values.icon,
        addObjectTab: values.addObjectTab,
      };

      if (newTab.icon && newTab.addObjectTab) {
        await axios.post('http://localhost:3000/mt_tabs', { mt_tab: newTab });
      }

      onAddOrEditObject({
        key: editingRecord ? editingRecord.key : response.data._id,
        label: values.label,
        name: values.name,
        plurallabel: values.plurallabel,
        addObjectTab: values.addObjectTab,
        icon: values.icon,
      });

      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error creating/updating object:', error);
      message.error(`Failed to ${editingRecord ? 'update' : 'create'} object`);
    } finally {
      setLoading(false); // Stop the spinner
    }
  };

  const iconOptions = Object.keys(Icons).map((iconName) => {
    const IconComponent = Icons[iconName];
    return (
      <Option key={iconName} value={iconName} label={iconName}>
        <IconComponent /> {iconName}
      </Option>
    );
  });

  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{editingRecord ? 'Edit Object' : 'Create New Object'}</div>}
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
            disabled={loading}
            type="primary"
            style={{
              height: '47px',
              width: '120px',
              fontSize: '18px',
              backgroundColor: 'white',
              color: '#1890ff',
              border: '1px solid #1890ff',
            }}
          >
            {editingRecord ? 'Save Changes' : 'Save'}
          </Button>
        </div>
      }
      footerStyle={{ textAlign: 'right', padding: '0' }}
    >
      <Spin spinning={loading} tip="Loading...">
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
              name="label"
              label="Label"
              rules={[{ required: true, message: 'Please enter the label' }]}
            >
              <Input placeholder="Please enter the label" />
            </Form.Item>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter the name' }]}
            >
              <Input placeholder="Please enter the name" />
            </Form.Item>
            <Form.Item
              name="plurallabel"
              label="Plural Label"
              rules={[{ required: true, message: 'Please enter the plural label' }]}
            >
              <Input placeholder="Please enter the plural label" />
            </Form.Item>
            <Form.Item
              name="addObjectTab"
              valuePropName="checked"
            >
              <Checkbox>Add Object Tab</Checkbox>
            </Form.Item>
            <Form.Item
              name="icon"
              label="Icon"
            >
              <Select
                placeholder="Select an icon"
                optionLabelProp="label"
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {iconOptions}
              </Select>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateObjectDrawer;
