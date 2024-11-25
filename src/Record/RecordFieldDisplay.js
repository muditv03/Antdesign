import React, { useEffect } from 'react';
import { Checkbox, Avatar } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

const DisplayField = ({ type, form, name, field, record,layouts }) => {
    useEffect(() => {
        // Logic to handle changes in record data
        if (record) {
        
            console.log(layouts);
        }
    }, [record]);
    
    const fieldValue = form.getFieldValue(name);
    console.log('display field ui');
    console.log(form.getFieldValue(name));
    const renderField = () => {
        switch (type) {
            case 'boolean':
                return <Checkbox checked={fieldValue} disabled />;
            case 'currency':
                return `$${fieldValue !== undefined && fieldValue !== null ? parseFloat(fieldValue).toFixed(2) : ''}`;
            case 'String':
                return fieldValue || '';
            case 'percentage':
                return `${fieldValue !== undefined && fieldValue !== null ? parseFloat(fieldValue) : ''}%`;
            case 'Integer':
                return fieldValue !== undefined && fieldValue !== null ? fieldValue : '';
            case 'Decimal':
                return fieldValue !== undefined && fieldValue !== null ? fieldValue : '';
            case 'Email':
                return fieldValue ? <a href={`mailto:${fieldValue}`}>{fieldValue}</a> : '';
            case 'URL':
                return fieldValue ? (
                    <a
                        href={fieldValue.startsWith('http') ? fieldValue : `http://${fieldValue}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {fieldValue}
                    </a>
                ) : '';
            case 'Address':
                return fieldValue
                    ? [fieldValue.street, fieldValue.city, fieldValue.state, fieldValue.postal_code, fieldValue.country]
                          .filter(Boolean)
                          .join(', ')
                    : '';
            case 'lookup':
                return name !== 'user' && fieldValue ? (
                    <a
                        href={`/record/${field.parent_object_name}/${record[name + '_id']}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                    >
                        <Avatar
                            size="small"
                            style={{
                                backgroundColor: '#87d068',
                                marginRight: 8,
                            }}
                        > 
                            {(fieldValue || '').charAt(0).toUpperCase()}
                        </Avatar>
                        {fieldValue}
                    </a>
                ) : fieldValue;
            case 'Phone':
                return fieldValue ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        {fieldValue || ''}
                    </div>
                ) : '';
            case 'MultiSelect':
                return Array.isArray(fieldValue) ? fieldValue.join(', ') : fieldValue || '';
            default:
                return fieldValue || '';
        }
    };

    return (
        <div
            style={{
                flex: 1,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxWidth: '100%',
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                overflowWrap: 'break-word',
                fontSize: '16px',
                fontWeight: 500,
            }}
        >
            {renderField()}
        </div>
    );
};

export default DisplayField;
