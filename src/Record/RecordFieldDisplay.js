import React, { useEffect,useState } from 'react';
import { Checkbox, Avatar,Card,Tag } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import LookupDisplayCard from './LookupDisplayCard';
import { BASE_URL,DateFormat } from '../Components/Constant';
import { colors,getUniqueColor,useHoverVisibility } from '../Components/Utility';
import dayjs from 'dayjs';

 

const DisplayField = ({ type, form, name, field, record,layouts }) => {

    const {
        isHovered,
        isVisible,
        handleMouseEnter,
        handleMouseLeave,
        handleContentMouseEnter,
        handleContentMouseLeave,
    } = useHoverVisibility();

    
    useEffect(() => {
        // Logic to handle changes in record data
        if (record) {
        
            console.log(layouts);
        }
    }, [record]);
    
    const fieldValue = form.getFieldValue(name);
    console.log('display field lookup ui');
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
                if (!form.getFieldValue(name+'_id')) {
                    return '';
                }
                
                return fieldValue ? (
                    <div
                      style={{ position: 'relative', display: 'inline-block' }}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {fieldValue?.Name ? (
                        <a
                          href={`/record/${field.parent_object_name}/${record[field.name + '_id']}`}
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
                            {(fieldValue?.Name || '').charAt(0).toUpperCase()}
                          </Avatar>
                          {fieldValue?.Name}
                        </a>
                      ) : (
                        fieldValue?.Name
                      )}
                
                      {isHovered && isVisible && (
                        <div
                          onMouseEnter={handleContentMouseEnter}
                          onMouseLeave={handleContentMouseLeave}
                        >
                          <LookupDisplayCard
                            displayFields={field?.lookup_config?.display_fields} // Pass the fields you want to display
                            fieldValue={fieldValue}
                            objectName={field.parent_object_name} // Parent object name for fetching fields
                          />
                        </div>
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
                    return Array.isArray(fieldValue) ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                            {fieldValue.map((value, index) => (
                                <Tag key={index} 
                                color={getUniqueColor(index)}
                                style={{
                                    fontSize: '12px', // Increase font size
                                    padding: '4px 10px', // Adjust padding for larger size
                                    borderRadius: '8px', // Add rounded corners for better aesthetics
                                    lineHeight: '1.5', // Adjust line height for better spacing
                                }}
                                > 
                                    {value}
                                </Tag>
                            ))}
                        </div>
                    ) : (
                        fieldValue || ''
                    );

                    case 'Rich-Text':
                    return fieldValue ? (
                        <div
                            style={{
                                padding: '12px',
                                fontSize: '14px',
                                color: '#555',
                                maxHeight: '200px', // Limits the height of the field
                                overflowY: 'auto',  // Adds a vertical scrollbar if content exceeds the maxHeight
                                wordBreak: 'break-word', // Ensures long words break correctly
                                whiteSpace: 'normal', // Ensures text wraps properly
                                border: '1px solid #ddd', // Optional: Adds a border for clarity
                                borderRadius: '4px', // Optional: Rounds the edges
                                width: '700px', // Sets the width of the field
                                maxWidth: '100%', // Ensures the width does not exceed the container
                            }}
                            dangerouslySetInnerHTML={{ __html: fieldValue }} // Use dangerouslySetInnerHTML here
                        />
                    ) : '';
                
                
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
