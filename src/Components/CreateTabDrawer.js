import React, { useEffect, useState } from 'react';
import { Drawer, Form, Select,Input, Button, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import * as Icons from '@ant-design/icons';
import ApiService from '../apiService'; // Ensure this points to your ApiService
import { BASE_URL } from '../Constant';
import pluralize from 'pluralize';
import { json } from 'react-router-dom';
 

const { Option } = Select;

const CreateTabDrawer = ({ visible, onClose }) => {
    const [form] = Form.useForm();

  const [objects, setObjects] = useState([]); // State to hold available objects
  const [loading, setLoading] = useState(true); // State for loading status

  // Fetch tabs and objects when the component mounts
  useEffect(() => {
    const fetchTabsAndObjects = async () => {
      try {
        // Fetch all tabs
        const tabsService = new ApiService(`${BASE_URL}/mt_tabs`, {
          'Content-Type': 'application/json',
        }, 'GET');
        const tabsResponse = await tabsService.makeCall();
        
        // Fetch all objects
        const objectsService = new ApiService(`${BASE_URL}/mt_objects`, {
          'Content-Type': 'application/json',
        }, 'GET');
        const objectsResponse = await objectsService.makeCall();

        // Filter out objects that are already in tabs
        const objectIdsInTabs = new Set(tabsResponse.map(tab => tab.mt_object_id));
        const filteredObjects = objectsResponse.filter(object => !objectIdsInTabs.has(object._id));

        setObjects(filteredObjects); // Set the filtered objects
      } catch (error) {
        message.error('Failed to fetch tabs or objects'); // Show error message
      } finally {
        setLoading(false); // Update loading status
      }
    };

    fetchTabsAndObjects();
  }, []);

  // Icon options for the Select
  const iconOptions = Object.keys(Icons)
    .filter((iconName) => iconName[0] >= 'A' && iconName[0] <= 'T') // Filter icons from A to T
    .map((iconName) => {
      const IconComponent = Icons[iconName];
      return (
        <Option key={iconName} value={iconName} label={iconName}>
          <span>
            {React.createElement(IconComponent, null)} {/* Render the icon */}
            <span style={{ marginLeft: 8 }}>{iconName}</span> {/* Display icon name */}
          </span>
        </Option>
      );
    });

  const handleSubmit = async (values) => {
    console.log('Form values:', values);
    console.log('label is '+values.label);
    console.log('name is '+values.name);

    // Construct the new tab object using selected values
    const newTab = {
      label: values.label, // Assuming object has a name property
      name: values.name,   // Assuming object has a name property
      description: `All Accounts`, // Example description
      mt_object_id: values.object, // Object ID selected
      icon: values.icon // Icon selected
    };

    console.log('body is '+JSON.stringify(newTab));

    // Call the API to create a new tab
    try {
      const apiServiceForTab = new ApiService(
        `${BASE_URL}/mt_tabs`,
        { 'Content-Type': 'application/json' },
        'POST',
        { mt_tab: newTab }
      );

      await apiServiceForTab.makeCall();
      message.success('New tab created successfully'); // Show success message
      onClose(); // Close the drawer after successful creation
    } catch (error) {
      message.error('Failed to create new tab'); // Show error message
    }
  };

  const generateApiName = (label) => {
    return label
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .trim() // Remove leading and trailing spaces
      .split(/\s+/) // Split by one or more spaces
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toLowerCase() + word.slice(1); // First word lowercase
        }
        return word.charAt(0).toUpperCase() + word.slice(1); // Capitalize other words
      })
      .join(''); // Join back into a single string
  };
  

  // Handle label change and update API name
  const handleLabelChange = (e) => {
    const label = e.target.value;
    form.setFieldsValue({
      name: generateApiName(label), // Set the API name based on the sanitized label
    });
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center'
        }} >
          <CloseOutlined style={{ cursor: 'pointer', marginRight: '10px' }} onClick={onClose} />
          <span>Create New Tab</span>
        </div>
      }
      placement="right"
      closable={false} // Disable default close button
      onClose={onClose}
      visible={visible}
      headerStyle={{
        padding: '20px 16px',
        //background: '#20b2aa',
        background: '#f0f2f5',
        borderBottom: '1px solid #e8e8e8',
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" form="createTabForm" htmlType="submit">
            Create Tab
          </Button>
        </div>
      }
    >
      <Form form={form} id="createTabForm" layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Select Object" name="object" required>
          <Select placeholder="Select an object" loading={loading}>
            {objects.map(object => (
              <Option key={object._id} value={object._id} label={object.name}>
                {object.name} {/* Assuming object has a name property */}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
              name="label"
              label="Label"
              rules={[{ required: true, message: 'Please enter the label' }]}
            >
              <Input 
                placeholder="Please enter the field label" 
                onBlur={handleLabelChange} // Add onChange handler here
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="API Name"
              rules={[ 
                { required: true, message: 'Please enter the name' }, 
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const alphabetOnlyRegex = /^[a-zA-Z]+$/;
                    if (!alphabetOnlyRegex.test(value)) {
                      return Promise.reject(new Error('Name should only contain alphabets without spaces.'));
                    }
                    if (pluralize.isPlural(value)) {
                      return Promise.reject(new Error('API name cannot be plural.'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
            <Input placeholder="Please enter the name" />

             
            </Form.Item>

        <Form.Item name="icon" label="Icon">
          <Select
            placeholder="Select an icon"
            optionLabelProp="label"
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {iconOptions}
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateTabDrawer;