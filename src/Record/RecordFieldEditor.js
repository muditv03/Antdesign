import React from 'react';
import { Form, Input, Select, Checkbox, DatePicker, Space, Row, Col, Avatar } from 'antd';
import dayjs from 'dayjs';
import { PhoneOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const FieldRendererEdit = ({
    isFieldEditable,
    type,
    name,
    label,
    validationRules = [],
    form,
    picklist_values = [],
    handleSearch,
    lookupOptionforparent = {},
    lookup_config = {},
    DateFormat ,
    setSelectedDate,
    handleAddressChange,
    fieldId,
    lookupData

    
}) => {
    if (!isFieldEditable) return null;
 
    const initialValue = form.getFieldValue(name);
    console.log('initial value from editing component');
    console.log(initialValue);
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
                initialValue={initialValue}
                rules={validationRules}
                noStyle
              >
                 <Select
                    allowClear
                    showSearch
                    placeholder="Type to search"
                    onSearch={(value) => handleSearch(value, fieldId,name)} 
                    notFoundContent="Search for records"
                    optionLabelProp='children'
                    filterOption={false} 
                    options={[
                      ...(lookupOptionforparent[name] || []).map((option) => ({
                        children: (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>
                            <Avatar size='small' style={{ backgroundColor: '#87d068', marginRight: 8 }}>
                              {option.Name?.charAt(0).toUpperCase()}
                            </Avatar>
                            {option.Name}
                            </div>
                          </div>
                        ),
                        value: option._id,
                        label:(
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar size="small" style={{ backgroundColor: '#87d068', marginRight: 8 }}>
                              {option.Name?.charAt(0).toUpperCase()}
                            </Avatar>
                            {option.Name}
                            
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                          {lookup_config?.display_fields?.map((fieldKey,index) => (
                            <div key={fieldKey} 
                            style={{ 
                                fontSize: '12px', 
                                color: '#888',
                                marginRight: index < lookup_config?.display_fields.length - 1 ? 8 : 0, // Add margin except for the last item
                            }}>
                            {typeof option[fieldKey] === 'object' && option[fieldKey] !== null
                                        ? Object.values(option[fieldKey]).join(' ') // Join object values with space
                                        : option[fieldKey] || '' // Display value or fallback to empty string
                                    }                            
                            </div>
                          ))}
                          </div>
                      </div>
                        )
                      })),
                      // Add the initial value if not already in options
                      ...(form.getFieldValue(name) &&
                      !(lookupOptionforparent[name] || []).some(
                        (option) => option._id === form.getFieldValue(name)._id
                      ) 
                        ? [
                            {
                              children: (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar size='small' style={{ backgroundColor: '#87d068', marginRight: 8 }}>
                                    {(form.getFieldValue(name)?.Name).charAt(0).toUpperCase()}
                                  </Avatar>
                                  {form.getFieldValue(name)?.Name}
                                </div>
                              ),
                             
                              
                            },
                          ]
                        : []), 
                    ]}

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
                        setSelectedDate(date ? dayjs(dateString, DateFormat) : null);
                        form.setFieldsValue({ [name]: dateString });
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
                    rules={[
                        {
                            validator: (_, value) => {
                                if (!value) {
                                    // Allow empty value
                                    return Promise.resolve();
                                }
                                if (/^[0-9]{10}$/.test(value)) {
                                    // Allow only 10-digit phone numbers
                                    return Promise.resolve();
                                }
                                // Reject if the value is not a 10-digit number
                                return Promise.reject('Enter a valid 10-digit phone number');
                            },
                        },
                    ]}
                    noStyle
                >
                    <Input initialValue={initialValue} placeholder={`Enter ${label}`} maxLength={10} addonBefore={<PhoneOutlined />} />
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
