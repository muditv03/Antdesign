import React, { useState, useEffect } from 'react';
import { Table, Spin, Tooltip, Popconfirm, message, Button } from 'antd';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateRecordDrawer from '../Record/CreateRecordDrawer';
import { Form } from 'antd'; // Import Form
import { useNavigate } from 'react-router-dom';

 

const UserComponent = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm(); // Initialize form
  const [fieldsData, setFieldsData] = useState([]);

  const fetchUsers = async () => {
    const apiServiceForLookup = new ApiService(
      `${BASE_URL}/fetch_records/User`,
      { 'Content-Type': 'application/json' },
      'GET'
    );

    try {
      const response = await apiServiceForLookup.makeCall();
      console.log('response'+JSON.stringify(response));
      const formattedUsers = response.map((user) => ({
        ...user,
        id: user.id || user._id, // Use `id` if present, otherwise fallback to `_id`
      }));
      setUsers(formattedUsers);
    } catch (error) {
      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to fetch users due to an unknown error';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    setLoading(true);
    const apiServiceForFields = new ApiService(
      `${BASE_URL}/mt_fields/object/User`, // Adjust the endpoint if needed
      { 'Content-Type': 'application/json' },
      'GET'
    );

    try {
      const response = await apiServiceForFields.makeCall();
      console.log('USER FIELDS:');
      console.log(JSON.stringify(response));
      const formattedFields = response.map((field) => ({
        name: field.name,  // Use API response's `Name` for field name
        label: field.label,    // Use API response's `label` for field label
        type: field.type || 'String',  // Default to String if type is not provided
        is_auto_number: field.is_auto_number || false, // Default to false
      }));
      console.log('Fetched fields:', formattedFields);
      setFieldsData(formattedFields);
    } catch (error) {
      message.error('Failed to fetch fields.');
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
    fetchUsers();
  }, []);
  

  const handleEdit = (record) => {
    setSelectedUser(record);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedUser(null);
  };

  const handleFinish = async (values) => {
    console.log(values);
    setLoading(true);
    try {
      if (selectedUser) {
        // Update existing record

        const body = {
          user: {
            username: values.username,
            email: values.email,
            Name: values.Name,
            is_active: values.is_active,
          },
        };

        const apiService = new ApiService(
          `${BASE_URL}/edit_user/${selectedUser._id}`,  // Use the ID of the selected user
          { 'Content-Type': 'application/json' },
          'PATCH',  // Use PATCH as per the API requirement
          JSON.stringify(body)  // Correct structure for the body
        );
        const response = await apiService.makeCall();
        console.log('response::::'+JSON.stringify(response));
        fetchUsers();
        message.success('Record updated successfully.');
      } else {
        // Create new record
        const body = {
          username: values.username,
          password: '12345',
          confirm_password: '12345',
          Name: values.Name,
          email: values.email,
          is_active: values.active,
        };

        const apiService = new ApiService(
          `${BASE_URL}/register`,
          { 'Content-Type': 'application/json' },
          'POST',
          JSON.stringify({ user: body })
        );
        await apiService.makeCall();
        message.success('Record created successfully.');
      }
       fetchUsers();
      handleCloseDrawer();
    } catch (error) {
      const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save record due to an unknown error';
      message.error(errorMessage);
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };



  const columns = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
      render: (text, record) => (
        <a
          href={`/record/User/${record._id}`} // Replace with your actual route structure
          onClick={(e) => {
            e.preventDefault(); // Prevent default navigation
            navigate(`/record/User/${record._id}`);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (isActive ? 'Active' : 'Deactivated'),
    },
    {
      title: 'Action',
      key: 'operation',
      render: (_, record) => (
        <>
          <Tooltip title="Edit">
            <EditOutlined
              style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  // Example fieldsData structure
  // const fieldsData = [
  //   { name: 'Name', label: 'Name', type: 'String', is_auto_number: false },
  //   { name: 'email', label: 'Email', type: 'Email', is_auto_number: false },
  //   { name: 'username', label: 'Username', type: 'String', is_auto_number: false },
  //   { name: 'is_active', label: 'Active', type: 'boolean', is_auto_number: false },
  //   // Add more fields as per your requirements
  // ];

  return (
    <div>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <Table
          title={() => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '24px' }}>User List</div>
              <Button
                type="primary"
                style={{ marginBottom: 5, marginRight: '5px' }}
                onClick={() => setDrawerVisible(true)} // Open drawer for creating new record
              >
                Create
              </Button>
            </div>
          )}
          dataSource={users}
          columns={columns}
          rowKey="id"
        />
      )}

      <CreateRecordDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        onFinish={handleFinish}
        loading={loading}
        fieldsData={fieldsData}
        selectedRecord={selectedUser}
        selectedDate={null} // Initialize as needed
        setSelectedDate={() => { }} // Implement state management as needed
        form={form}
      />
    </div>
  );
};

export default UserComponent;
