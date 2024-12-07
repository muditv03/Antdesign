import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Row, Col, Typography, Space, Select, message, Checkbox,Affix } from "antd";
import { ConsoleSqlOutlined, DeleteOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // Updated import
import ApiService from '../Components/apiService'; // Import ApiService class
import { BASE_URL } from '../Components/Constant';

const { Title } = Typography;
const { Option } = Select;

const LayoutEditor = ({ onBack, object, fields, getAllLayouts, Editinglayout,isCloning }) => {
  const [layoutName, setLayoutName] = useState("");
  const [sections, setSections] = useState([]);
  const [updatedFields, setUpdatedFields] = useState(fields.map(field => field.name));
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (Editinglayout) {
      // Set layout name
      setLayoutName(
        (isCloning ? `${Editinglayout.layout_name || ""} clone` : Editinglayout.layout_name || "")
      );
      setIsActive(Editinglayout.active);

      // Populate sections from Editinglayout
      const populatedSections = (Editinglayout.sections || []).map((section, sectionIndex) => ({
        name: section.name || `Section ${sectionIndex + 1}`,
        order: section.order || sectionIndex + 1,
        columns: (section.columns || []).map((column, columnIndex) => ({
          order: column.order || columnIndex + 1,
          items: (column.items || []).map((item, itemIndex) => ({
            field: item.name || `Field ${itemIndex + 1}`,
            order: item.order || itemIndex + 1,
          })),
        })),
      }));

      setSections(populatedSections);

      const existingFields = new Set(
        populatedSections.flatMap(section =>
          section.columns.flatMap(column => column.items.map(item => item.field))
        )
      );
  
      // Filter updatedFields to exclude existing fields
      const filteredFields = fields
        .map(field => field.name)
        .filter(fieldName => !existingFields.has(fieldName));
  
      setUpdatedFields(filteredFields);
    }
  }, [Editinglayout]);

  const addSection = () => {
    if (!layoutName || !object) {
      alert("Please provide Layout Name and Object Name before adding a section.");
      return;
    }
    setSections((prevSections) => [
      ...prevSections,
      { name: "", order: prevSections.length + 1, columns: [] },
    ]);
  };

  const addColumn = (sectionIndex) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      updatedSections[sectionIndex].columns.push({
        name: "",
        order: updatedSections[sectionIndex].columns.length + 1,
        items: [],
      });
      return updatedSections;
    });
  };

  const handleInputChange = (value, sectionIndex, columnIndex, itemIndex, key) => {
    console.log('handle field changed');
    console.log(value);
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      if (itemIndex !== undefined) {
        updatedSections[sectionIndex].columns[columnIndex].items[itemIndex][key] = value;
      } else if (columnIndex !== undefined) {
        updatedSections[sectionIndex].columns[columnIndex][key] = value;
      } else {
        updatedSections[sectionIndex][key] = value;
      }
      return updatedSections;
    });
    console.log('value after selecting field');
    console.log(value);
    let oldList = updatedFields;
    const filteredFields = oldList.filter((field) => field !== value);
    setUpdatedFields(filteredFields);
    console.log('filtered fields');
    console.log(updatedFields);
  };

  useEffect(() => {
    console.log('UpdatedFields after update:', updatedFields);
  }, [updatedFields]);

  const deleteElement = (sectionIndex, columnIndex, itemIndex, value) => {
    console.log(value);
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      // const middata =updatedSections[sectionIndex].columns[columnIndex];
      if (itemIndex !== undefined) {
        updatedSections[sectionIndex].columns[columnIndex].items.splice(itemIndex, 1);
        if (value && value.field) {
          // Update the fields list
          console.log('fields are');
          console.log(updatedFields);
          setUpdatedFields((prevFields) => {
            console.log('Previous fields:', prevFields);
            const newField = { name: value.field };
            console.log('Adding to updatedFields:', newField); // Log before adding

            return [...prevFields, newField];
          });
        } else {
          console.error('Invalid deleted item or missing field:');
        }
        console.log(updatedFields);
      }
      else if (columnIndex !== undefined) {
        updatedSections[sectionIndex].columns.splice(columnIndex, 1);
      } else {
        updatedSections.splice(sectionIndex, 1);
      }
      return updatedSections;
    });

  };

  const saveLayout = async () => {

    for (let section of sections) {
      if (!section.name || !section.order) {
        message.error("All sections must have a name and order.");
        return;
      }
      for (let column of section.columns) {
        if (!column.order) {
          message.error("All columns must have an order.");
          return;
        }
        for (let item of column.items) {
          if (!item.order || !item.field) {
            message.error("Some items does not contain fields");
            return;
          }
        }
      }
    }

    const mt_layout = {
      layout_name: layoutName,
      active: isActive,
      object_name: object,
      sections: sections.map((section) => ({
        name: section.name,
        order: section.order,
        columns: section.columns.map((column) => ({
          order: column.order,
          items: column.items.map((item) => ({
            name: item.field,  // or field, depending on how your API expects it
            order: item.order,
          })),
        })),
      })),
    };
    console.log(mt_layout);
    try {
      let apiUrl = ''; // Default: create layout

      if (Editinglayout?._id && !isCloning) {
        // If Editinglayout has an ID, update the existing layout
        apiUrl = `${BASE_URL}/update_layout/${Editinglayout._id}`;
      } else {
        apiUrl = `${BASE_URL}/create_layout`;

      }

      console.log(apiUrl);

      const apiService = new ApiService(apiUrl, {}, "POST", { "mt_layout": mt_layout });
      const response = await apiService.makeCall();

      message.success(
        Editinglayout?.id ? "Layout updated successfully" : "Layout created successfully"
      );
      getAllLayouts();
      setLayoutName("");
      setSections([]);
      onBack();
    } catch (error) {

      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save layout due to an unknown error';
      message.error(errorMessage);

    }

  };

  const cancelEditing = () => {
    setLayoutName("");
    setSections([]);
    onBack();
  };

  const handleDragEnd = (result) => {
    console.log('in the handledragend');
    const { source, destination, type } = result;

    if (!destination) return;

    const updateOrders = (list) => {
      return list.map((item, index) => ({ ...item, order: index + 1 }));
    };

    if (type === "section") {
      // Handle section reordering
      console.log('section is dragged');
      const reorderedSections = Array.from(sections);
      const [movedSection] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, movedSection);

      // Update orders
      setSections(updateOrders(reorderedSections));
    } else if (type === "column") {
      // Handle column reordering
      const sourceSectionIndex = parseInt(source.droppableId.split("-")[1], 10);
      const destinationSectionIndex = parseInt(destination.droppableId.split("-")[1], 10);
  
      if (sourceSectionIndex === destinationSectionIndex) {
        const updatedSections = Array.from(sections);
        const section = updatedSections[sourceSectionIndex];
        const [movedColumn] = section.columns.splice(source.index, 1);
        section.columns.splice(destination.index, 0, movedColumn);
        section.columns = updateOrders(section.columns);


        setSections(updatedSections);
      }
    } else if (type === "item") {
      // Handle item reordering
      const sourceSectionIndex = parseInt(source.droppableId.split("-")[1], 10);
      const sourceColumnIndex = parseInt(source.droppableId.split("-")[3], 10);
      const destinationSectionIndex = parseInt(destination.droppableId.split("-")[1], 10);
      const destinationColumnIndex = parseInt(destination.droppableId.split("-")[3], 10);

      const updatedSections = Array.from(sections);

      // Remove the item from the source
      const sourceColumn = updatedSections[sourceSectionIndex].columns[sourceColumnIndex];
      const [movedItem] = sourceColumn.items.splice(source.index, 1);

      // Add the item to the destination
      const destinationColumn = updatedSections[destinationSectionIndex].columns[destinationColumnIndex];
      destinationColumn.items.splice(destination.index, 0, movedItem);

      // Update orders for items in both source and destination columns
      sourceColumn.items = updateOrders(sourceColumn.items);
      destinationColumn.items = updateOrders(destinationColumn.items);

      setSections(updatedSections);
    }
  };




  const addItem = (sectionIndex, columnIndex) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      const targetColumn = updatedSections[sectionIndex].columns[columnIndex];

      // Add a new item to the column
      targetColumn.items.push({
        field: "", // Default field value
        order: targetColumn.items.length + 1, // Auto-increment order
      });

      return updatedSections;
    });
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3}>Layout Editor</Title>
        </Col>
        <Col>
          <Button type="default" onClick={onBack}>
            Back
          </Button>
        </Col>
      </Row>

      <Space direction="vertical" style={{ width: "100%", marginBottom: 20 }}>
        <Input
          placeholder="Enter Layout Name"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
        />
        <Input placeholder="Enter Object Name" value={object} disabled />
        <Checkbox
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        >
          <span style={{ fontWeight: '500' }}>Active</span>

        </Checkbox>
      </Space>

      <Button type="dashed" onClick={addSection} style={{ marginBottom: 15 }}>
        Add Section
      </Button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {sections.map((section, sectionIndex) => (
                <Draggable
                  key={`section-${sectionIndex}`}
                  draggableId={`section-${sectionIndex}`}
                  index={sectionIndex}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        border: snapshot.isDragging ? "2px dashed blue" : "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "15px",
                        background: snapshot.isDragging ? "#f0f8ff" : "#fff",
                      }}
                    >
                      <Card
                        title={
                          <div {...provided.dragHandleProps}>
                            <Space>
                              Section {sectionIndex + 1}
                              <Input
                                placeholder="Section Name"
                                value={section.name}
                                onChange={(e) =>
                                  handleInputChange(e.target.value, sectionIndex, undefined, undefined, "name")
                                }
                              />
                              <Input
                                placeholder="Order"
                                value={section.order}
                                onChange={(e) =>
                                  handleInputChange(e.target.value, sectionIndex, undefined, undefined, "order")
                                }
                              />
                            </Space>
                          </div>
                        }
                        extra={
                          <Button type="text" danger>
                            <DeleteOutlined
                              onClick={() => deleteElement(sectionIndex)}
                              style={{ color: "red", fontSize: "16px", cursor: "pointer" }}
                            />
                          </Button>
                        }
                        style={{ marginBottom: 20 }}
                      >
                        <Button
                          type="dashed"
                          onClick={() => addColumn(sectionIndex)}
                          style={{ marginBottom: 10 }}
                        >
                          Add Column
                        </Button>

                        <Droppable droppableId={`section-${sectionIndex}`} type="column" direction="horizontal">
                          {(provided) => (

                            <Row
                              gutter={16}
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{ display: "flex" }} // Ensuring the columns wrap to the next row
                            >
                              {section.columns.map((column, columnIndex) => {
                                // Ensure a maximum of 3 columns per row
                                const rowIndex = Math.floor(columnIndex / 3); // Determine the row index based on column index
                                const columnSpan = 8; // Each column takes 8 spans (3 columns max in one row)

                                return (
                                  <Draggable
                                    key={`column-${sectionIndex}-${columnIndex}`}
                                    draggableId={`column-${sectionIndex}-${columnIndex}`}
                                    index={columnIndex}
                                  >
                                    {(provided) => (
                                      <Col
                                        span={columnSpan}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        key={columnIndex}
                                      >
                                        <Card
                                          title={
                                            <Space>
                                              Column {columnIndex + 1}
                                              <Input
                                                placeholder="Order"
                                                value={column.order}
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    e.target.value,
                                                    sectionIndex,
                                                    columnIndex,
                                                    undefined,
                                                    "order"
                                                  )
                                                }
                                              />
                                            </Space>
                                          }
                                          extra={
                                            <Button type="text" danger>
                                              <DeleteOutlined
                                                onClick={() => deleteElement(sectionIndex, columnIndex)}
                                                style={{ color: "red", fontSize: "16px", cursor: "pointer" }}
                                              />
                                            </Button>
                                          }
                                          style={{ marginBottom: 20 }}
                                        >
                                          <Button
                                            type="dashed"
                                            onClick={() => addItem(sectionIndex, columnIndex)}
                                            style={{ marginBottom: 10 }}
                                          >
                                            Add Item
                                          </Button>

                                          {/* Droppable for items */}
                                          <Droppable
                                            droppableId={`section-${sectionIndex}-column-${columnIndex}`}
                                            type="item"
                                          >
                                            {(provided) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{ minHeight: 50, padding: 10, border: "1px dashed #ccc" }}
                                              >
                                                {column.items.map((item, itemIndex) => (
                                                  <Draggable
                                                    key={`item-${sectionIndex}-${columnIndex}-${itemIndex}`}
                                                    draggableId={`item-${sectionIndex}-${columnIndex}-${itemIndex}`}
                                                    index={itemIndex}
                                                  > 
                                                    {(provided, snapshot) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                          ...provided.draggableProps.style,
                                                          padding: "10px",
                                                          marginBottom: "5px",
                                                          background: snapshot.isDragging ? "#f0f8ff" : "#fff",
                                                          border: "1px solid #ddd",
                                                        }}
                                                      >
                                                        <Row key={itemIndex} style={{ marginBottom: 10, margin: 'auto' }}>
                                                          <Col span={3}>
                                                            <Input
                                                              placeholder="Order"
                                                              value={item.order}
                                                              onChange={(e) =>
                                                                handleInputChange(
                                                                  e.target.value,
                                                                  sectionIndex,
                                                                  columnIndex,
                                                                  itemIndex,
                                                                  "order"
                                                                )
                                                              }
                                                            />
                                                          </Col>
                                                          <Col span={16}>
                                                            <Select
                                                              placeholder="Select item"
                                                              value={item.field}
                                                              rules={[
                                                                { required: true, message: "This field is required!" },
                                                              ]}
                                                              onChange={(value) =>
                                                                handleInputChange(value, sectionIndex, columnIndex, itemIndex, "field")
                                                              }
                                                              style={{ width: "90%" }}
                                                            >
                                                              {updatedFields.map((field, index) => (
                                                                <Option key={index} value={field}>
                                                                  {field}
                                                                </Option>
                                                              ))}
                                                            </Select>
                                                          </Col>
                                                          <Col span={2}>
                                                            <Button
                                                              type="text"
                                                              danger
                                                              onClick={() =>
                                                                deleteElement(sectionIndex, columnIndex, itemIndex, item)
                                                              }
                                                            >
                                                              <DeleteOutlined />
                                                            </Button>
                                                          </Col>
                                                        </Row>
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                ))}
                                                {provided.placeholder}
                                              </div>
                                            )}
                                          </Droppable>
                                        </Card>
                                      </Col>
                                    )}
                                  </Draggable>
                                );
                              })}

                              {provided.placeholder}
                            </Row>
                          )}
                        </Droppable>

                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
 
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
    
    <Button type="primary" onClick={saveLayout} style={{ marginRight: 10 }}>
      Save Layout
    </Button>
    <Button type="default" onClick={cancelEditing}>
      Cancel
    </Button>
  </div></Affix>

    </div> 
  );
};

export default LayoutEditor;
