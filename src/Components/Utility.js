import dayjs from 'dayjs';
import ApiService from './apiService';
import { replace } from 'react-router-dom';


// Function to handle Insert operation
export const generateBody = (fieldsDataDrawer, values) => {
    const updatedValues = {};
    console.log('values are');
    console.log(values);
    fieldsDataDrawer.forEach((field) => {
        const fieldName = field.name;
        console.log('value');
        console.log( values[fieldName]);
        if (field.type === 'lookup') {
          console.log(values[fieldName._id]);
          if(values[fieldName]?._id){
            updatedValues[`${fieldName}_id`] = values[fieldName]._id;
          }else{
            updatedValues[`${fieldName}_id`] = values[fieldName];
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
        else if(field.type==='percentage'){
          updatedValues[fieldName]=values[fieldName]/100;
        }
        else {
            updatedValues[fieldName] = values[fieldName];
        }
    });

    console.log(updatedValues);
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
      if (field.type === 'percentage' && record[field.name]) {
        formattedRecord[field.name] = record[field.name]*100;
      }
    });
  
    return formattedRecord;
  };
  
  export const fetchLookupData =  (record, fieldsResponse, BASE_URL, setLookupName, form) => {
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
