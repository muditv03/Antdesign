import React from 'react';
import { Drawer, Button, Form, Card, Select, Input } from 'antd';

const { Option } = Select;

const CallDrawer = ({ visible, onClose }) => (
  <Drawer
    title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{'Create Call'}</div>}
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
        <Button
          onClick={onClose}
          style={{ height: '34px', width: '90px', fontSize: '14px' }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          style={{
            height: '34px',
            width: '90px',
            fontSize: '14px',
            border: '1px solid #1890ff',
          }}
        >
          Save
        </Button>
      </div>
    }
  >
    <Card
      style={{
        margin: '20px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Form layout="vertical">
        {/* Searchable Picklist Field */}
        <Form.Item
          label="Subject"
          name="subject"
        >
          <Select
            showSearch
            placeholder="Search and select"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option value="option1">--None--</Option>
            <Option value="option2">Call</Option>
            <Option value="option3">Email</Option>
            <Option value="option3">Send Letter</Option>
            <Option value="option3">Send Quote</Option>
            <Option value="option3">Other</Option>
          </Select>
        </Form.Item>

        {/* Text Area Field */}
        <Form.Item
          label="Comments"
          name="comments"
        >
          <Input.TextArea placeholder="Enter comment..." rows={4} />
        </Form.Item>
      </Form>
    </Card>
  </Drawer>
);

export default CallDrawer;