// Function to handle Insert operation
export const generateBody = (fieldsDataDrawer, values) => {
    const updatedValues = {};
    fieldsDataDrawer.forEach((field) => {
        const fieldName = field.name;
        if (field.type === 'lookup') {
            if (field.name === 'User') {
                updatedValues[`${fieldName}`] = values[fieldName];
            }
            else {
                updatedValues[`${fieldName.toLowerCase()}`] = values[fieldName];
                delete values[fieldName];
            }
        }
        if (field.type === 'Address') {
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