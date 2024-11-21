// RecordDetails.js
import React, { useState, useEffect } from 'react';
import { Form, Card, Input, Button, Row, Col, Typography, Avatar, Select, Tabs, Checkbox, message, Space, DatePicker, Collapse, Affix, Tooltip, Spin } from 'antd';
import { EditOutlined, UnorderedListOutlined, InfoCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { BASE_URL, DateFormat } from '../Components/Constant';
import ApiService from '../Components/apiService'; // Import ApiService class
import dayjs from 'dayjs';
import FieldRenderer from './RecordFieldEditor';
import DisplayField from './RecordFieldDisplay';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);


const { Title } = Typography;

const RecordDetails = ({ objectName, id }) => {

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);  // Initial state is true to show spinner initially
    const [lookupOptionforparent, setLookupOptionsForParent] = useState([]);
    const [isEditable, setIsEditable] = useState(false);
    const [record, setRecord] = useState(null);
    const [fields, setFields] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [recordName, setRecordName] = useState('');
    const [initialValues, setInitialValues] = useState({});
    const [lookupData,setLookupData]=useState({});
    const [layouts,setLayouts]=useState({});


    useEffect(() => {
        fetchRecords();
    }, [id, objectName]);


    const handleEditClick = () => {
        form.setFieldValue(initialValues);
        setIsEditable(true);

    };

    const handleCancelClick = () => {
        form.setFieldsValue(initialValues);
        setIsEditable(false);
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);

            // Fetch the record data
            console.log(objectName);
            console.log(id);
            const apiService = new ApiService(`${BASE_URL}/fetch_single_record/${objectName}/${id}`, {}, 'GET');
            const responseData = await apiService.makeCall();
            console.log('record fetched is ' + JSON.stringify(responseData)); // Process the data as needed
            const recordData = responseData;
            setRecordName(responseData.Name);
            const layouts= new ApiService(`${BASE_URL}/get_by_objectName/${objectName}`, {}, 'GET');
            const res=await layouts.makeCall();
            setLayouts(res);
            const fieldCallout = new ApiService(`${BASE_URL}/mt_fields/object/${objectName}`, {}, 'GET');
            const fieldsResponse = await fieldCallout.makeCall();
            const filteredFields = fieldsResponse.filter(field => field.name !== 'recordCount');

            console.log('fieldresponse :', fieldsResponse);
            console.log(fieldsResponse);
            setFields(filteredFields);
            console.log(JSON.stringify(responseData));
            const updatedLookupOptions = {}; // To store lookup options

            // Format date fields in recordData
            fieldsResponse.forEach(field => {
                if (field.type === 'Date' && recordData[field.name]) {
                    // Format the date using dayjs to 'DD/MM/YYYY'
                    recordData[field.name] = dayjs(recordData[field.name]).format(DateFormat);
                }
                if (field.type === 'percentage' && recordData[field.name]) {
                    recordData[field.name] = recordData[field.name] * 100;
                }
                if (field.type === 'DateTime' && recordData[field.name]) {
                    // Assuming recordData[field.name] is in UTC
                    console.log(recordData[field.name]);
                    const localDateTime = dayjs(recordData[field.name]).utc().format('DD/MM/YYYY HH:mm:ss'); // Convert to local time
                    //console.log('formatted date time is ' + localDateTime.format('DD/MM/YYYY HH:mm:ss'));
                    recordData[field.name] = localDateTime; // Store formatted date-time
                }
                if (field.type === 'lookup' && recordData[field.name]) {
                    updatedLookupOptions[field.name] = recordData[field.name] || '';
                    recordData[field.name] = recordData[field.name]?.Name  || '';
                    recordData[field.name+'_id']=updatedLookupOptions[field.name]?._id  || '';
                }
            });
            
            setRecord(recordData);
            setLookupData(prevState => ({ ...prevState, ...updatedLookupOptions }));
            console.log('record data is ');
            console.log(recordData);
            form.setFieldsValue(recordData);
            setLoading(false);

        } catch (err) {
            console.error('Error fetching records', err);
            setLoading(false);

        } finally {
            setLoading(false);

        }

    };


    const onFinish = async (values) => {
        try {
            console.log('values are');
            console.log(values);
            const bodyData = Object.assign({}, values);
            console.log(bodyData);
            fields.forEach(field => {
                if (field.type === 'lookup') {
                    let lookupFieldName;
                    lookupFieldName = field.name + '_id';
                    console.log('not changed lookup values');
                    console.log(bodyData[field.name]);
                    if (bodyData[field.name]?._id) {

                        bodyData[lookupFieldName] = bodyData[field.name]._id;

                    } else {
                        bodyData[lookupFieldName] = bodyData[field.name];
                    }
                    delete bodyData[field.name];
                }

                if (field.type === 'percentage') {
                    bodyData[field.name] = bodyData[field.name] / 100;
                }

                if (field.type === 'Address') {
                    console.log('Checking Address Values')
                    console.log(values)
                    bodyData[field.name] = {
                        street: bodyData[field.name]['street'] || '',
                        city: bodyData[field.name]['city'] || '',
                        state: bodyData[field.name]['state'] || '',
                        postal_code: bodyData[field.name]['postal_code'] || '',
                        country: bodyData[field.name]['country'] || '',
                    };

                }


            });


            console.log(bodyData);
            const sanitizedData = Object.keys(bodyData).reduce((acc, key) => {
                acc[key] = bodyData[key] === undefined ? "" : bodyData[key];
                return acc;
            }, {});

            var data = Object.assign(sanitizedData)
            data['_id'] = record?._id;
            const body = {
                object_name: objectName,
                data: data
            };

            console.log('final body');
            console.log(body);

            const apiService = new ApiService(`${BASE_URL}/insert_or_update_records`, {
                'Content-Type': 'application/json', // Add any necessary headers, such as content type
            }, 'POST', body);
            await apiService.makeCall();
            message.success('Record saved successfully');

            setIsEditable(false);
            fetchRecords();
        } catch (error) {
            //console.error('Error saving record'+ error.response.data[0]);
            const errorMessage = error && typeof error === 'object'
                ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
                : 'Failed to save record due to an unknown error';
            message.error(errorMessage);
        }

    };

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
                console.log('lookupdata ');
                console.log(lookupData[name]);
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

    const renderFieldWithEdit = (field, selectedDate, setSelectedDate) => {
        const { name, label, type, picklist_values, isTextArea, required, help_text, _id, lookup_config } = field;



        const validationRules = [];
        // Check for required field
        if (required) {
            validationRules.push({
                required: true,
                message: `${label} is required.`,
            });
        }

        if (name === 'recordCount') {
            return null;
        }

        if (type === 'Integer') {
            validationRules.push({
                type: 'number',
                transform: (value) => Number(value),
                min: 0,
                message: 'Please enter a valid integer.',
            });
        } else if (type === 'decimal') {
            validationRules.push({
                type: 'number',
                transform: (value) => Number(value),
                min: 0,
                precision: field.decimal_places_after || 2,
                message: 'Please enter a valid decimal number.',
            });
        } else if (type === 'Date') {
            validationRules.push({
                type: 'Date',
                message: 'Please enter a valid date.',
            });
        } else if (type === 'currency') {
            validationRules.push({
                type: 'number',
                transform: (value) => Number(value),
                min: 0,
                message: 'Please enter a valid currency value.',
            });
        } else if (type === 'Email') {
            validationRules.push(
                { type: 'email', message: 'The input is not valid E-mail!' }
            );
        }


        const isFieldEditable = !field.is_auto_number && !field.is_formula && isEditable;


        const handleAddressChange = (parentField, childField, value) => {
            console.log(parentField);
            console.log(childField);
            const currentAddress = form.getFieldValue(parentField);
            const newAddress = {
                ...currentAddress,
                [childField]: value,
            };
        }


        return (
            <div
                className="editable-field-container"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: !isEditable ? '1px solid #ddd' : 'none',
                    paddingBottom: 0,
                    marginBottom: 20,
                    position: 'relative', // Added to position the icon correctly
                }}
            >
                {isFieldEditable ? (
                    <FieldRenderer
                        isFieldEditable={isFieldEditable}
                        type={type}
                        name={name}
                        label={label}
                        validationRules={validationRules}
                        form={form}
                        picklist_values={picklist_values}
                        handleSearch={handleSearch}
                        lookupOptionforparent={lookupOptionforparent}
                        lookup_config={lookup_config}
                        DateFormat={DateFormat}
                        setSelectedDate={setSelectedDate}
                        fieldId={field._id}
                        handleAddressChange={handleAddressChange}
                        lookupData={lookupData}
                    />


                ) : (
                    <DisplayField
                        type={type}
                        form={form}
                        name={name}
                        field={field}
                        record={record}
                        fetchRecords={fetchRecords}
                    
                    />

                )}

                {!isEditable && (
                    <Avatar
                        icon={<EditOutlined />}
                        size={24}
                        className="edit-icon"
                        style={{
                            marginLeft: 8,
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            color: 'black',
                        }}
                        onClick={handleEditClick}
                    />
                )}

            </div>
        );
    };


    return (
        <>
            <Card style={{ display: 'flex', flexDirection: 'column' }}>
                <Form layout="vertical" onFinish={onFinish} style={{ flex: 1, overflow: 'auto' }}>
                    <Title level={3} style={{ marginTop: '0px' }}>Record Details</Title>
                    <div style={{
                        overflow: 'auto',
                        paddingRight: '15px',
                        height: 'calc(100vh - 300px)', // Adjust this value based on your layout
                        flex: 1
                    }}>
                       {loading ? (
                            <Spin size="large" style={{ marginTop: '20px' }} />
                        ) : (
                            layouts[0]?(
                            layouts[0]?.sections?.map((section, sectionIndex) => (
                                <div
                                  key={sectionIndex}
                                  style={{
                                    border: '1px solid #ddd', // Thin border around the section
                                    marginBottom: '20px', // Space between sections
                                    padding: '20px', // Padding inside the section
                                    borderRadius: '4px', // Optional: rounded corners for the border
                                  }}
                                >
                                  <Title level={4}>{section.name}</Title>
                                  <Row gutter={24} style={{ marginBottom: '0px' }}>
                                    {/* Loop through columns within each section */}
                                    {section.columns?.map((column, columnIndex) => {
                                      // Dynamically calculate column span based on the number of columns in the section
                                      const totalColumns = section.columns.length;
                                      const columnSpan = totalColumns === 1
                                        ? 24  // 1 column, full width
                                        : totalColumns === 2
                                        ? 12  // 2 columns, each takes half the width
                                        : totalColumns === 3
                                        ? 8  // 3 columns, each takes 1/3rd of the width
                                        : 8; // Fallback for more columns (you can adjust this if needed)
                              
                                      const columnItems = column.items || [];
                                      const maxItems = Math.max(...section.columns.map(c => c.items?.length || 0));
                              
                                      return (
                                        <Col
                                          key={columnIndex}
                                          span={columnSpan} // Dynamically set the span based on the number of columns
                                          style={{ marginBottom: '20px' }}
                                        >
                                          <div>
                                            {/* Loop through the number of items in this column */}
                                            {Array.from({ length: maxItems }).map((_, rowIndex) => {
                                              const item = columnItems[rowIndex];
                                              const matchedField = fields.find(field => field.name === item?.name);
                                              console.log(matchedField);
                                              console.log('item is ');
                                              console.log(item?.name);
                                              return (
                                                item && (
                                                  <Form.Item
                                                    key={rowIndex}
                                                    label={<span>{item.name}</span>}
                                                    style={{ marginBottom: '10px', padding: '0px' }}
                                                  >
                                                    {/* Call renderFieldWithEdit method for each field */}
                                                    {renderFieldWithEdit(matchedField, selectedDate, setSelectedDate)}
                                                  </Form.Item>
                                                )
                                              );
                                            })}
                                          </div>
                                        </Col>
                                      );
                                    })}
                                  </Row>
                                </div>
                              ))
                            ):(
                                <Row gutter={24} style={{ marginBottom: '0px' }}>
                                {fields.map((field, index) => (
                                    <Col key={index} xs={24} sm={12} style={{ marginBottom: -5 }}>
                                        <Form.Item label={<span>{field.label} {field.help_text && <Tooltip title={field.help_text}><InfoCircleOutlined style={{ marginLeft: 5 }} /></Tooltip>}</span>} style={{ marginBottom: -1, padding: '0px' }}>
                                            {renderFieldWithEdit(field, selectedDate, setSelectedDate)}
                                        </Form.Item>
                                    </Col>
                                ))}
                            </Row>
                            )
                              
                            )}
                        <div className="system-info-section" style={{
                            marginTop: '20px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Title level={3} style={{ marginTop: '0px' }}>System Information</Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Created At" style={{ marginBottom: 0 }}>
                                        <Input
                                            style={{ border: 'none', borderBottom: '1px solid #ddd', fontWeight: '500', padding: 0 }}
                                            value={dayjs(record?.created_at).format('DD/MM/YYYY HH:mm:ss')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Updated At" style={{ marginBottom: 0 }}>
                                        <Input
                                            style={{ border: 'none', borderBottom: '1px solid #ddd', fontWeight: '500', padding: 0 }}
                                            value={dayjs(record?.updated_at).format('DD/MM/YYYY HH:mm:ss')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    {isEditable && (
                        <Affix offsetBottom={50}>
                            <div style={{
                                width: '90%',
                                padding: '10px 0',
                                background: '#f0f2f5',
                                position: 'fixed',
                                bottom: '50px',
                                left: 110
                            }}>
                                <Row justify="center">
                                    <Button onClick={handleCancelClick} style={{ marginRight: 8 }}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit">
                                        Save
                                    </Button>
                                </Row>
                            </div>
                        </Affix>
                    )}
                </Form>
            </Card>
            <Affix offsetBottom={0} >
                <div style={{
                    width: '100%',
                    padding: '10px 0',
                    background: '#FFFFFF',
                    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)', // Add shadow effect
                }}>
                    <Row justify="start" >

                        <Button type="text" style={{ margin: 'auto', marginLeft: '20px', fontWeight: 500 }}>
                            <UnorderedListOutlined />
                            To Do List
                        </Button>
                    </Row>
                </div>
            </Affix>
        </>
    );
};

export default RecordDetails;
