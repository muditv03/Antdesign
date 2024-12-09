import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Row, Col, Typography, Space, Select, message, Checkbox,Affix, Layout } from "antd";
import ApiService from '../Components/apiService'; // Import ApiService class
import { BASE_URL } from '../Components/Constant';
import { ConsoleSqlOutlined, DeleteOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

 
const { Title } = Typography;
const { Option } = Select;

const CompactLayoutEditor = ({ onBack, object, fields,selectedLayout,fetchCompactLayout }) => {


    const [updatedFields, setUpdatedFields] = useState(fields.map(field => field.name));
    const [description,setDescription]=useState('');
    const [titlefield,setTitleField]=useState('');
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        if (selectedLayout) {
            console.log('selected layout is', selectedLayout);
    
            setDescription(selectedLayout.description);
            setTitleField(selectedLayout.title_field);
    
            // Map the layout fields to columns
            const mappedColumns = selectedLayout.layout_fields.map((layoutField, index) => ({
                id: `column-${index + 1}`,
                label: layoutField.display_label || '',
                field: layoutField.field_name || '',
            }));
    
            setColumns(mappedColumns);

            const layoutFieldNames = selectedLayout.layout_fields.map(field => field.field_name);
            const filteredFields = fields.filter(field => !layoutFieldNames.includes(field.name)); // Filter out fields already in the layout

            setUpdatedFields(filteredFields.map(field => field.name));
        }
    }, [selectedLayout]);


    const addColumn = () => {
        setColumns([
            ...columns,
            { id: `column-${columns.length + 1}`, label: "", field: "" }
        ]);
    };

    // Function to delete a column
    const deleteColumn = (indexToRemove) => {
        const updatedColumns = columns.filter((_, index) => index !== indexToRemove);
        setColumns(updatedColumns);
    };

    // Function to handle input or select changes within a column
    const handleColumnChange = (value, columnIndex, key) => {
        const updatedColumns = [...columns];
        updatedColumns[columnIndex][key] = value;
         // If field is updated, ensure it's removed from available fields
        if (key === 'field') {
            let updatedList = [...updatedFields];
            const fieldIndex = updatedList.indexOf(value);
            if (fieldIndex !== -1) updatedList.splice(fieldIndex, 1);
            setUpdatedFields(updatedList);
        }
        setColumns(updatedColumns);
    };

    // Handle drag-and-drop reordering of columns
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedColumns = [...columns];
        const [moved] = reorderedColumns.splice(result.source.index, 1);
        reorderedColumns.splice(result.destination.index, 0, moved);
        setColumns(reorderedColumns);
    };

    const saveCompactLayout=async()=>{
        if (!titlefield ||  columns.length === 0) {
            message.error("Please fill all the required fields and add at least one layout field.");
            return;
        }  


    
        // Construct the body
        const requestBody = {
            mt_compact_layout: {
                object_name: object, // From props
                title_field: titlefield, // From state
                description: description, // From state
                layout_fields: columns.map((column, index) => ({
                    field_name: column.field,
                    display_label: column.label,
                    order: index + 1, // Order is based on the index in the array
                })),
            },
        };
        

        let apiurl='';
        let req='';
        if(selectedLayout){
            apiurl=`${BASE_URL}/edit_compact_layout/${selectedLayout._id}`;
            req='PUT';
        }else{
            apiurl=`${BASE_URL}/create_compact_layout`;
            req='POST';

        }

        console.log(requestBody);
        console.log(apiurl);
        console.log(req);

        try{
            const apiService = new ApiService(apiurl, {}, req, requestBody );
            const response = await apiService.makeCall();
            console.log(response)
            message.success(
                selectedLayout?._id ? "Compact Layout updated successfully" : "Compact Layout created successfully"
              );

            setDescription('');
            setColumns([]);
            setTitleField('');
            fetchCompactLayout();
            onBack(); 
        }
        catch (error) {

            const errorMessage = error && typeof error === 'object'
              ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
              : 'Failed to save compact layout due to an unknown error';
            message.error(errorMessage);
      
          }

    }

    const cancelEditing=()=>{

        onBack();

    }
    return(

        <div>

            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
            <Title level={3}>Compact Layout Editor</Title>
            </Col>
            <Col>
            <Button type="default" onClick={onBack}>
                Back
            </Button>
            </Col>
            </Row>

            <Space direction="vertical" style={{ width: "100%", marginBottom: 20 }}>
               
                <Input placeholder="Enter Object Name" value={object} disabled />
                <Select
                    showSearch
                    allowClear
                    value={titlefield}
                    placeholder="Select title field"
                    rules={[{ required: true, message: "This field is required!" },]}
                    onChange={(value) => {
                        setTitleField(value);
                    }}
                    style={{ width: "90%" }}
                    >
                    {updatedFields.map((field, index) => (
                    <Option key={index} value={field}>
                        {field}
                    </Option>
                    ))}
                </Select>

                <Input
                 placeholder="Description"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}>
                </Input>
            </Space>

           

            <div style={{ marginBottom: 10, paddingRight: 15, paddingBottom:10,paddingLeft:15,border: "1px solid #d9d9d9", borderRadius: 5 }}>
            <Row justify="space-between" align="middle" >
                    <Col>
                        <Title level={4}>Layout Fields</Title>
                    </Col>
                    <Col>
                        <Button  type="dashed" onClick={addColumn}>
                            Add field
                        </Button>
                    </Col>
                </Row>
               
                <div style={{ marginTop: 10 }}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="columns" direction="horizontal">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{
                                    display: "flex",
                                    gap: 20, // Space between columns
                                    overflowX: "auto"
                                }}
                            >
                                {columns.map((column, index) => (
                                    <Draggable
                                        key={column.id}
                                        draggableId={column.id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    minWidth: 200,
                                                    border: "1px solid #ccc",
                                                    borderRadius: 5,
                                                    padding: 10,
                                                    background: "#f9f9f9",
                                                    position: "relative",
                                                    ...provided.draggableProps.style
                                                }}
                                            >
                                                {/* Order */}
                                                <Row style={{ marginBottom: 10 }}>
                                                    <Col span={12}>
                                                        <Input
                                                            placeholder="Order"
                                                            value={index + 1}
                                                            disabled
                                                        />
                                                    </Col>
                                                    
                                                    <Col span={12} style={{ textAlign: "right" }}>
                                                        <Button>
                                                            <DeleteOutlined
                                                            onClick={() => deleteColumn(index)}
                                                            style={{ color: "red", fontSize: "16px", cursor: "pointer" }}
                                                          />
                                                        
                                                        </Button>
                                                    
                                                </Col>
                                                </Row>
                                                {/* Display Label */}
                                                <Row style={{ marginBottom: 10 }}>
                                                    <Col span={24}>
                                                        <Input
                                                            placeholder="Display Label"
                                                            value={column.label}
                                                            onChange={(e) =>
                                                                handleColumnChange(
                                                                    e.target.value,
                                                                    index,
                                                                    "label"
                                                                )
                                                            }
                                                        />
                                                    </Col>
                                                </Row>
                                                {/* Field Selector */}
                                                <Row style={{ marginBottom: 10 }}>
                                                    <Col span={24}>
                                                        <Select
                                                            placeholder="Select Field"
                                                            value={column.field}
                                                            onChange={(value) =>
                                                                handleColumnChange(
                                                                    value,
                                                                    index,
                                                                    "field"
                                                                )
                                                            }
                                                            style={{ width: "100%" }}
                                                        >

                                                        {updatedFields.map((field, index) => (
                                                            <Option key={index} value={field}>
                                                                  {field}
                                                             </Option>
                                                         ))}
                                                            
                                                            
                                                        </Select>
                                                    </Col>
                                                </Row>
                                                {/* Delete Button */}
                                                
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
            
            </div>


            <Affix offsetBottom={0}>
                <div
                style={{
                position: "sticky",
                bottom: 0,
                background: 'rgba(240, 242, 245, 0.9)', 
                padding: "10px 0",
                boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                
                }}
            >
                
                <Button type="primary" onClick={saveCompactLayout} style={{ marginRight: 10 }}>
                Save Layout
                </Button>
                <Button type="default" onClick={cancelEditing}>
                Cancel
                </Button>
            </div>
            </Affix>
        </div>

    );
}

export default CompactLayoutEditor;

