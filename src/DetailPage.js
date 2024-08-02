import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Collapse, Typography, Avatar, Checkbox, Select } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Link } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DetailPage = () => {
  const [form] = Form.useForm();
  const [isEditable, setIsEditable] = useState(false); // Controls the entire form's edit state
  const [initialValues, setInitialValues] = useState({}); // To store the initial values

  const onFinish = (values) => {
    console.log('Form Values:', values);
    setInitialValues(values); // Save the new values when the form is submitted
    setIsEditable(false);
  };

  const handleEditClick = () => {
    setInitialValues(form.getFieldsValue()); // Save the current values before entering edit mode
    setIsEditable(true);
  };

  const handleCancelClick = () => {
    form.setFieldsValue(initialValues); // Reset the form to the initial values
    setIsEditable(false);
  };

  const renderFieldWithEdit = (fieldName, placeholder, isPicklist = false, options = [], isTextArea = false) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: !isEditable ? '1px solid #ddd' : 'none',
          paddingBottom: 4,
          paddingTop: 4,
          marginBottom: 12,
        }}
      >
        {isEditable ? (
          <Form.Item name={fieldName} noStyle>
            {isPicklist ? (
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
          <span style={{ flex: 1 }}>{form.getFieldValue(fieldName)}</span>
        )}
        {!isEditable && (
          <Avatar
            icon={<EditOutlined />}
            size={16} // Smaller icon size
            style={{ marginLeft: 8, cursor: 'pointer' }}
            onClick={handleEditClick}
          />
        )}
      </div>
    );
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} style={{ padding: '24px' }}>
      <Collapse defaultActiveKey={['1', '2', '3', '4']}>
        <Panel header="Account Information" key="1">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Account Name" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('accountName', 'Account Name')}
              </Form.Item>
              <Form.Item label="Parent Account" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('parentAccount', 'Parent Account')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('phone', 'Phone')}
              </Form.Item>
              <Form.Item label="Fax" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('fax', 'Fax')}
              </Form.Item>
              <Form.Item label="Website" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('website', 'Website')}
              </Form.Item>
            </Col>
          </Row>
        </Panel>

        <Panel header="Additional Information" key="2">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Type" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('type', 'Type', true, ['Customer', 'Partner', 'Supplier'])}
              </Form.Item>
              <Form.Item label="Industry" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('industry', 'Industry', true, ['Technology', 'Finance', 'Healthcare'])}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Employees" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('employees', 'Employees')}
              </Form.Item>
              <Form.Item label="Annual Revenue" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('revenue', 'Annual Revenue')}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Description" style={{ marginBottom: 8 }}>
            {renderFieldWithEdit('description', 'Description')}
          </Form.Item>
        </Panel>

        <Panel header="Address Information" key="3">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Billing Address" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('billingAddress', 'Billing Address', false, [], true)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Shipping Address" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('shippingAddress', 'Shipping Address', false, [], true)}
              </Form.Item>
            </Col>
          </Row>
        </Panel>

        <Panel header="Renewal/Co-Term Information" key="4">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Contract Co-Termination" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('contractCoTermination', 'Contract Co-Termination')}
              </Form.Item>
              <Form.Item label="Co-Termination Event" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('coTerminationEvent', 'Co-Termination Event')}
              </Form.Item>
              <Form.Item label="Renewal Pricing Method" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('renewalPricingMethod', 'Renewal Pricing Method')}
              </Form.Item>
              <Form.Item label="Renewal Model" style={{ marginBottom: 8 }}>
                {renderFieldWithEdit('renewalModel', 'Renewal Model')}
              </Form.Item>
            </Col>
          </Row>
        </Panel>
      </Collapse>

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
  );
};

export default DetailPage;
