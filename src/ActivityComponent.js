import React from 'react';
import { Timeline, Collapse, Icon,Card } from 'antd';
import { CloudOutlined, ApiOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

const CustomTimeline = () => (
    <Card>
  <Timeline>
    {/* First Node */}
    <Timeline.Item dot={<CloudOutlined />} color="blue">
      <Collapse expandIconPosition="right">
        <Panel header="Marketing Cloud" key="1">
          <p>Starter data bundles and Data Extensions</p>
        </Panel>
      </Collapse>
    </Timeline.Item>

    {/* Second Node */}
    <Timeline.Item dot={<AppstoreOutlined />} color="blue">
      <Collapse expandIconPosition="right">
        <Panel header="Salesforce CRM" key="2">
          <p>Import objects from Salesforce CRM</p>
        </Panel>
      </Collapse>
    </Timeline.Item>

    {/* Third Node */}
    <Timeline.Item dot={<ApiOutlined />} color="blue">
      <Collapse expandIconPosition="right">
        <Panel header="Ingestion API" key="3">
          <p>Stream and bulk upload data from external sources</p>
        </Panel>
      </Collapse>
    </Timeline.Item>

  </Timeline>
  </Card>
);

export default CustomTimeline;
