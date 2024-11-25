import React from 'react';
import { Button } from 'antd';

const SearchLayout = ({
  availableFields,
  setAvailableFields,
  setSelectedFields,
  selectedFields,
  loading,
  isEditMode,
  toggleSelection,
  handleAddToSelected,
  handleRemoveFromSelected,
  handleSave,
  handleEdit,
}) => {
    const styles = {
        listContainer: {
          border: '1px solid #ddd',
          padding: '10px',
          width: '300px',
          maxHeight: '400px', // Set a maximum height
          overflowY: 'auto', // Add vertical scrollbar if content exceeds height
          display: 'flex',
          flexDirection: 'column',
          marginLeft: '100px'
        },
      };
      
  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {/* Available Fields */}
      <div style={styles.listContainer}>
        <h3>Available Fields</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          availableFields.map((field) => (
            <div
              key={field.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() =>
                toggleSelection(field, availableFields, setAvailableFields)
              }
            >
              <input
                type="checkbox"
                checked={field.isSelected && isEditMode}
                onChange={() =>
                  toggleSelection(field, availableFields, setAvailableFields)
                }
              />
              <span style={{ marginLeft: '10px' }}>{field.name}</span>
            </div>
          ))
        )}
      </div>

      {/* Arrow Buttons */}
      <div
        style={{
          marginTop: '50px',
          marginLeft: '70px',
          width: '80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Button
          onClick={handleAddToSelected}
          disabled={!availableFields.length || !isEditMode}
        >
          →
        </Button>
        <Button
          onClick={handleRemoveFromSelected}
          disabled={!selectedFields.length || !isEditMode}
        >
          ←
        </Button>
      </div>

      {/* Selected Fields */}
      <div style={styles.listContainer}>
        <h3>Selected Fields</h3>
        {selectedFields.map((field) => (
          <div
            key={field.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() =>
              toggleSelection(field, selectedFields, setSelectedFields)
            }
          >
            <input
              type="checkbox"
              checked={field.isSelected && isEditMode}
              onChange={() =>
                toggleSelection(field, selectedFields, setSelectedFields)
              }
            />
            <span style={{ marginLeft: '10px' }}>{field.name}</span>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '60px' }}>
        {isEditMode ? (
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        ) : (
          <Button type="default" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchLayout;
