import React, { useState, useEffect } from 'react';
import { Drawer, Button, Form, Card, Spin, Input, Checkbox, DatePicker, Space, Select } from 'antd';
import dayjs from 'dayjs';
import ApiService from './apiService'; // Import ApiService class
import {BASE_URL,DateFormat} from './Constant' // Define the date format
import customParseFormat from 'dayjs/plugin/customParseFormat';
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
  form 
}) => {
  // Function to render form items based on field type

  const [lookupOptions, setLookupOptions] = useState([]);


  useEffect(() => {
    const fetchAllLookupOptions = async () => {
      const lookupFields = fieldsData.filter(field => field.type === 'lookup');
      const lookupOptionsObj = {};
  
      for (const lookupField of lookupFields) {
        try {
          const apiServiceForLookup = new ApiService(
            `${BASE_URL}/fetch_records/${lookupField.name}`,
            { 'Content-Type': 'application/json' },
            'GET'
          );
          const response = await apiServiceForLookup.makeCall();
          lookupOptionsObj[lookupField.name] = response; // Store options for each lookup field
        } catch (error) {
          console.error(`Error fetching lookup options for ${lookupField.name}:`, error);
        }
      }
      setLookupOptions(lookupOptionsObj); // Store all lookup options in state
    };
  
    if (fieldsData.some(field => field.type === 'lookup')) {
      fetchAllLookupOptions();
    }
  }, [fieldsData]);


  const renderFormItem = (field, selectedDate, setSelectedDate) => {
    switch (field.type) {
      case 'String':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
          >
            <Input placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'Integer':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
          >
            <Input type="number" placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>{field.label}</Checkbox>
          </Form.Item>
        );

      case 'Date':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
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
            label={field.label}
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
            label={field.label}
          >
            <Select placeholder={`Select ${field.label}`}>
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
            label={field.label}
          >
            <Select
              placeholder={`Select ${field.label}`}
              showSearch
              allowClear
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {lookupOptions[field.name]?.map((option) => (
                <Select.Option key={option._id} value={option._id}>
                  {option.Name}
                </Select.Option>
              ))}
            </Select>
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
            label={field.label}
          >
            <Input
              placeholder={`Enter ${field.label}`}
              maxLength={decimalPlacesBefore + decimalPlacesAfter + 1}
            />
          </Form.Item>
        );

      case 'Text-Area':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
          >
            <Input.TextArea
              placeholder={`Enter ${field.label}`}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>
        {selectedRecord?.isClone ? 'Clone Record' : selectedRecord ? 'Edit Record' : 'Create New Record'}
      </div>}
      width="40%"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      headerStyle={{
        padding: '20px 16px',
        background: '#20b2aa',
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
          <Button onClick={onClose} style={{ height: '34px', width: '90px', fontSize: '14px' }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            style={{
              height: '34px',
              width: '90px',
              fontSize: '14px',
              // backgroundColor: 'white',
              // color: '#1890ff',
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
            hideRequiredMark
            onFinish={onFinish}
            style={{ fontSize: '16px' }}
          >
            {fieldsData?.map((field) => renderFormItem(field, selectedDate, setSelectedDate))}
          </Form>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default CreateRecordDrawer;
