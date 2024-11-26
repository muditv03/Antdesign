import React, { useEffect,useState } from 'react';
import { Checkbox, Avatar,Card } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

const DisplayField = ({ type, form, name, field, record,layouts }) => {

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    useEffect(() => {
        // Logic to handle changes in record data
        if (record) {
        
            console.log(layouts);
        }
    }, [record]);
    
    const fieldValue = form.getFieldValue(name);
    console.log('display field ui');
    console.log(form.getFieldValue(name)); 
    const displayField=field?.lookup_config?.display_fields;
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
                return name !== 'user' && fieldValue?.Name ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                    {fieldValue?.Name ? (
                        <a
                            href={`/record/${field.parent_object_name}/${record[field.name + '_id']}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Avatar
                                size="small"
                                style={{
                                    backgroundColor: '#87d068',
                                    marginRight: 8,
                                }}
                            >
                                {(fieldValue?.Name || '').charAt(0).toUpperCase()}
                            </Avatar>
                            {fieldValue?.Name}
                        </a>
                    ) : (
                        fieldValue?.Name
                    )}
                   {isHovered && (
                    <Card
                        style={{
                            position: 'absolute',
                            top: 0, // Aligns with the top of the parent
                            left: '100%', // Places it to the right of the parent
                            marginLeft: 8, // Adds some spacing between the element and the card
                            zIndex: 10,
                            width: 'auto',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                            whiteSpace: 'nowrap', // Prevents the content from wrapping (optional, based on your content)

                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div
        style={{
            position: 'absolute',
            left: '-8px',
            width: 0,
            height: 0,
            borderRight: '8px solid #fff', // Adjust arrow color to match the card background
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            transform: 'translateY(-50%)', // Align vertically to center the arrow
            zIndex: 1,
        }}
    ></div>
                        {/* Header with border bottom */}
                    <div
                        style={{
                            padding: '6px',
                            borderBottom: '1px solid #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#f9f9f9',
                        }}
                    >
                        <Avatar
                            size="medium"
                            style={{
                                marginRight: 12,
                                backgroundColor: '#87d068',
                            }}
                        >
                            {(fieldValue?.Name || '').charAt(0).toUpperCase()}
                        </Avatar>
                        <div
                            style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#333',
                            }}
                        >
                            {fieldValue?.Name || ''}
                        </div>
                    </div>

                    {/* Card Body */}
                    <div
                        style={{
                            padding: '12px',
                            fontSize: '14px',
                            color: '#555',
                        }}
                    >
                        {Array.isArray(displayField) &&
                            displayField.length > 0 &&
                            displayField.map((displayFieldName) => (
                                <div
                                    key={displayFieldName}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: 8,
                                    }}
                                >
                                    <span style={{ fontWeight: '500' }}>{displayFieldName}:-</span>
                                    <span>
                                        {typeof fieldValue[displayFieldName] === 'boolean' ? (
                                            <Checkbox checked={fieldValue[displayFieldName]} disabled />
                                        ) : (
                                            fieldValue[displayFieldName] || ''
                                        )}
                                    </span>
                                </div>
                            ))}
                    </div>
                    </Card>
                )}

                </div>
                   
                ) : fieldValue?.Name;
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
