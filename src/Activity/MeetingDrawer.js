import React, { useEffect } from "react";
import {
  Drawer,
  Button,
  Form,
  Card,
  Select,
  DatePicker,
  Input,
  message,
} from "antd";
import ApiService from "../Components/apiService";
import { BASE_URL } from "../Components/Constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;
const { TextArea } = Input;

const MeetingDrawer = ({
  visible,
  onClose,
  objectName,
  recordId,
  fetchActivityRecords,
  editingRecord,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingRecord) {
      // Ensure that StartDateTime and EndDateTime are valid date strings before parsing
      const startDate = editingRecord.StartDateTime
        ? dayjs(editingRecord.StartDateTime).isValid()
          ? dayjs(editingRecord.StartDateTime)
          : null
        : null;

      form.setFieldsValue({
        Name: editingRecord.Name,
        Subject: editingRecord.Subject,
        Description: editingRecord.Description,
        Priority: editingRecord.Priority,
        Status: editingRecord.Status,
        AssignedTo: editingRecord.AssignedTo,
        StartDateTime: startDate,
        EndDateTime: editingRecord.EndDateTime
          ? dayjs(editingRecord.EndDateTime, "DD/MM/YYYY HH:mm:ss")
          : null, // Handle null values
      });

      console.log("Start date:", startDate);
    }
  }, [editingRecord, form]);

  const handleSave = async () => {
    try {
      const formValues = await form.validateFields(); // Retrieve validated form values
      if (formValues.EndDateTime) {
        // Or use custom formatting if needed:
        formValues.EndDateTime = dayjs(formValues.EndDateTime).format(
          "YYYY-MM-DDTHH:mm:ss"
        );
      }
      if (formValues.StartDateTime) {
        formValues.StartDateTime = dayjs(formValues.StartDateTime).format(
          "YYYY-MM-DDTHH:mm:ss"
        );
      }
      console.log(formValues);
      const body = {
        object_name: "Activity",
        data: {
          ...formValues,
          ...(editingRecord?._id && { _id: editingRecord._id }),
        },
      };

      const apiService = new ApiService(
        `${BASE_URL}/insert_or_update_records`,
        { "Content-Type": "application/json" },
        "POST",
        body
      );

      const response = await apiService.makeCall();

      console.log("RESPONSE", response);

      if (response && response.operation) {
        message.success("Meeting saved successfully!");
        onClose();
        form.resetFields();
        fetchActivityRecords();
      } else {
        message.error("Failed to save meeting. Please try again.");
      }
    } catch (error) {
      message.error("Validation failed or API error occurred.");
    }
  };

  return (
    <Drawer
      title={
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          {editingRecord ? "Edit Meeting" : "Create Meeting"}
        </div>
      }
      width="40%"
      placement="right"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      headerStyle={{
        padding: "20px 16px",
        background: "#f0f2f5",
        borderBottom: "1px solid #e8e8e8",
      }}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 16px",
          }}
        >
          <Button
            onClick={onClose}
            style={{ height: "34px", width: "90px", fontSize: "14px" }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSave} // Connect Save button to handleSave
            style={{
              height: "34px",
              width: "90px",
              fontSize: "14px",
              border: "1px solid #1890ff",
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <Card
        style={{
          margin: "20px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            AssociatedObject: objectName,
            ParentId: recordId,
            ActivityType: "Meeting",
          }}
        >
          {/* Name */}
          <Form.Item
            label="Name"
            name="Name"
            style={{ display: "none" }}
            // rules={[{ required: true, message: "Please enter a name!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          {/* Activity Type */}
          <Form.Item
            label="Activity Type"
            name="ActivityType"
            style={{ display: "none" }}
            rules={[
              { required: true, message: "Please select an activity type!" },
            ]}
          >
            <Select placeholder="Select activity type" disabled>
              <Option value="Call">Call</Option>
              <Option value="Meeting">Meeting</Option>
              <Option value="Email">Email</Option>
              <Option value="Task">Task</Option>
              <Option value="Note">Note</Option>
            </Select>
          </Form.Item>

          {/* Subject */}
          <Form.Item label="Subject" name="Subject" rules={[{ required: true, message: "Please enter subject!" }]}>
            <Input placeholder="Enter subject" />
          </Form.Item>

          {/* Description */}
          <Form.Item label="Description" name="Description">
            <TextArea placeholder="Enter description" rows={4} />
          </Form.Item>

          {/* Start Date & Time */}
          <Form.Item label="Start Date & Time" name="StartDateTime">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="DD/MM/YYYY HH:mm:ss"
              value={
                form.getFieldValue("StartDateTime")
                  ? dayjs(form.getFieldValue("StartDateTime"))
                  : null
              }
              onChange={(date) => {
                form.setFieldValue("StartDateTime", date);
              }}
            />
          </Form.Item>

          {/* End Date & Time */}
          <Form.Item label="End Date & Time" name="EndDateTime">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="DD/MM/YYYY HH:mm:ss"
              value={
                form.getFieldValue("EndDateTime")
                  ? dayjs(form.getFieldValue("EndDateTime"))
                  : null
              }
              onChange={(date) => {
                form.setFieldValue("EndDateTime", date);
              }}
            />
          </Form.Item>

          {/* Assigned To */}
          <Form.Item label="Assigned To" name="AssignedTo">
            <Input placeholder="Enter assignee" />
          </Form.Item>

          {/* Status */}
          <Form.Item label="Status" name="Status">
            <Select placeholder="Select status">
              <Option value="Pending">Pending</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Form.Item>

          {/* Priority */}
          <Form.Item label="Priority" name="Priority">
            <Select placeholder="Select priority">
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
          </Form.Item>

          {/* Associated Object */}
          <Form.Item
            label="Associated Object"
            name="AssociatedObject"
            style={{ display: "none" }}
          >
            <Input placeholder="Enter associated object" disabled />
          </Form.Item>

          {/* Parent ID */}
          <Form.Item
            label="Parent ID"
            name="ParentId"
            style={{ display: "none" }}
          >
            <Input placeholder="Enter parent ID" disabled />
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
};

export default MeetingDrawer;
