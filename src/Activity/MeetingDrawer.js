import React from 'react';
import { Drawer, Button, Form, Card } from 'antd';

const MeetingDrawer = ({ visible, onClose }) => (
  <Drawer
  title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>{'Create Meeting'}</div>}
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
    <div style={{ display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 16px',  
        }} >
      <Button onClick={onClose} style={{ height: '34px', width: '90px', fontSize: '14px' }}>Cancel</Button>
      <Button type="primary" style={{
            height: '34px',
            width: '90px',
            fontSize: '14px',
            border: '1px solid #1890ff',
          }}>Save</Button>
    </div>
  }
>
  <Card style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
    {/* Add your form fields here */}
  </Card>
</Drawer>
);

export default MeetingDrawer;
