import React, { useState } from 'react';
import { Timeline, Collapse, Card, Dropdown, message, Col, Row } from 'antd';
import { UserOutlined, FileTextOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import TaskDrawer from './TaskDrawer'; // Import the drawer components
import CallDrawer from './CallDrawer';
import EmailDrawer from './EmailDrawer';
import MeetingDrawer from './MeetingDrawer';
import NoteDrawer from './NoteDrawer';

const { Panel } = Collapse;

const handleMenuClick = (e) => {
  message.info('Click on menu item.');
  console.log('click', e);
};

const items = [
  { label: '1st menu item', key: '1', icon: <UserOutlined /> },
  { label: '2nd menu item', key: '2', icon: <UserOutlined /> },
  { label: '3rd menu item', key: '3', icon: <UserOutlined />, danger: true },
  { label: '4th menu item', key: '4', icon: <UserOutlined />, danger: true, disabled: true },
];

const menuProps = {
  items,
  onClick: handleMenuClick,
};

const CustomTimeline = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false); // State to control drawer visibility
  const [drawerType, setDrawerType] = useState(''); // State to control which drawer is shown

  const handleButtonClick = (type) => {
    const newEntry = { 
      type, 
      content: `New ${type} record created`, 
      icon: getIconByType(type),
      key: Date.now() 
    };
    setTimelineData([newEntry, ...timelineData]);

    setDrawerType(type); // Set which drawer to show based on button clicked
    setDrawerVisible(true); // Open the drawer
  };

  const getIconByType = (type) => {
    switch(type) {
      case 'Task': return <FileTextOutlined />;
      case 'Call': return <PhoneOutlined />;
      case 'Email': return <MailOutlined />;
      case 'Meeting': return <CalendarOutlined />;
      case 'Note': return <ClockCircleOutlined />;
      default: return <UserOutlined />;
    }
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false); // Close the drawer
  };

  return (
    <Card>
      <Row justify="start" style={{ paddingBottom: '20px' }}>
        <Col style={{ marginRight: '10px' }}>
          <Dropdown.Button 
            onClick={() => handleButtonClick('Task')} 
            menu={menuProps} 
            icon={<FileTextOutlined />} 
            placement="bottom"
            style={{ backgroundColor: 'transparent', color: '#000' }}
          >
            Task
          </Dropdown.Button>
        </Col>
        <Col style={{ marginRight: '10px' }}>
          <Dropdown.Button 
            onClick={() => handleButtonClick('Call')} 
            menu={menuProps} 
            icon={<PhoneOutlined />} 
            placement="bottom"
            style={{ backgroundColor: 'transparent', color: '#000' }}
          >
            Call
          </Dropdown.Button>
        </Col>
        <Col style={{ marginRight: '10px' }}>
          <Dropdown.Button 
            onClick={() => handleButtonClick('Email')} 
            menu={menuProps} 
            icon={<MailOutlined />} 
            placement="bottom"
            style={{ backgroundColor: 'transparent', color: '#000' }}
          >
            Email
          </Dropdown.Button>
        </Col>
        <Col style={{ marginRight: '10px' }}>
          <Dropdown.Button 
            onClick={() => handleButtonClick('Meeting')} 
            menu={menuProps} 
            icon={<CalendarOutlined />} 
            placement="bottom"
            style={{ backgroundColor: 'transparent', color: '#000' }}
          >
            Meeting
          </Dropdown.Button>
        </Col>
        <Col>
          <Dropdown.Button 
            onClick={() => handleButtonClick('Note')} 
            menu={menuProps} 
            icon={<ClockCircleOutlined />} 
            placement="bottom"
            style={{ backgroundColor: 'transparent', color: '#000' }}
          >
            Note
          </Dropdown.Button>
        </Col>
      </Row>

      {/* Timeline */}
      <Timeline>
        {timelineData.map((item) => (
          <Timeline.Item key={item.key} dot={item.icon} color="blue">
            <span>{item.type}</span>
            <Collapse expandIconPosition="right">
              <Panel header={item.type} key={item.key}>
                <p>{item.content}</p>
              </Panel>
            </Collapse>
          </Timeline.Item>
        ))}
      </Timeline>

      {/* Render the appropriate drawer based on button clicked */}
      {drawerVisible && drawerType === 'Task' && <TaskDrawer visible={drawerVisible} onClose={handleDrawerClose} />}
      {drawerVisible && drawerType === 'Call' && <CallDrawer visible={drawerVisible} onClose={handleDrawerClose} />}
      {drawerVisible && drawerType === 'Email' && <EmailDrawer visible={drawerVisible} onClose={handleDrawerClose} />}
      {drawerVisible && drawerType === 'Meeting' && <MeetingDrawer visible={drawerVisible} onClose={handleDrawerClose} />}
      {drawerVisible && drawerType === 'Note' && <NoteDrawer visible={drawerVisible} onClose={handleDrawerClose} />}
    </Card>
  );
};

export default CustomTimeline;
