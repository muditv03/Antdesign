import React, { useState, useEffect } from 'react';
import { Avatar, Card, Checkbox, Tag } from 'antd';
import ApiService from '../Components/apiService'; // Import ApiService class
import { BASE_URL,DateFormat } from '../Components/Constant';
import { PhoneOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const LookupDisplayCard = ({ displayFields, fieldValue, objectName }) => {
    const [fieldData, setFieldData] = useState([]);
  
    // Fetch fields data when component mounts
    useEffect(() => {
        if (objectName) {
            fetchFields(objectName);
        }
    }, [objectName]);

    const fetchFields = async (objectName) => {
        try {
            const objectService = new ApiService(`${BASE_URL}/mt_fields/object/${objectName}`, {}, 'GET');
            const response = await objectService.makeCall();
            setFieldData(response || []);
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };

    const renderField = (field, value) => {
        const type = field?.type || 'default';
        switch (type) {
            case 'boolean':
                return <Checkbox checked={value} disabled />;
            case 'currency':
                return `$${value !== undefined && value !== null ? parseFloat(value).toFixed(2) : ''}`;
            case 'String':
                return value || '';
            case 'percentage':
                return `${value !== undefined && value !== null ? parseFloat(value) : ''}%`;
            case 'Integer':
                return value !== undefined && value !== null ? value : '';
            case 'Decimal':
                return value !== undefined && value !== null ? value : '';
            case 'Email':
                return value ? <a href={`mailto:${value}`}>{value}</a> : '';
            case 'URL':
                return value ? (
                    <a
                        href={value.startsWith('http') ? value : `http://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {value}
                    </a>
                ) : '';
            case 'Date':
                return value ? dayjs(value).format(DateFormat) : ''  ;
            case 'DateTime':
                return value ? dayjs(value).utc().format('DD/MM/YYYY HH:mm:ss') : '';
            case 'Address':
                return value
                    ? [value.street, value.city, value.state, value.postal_code, value.country]
                          .filter(Boolean)
                          .join(', ')
                    : '';
            case 'Phone':
                return value ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        {value || ''}
                    </div>
                ) : '';
            case 'MultiSelect':
                return Array.isArray(value) ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {value.map((v, i) => (
                            <Tag key={i}>{v}</Tag>
                        ))}
                    </div>
                ) : (
                    value || ''
                );
            case 'Rich-Text':
                return value ? (
                    <div
                        style={{
                            padding: '12px',
                            fontSize: '14px',
                            color: '#555',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            maxWidth: '100%',
                        }}
                        dangerouslySetInnerHTML={{ __html: value }}
                    />
                ) : '';
            default:
                return value || '';
        }
    };

    return (
        <Card
        style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            marginLeft: 8,
            zIndex: 10,
            width: 'auto',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            whiteSpace: 'nowrap',
            padding:0,
            borderRadius: '8px',
        }}
    >
        <div
            style={{
                position: 'absolute',
                left: '-8px',
                width: 0,
                height: 0,
                borderRight: '8px solid #fff',
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                transform: 'translateY(-50%)',
                zIndex: 1,
            }}
        ></div>
    
        {/* Header */}
        <div
            style={{
                marginTop:'2px',
                display: 'flex',
                alignItems: 'flex-start', // Align items to the top
                marginBottom: '8px', // Reduced margin
            }}
        >
            <Avatar
                size="medium"
                style={{
                    marginRight: 8, // Reduced margin for avatar
                    backgroundColor: '#87d068',
                }}
            >
                {(fieldValue?.Name || '').charAt(0).toUpperCase()}
            </Avatar>
            <div
                style={{
                    fontSize: '16px', // Slightly smaller font size for heading
                    fontWeight: 'bold',
                    color: '#333',
                }}
            >
                {fieldValue?.Name || ''}
            </div>
        </div>
    
        {/* Body */}
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr', // Two equal columns
                gap: '8px 16px', // Reduced gap between columns and rows
            }}
        >
            {Array.isArray(displayFields) &&
                displayFields.map((displayFieldName) => {
                    const field = fieldData.find((f) => f.name === displayFieldName);
                    return (
                        <div
                            key={displayFieldName}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginBottom: 4, // Reduced margin
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: '300',
                                    marginBottom: '2px', // Reduced space between label and value
                                }}
                            >
                                {field?.label || displayFieldName}
                            </span>
                            <span style={{ fontWeight: '700', color: '#555' }}>
                                {renderField(field, fieldValue[displayFieldName]) || '-'}
                            </span>
                        </div>
                    );
                })}
        </div>
    </Card>
    
    
    );
};

export default LookupDisplayCard;
