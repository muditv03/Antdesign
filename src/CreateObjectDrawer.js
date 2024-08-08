import React from 'react';
import { Drawer, Form, Input, Button, message, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

const CreateObjectDrawer = ({ visible, onClose, onAddObject }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    console.log('Form Values:', values);

    const formData = { 
      label: values.label,
      name: values.name,
      pluralLabel: values.plurallabel, // Ensure this matches the field name in Form.Item
    };

    try {
      const response = await axios.post('http://localhost:3000/mt_objects', {
        mt_object: formData,
      });
      console.log('response is ', response);

      onAddObject({
        key: Date.now(),
        label: values.label,
        name: values.name,
        plurallabel: values.plurallabel, // Ensure consistency with Form.Item name
      });

      message.success('Object created successfully');
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Error creating object:', error);
      message.error('Failed to create object');
    }
  };

  const handleSave = () => {
    form.validateFields()
      .then(values => {
        handleFinish(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'lightseagreen', padding: '10px 24px' }}>
          <span>Create a new property</span>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>
      }
      width="40%"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 0, paddingTop: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      headerStyle={{ backgroundColor: 'lightseagreen' }}
      closable={false}
    >
      <Form form={form} layout="vertical" hideRequiredMark style={{ flex: 1, overflowY: 'auto' }}>
        <Card style={{ flex: 1 }}>
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
        </Card>
      </Form>
      <div style={{ backgroundColor: 'lightseagreen', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button type="primary" onClick={handleSave} style={{ flex: 1 }}>
          Save
        </Button>
        <Button onClick={onClose} style={{ flex: 1, marginLeft: 16 }}>
          Cancel
        </Button>
      </div>
    </Drawer>
  );
};

export default CreateObjectDrawer;
