import React, { Children, useEffect, useState } from 'react';
import { Drawer, Button, Form, Card, Spin, Input, Checkbox, DatePicker, Space, Select, Tooltip, Avatar } from 'antd';
import { MailOutlined, InfoCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ApiService from '../Components/apiService'; // Import ApiService class
import { BASE_URL, DateFormat } from '../Components/Constant'; // Define the date format
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DynamicSelect from './DynamicSelectForLookup';

dayjs.extend(customParseFormat);
 
const CreateRecordDrawer = ({
  visible,
  onClose,
  onFinish,
  loading,
  fieldsData,
  selectedRecord,
  selectedDate,
  setSelectedDate,
  handleFinishFailed,
  form
}) => {
  const [lookupOptionforparent, setLookupOptionsForParent] = useState([]);
  const [richTextContent, setRichTextContent] = useState(''); 

  useEffect(() => {
    if (selectedRecord) {
      // Populate the form with selected record's data
      const formValues = {};
      fieldsData.forEach(field => {
        if (field.type === 'Date' || field.type === 'DateTime') {
          formValues[field.name] = selectedRecord[field.name]
            ? dayjs(selectedRecord[field.name], field.type === 'Date' ? DateFormat : "DD/MM/YYYY HH:mm:ss")
            : null;
        } else if (field.type === 'boolean') {
          formValues[field.name] = selectedRecord[field.name] || false;
        } else if (field.type === 'Address') {
          // Assuming address fields are stored as separate properties
          formValues[`${field.name}_street`] = selectedRecord[`${field.name}_street`] || '';
          formValues[`${field.name}_city`] = selectedRecord[`${field.name}_city`] || '';
          formValues[`${field.name}_state`] = selectedRecord[`${field.name}_state`] || '';
          formValues[`${field.name}_country`] = selectedRecord[`${field.name}_country`] || '';
          formValues[`${field.name}_postalcode`] = selectedRecord[`${field.name}_postalcode`] || '';
        } else if (field.type === 'Rich-Text') {
          formValues[field.name] = selectedRecord[field.name] || '';
        } else {
          formValues[field.name] = selectedRecord[field.name] || '';
        }
      });
      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
      setRichTextContent(''); // Reset the form if no record is selected (for new record)
    }
  }, [selectedRecord, form, fieldsData]);

  const handleSearch = async (value, fieldId, name) => {
    console.log('handle search called');
 

    console.log(value)
    if (value) {
      console.log(fieldId);
      console.log(value);
      try {
        const apiService = new ApiService(`${BASE_URL}/search_lookup/${fieldId}/${value}`, {
          'Content-Type': 'application/json', // Add any necessary headers, such as content type
        }, 'GET',);
        const response = await apiService.makeCall();
        console.log('response of lookups ar');
        console.log(response);
        // Assuming the response data structure has options as an array
        setLookupOptionsForParent(prevOptions => ({
          ...prevOptions,
          [name]: response // Store the response for the specific field name
        }));
      } catch (error) {
        console.error("API request failed:", error);
        setLookupOptionsForParent(prevOptions => ({
          ...prevOptions,
          [name]: []
        }))
      } finally {
      }
    } else {
      setLookupOptionsForParent(prevOptions => ({
        ...prevOptions,
        [name]: []
      }));
    }
  };

 
  const renderFormItem = (field) => {

    if (field.is_auto_number || field.is_formula) {
      return null; // Don't render the field if it's an auto-number field
    }

    if (field.name === 'recordCount' || field.name==='CreatedBy' || field.name==='LastModifiedBy') {
      return null;
    }



    const isRequired = field.required ? [{ required: true, message: `${field.label} is required!` }] : [];

    // Check if help text is present for the field
    const renderLabel = (
      <span>
        {field.label}
        {field.help_text && field.help_text.trim() !== "" && (
          <Tooltip title={field.help_text}>
            <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }}></InfoCircleOutlined>
          </Tooltip>
        )}
      </span>
    );

    switch (field.type) {
      case 'String':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Input placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'Integer':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Input type="number" placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'Phone':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel} // Use the custom label here
            rules={isRequired}

          >
            <Input

              type="Number" 
              placeholder={`Enter ${field.label}`}
              addonBefore={
                <PhoneOutlined style={{ cursor: 'pointer' }} />
              }
            />
          </Form.Item>
        );

      case 'Email':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={[
              { type: 'email', message: 'The input is not valid E-mail!' },
              ...isRequired
            ]}
          >
            <Input type='email' prefix={<MailOutlined />} placeholder="Enter email" />
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            valuePropName="checked"
            initialValue={false}
            label={renderLabel}  // Use the custom label here
          >
            <Checkbox>{field.label}</Checkbox>
          </Form.Item>
        );

      case 'Date':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Space>
              <DatePicker
                placeholder={`Select ${field.label}`}
                style={{ width: '100%' }}
                format={DateFormat}
                value={form.getFieldValue(field.name) ? dayjs(form.getFieldValue(field.name), DateFormat) : null}
                onChange={(date, dateString) => {
                  setSelectedDate(date ? dayjs(dateString, DateFormat) : null);
                  form.setFieldsValue({ [field.name]: dateString });
                }}
              />
            </Space>
          </Form.Item>
        );

      case 'DateTime':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Space>
              <DatePicker
                showTime
                placeholder={`Select ${field.label}`}
                style={{ width: '100%' }}
                format="DD/MM/YYYY HH:mm:ss"
                value={form.getFieldValue(field.name) ? dayjs(form.getFieldValue(field.name), "DD/MM/YYYY HH:mm:ss") : null}
                onChange={(date, dateString) => {
                  setSelectedDate(date ? dayjs(dateString, "DD/MM/YYYY HH:mm:ss") : null);
                  form.setFieldsValue({ [field.name]: dateString });
                }}
              />
            </Space>
          </Form.Item>
        );
 
      case 'URL':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={[
              { type: 'url', message: 'Please enter a valid URL!' },
              ...isRequired
            ]}
          >
            <Input type="url" placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'currency':
        const currencyDecimalPlacesBefore = field.decimal_places_before;
        const currencyDecimalPlacesAfter = field.decimal_places_after;
        const regexPattern = new RegExp(`^\\d{1,${currencyDecimalPlacesBefore}}(\\.\\d{0,${currencyDecimalPlacesAfter}})?$`);
        const handleCurrencyInput = (event) => {
          const inputValue = event.target.value;
          if (!regexPattern.test(inputValue)) {
            event.preventDefault();
          }
        };

        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Input
              addonBefore="$"
              placeholder={`Enter ${field.label}`}
              onInput={handleCurrencyInput}
              maxLength={currencyDecimalPlacesBefore + currencyDecimalPlacesAfter + 1}
            />
          </Form.Item>
        );

      case 'Picklist':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Select
              placeholder={`Select ${field.label}`}
              allowClear
            >
              {field.picklist_values.map((value) => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'MultiSelect':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Select
              mode="multiple"
              placeholder={`Select ${field.label}`}
              allowClear
            >
              {field.picklist_values.map((value) => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'lookup':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >   
           <DynamicSelect
                objectName={field.parent_object_name}
                lookupConfig={field.lookup_config}
                onSearch={handleSearch}
                value={form.getFieldValue(field.name)}
                name={field.name}
                lookupOptionforparent={lookupOptionforparent}
                fieldId={field._id}
                onChange={(newValue) => form.setFieldsValue({ [field.name]: newValue })} // Update form value dynamically
              />
          </Form.Item>
        );
 
      case 'Address':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label} // This shows "Address" as the label
          >
            <Card title="Enter Address" bordered={true}>
              <Form.Item
                key={`${field.name}_street`}
                name={`${field.name}_street`}
                label="Street"
              >
                <Input placeholder="Enter Street" />
              </Form.Item>
              <Form.Item
                key={`${field.name}_city`}
                name={`${field.name}_city`}
                label="City"
              >
                <Input placeholder="Enter City" />
              </Form.Item>
              <Form.Item
                key={`${field.name}_state`}
                name={`${field.name}_state`}
                label="State"
              >
                <Input placeholder="Enter State" />
              </Form.Item>
              <Form.Item
                key={`${field.name}_country`}
                name={`${field.name}_country`}
                label="Country"
              >
                <Input placeholder="Enter Country" />
              </Form.Item>
              <Form.Item
                key={`${field.name}_postalcode`}
                name={`${field.name}_postalcode`}
                label="Postal Code"
              >
                <Input placeholder="Enter Postal Code" />
              </Form.Item>
            </Card>
          </Form.Item>
        );

      case 'decimal':
        const decimalPlacesBefore = field.decimal_places_before;
        const decimalPlacesAfter = field.decimal_places_after;
        const decimalPattern = new RegExp(`^\\d{1,${decimalPlacesBefore}}(\\.\\d{0,${decimalPlacesAfter}})?$`);

        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Input
              placeholder={`Enter ${field.label}`}
              maxLength={decimalPlacesBefore + decimalPlacesAfter + 1}
              onInput={(e) => {
                const value = e.target.value;
                if (!decimalPattern.test(value)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        );

      case 'percentage':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}
            rules={isRequired}
          >
            <Input addonAfter="%" type="float" placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'Text-Area':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={renderLabel}  // Use the custom label here
            rules={isRequired}
          >
            <Input.TextArea
              placeholder={`Enter ${field.label}`}
            />
          </Form.Item>
        );

        case 'Rich-Text':
          return (
            <Form.Item
          key={field.name}
          name={field.name}
          label={renderLabel} 
          rules={isRequired}
        >
          <ReactQuill
            value={form.getFieldValue(field.name)}
            onChange={(value) => form.setFieldsValue({ [field.name]: value })}
            placeholder={`Enter ${field.label}`}
            theme="snow"
            style={{ height: '200px', minHeight: '150px' }}
          />
        </Form.Item>
          )

      default:
        return null;
    }
  };

