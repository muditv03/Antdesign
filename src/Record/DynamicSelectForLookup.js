import React, { useState, useEffect } from "react";
import { Select, Avatar,Checkbox,Tag } from "antd";
import { PhoneOutlined } from '@ant-design/icons';
import ApiService from '../Components/apiService'; // Import ApiService class
import { BASE_URL } from '../Components/Constant';
import { colors,getUniqueColor,useHoverVisibility } from '../Components/Utility';
import LookupDisplayCard from './LookupDisplayCard';



const DynamicSelect = (
  {
  objectName, 
  lookupConfig,
  onSearch,
  value,
  name,
  lookupOptionforparent,
  fieldId,
  onChange, }) => 
{

  const {
    isHovered,
    isVisible,
    handleMouseEnter,
    handleMouseLeave,
    handleContentMouseEnter,
    handleContentMouseLeave,
} = useHoverVisibility();

  const [fields, setFields] = useState([]);

  const fetchOptions = async () => {
    try {
      const objectService = new ApiService(`${BASE_URL}/mt_fields/object/${objectName}`, {}, 'GET');
      const response = await objectService.makeCall();
      setFields(response);
    } catch (error) {
      console.error("Failed to fetch fields", error);
    }
  };
  useEffect(() => {
    fetchOptions();
    console.log("lookupOptionforparent");
    console.log(lookupOptionforparent);

  }, [objectName]);

  const renderField = (type,fieldValue) => {
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

  const getOptionChildren = (option) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Avatar size="small" style={{ backgroundColor: "#87d068", marginRight: 8 }}>
        {option?.Name?.charAt(0).toUpperCase()}
      </Avatar>
      {option?.Name}
    </div>
  );

  const getOptionLabel = (option) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Avatar size="small" style={{ backgroundColor: "#87d068", marginRight: 8 }}>
          {option.Name?.charAt(0).toUpperCase()}
        </Avatar>
        {option.Name}
      </div>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
      {lookupConfig?.display_fields?.map((fieldKey, index) => {
          // Find the matching field in the state
          const matchedField = fields.find((field) => field.name === fieldKey);

          // Get field type and value
          const fieldType = matchedField?.type || "text"; // Default to "text" if not found
          const value =
            typeof option[fieldKey] === "object" && option[fieldKey] !== null
              ? Object.values(option[fieldKey]).join(" ") // Join object values with space
              : option[fieldKey] || ""; // Display value or fallback to empty string

          return (
            <div
              key={fieldKey}
              style={{
                fontSize: "12px",
                color: "#888",
                marginRight:
                  index < lookupConfig?.display_fields.length - 1 ? 8 : 0, // Add margin except for the last item
              }}
            >
              {/* Call renderField with the field type and value */}
              {renderField(fieldType, value)}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Select
      allowClear
      showSearch
      placeholder="Type to search"
      onSearch={(value) => onSearch(value, fieldId, name)}
      notFoundContent="Search for records"
      optionLabelProp="children"
      filterOption={false}
      value={value}
      onChange={(selectedValue) => {
        onChange && onChange(selectedValue);
      }}
      options={([
        ...(lookupOptionforparent[name] || []).map((option) => ({
          children: getOptionChildren(option),
          value: option._id,
          label: getOptionLabel(option),
        })),

        ...(value &&
        !(lookupOptionforparent[name] || []).some((option) => option._id === value._id)
          ? [
              {
                children: getOptionChildren(value),
              }
            ]
          : []),
      ])}
    />
  );
};

export default DynamicSelect;