import React, { useEffect, useState } from 'react';
import { Drawer, Form, Button, Card, Input, Select, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ApiService from '../Components/apiService';
import { BASE_URL } from '../Components/Constant';

const { Option } = Select;

const CreateApprovalProcessDrawer = ({ visible, onClose, object }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      const apiServiceForLookup = new ApiService(
        `${BASE_URL}/fetch_records/User`,
        { 'Content-Type': 'application/json' },
        'GET'
      );

      try {
        setLoading(true); // Start loading
        const response = await apiServiceForLookup.makeCall();
        const formattedUsers = response.map((user) => ({
          id: user.id || user._id, // Use `id` or `_id`
          name: user.Name || user.username || 'No Name Available', // Use appropriate field for name
        }));
        setUsers(formattedUsers);
      } catch (error) {
        const errorMessage =
          error && typeof error === 'object'
            ? Object.entries(error)
                .map(([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(', ') : value}` 
                )
                .join(' | ')
            : 'Failed to fetch users due to an unknown error';
        message.error(errorMessage);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUsers();
  }, []);

  // Fetch fields for the specified object name
  useEffect(() => {
    const fetchFields = async () => {
      if (!object?.name) return;

      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${object.name}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );

      try {
        setLoading(true); // Start loading
        const response = await apiServiceForFields.makeCall();
        console.log('fields are');
        console.log(response);
        setAvailableFields(response);
        
      } catch (error) {
        const errorMessage =
          error && typeof error === 'object'
            ? Object.entries(error)
                .map(([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(', ') : value}` 
                )
                .join(' | ')
            : 'Failed to fetch fields due to an unknown error';
        message.error(errorMessage);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    console.log('Fields State:');
    console.log(availableFields);

    fetchFields();
  }, [object?.name]); // Dependency array ensures it runs when object name changes

  useEffect(() => {
    form.resetFields(); // Reset fields on object change
  }, [object?.name]);
  
  const onCloseDrawer = () => {
    form.resetFields(); // Reset form fields
    onClose(); // Close the drawer
  };

  const onFinish = async (formValues) => {
    // Map form values to the required JSON structure
    const body = {
      approval_process: {
        name: formValues.name,
        object_name: formValues.objectName,
        criteria: {}, // Assuming criteria is always an empty object as per your example
        steps: formValues.steps.map((step, index) => ({
          order: index + 1, // Ensure the order is correct
          approver_id: step.approverId, // Map approverId to approver_id
          actions: step.actions.map((action) => ({
            action: action.action.toLowerCase().replace(/\s+/g, '_'), // Convert action to lowercase and replace spaces with underscores
            field: action.field,
            value: action.value,
          })),
        })),
      },
    };
  
    console.log('Request Body:', JSON.stringify(body, null, 2));
  
    const apiService = new ApiService(
      `${BASE_URL}/approval_processes`, 
      { 'Content-Type': 'application/json' }, 
      'POST', 
      body 
    );
  
    try {
      const response = await apiService.makeCall(); // Await the API response
      console.log('API Response:', response);
      message.success('Approval process created successfully!');
      form.resetFields(); 
      onClose(); // Close the drawer after successful submission
    } catch (error) {
      console.error('API Error:', error);
      message.error('Failed to create the approval process. Please try again.');
    }
  };
  

  return (
    <Drawer
      title={'Create Approval Process'}
      width="40%"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            onClick={onCloseDrawer}
          > 
            Cancel
          </Button>
          <Button onClick={() => form.submit()} type="primary">
            Submit
          </Button>
        </div>
      }
    >
      <Card
        style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            objectName: object?.name || '', // Use the object name if available
          }}
        >
          {/* Name Field */}
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name!' }]}>
            <Input placeholder="Enter the name" />
          </Form.Item>

          {/* Object Name Field */}
          <Form.Item
            name="objectName"
            label="Object Name"
            rules={[{ required: true, message: 'Object name is required!' }]}>
            <Input value={object?.name} disabled /> {/* Disable the field for display only */}
          </Form.Item>

          {/* Criteria Field */}
          <Form.Item
            name="criteria"
            label="Criteria"
            rules={[{ required: false, message: 'Please enter the criteria!' }]}>
            <Input placeholder="Enter the criteria" />
          </Form.Item>

          

          {/* Steps Section */}
          <Form.List name="steps">
            {(stepFields, { add, remove }) => (
              <>
                {stepFields.map(({ key, name, fieldKey, ...restField }, index) => (
                  <Card
                    key={key}
                    title={`Step ${index + 1}`}
                    style={{ marginBottom: 20 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    }
                  >
                    {/* Automatically populate the Order field */}
                    <Form.Item
                      {...restField}
                      name={[name, 'order']}
                      fieldKey={[fieldKey, 'order']}
                      label="Order"
                      rules={[{ required: false, message: 'Order is required!' }]}>
                      <span disabled >{index+1} </span>{/* Display the step number */}
                    </Form.Item>

                    {/* Approver ID as a Picklist */}
                    <Form.Item
                      {...restField}
                      name={[name, 'approverId']}
                      fieldKey={[fieldKey, 'approverId']}
                      label="Approver"
                      rules={[{ required: true, message: 'Approver ID is required!' }]}>
                      <Select
                        placeholder="Select an approver"
                        loading={loading}
                        allowClear
                      >
                        {users.map((user) => (
                          <Option key={user.id} value={user.id}>
                            {user.name} {/* Ensure you display the correct field */}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {/* Actions Subsection */}
                    <Form.List name={[name, 'actions']}>
                      {(actionFields, { add: addAction, remove: removeAction }) => (
                        <>
                          {actionFields.map(
                            ({
                              key: actionKey,
                              name: actionName,
                              fieldKey: actionFieldKey,
                              ...actionRestField
                            }) => (
                              <Card
                                key={actionKey}
                                style={{
                                  marginBottom: 16,
                                  border: '1px solid #d9d9d9',
                                  borderRadius: 4,
                                }}
                                title={`Action`}
                                extra={
                                  <Button
                                    type="text"
                                    danger
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => removeAction(actionName)}
                                  />
                                }
                              >
                                <Form.Item
                              {...actionRestField}
                              name={[actionName, 'action']}
                              fieldKey={[actionFieldKey, 'action']}
                              label="Action"
                              rules={[{ required: true, message: 'Action is required!' }]}
                              >
                              <Select placeholder="Select an action" allowClear>
                              <Option value="Update Field">Update Field</Option>
                             </Select>
                             </Form.Item>
                                <Form.Item
                                  {...actionRestField}
                                  name={[actionName, 'field']}
                                  fieldKey={[actionFieldKey, 'field']}
                                  label="Field"
                                  rules={[{ required: true, message: 'Field is required!' }]}
                                >
                            <Select
                              placeholder="Select fields"
                              loading={loading}
                              notFoundContent={loading ? 'Loading fields...' : 'No fields available'}
                              allowClear
                            >
                              {availableFields.map((field) => (
                                <Option key={field.name} value={field.id}>
                                  {field.name}
                                </Option>
                              ))}
                            </Select>
                            </Form.Item>

                                <Form.Item
                                  {...actionRestField}
                                  name={[actionName, 'value']}
                                  fieldKey={[actionFieldKey, 'value']}
                                  label="Value"
                                  rules={[{ required: true, message: 'Value is required!' }]}>
                                  <Input placeholder="Enter the value" />
                                </Form.Item>
                              </Card>
                            )
                          )}
                          <Button
                            type="dashed"
                            onClick={() => addAction()}
                            block
                            icon={<PlusOutlined />}>
                            Add Action
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Step
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Card>
    </Drawer>
  );
};

export default CreateApprovalProcessDrawer;