const cancelDrawer = ()=>{
  form.resetFields();
  onClose();
}
  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }} onOpenChange={() => {
        const drawerBody = document.querySelector('.ant-drawer-body');
        if (drawerBody) {
          drawerBody.scrollTop = 0;
        }
      }}
    >
        {selectedRecord?.isClone ? 'Clone Record' : selectedRecord ? 'Edit Record' : 'Create New Record'}
      </div>}
      width="40%"
      onClose={!loading ? cancelDrawer : null} // Prevent drawer from closing when loading is true
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      headerStyle={{
        padding: '20px 16px',
        background: '#f0f2f5',
        borderBottom: '1px solid #e8e8e8',
      }}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 16px',
            background: '#f0f2f5',
            borderTop: '1px solid #e8e8e8',
          }}
        >
          <Button
            onClick={onClose}
            disabled={loading} // Disable cancel button when loading is true
            style={{ height: '34px', width: '90px', fontSize: '14px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            disabled={loading} // Disable save button when loading is true
            type="primary"
            style={{
              height: '34px',
              width: '90px',
              fontSize: '14px',
              border: '1px solid #1890ff',
            }}
          >
            Save
          </Button>
        </div>
      }
      footerStyle={{ textAlign: 'right', padding: '0' }}
    >
      <Spin spinning={loading} tip="Loading...">
        <Card
          style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              const richTextValue = richTextContent; // Get the rich text content
              const formData = { ...values, richText: richTextValue };
              onFinish(formData); // Pass the full data to the parent
            }} 
            onFinishFailed={handleFinishFailed} // Add this for handling validation errors



            style={{ fontSize: '16px' }}
          >
            {fieldsData?.map((field) => renderFormItem(field))}
          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateRecordDrawer;
