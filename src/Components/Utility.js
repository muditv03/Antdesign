import dayjs from 'dayjs';
import ApiService from '../apiService';


// Function to handle Insert operation
export const generateBody = (fieldsDataDrawer, values) => {
    const updatedValues = {};
    fieldsDataDrawer.forEach((field) => {
        const fieldName = field.name;
        if (field.type === 'lookup') {
            updatedValues[`${fieldName}_id`] = values[fieldName];
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
        else {
            updatedValues[fieldName] = values[fieldName];
        }
    });
    return updatedValues;
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
    });
  
    return formattedRecord;
  };
  
  export const fetchLookupData = async (record, fieldsResponse, BASE_URL, setLookupName, form) => {
    const lookupFields = fieldsResponse.filter(field => field.type === 'lookup');
  
    for (const lookupField of lookupFields) {
      const ob = lookupField.parent_object_name;
      const objectName = lookupField.name;
      const recordId = record[`${objectName}_id`];
  
      if (recordId) {
        const apiServiceForRecord = new ApiService(
          `${BASE_URL}/fetch_single_record/${ob}/${recordId}`,
          { 'Content-Type': 'application/json' },
          'GET'
        );
  
        const response = await apiServiceForRecord.makeCall();
        setLookupName(prev => ({ ...prev, [lookupField.name]: response.Name }));
  
        form.setFieldsValue({
          [lookupField.name]: recordId
        });
      }
    }
  };
