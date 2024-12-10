
import React, { useEffect, useState } from 'react';
import { BASE_URL,DateFormat } from '../Components/Constant';
import { Checkbox, Avatar,Card,Tag,Row, Col,Typography,message } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import ApiService from '../Components/apiService'; 
import { colors,getUniqueColor,useHoverVisibility } from '../Components/Utility';
import dayjs from 'dayjs';
import LookupDisplayCard from './LookupDisplayCard';
import RecordDetailHeader from "./RecordDetailHeader";

 
const { Title } = Typography;



const CompactLayout = ({ compactlayout, record,object }) => {

    const {
        isHovered,
        isVisible,
        handleMouseEnter,
        handleMouseLeave,
        handleContentMouseEnter,
        handleContentMouseLeave,
    } = useHoverVisibility();

    const [fields,setFields]=useState([]);
    const [loading, setLoading] = useState(false);



    const renderField = (field,fieldValue) => {
        const type=field?.type;
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
                return fieldValue ? (
                    <div
                      style={{ position: 'relative', display: 'inline-block' }}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {fieldValue?.Name ? (
                        <a
                          href={`/record/${field.parent_object_name}/${fieldValue?._id}`}
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
            case 'Date':
                return fieldValue ? dayjs(fieldValue).format(DateFormat) : ''  ;
            case 'DateTime':
                return fieldValue ? dayjs(fieldValue).utc().format('DD/MM/YYYY HH:mm:ss') : '';
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

   

       
  useEffect(() => {
    fetchFields();
  }, [object]);

  const fetchFields = async () => {
    try {
      const apiService = new ApiService(
        `${BASE_URL}/mt_fields/object/${object}`,
        {},
        "GET"
      );
      const responseData = await apiService.makeCall();
      setFields(responseData);
    } catch (error) {
      console.log(error);
    }
  };

  const getFieldType = (fieldName) => {
    const matchedField = fields.find((field) => field.name === fieldName);
    return matchedField ? matchedField : null;
  };

  // API call function for creating approval
  const createApproval = async () => {
    setLoading(true); // Set loading to true while making the request

    try {
      const apiService = new ApiService(
        `${BASE_URL}/approvals/create/${object}/${record._id}`,
        {
          "Content-Type": "application/json",
        },
        "POST"
      );

      // Make the API call
      const response = await apiService.makeCall();
      message.success("Approval created successfully!");
      console.log("Approval created successfully:", response.data);
    } catch (error) {
      message.error("Error creating approval:", error);
      console.error("Error creating approval:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RecordDetailHeader
        title={renderField(
          getFieldType(compactlayout?.title_field),
          record[compactlayout?.title_field]
        )}
        buttons={[
          {
            label: "Submit For Approval",
            type: "primary",
            onClick: createApproval, // Your custom function
            loading: loading, // Pass the loading state here
          },
        ]}
      />

      {/* Compact Layout Fields */}
      <Card style={{ borderRadius: "12px",marginTop:'45px' ,marginLeft:1}}>
        <Row gutter={8}>
          {compactlayout?.layout_fields?.map((field) => {
            const matchedfield = getFieldType(field.field_name);
            const columnSpan =
              Math.floor(24 / compactlayout.layout_fields.length) || 24;

            return (
              <Col span={columnSpan} key={field.order}>
                {/* Display Label */}
                <Typography.Text style={{ fontSize: "16px" }} strong>
                  {field.display_label}
                </Typography.Text>
                <br />
                {/* Field Value */}
                <Typography.Text>
                  {renderField(matchedfield, record[field.field_name])}
                </Typography.Text>
              </Col>
            );
          })}
        </Row>
      </Card>
    </>
  );
};

export default CompactLayout;
