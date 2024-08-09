import React from 'react';
import { Drawer, Form, Input, Button, message, Card, Checkbox, Select } from 'antd';
import axios from 'axios';
import * as Icons from '@ant-design/icons';

const { Option } = Select;

const CreateObjectDrawer = ({ visible, onClose, onAddObject }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    console.log('Form Values:', values);
  
    const formData = { 
      label: values.label,
      name: values.name,
      pluralLabel: values.plurallabel,
      addObjectTab: values.addObjectTab,  // Include checkbox value
      icon: values.icon,
    };
  
    try {
      const response = await axios.post('http://localhost:3000/mt_objects', {
        mt_object: formData,
      });
      console.log('Response:', response.data);
  
      const newTab = {
        label: values.label,
        name: values.name,
        description: "All Accounts",
        mt_object_id: response.data._id,
        icon: values.icon,
        addObjectTab: values.addObjectTab,  // Include checkbox value
      };
  
      console.log(newTab);
      // Check if icon is not null and addObjectTab is true
      if (newTab.icon && newTab.addObjectTab) {
        const response1 = await axios.post('http://localhost:3000/mt_tabs', {
          mt_tab: newTab,
        });
        console.log('Tab created response:', response1);
      }
  
      onAddObject({
        key: Date.now(),
        label: values.label,
        name: values.name,
        plurallabel: values.plurallabel,
        addObjectTab: values.addObjectTab,  // Include checkbox value
        icon: values.icon,
      });
  
      message.success('Object created successfully');
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error creating object:', error);
      message.error('Failed to create object');
    }
  };
  

  // Generate options for all Ant Design icons
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
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>Create New Object</div>}
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
          //  rules={[{ required: true, message: 'Please select an icon' }]}
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
    </Drawer>
  );
};

export default CreateObjectDrawer;
