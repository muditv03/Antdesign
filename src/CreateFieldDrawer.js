import React from 'react';
import { Drawer, Form, Input, Button,message, Select, Checkbox, Card } from 'antd';
import axios from 'axios';
  
const { Option } = Select;

const CreateFieldDrawer = ({ visible, onClose, onAddField, mtObjectId }) => {
  const [form] = Form.useForm();
  
  console.log('mtObjectId in CreateFieldDrawer:', mtObjectId);
 
  const handleFinish = async (values) => {
    console.log('Form Values:', values);

    const newField = {
      label: values.label,
      name: values.name,
      type: values.type,
      mt_object_id: mtObjectId,
      iseditable: values.iseditable || false,
      iswriteable: values.iswriteable || false ,
    };

    console.log(newField);

    try {
      const response = await axios.post('http://localhost:3000/mt_fields', {
        mt_field: newField,
      });
      console.log('response is ', response);

      onAddField({
        key: Date.now(),
        label: values.label,
        name: values.name,
        type: values.type,
        iseditable: values.iseditable,
        iswriteable: values.iswriteable,
      });

      message.success('Object created successfully');
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error creating field:', error);
      message.error('Failed to create field');
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
            <Input placeholder="Please enter the field name" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Please enter the name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select the type' }]}
          >
            <Select placeholder="Select the field type">
              <Option value="String">String</Option>
              <Option value="Integer">Integer</Option>
              <Option value="Boolean">Boolean</Option>
              {/* <Option value="Date">Date</Option>
              <Option value="Currency">Currency</Option> */}
            </Select>
          </Form.Item>
        
          <Form.Item
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
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
};

export default CreateFieldDrawer;
