import React, { useEffect, useState } from "react";
import { Table, message, Select, Typography, Spin } from "antd";
import ApiService from '../Components/apiService'; 
import { BASE_URL } from '../Components/Constant';

const MapContent = ({ uploadedCSVID, object, onDataChange }) => {
    const { Title } = Typography;

    const [csvColumns, setCsvColumns] = useState([]);
    const [fields, setFields] = useState([]);
    const [mappedData, setMappedData] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state

    useEffect(() => {
        const fetchMappingData = async () => {
            try {
                setLoading(true); // Set loading to true before data fetch

                // Fetch CSV column headers
                const id = uploadedCSVID;
                const csvService = new ApiService(`${BASE_URL}/csv_column_headers/${id}`, {
                    'Content-Type': 'application/json'
                }, 'GET'); 
                const csvResponse = await csvService.makeCall();
                setCsvColumns(csvResponse.field_names); // Store CSV column headers

                // Fetch fields based on the provided object
                const fieldService = new ApiService(`${BASE_URL}/mt_fields/object/${object}`, {
                    'Content-Type': 'application/json'
                }, 'GET');
                const fieldResponse = await fieldService.makeCall();
                const filteredFields = fieldResponse.filter(field => 
                    field.name !== 'recordCount' && 
                    !field.is_formula && 
                    !field.is_auto_number
                );
                setFields(filteredFields);

                // Initialize mapped data with fuzzy matching
                handleFuzzyMatch(csvResponse.field_names, fieldResponse);

                setLoading(false); // Set loading to false once data is fetched
            } catch (error) {
                setLoading(false); // Set loading to false on error
                message.error('Failed to fetch mapping data');
                console.error(error);
            }
        };

        if (uploadedCSVID) {
            fetchMappingData();
        }
    }, [uploadedCSVID, object]);

    // Function to handle fuzzy matching
    // Function to handle fuzzy matching
const handleFuzzyMatch = (csvColumns, fieldsData) => {
    // Create a set to keep track of fields that are already mapped
    const mappedFields = new Set();
    
    const newMappings = csvColumns.map(column => {
        // Try to find a field that matches the column
        const matchedField = fieldsData.find(field =>
            column.toLowerCase().includes(field.name.toLowerCase()) && !mappedFields.has(field.name)
        );

        if (matchedField) {
            mappedFields.add(matchedField.name); // Mark this field as mapped
        }

        return {
            header: column,
            field: matchedField ? matchedField.name : null, // Set to matched field name or null
            isMapped: !!matchedField // Set to true if there is a match
        };
    });

    // Update the mapped data state
    setMappedData(newMappings);
};

    const handleFieldChange = (headerIndex, field) => {
        const updatedMappedData = [...mappedData];
        
        // If the field is already mapped, prevent re-mapping it
        if (field && mappedData.some(record => record.field === field && record.header !== updatedMappedData[headerIndex].header)) {
            message.warning('This field has already been mapped to another column.');
            return; // Exit early if the field is already mapped
        }
    
        if (field) {
            updatedMappedData[headerIndex].field = field;
            updatedMappedData[headerIndex].isMapped = true; // Update mapped status to true
        } else {
            updatedMappedData[headerIndex].field = null; // Clear the mapped field
            updatedMappedData[headerIndex].isMapped = false; // Update mapped status to false
        }
    
        setMappedData(updatedMappedData);
    };
    

    // Calculate the counts of mapped and unmapped columns
    const mappedCount = mappedData.filter(record => record.isMapped).length;
    const unmappedCount = mappedData.length - mappedCount;

    useEffect(() => {
        // After setting mappedData, call the callback with the new values
        onDataChange(mappedData, unmappedCount);
    }, [mappedData, unmappedCount]); // Depend on mappedData and mappedCount

    const columns = [
        {
            title: 'CSV Column Header',
            dataIndex: 'header',
            key: 'header',
        },
        {
            title: 'Field Name',
            dataIndex: 'field',
            key: 'field',
            render: (text, record, index) => (
                <Select 
                    placeholder="Select field"
                    onChange={(value) => handleFieldChange(index, value)} 
                    style={{ width: '100%' }} 
                    defaultValue={text} // Default to the mapped field name
                    allowClear // Enable the clear option
                >
                    {fields.map(field => (
                        <Select.Option key={field.id} value={field.name}>
                            {field.name}
                        </Select.Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Mapped',
            key: 'mapped',
            render: (_, record) => (
                <span style={{ color: record.isMapped ? 'green' : 'red' }}>
                    {record.isMapped ? '✔️' : '❌'} {/* Show checkmark if mapped, cross if not */}
                </span>
            )
        },
        {
            title: 'Manage Existing Values',
            key: 'manage',
            render: () => (
                <Select defaultValue="doNotOverwrite" style={{ width: '100%' }}>
                    <Select.Option value="doNotOverwrite">Do Not Overwrite</Select.Option>
                    <Select.Option value="overwrite">Overwrite</Select.Option>
                </Select>
            )
        }
    ];

    return (
        <div>
            <Title level={3} style={{ marginTop: '10px' }}>Mappings</Title>
            
            {/* Show loading spinner when data is being fetched */}
            {loading ? (
                <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />
            ) : (
                <Table
                    dataSource={mappedData}
                    columns={columns}
                    rowKey="header"
                    pagination={false}
                    bordered
                />
            )}

            <div style={{ marginTop: '16px' }}>
                <strong>Total Mapped Columns: {mappedCount}</strong>
                <br />
                <strong>Total Unmapped Columns: {unmappedCount}</strong>
            </div>
        </div>
    );
};

export default MapContent;
