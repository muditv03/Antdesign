import React from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Typography, Tabs,Row ,Col,Button } from 'antd'
import ObjectFieldTab from './Components/ObjectFieldsTab';
import ObjectRelatedListTab from './Components/ObjectRelatedListTab';

const { Title } = Typography;
const { TabPane } = Tabs;

const ObjectFieldDetail = () => {
  const location = useLocation();
  const { record } = location.state || {};

  // Define the columns for specific keys
  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Plural Label',
      dataIndex: 'plurallabel',
      key: 'plurallabel',
    },
  ];

  // Data source for the table with the corresponding values from the record
  const data = [
    {
      key: record?.key || 'N/A',
      label: record?.label || 'N/A',
      name: record?.name || 'N/A',
      plurallabel: record?.plurallabel || 'N/A',
    },
  ];

  return (
    <div>
      <Title level={3}>{record?.label || 'Object Details'}</Title>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Details" key="1">
          {/* Display specific record fields in a table */}
          <Row justify="end" style={{ marginBottom: '16px' }}>
        <Col>
          <Button type="primary" >
            Create Tab
          </Button>
        </Col>
      </Row>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false} // Disable pagination for simplicity
          />
        </TabPane>
        <TabPane tab="Properties" key="2">
          <ObjectFieldTab object={record} />
        </TabPane>
        <TabPane tab="Related Lists" key="3">
          <ObjectRelatedListTab object={record} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ObjectFieldDetail;
