import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Typography, Avatar, Select, Tabs, Checkbox, Spin, List } from 'antd';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { EditOutlined } from '@ant-design/icons';
import RelatedRecord from './RelatedRecords';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;

const RecordDetail = () => {
  const { id, objectName } = useParams();
  const location = useLocation(); // Get the current location object from the router
  const [form] = Form.useForm();
  const [record, setRecord] = useState(null);
  const [fields, setFields] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [activeTabKey, setActiveTabKey] = useState("1"); // Manage the active tab key

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/fetch_single_record/${objectName}/${id}`);
        setRecord(response.data);
        form.setFieldsValue(response.data);
        console.log('record data is ' + JSON.stringify(response.data));

        const fieldsResponse = await axios.get(`http://localhost:3000/mt_fields/object/${objectName}`);
        setFields(fieldsResponse.data);
        console.log('recordresponse data is ' + JSON.stringify(fieldsResponse.data));
      } catch (err) {
        console.error('Error fetching records', err);
      }
    };

    fetchRecords();
  }, [id, objectName]);

  useEffect(() => {
    // Check the current path to determine which tab should be active
    if (location.pathname.includes('related')) {
      setActiveTabKey("2"); // Set to the "Related" tab if on the related record route
    } else {
      setActiveTabKey("1"); // Default to the "Detail" tab otherwise
    }
  }, [location.pathname]); // Listen to changes in the path

  const onFinish = async (values) => {
    try {
      console.log('Form Values:', values);

      const body = {
        object_name: objectName,
        data: {
          _id: record?._id, // Include the record ID if editing
          ...values, // Spread the updated form values
        },
      };

      await axios.post('http://localhost:3000/insert_or_update_records', body);
      console.log('API call with updated body:', body);

      setInitialValues(values);
      setIsEditable(false);
    } catch (err) {
      console.error('Error saving record', err);
    }
  };

  const handleEditClick = () => {
    setInitialValues(form.getFieldsValue());
    setIsEditable(true);
  };

  const handleCancelClick = () => {
    form.setFieldsValue(initialValues);
    setIsEditable(false);
  };

  const renderFieldWithEdit = (fieldName, placeholder, isPicklist = false, options = [], isTextArea = false, isBoolean = false) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: !isEditable ? '1px solid #ddd' : 'none',
          paddingBottom: 8,
          marginBottom: 16,
        }}
      >
        {isEditable ? (
          <Form.Item name={fieldName} noStyle valuePropName={isBoolean ? "checked" : "value"}>
            {isBoolean ? (
              <Checkbox>{placeholder}</Checkbox>
            ) : isPicklist ? (
              <Select placeholder={placeholder}>
                {options.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            ) : isTextArea ? (
              <TextArea placeholder={placeholder} />
            ) : (
              <Input placeholder={placeholder} />
            )}
          </Form.Item>
        ) : (
          <span style={{ flex: 1 }}>
            {isBoolean ? (form.getFieldValue(fieldName) ? "True" : "False") : form.getFieldValue(fieldName)}
          </span>
        )}
        {!isEditable && (
          <Avatar
            icon={<EditOutlined />}
            size={16}
            style={{ marginLeft: 8, cursor: 'pointer' }}
            onClick={handleEditClick}
          />
        )}
      </div>
    );
  };

  if (!record || fields.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: '12px', marginTop: '0px' }}>
        {objectName}
      </Title>
      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} style={{ marginBottom: '20px' }}>
        <TabPane tab="Detail" key="1">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Title level={3} style={{ marginBottom: '24px' }}>Record Details</Title>
            <Row gutter={24}>
              {fields.map((field, index) => (
                <Col key={index} xs={24} sm={12}>
                  <Form.Item label={field.label} style={{ marginBottom: 16 }}>
                    {renderFieldWithEdit(
                      field.name,
                      field.label,
                      field.isPicklist,
                      field.options || [],
                      field.isTextArea,
                      field.type === 'boolean'
                    )}
                  </Form.Item>
                </Col>
              ))}
            </Row>
            {isEditable && (
              <Row justify="end" style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                  Save
                </Button>
                <Button onClick={handleCancelClick}>
                  Cancel
                </Button>
              </Row>
            )}
          </Form>
        </TabPane>
        <TabPane tab="Related" key="2">
          <RelatedRecord objectName={objectName} recordId={id} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RecordDetail;
