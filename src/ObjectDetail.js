import React from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Form, Card, Button, Row, Col, Typography, Tabs } from 'antd';
import ObjectFieldTab from './Components/ObjectFieldsTab';
import CreateListView from './Components/CreateListView';
import ObjectRelatedListTab from './Components/ObjectRelatedListTab';
import { useState } from 'react';
import CreateObjectDrawer from './CreateObjectDrawer';


const { Title } = Typography;
const { TabPane } = Tabs;

const ObjectFieldDetail = () => {
  const location = useLocation();
  const { record } = location.state || {};
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const handleAddOrEditObject = (updatedObject) => {
    // Logic to update the object in state
  };

  const dataset = [
    {
      key: record?.key || 'N/A',
      label: record?.label || 'N/A',
      name: record?.name || 'N/A',
      plurallabel: record?.plurallabel || 'N/A',
    },
  ];

  const createTab = () => {
    setDrawerVisible(true);
    setEditingRecord(record);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingRecord(null);
  };

  return (
    <div>
      <Title level={3}>{record?.label || 'Object Details'}</Title>
      <Tabs defaultActiveKey="1" tabPosition='left'>
        <TabPane tab="Details" key="1">
          
          <Card>
          <Row justify="end" style={{ marginBottom: '16px' }}>
            
          </Row>
            <Form form={form} layout="vertical" style={{ position: 'relative' }}>
              <Title level={3} style={{ marginTop: '0px' }}>Details</Title>
              <Row gutter={24} style={{ marginBottom: '0px' }}>
                {dataset.map((field, index) => (
                  <React.Fragment key={index}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Label"
                        labelCol={{ span: 6 }} // Adjust label column width
                        wrapperCol={{ span: 18 }} // Adjust wrapper column width
                        style={{ marginBottom: '8px',borderBottom: '1px solid  #ddd' }} // Decrease bottom margin
                      >
                        <span style={{ fontWeight: 500 }}>{field.label}</span>
                      </Form.Item>
                    </Col>
              
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Name"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ marginBottom: '8px' ,borderBottom: '1px solid  #ddd'}}
                      >
                        <span style={{ fontWeight: 500 }}>{field.name}</span>
                       </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Plural Label"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ marginBottom: '8px',borderBottom: '1px solid  #ddd' }}
                      >
                        <span style={{ fontWeight: 500 }}>{field.plurallabel}</span>
                      </Form.Item>
                    </Col>
                  </React.Fragment>
                ))}
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Properties" key="2">
          <Card>
          <ObjectFieldTab object={record} />  
          </Card>
        </TabPane>
        <TabPane tab="Related Lists" key="3">
         <Card>
         <ObjectRelatedListTab object={record} />
         </Card>
        </TabPane>
        <TabPane tab="Create List View" key="4">
         <Card>
            <CreateListView object={record}/>
         </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ObjectFieldDetail;
