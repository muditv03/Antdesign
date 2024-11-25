import React, { useState, useEffect } from "react";
import {
  Timeline,
  Collapse,
  Card,
  Dropdown,
  message,
  Col,
  Row,
  Button,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import TaskDrawer from "./TaskDrawer";
import CallDrawer from "./CallDrawer";
import EmailDrawer from "./EmailDrawer";
import MeetingDrawer from "./MeetingDrawer";
import NoteDrawer from "./NoteDrawer";
import ApiService from "../Components/apiService";
import { BASE_URL } from "../Components/Constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Panel } = Collapse;

const handleMenuClick = (e) => {
  message.info("Click on menu item.");
  console.log("click", e);
};

const items = [];

const menuProps = {
  items,
  onClick: handleMenuClick,
};

const CustomTimeline = ({ objectName, recordId }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);

  console.log("Object Name:", objectName);
  console.log("Record ID:", recordId);

  // Fetch activity records function
  const fetchActivityRecords = async () => {
    try {
      const fetchRec = new ApiService(
        `${BASE_URL}/fetchActivityRecords/${objectName}/${recordId}`,
        {},
        "GET"
      );
      const response = await fetchRec.makeCall();
      console.log("Activity Records Response:", response);

      // Get current date, tomorrow, and end of the month
      const currentDate = new Date();
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);

      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // Map response to timelineData format with categorization
      const data = response.map((record) => {
        console.log("DATA:");
        console.log(record);
        const endDateTime = new Date(record.EndDateTime);
        const formattedEndDateTime = dayjs(record.EndDateTime)
          .utc()
          .format("DD/MM/YYYY HH:mm:ss");

        const startDateTime = new Date(record.StartDateTime);
        const formattedStartDateTime = dayjs(record.StartDateTime)
          .utc()
          .format("DD/MM/YYYY HH:mm:ss");
        console.log(record);

        const section =
          record.Status === "Pending"
            ? "Upcoming & Overdue"
            : getMonthSection(endDateTime);

        return {
          Name: record.Name,
          ActivityType: record.ActivityType,
          section,
          ParentId: record.ParentId,
          StartDateTime: formattedStartDateTime,
          AssociatedObject: record.AssociatedObject,
          Description: record.Description,
          AssignedTo: record.AssignedTo,
          Subject: record.Subject,
          EndDateTime: formattedEndDateTime,
          Status: record.Status,
          Priority: record.Priority,
          icon: getIconByType(record.ActivityType),
          key: record.id || Date.now(),
          _id: record._id,
          created_at: record.created_at,
          updated_at: record.updated_at,
          recordCount: record.recordCount,
          user_id: record.user_id,
        };
      });

     // Sort records within each section by date
    const sortedData = data.sort((a, b) => {
      const dateA = dayjs(a.EndDateTime, "DD/MM/YYYY HH:mm:ss");
      const dateB = dayjs(b.EndDateTime, "DD/MM/YYYY HH:mm:ss");
      return dateA.isBefore(dateB) ? -1 : 1;
    });

    // Group records by section
    const groupedData = sortedData.reduce((acc, record) => {
      if (!acc[record.section]) acc[record.section] = [];
      acc[record.section].push(record);
      return acc;
    }, {});

    // Prioritize "Upcoming & Overdue" section
    const orderedSections = ["Upcoming & Overdue", ...Object.keys(groupedData).filter((key) => key !== "Upcoming & Overdue")];

    // Sort "Upcoming & Overdue" section by ascending order (earliest first)
    const upcomingOverdueSection = groupedData["Upcoming & Overdue"];
    const sortedUpcomingOverdue = upcomingOverdueSection.sort((a, b) => {
      const dateA = dayjs(a.EndDateTime, "DD/MM/YYYY HH:mm:ss");
      const dateB = dayjs(b.EndDateTime, "DD/MM/YYYY HH:mm:ss");
      return dateA.isBefore(dateB) ? -1 : 1; // Ascending sort for Upcoming & Overdue
    });

    // Sort other sections by descending order (latest first)
    const sortedOtherSections = Object.keys(groupedData)
      .filter((key) => key !== "Upcoming & Overdue")
      .reduce((acc, section) => {
        acc[section] = groupedData[section].sort((a, b) => {
          const dateA = dayjs(a.EndDateTime, "DD/MM/YYYY HH:mm:ss");
          const dateB = dayjs(b.EndDateTime, "DD/MM/YYYY HH:mm:ss");
          return dateB.isBefore(dateA) ? -1 : 1; // Descending sort for other sections
        });
        return acc;
      }, {});

    // Merge sorted data into final array
    const finalData = [sortedUpcomingOverdue, ...Object.values(sortedOtherSections)].flat();
      

      setTimelineData(finalData);
    } catch (error) {
      console.error("Error fetching activity records:", error);
    }
  };

  const getMonthSection = (date) => {
    // Format to month-year (e.g., "November 2024")
    const monthYear = dayjs(date).format("MMMM YYYY");
    return monthYear;
  };

  useEffect(() => {
    fetchActivityRecords();
  }, []);

  const handleButtonClick = (type) => {
    setDrawerType(type);
    setDrawerVisible(true);
    setEditingRecord(null);
  };

  const handleEditClick = (record) => {
    console.log("editing record is ");
    console.log(record.id);
    setDrawerType(record.ActivityType);
    setDrawerVisible(true);
    setEditingRecord(record);

    console.log("type:" + record.type);
    console.log("drawrr:" + drawerVisible);
    console.log("Edit Record:", record);
  };

  const getIconByType = (type) => {
    switch (type) {
      case "Task":
        return <FileTextOutlined />;
      case "Call":
        return <PhoneOutlined />;
      case "Email":
        return <MailOutlined />;
      case "Meeting":
        return <CalendarOutlined />;
      case "Note":
        return <ClockCircleOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const handleDrawerClose = () => {
    setEditingRecord(null);
    setDrawerVisible(false);
  };

  const renderTimelineSection = (section) => {
    const formatHeaderDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      const formattedDate = new Date(`${year}-${month}-${day}`);

      const currentDate = new Date();
      const differenceInDays = Math.floor(
        (formattedDate - new Date(currentDate.toDateString())) /
          (1000 * 60 * 60 * 24)
      );

      if (differenceInDays === 0) return "Today";
      return formattedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    // Sort the timeline data to ensure "Today" comes first, then "Tomorrow", and then others
    const sortedTimelineData = timelineData
      .filter((item) => item.section === section)
      .sort((a, b) => {
        const dateA = dayjs(a.endDateTime, "DD/MM/YYYY HH:mm:ss");
        const dateB = dayjs(b.endDateTime, "DD/MM/YYYY HH:mm:ss");

        // Sort by "Today" first, then "Tomorrow", then other dates in order
        if (dateA.isSame(dayjs(), "day")) return -1;
      if (dateB.isSame(dayjs(), "day")) return 1;

        // For dates that are not Today or Tomorrow, compare by date directly
        return dateA.isBefore(dateB) ? -1 : 1;
      });

    return (
      <Collapse defaultActiveKey={["section"]} expandIconPosition="right">
        <Panel header={section} key={section}>
          <Timeline>
            {sortedTimelineData.map((item) => (
              <Timeline.Item key={item.key} dot={item.icon} color="blue">
                <span>
                  {item.ActivityType}
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    type="link"
                    style={{ marginLeft: "10px", color: "black" }}
                    onClick={() => handleEditClick(item)} // Open drawer on click
                  />
                </span>
                <Collapse expandIconPosition="right">
                  <Panel
                    header={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {(() => {
                            // Determine message based on status and type
                            if (item.Status === "Pending") {
                              return `You have an upcoming ${item.ActivityType}`;
                            } else if (item.Status === "Completed") {
                              switch (item.ActivityType) {
                                case "Call":
                                  return "You logged a call";
                                case "Email":
                                  return "You sent an email";
                                case "Note":
                                  return "You created a note";
                                case "Task":
                                  return "You completed a task";
                                case "Meeting":
                                  return "You held a meeting";
                                default:
                                  return `You completed a ${item.ActivityType}`;
                              }
                            } else {
                              return item.Subject;
                            }
                          })()}
                        </span>
                        <span>
                          {formatHeaderDate(item.EndDateTime.split(" ")[0])}
                        </span>
                      </div>
                    }
                    key={item.key}
                  >
                    <p>
                      {item.ActivityType === "Meeting" && (
                        <>
                          <strong>Start Date & Time:</strong>{" "}
                          <span>
                            {(() => {
                              console.log("start date time is");
                              console.log(item.StartDateTime);
                              const [
                                day,
                                month,
                                year,
                                hours,
                                minutes,
                                seconds,
                              ] = item.StartDateTime.split(/[\s/:]+/);
                              const formattedDate = new Date(
                                `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
                              );

                              const dateStr = formattedDate.toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                }
                              );

                              const timeStr = formattedDate.toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              );

                              return `${dateStr}, ${timeStr}`;
                            })()}
                          </span>
                        </>
                      )}
                    </p>
                    <p>
                      <strong>End Date & Time:</strong>{" "}
                      <span>
                        {(() => {
                          console.log("end date time is");
                          console.log(item.EndDateTime);
                          const [day, month, year, hours, minutes, seconds] =
                            item.EndDateTime.split(/[\s/:]+/);
                          const formattedDate = new Date(
                            `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
                          );

                          const dateStr = formattedDate.toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          );

                          const timeStr = formattedDate.toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          );

                          return `${dateStr}, ${timeStr}`;
                        })()}
                      </span>
                    </p>
                    <p>
                      <strong>Subject:</strong> <a 
                      href={`/record/Activity/${item._id}`} // Replace with your dynamic URL logic
                      style={{ color: '#1890ff' }} // Optional styling
                    >
                    {item.Subject}
                    </a>
                    </p>
                    <p>
                      <strong>Priority:</strong> {item.Priority}
                    </p>
                    {item.ActivityType === "Note" && (
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start", // Ensure the items are aligned to the start
                        }}
                      >
                        <strong
                          style={{ marginRight: "10px", marginBottom: "auto" }}
                        >
                          Description:
                        </strong>
                        <div
                          style={{
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            padding: "8px",
                            width: "300px",
                            height: "100px", // Fixed height
                            overflowY: "auto", // Ensure scroll if content overflows
                            whiteSpace: "pre-wrap", // Wrap text properly
                            backgroundColor: "",
                            flexShrink: 0, // Prevent the div from shrinking
                          }}
                        >
                          {item.Description ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: item.Description,
                              }}
                            />
                          ) : (
                            "No description provided."
                          )}
                        </div>
                      </p>
                    )}
                  </Panel>
                </Collapse>
              </Timeline.Item>
            ))}
          </Timeline>
        </Panel>
      </Collapse>
    );
  };

  return (
    <Card>
      <Row justify="start" style={{ paddingBottom: "20px" }}>
        <Col style={{ marginRight: "10px" }}>
          <Dropdown.Button
            onClick={() => handleButtonClick("Task")}
            menu={menuProps}
            icon={<FileTextOutlined />}
            placement="bottom"
            style={{ backgroundColor: "transparent", color: "#000" }}
          >
            Task
          </Dropdown.Button>
        </Col>
        <Col style={{ marginRight: "10px" }}>
          <Dropdown.Button
            onClick={() => handleButtonClick("Call")}
            menu={menuProps}
            icon={<PhoneOutlined />}
            placement="bottom"
            style={{ backgroundColor: "transparent", color: "#000" }}
          >
            Call
          </Dropdown.Button>
        </Col>
        <Col style={{ marginRight: "10px" }}>
          <Dropdown.Button
            onClick={() => handleButtonClick("Email")}
            menu={menuProps}
            icon={<MailOutlined />}
            placement="bottom"
            style={{ backgroundColor: "transparent", color: "#000" }}
          >
            Email
          </Dropdown.Button>
        </Col>
        <Col style={{ marginRight: "10px" }}>
          <Dropdown.Button
            onClick={() => handleButtonClick("Meeting")}
            menu={menuProps}
            icon={<CalendarOutlined />}
            placement="bottom"
            style={{ backgroundColor: "transparent", color: "#000" }}
          >
            Meeting
          </Dropdown.Button>
        </Col>
        <Col>
          <Dropdown.Button
            onClick={() => handleButtonClick("Note")}
            menu={menuProps}
            icon={<ClockCircleOutlined />}
            placement="bottom"
            style={{ backgroundColor: "transparent", color: "#000" }}
          >
            Note
          </Dropdown.Button>
        </Col>
      </Row>

      <Timeline>
        {timelineData &&
          timelineData.length > 0 &&
          [...new Set(timelineData.map((item) => item.section))].map(
            (section) => (
              <div key={section}>{renderTimelineSection(section)}</div>
            )
          )}
      </Timeline>

      {/* Render the appropriate drawer based on button clicked */}
      {drawerVisible && drawerType === "Task" && (
        <TaskDrawer
          fetchActivityRecords={fetchActivityRecords}
          objectName={objectName}
          recordId={recordId}
          visible={drawerVisible}
          editingRecord={editingRecord}
          onClose={handleDrawerClose}
        />
      )}
      {drawerVisible && drawerType === "Call" && (
        <CallDrawer
          fetchActivityRecords={fetchActivityRecords}
          objectName={objectName}
          recordId={recordId}
          visible={drawerVisible}
          editingRecord={editingRecord}
          onClose={handleDrawerClose}
        />
      )}
      {drawerVisible && drawerType === "Email" && (
        <EmailDrawer
          fetchActivityRecords={fetchActivityRecords}
          objectName={objectName}
          recordId={recordId}
          visible={drawerVisible}
          onClose={handleDrawerClose}
        />
      )}
      {drawerVisible && drawerType === "Meeting" && (
        <MeetingDrawer
          fetchActivityRecords={fetchActivityRecords}
          objectName={objectName}
          recordId={recordId}
          visible={drawerVisible}
          editingRecord={editingRecord}
          onClose={handleDrawerClose}
        />
      )}
      {drawerVisible && drawerType === "Note" && (
        <NoteDrawer
          fetchActivityRecords={fetchActivityRecords}
          objectName={objectName}
          recordId={recordId}
          visible={drawerVisible}
          editingRecord={editingRecord}
          onClose={handleDrawerClose}
        />
      )}
    </Card>
  );
};

export default CustomTimeline;