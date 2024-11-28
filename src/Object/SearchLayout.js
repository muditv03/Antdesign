import React, { useState } from 'react';
import { Button, Input, Select, Table } from 'antd';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons'; // Import the DragOutlined icon
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const { Option } = Select;

const SearchLayout = ({
  availableFields,
  setAvailableFields,
  selectedFields,
  setSelectedFields,
  handleSave,
  setIsEditMode,
  isEditMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFieldSelect = (fieldName) => {
    const field = availableFields.find((f) => f.name === fieldName);
    if (field) {
      setSelectedFields([...selectedFields, { ...field, order: '' }]);
      setAvailableFields(availableFields.filter((f) => f.name !== fieldName));
    }
  };

  const handleFieldRemove = (fieldName) => {
    const field = selectedFields.find((f) => f.name === fieldName);
    if (field) {
      setAvailableFields([...availableFields, field]);
      setSelectedFields(selectedFields.filter((f) => f.name !== fieldName));
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const filteredFields = selectedFields.filter((field) =>
    field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragEnd = (result) => {
    const { destination, source } = result;

    // If dropped outside the droppable area, do nothing
    if (!destination) return;

    const items = Array.from(selectedFields);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setSelectedFields(items); // Update the order of fields
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Show Select and Search Fields only when Edit Mode is enabled */}
      {isEditMode && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <Select
            style={{ width: '300px' }}
            placeholder="Select a field"
            onChange={handleFieldSelect}
          >
            {availableFields.map((field) => (
              <Option key={field.name} value={field.name}>
                {field.name}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Search added fields"
            style={{ width: '300px'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Show Drag-and-Drop and the Table of Fields only when Edit Mode is enabled */}
      {isEditMode && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ marginBottom: '20px' }}
              >
                {/* Render Draggable Fields */}
                {filteredFields.map((record, index) => (
                  <Draggable key={record.name} draggableId={record.name} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px',
                          border: '1px solid #ddd',
                          marginBottom: '8px',
                          backgroundColor: '#fff',
                        }}
                      >
                        {/* Draggable Handle - Three Dots */}
                        <DragOutlined
                          style={{
                            cursor: 'move',
                            marginRight: '10px',
                            fontSize: '16px',
                          }}
                        />
                        <span>{record.name}</span>
                        <Button
                          type="text"
                          danger
                          onClick={() => handleFieldRemove(record.name)}
                          style={{ marginLeft: 'auto' }}
                        >
                          <DeleteOutlined style={{ color: 'red', fontSize: '16px', cursor: 'pointer' }} />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Show the Table of Fields when Edit Mode is not enabled */}
      {!isEditMode && (
        <Table
          dataSource={filteredFields}
          columns={[{ title: 'Field Name', dataIndex: 'name', key: 'name' }]}
          rowKey="name"
          pagination={false}
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* Save and Edit Button */}
      <div style={{ textAlign: 'right' }}>
        {isEditMode ? (
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        ) : (
          <Button type="default" onClick={toggleEditMode}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchLayout;
