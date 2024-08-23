import React from 'react';
import { Tabs, Descriptions } from 'antd';
  
const { TabPane } = Tabs;

const RecordDetail = ({ record }) => {
  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Detail" key="1">
          <Descriptions title="Record Details" bordered>
            {Object.keys(record).map((key) => (
              <Descriptions.Item label={key} key={key}>
                {record[key]}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </TabPane>
        <TabPane tab="Related" key="2">
          <p>Related information goes here.</p>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RecordDetail;
