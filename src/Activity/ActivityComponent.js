import React, { useState, useEffect } from 'react';
import { Timeline, Collapse, Card, Dropdown, message, Col, Row } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import TaskDrawer from './TaskDrawer';
import CallDrawer from './CallDrawer';
import EmailDrawer from './EmailDrawer';
import MeetingDrawer from './MeetingDrawer';
import NoteDrawer from './NoteDrawer';
import ApiService from '../Components/apiService';
import { BASE_URL } from '../Components/Constant';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

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

const CustomTimeline = ({ objectName, recordId }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState('');

  console.log('Object Name:', objectName);
  console.log('Record ID:', recordId);

  // Fetch activity records function
  const fetchActivityRecords = async () => {
    try {
      const fetchRec = new ApiService(`${BASE_URL}/fetchActivityRecords/${objectName}/${recordId}`, {}, 'GET');
      const response = await fetchRec.makeCall();
      console.log("Activity Records Response:", response);

      // Get current date, tomorrow, and end of the month
      const currentDate = new Date();
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);

      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Map response to timelineData format with categorization
      const data = response.map((record) => {
        const endDateTime = new Date(record.EndDateTime);
        const formattedEndDateTime = dayjs(record.EndDateTime)
          .utc()
          .format('DD/MM/YYYY HH:mm:ss');

        let section = '';
        if (record.Status === 'Pending') {
          section = 'Upcoming & Overdue';
        } else {
          section = 'This Month';
        }

        return {
          type: record.ActivityType,
          section,
          subject: record.Subject,
          endDateTime: formattedEndDateTime,
          status: record.Status,
          priority: record.Priority,
          icon: getIconByType(record.ActivityType),
          key: record.id || Date.now(),
        };
      });

      setTimelineData(data);
    } catch (error) {
      console.error("Error fetching activity records:", error);
    }
  };

  useEffect(() => {
    fetchActivityRecords();
  }, []);

  const handleButtonClick = (type) => {
    setDrawerType(type);
    setDrawerVisible(true);
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'Task': return <FileTextOutlined />;
      case 'Call': return <PhoneOutlined />;
      case 'Email': return <MailOutlined />;
      case 'Meeting': return <CalendarOutlined />;
      case 'Note': return <ClockCircleOutlined />;
      default: return <UserOutlined />;
    }
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const renderTimelineSection = (section) => (
    <Timeline>
      {timelineData
        .filter((item) => item.section === section)
        .map((item) => (
          <Timeline.Item key={item.key} dot={item.icon} color="blue">
            <span>{item.type}</span>
            <Collapse expandIconPosition="right">
              <Panel
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.subject}</span>
                    <span>
                      {(() => {
                        const [day, month, year, time] = item.endDateTime.split(/[\s/:]+/);
                        const formattedDate = new Date(`${year}-${month}-${day}T${time}:00`);
                        return formattedDate.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        });
                      })()}
                    </span>
                  </div>
                }
                key={item.key}
              >
                <p><strong>End Date & Time:</strong> <span>
                  {(() => {
                    // Assuming item.endDateTime format: '17/11/2024 00:30:00'
                    const [day, month, year, hours, minutes, seconds] = item.endDateTime.split(/[\s/:]+/);
                    const formattedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);

                    // Format the date and time
                    const dateStr = formattedDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    });

                    // Format the time in 12-hour format (with AM/PM)
                    const timeStr = formattedDate.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });

                    return `${dateStr}, ${timeStr}`;
                  })()}
                </span></p>
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Priority:</strong> {item.priority}</p>
              </Panel>
            </Collapse>
          </Timeline.Item>
        ))}
    </Timeline>
  );


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

      {/* Accordion for "Upcoming & Overdue" section */}
      <div style={{ marginBottom: '20px' }}>
        <Collapse defaultActiveKey={['1']} expandIconPosition="right">
          <Panel header="Upcoming & Overdue" key="1">
            {renderTimelineSection('Upcoming & Overdue')}
          </Panel>
        </Collapse>
      </div>

      {/* Accordion for "This Month" section */}
      <div style={{ marginBottom: '20px' }}>
        <Collapse defaultActiveKey={['2']} expandIconPosition="right">
          <Panel header="This Month" key="2">
            {renderTimelineSection('This Month')}
          </Panel>
        </Collapse>
      </div>


      {/* Render the appropriate drawer based on button clicked */}
      {drawerVisible && drawerType === 'Task' && <TaskDrawer fetchActivityRecords={fetchActivityRecords} objectName={objectName} recordId={recordId} visible={drawerVisible} onClose={handleDrawerClose} />}
      {drawerVisible && drawerType === 'Call' && <CallDrawer fetchActivityRecords={fetchActivityRecords} objectName={objectName} recordId={recordId} visible={drawerVisible} onClose={handleDrawerClose} />}
      {drawerVisible && drawerType === 'Email' && <EmailDrawer fetchActivityRecords={fetchActivityRecords} objectName={objectName} recordId={recordId} visible={drawerVisible} onClose={handleDrawerClose} />}
      {drawerVisible && drawerType === 'Meeting' && <MeetingDrawer fetchActivityRecords={fetchActivityRecords} objectName={objectName} recordId={recordId} visible={drawerVisible} onClose={handleDrawerClose} />}
      {drawerVisible && drawerType === 'Note' && <NoteDrawer fetchActivityRecords={fetchActivityRecords} objectName={objectName} recordId={recordId} visible={drawerVisible} onClose={handleDrawerClose} />}
    </Card>
  );
};

export default CustomTimeline;
