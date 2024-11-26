import React, { useState } from 'react';
import { Drawer, Button, Form, Card, Input } from 'antd';
import { useQuill } from "react-quilljs";
import 'react-quill/dist/quill.snow.css';

const EmailDrawer = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const { quill, quillRef } = useQuill();
  const [body, setBody] = useState('');

  const handleBodyChange = () => {
    if (quill) setBody(quill.root.innerHTML);
  };

  const emailListValidation = (_, value) => {
    if (!value) return Promise.resolve();
    const emails = value.split(',').map(email => email.trim());
    const isValid = emails.every(email =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    return isValid
      ? Promise.resolve()
      : Promise.reject(new Error('Please enter valid email addresses.'));
  };

  const handleSave = () => {
    form
      .validateFields()
      .then(values => {
        console.log('To:', values.to);
        console.log('CC:', values.cc);
        console.log('BCC:', values.bcc);
        console.log('Subject:', values.subject);
        console.log('Body:', body);
        alert('Email saved (simulated)!');
      })
      .catch(errorInfo => {
        console.error('Validation Failed:', errorInfo);
      });
  };

  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{'Create Email'}</div>}
      width="40%"
      placement="right"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      headerStyle={{
        padding: '20px 16px',
        background: '#f0f2f5',
        borderBottom: '1px solid #e8e8e8',
      }}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 16px',
          }}
        >
          <Button onClick={onClose} style={{ height: '34px', width: '90px', fontSize: '14px' }}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            style={{
              height: '34px',
              width: '90px',
              fontSize: '14px',
              border: '1px solid #1890ff',
            }}
          >
            Send
          </Button>
        </div>
      }
    >
      <Card style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="To"
            name="to"
            rules={[
              { required: true, message: 'Please enter the recipient email.' },
              { type: 'email', message: 'Please enter a valid email address.' },
            ]}
          >
            <Input placeholder="Enter recipient's email" />
          </Form.Item>

          <Form.Item label="CC" name="cc" rules={[{ validator: emailListValidation }]}>
            <Input placeholder="Enter CC email(s), comma-separated" />
          </Form.Item>

          <Form.Item label="BCC" name="bcc" rules={[{ validator: emailListValidation }]}>
            <Input placeholder="Enter BCC email(s), comma-separated" />
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: 'Please enter the email subject.' }]}
          >
            <Input placeholder="Enter email subject" />
          </Form.Item>

          <Form.Item label="Body">
            <div style={{ width: "100%", height: 200 }}>
              <div ref={quillRef} onChange={handleBodyChange} />
            </div>
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
};

export default EmailDrawer;
