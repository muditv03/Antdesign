import dayjs from 'dayjs';
import { useState } from 'react';
 

// Function to handle Insert operation
export const generateBody = (fieldsDataDrawer, values) => {
  const updatedValues = {};
  console.log('values are');
  console.log(values);
  fieldsDataDrawer.forEach((field) => {
    const fieldName = field.name;
    if (field.Name === 'CreatedBy' || field.Name === 'LastModifiedBy') {
      return;
    }
    console.log('value');
    console.log(values[fieldName]);
    if (field.type === 'lookup' && field.Name === 'CreatedBy' || field.Name === 'LastModifiedBy') {
      console.log(values[fieldName._id]);
      if (values[fieldName]?._id) {
        updatedValues[`${fieldName}_id`] = values[fieldName]._id;
      } else {
        updatedValues[`${fieldName}_id`] = values[fieldName] ?? "";
      }
    }
    else if (field.type === 'Address') {
      updatedValues[fieldName] = {
        street: values[`${field.name}_street`],
        city: values[`${field.name}_city`],
        state: values[`${field.name}_state`],
        country: values[`${field.name}_country`],
        postal_code: values[`${field.name}_postalcode`]
      };
    }
    else if (field.type === 'percentage') {
      updatedValues[fieldName] = values[fieldName] / 100;
    }
    else {
      updatedValues[fieldName] = values[fieldName];
    }
  });

  console.log(updatedValues);
  return updatedValues;
};
export const colors = ['blue', 'green', 'red', 'purple', 'orange', 'volcano', 'gold', 'cyan', 'lime', 'pink'];

export const getUniqueColor = (index) => {
  // Assign a color based on the index, wrapping around if there are more values than colors
  return colors[index % colors.length];
};

export const formatRecordData = async (record, fieldsResponse, BASE_URL) => {
  const formattedRecord = { ...record };

  // Format address and date fields
  fieldsResponse.forEach(field => {
    if (field.type === 'Address' && formattedRecord[field.name]) {
      formattedRecord[`${field.name}_street`] = record[field.name].street || '';
      formattedRecord[`${field.name}_city`] = record[field.name].city || '';
      formattedRecord[`${field.name}_state`] = record[field.name].state || '';
      formattedRecord[`${field.name}_country`] = record[field.name].country || '';
      formattedRecord[`${field.name}_postalcode`] = record[field.name].postal_code || '';
    }

    if (field.type === 'Date' && record[field.name]) {
      formattedRecord[field.name] = dayjs(record[field.name]).format('DD/MM/YYYY');
    }
    if (field.type === 'DateTime' && record[field.name]) {
      formattedRecord[field.name] = dayjs(record[field.name]).format('DD/MM/YYYY HH:mm:ss');
    }
    if (field.type === 'percentage' && record[field.name]) {
      formattedRecord[field.name] = record[field.name] * 100;
    }
  });

  return formattedRecord;
};

export const fetchLookupData = (record, fieldsResponse, BASE_URL, setLookupName, form) => {
  const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');
  console.log('fetch lookup datA IS cALLED')
  console.log('record is ');
  console.log(record);

  for (const lookupField of lookupFields) {
    console.log('looku[ fields are');
    console.log(lookupField);
    console.log('lookup field name is');
    console.log(lookupField.name);
    console.log(record[lookupField.name].Name);
    form.setFieldsValue({
      [lookupField.name]: record[lookupField.name].Name
    });


  }
};

export const useHoverVisibility = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  // Handle mouse enter on the element that triggers the card
  const handleMouseEnter = () => {
      if (hoverTimeout) {
          clearTimeout(hoverTimeout); // Clear the timeout when the mouse enters
      }
      setIsHovered(true); // Keep the component visible when hovering over it
      setIsVisible(true); // Make the content visible immediately
  };

  // Handle mouse leave from the element that triggers the card
  const handleMouseLeave = () => {
      const timeout = setTimeout(() => {
          setIsVisible(false); // Close the component after a delay
      }, 400);
      setHoverTimeout(timeout); // Store the timeout to clear it when hovering over content
  };

  // Handle mouse enter on the content (to prevent closing when hovering over content)
  const handleContentMouseEnter = () => {
      setIsHovered(true); // Keep the component visible when hovering over the content
  };

  // Handle mouse leave from the content (to check for closing)
  const handleContentMouseLeave = () => {
      setIsHovered(false); // Allow the timeout to close the component
  };

  return {
      isHovered,
      isVisible,
      handleMouseEnter,
      handleMouseLeave,
      handleContentMouseEnter,
      handleContentMouseLeave,
  };
};
