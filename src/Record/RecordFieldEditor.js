import React from 'react';
import { Form, Input, Select, Checkbox, DatePicker, Space, Row, Col, Avatar } from 'antd';
import dayjs from 'dayjs';
import { PhoneOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the Quill styles
import DynamicSelect from './DynamicSelectForLookup';

const { Option } = Select;
const { TextArea } = Input;

const FieldRendererEdit = ({ isFieldEditable, type, name, label, validationRules = [], form, picklist_values = [], handleSearch, lookupOptionforparent = {}, lookup_config = {}, DateFormat , setSelectedDate, handleAddressChange, fieldId, lookupData,parentObjectName}) => {
    if (!isFieldEditable) return null;
 
    const initialValue = form.getFieldValue(name);
    switch (type) {
        case 'boolean':
            return (
                <Form.Item
                    name={name}
                    valuePropName="checked"
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <Checkbox>{label}</Checkbox>
                </Form.Item>
            );
        case 'Integer' :
                return (
                  <Form.Item
                          name={name}
                          initialValue={initialValue}
                          rules={validationRules}
                          noStyle
                      >
                          <Input initialValue={initialValue} placeholder={label} type="number"  />
                      </Form.Item>
      
                ); 
        case 'Picklist':
            return (
                <Form.Item
                    name={name}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <Select allowClear placeholder={label}>
                        {picklist_values.map(option => (
                            <Option key={option} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            );
        case 'MultiSelect':
            return (
                <Form.Item
                    name={name}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle

                >
                    <Select mode="multiple" placeholder={label}>
                        {picklist_values.map(option => (
                            <Option key={option} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            );
        case 'lookup':
            return (
                <Form.Item
                name={name}
                label={label}
                key={name}
                initialValue={form.getFieldValue(name)}
                rules={validationRules}
                noStyle
              >
              <DynamicSelect
                objectName={parentObjectName}
                lookupConfig={lookup_config}
                onSearch={handleSearch}
                value={form.getFieldValue(name)}
                name={name}
                lookupOptionforparent={lookupOptionforparent}
                fieldId={fieldId}
                onChange={(newValue) => form.setFieldsValue({ [name]: newValue })} // Update form value dynamically
              />
              </Form.Item>
            );
        case 'Date':
            return(
                <Form.Item
                name={name}
                label={label}
                key={name}
                valuePropName={type === 'boolean' ? 'checked' : 'value'}
                initialValue={form.getFieldValue(name)}
                rules={validationRules}
                noStyle
              >
                  <Space>
                    <DatePicker
                      placeholder={`Select ${label}`}
                      style={{ width: '100%' }}
                      format={DateFormat}
                      value={form.getFieldValue(name) ? dayjs(form.getFieldValue(name), DateFormat) : null}
                      onChange={(date, dateString) => {
                        console.log('my selected date is ');
                        console.log(dateString);
                        setSelectedDate(date ? dayjs(dateString, DateFormat) : null);
                        form.setFieldsValue({ [name]: dateString });
                        console.log('form value for date is ');
                        console.log(form.getFieldValue(name))
                      }}
                    />
                  </Space>
                  </Form.Item>

            );
        case 'DateTime':
            return (
                <Form.Item
                name={name}
                label={label}
                key={name}
                valuePropName={type === 'boolean' ? 'checked' : 'value'}
                initialValue={form.getFieldValue(name)}
                rules={validationRules}
                noStyle
              >
                  <Space>
                  <DatePicker
                    showTime
                    placeholder={`Select ${label}`}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY HH:mm:ss"
                    value={form.getFieldValue(name) ? dayjs(form.getFieldValue(name),"DD/MM/YYYY HH:mm:ss") : null}
                    onChange={(date, dateString) => {
                      setSelectedDate(date ? dayjs(dateString,"DD/MM/YYYY HH:mm:ss") : null);
                      form.setFieldsValue({ [name]: dateString });
                    }}
                  />
                  </Space>
                  </Form.Item>
               
            );
        case 'Address':
            return (
                <Form.Item 
                key={name}
 // This shows "Address" as the label
              >
                <Row gutter={16} style={{ marginBottom: '16px' }}> {/* Add margin-bottom for spacing between rows */}
                  <Col span={12}>
                  <Form.Item
                   name={[name, 'street']}
                   
                   label="Street"
                   //initialValue={form.getFieldValue(name).street}
                   >

                  <Input placeholder="Street" 
                  // onChange={(e) => handleAddressChange(name, 'street', e.target.value)}

                  />
                  </Form.Item>
                    
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      name={[name, 'city']}
                      
                      label="City"
                     // initialValue={form.getFieldValue(name).city}

                    >
                      <Input placeholder="City" 
                      // onChange={(e) => {
                        
                      //   handleAddressChange(name, 'city', e.target.value)}}

                     />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '16px' }}> {/* Add margin-bottom for spacing between rows */}
                  <Col span={12}>
                    <Form.Item 
                   name={[name, 'state']}
                   label="State" 
                     // initialValue={form.getFieldValue(name).state}

                    >
                      <Input placeholder="State"
                      onChange={(e) => handleAddressChange(name, 'state', e.target.value)}

                       /> 
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                   name={[name, 'postal_code']}
                   label="Postal Code" 
                   // initialValue={form.getFieldValue(name).postal_code}

                    >
                      <Input placeholder="Postal Code" 
                      //  onChange={(e) => handleAddressChange(name, 'postal_code', e.target.value)}
/>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: '16px' }}> {/* Add margin-bottom for spacing between rows */}
                  <Col span={12}>
                    <Form.Item 
                      name={[name, 'country']}
                      label="Country" 
                     // initialValue={form.getFieldValue(name).country}
                    >
                      <Input placeholder="Country" />
                    </Form.Item>
                  </Col>
                </Row>
                </Form.Item>
              
            );
        case 'Text-Area':
            return (
                <Form.Item
                    name={name}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <TextArea initialValue={initialValue}   placeholder={label} autoSize />
                </Form.Item>
            );
        case 'currency':
            return (
                <Form.Item
                    name={name}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <Input initialValue={initialValue} placeholder={label} type="number" addonBefore="$" />
                </Form.Item>
            );
        case 'Rich-Text':
            return (
                <Form.Item
                    name={name}
                    label={label}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <ReactQuill
                        value={initialValue || ''}
                        onChange={(content) => form.setFieldsValue({ [name]: content })}
                        modules={{
                            toolbar: [
                                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['bold', 'italic', 'underline'],
                                [{ 'align': [] }],
                                ['link'],
                            ],
                        }}
                        placeholder={label}
                    />
                </Form.Item>
            );
        case 'percentage':
            return (
                <Form.Item
                    name={name}
                    initialValue={initialValue ? initialValue * 100 : undefined}
                    rules={validationRules}
                    noStyle
                >
                    <Input initialValue={initialValue} placeholder={label} type="number" addonAfter="%" />
                </Form.Item>
            );
        case 'Phone':
            return (
                <Form.Item
                    name={name}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <Input initialValue={initialValue} placeholder={`Enter ${label}`} addonBefore={<PhoneOutlined />} />
                </Form.Item>
            );
        case 'Email':
            return (
                <Form.Item
                    name={name}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <Input initialValue={initialValue} placeholder={label} type="email" />
                </Form.Item>
            );
        case 'URL':
            return (
                <Form.Item
                    name={name}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <Input initialValue={initialValue} placeholder={label} type="url" />
                </Form.Item>
            );
        default:
            return (
                <Form.Item
                    name={name}
                    label={label}
                    initialValue={initialValue}
                    rules={validationRules}
                    noStyle
                >
                    <Input initialValue={initialValue} placeholder={label} />
                </Form.Item>
            );
    }
};

export default FieldRendererEdit;
