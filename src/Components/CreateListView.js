import React,{ useState,useEffect } from 'react';
import { Table, Form, Card, Button, Row, Col, Typography, Tabs, Tooltip,Popconfirm } from 'antd';
import { DownOutlined, EditOutlined, CopyOutlined, DeleteOutlined  } from '@ant-design/icons';
import CreateListViewDrawer from './CreateListViewDrawer';
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';
const {Title}=Typography;
   

const CreateListView = ({ object }) => {
 
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [listViews, setListViews] = useState([]); // State to store the fetched list views
    const [loading, setLoading] = useState(false); // Loading state for API call
    const [selectedListView, setSelectedListView] = useState(null); // State to store the selected list view for editing


    const showCreateListDrawer = (listView) => {
      setSelectedListView(listView); // Set the selected list view for editing
      setDrawerVisible(true); // Show the drawer
    };
 
    const closeCreateListDrawer = () => {
        setDrawerVisible(false); // Hide the drawer
    };

    // Fetch list views when the component mounts
    const fetchListViews = async () => {
        setLoading(true); // Set loading to true before API call
        const apiService = new ApiService(
            `${BASE_URL}/list-views/${object.name}`,
            { 'Content-Type': 'application/json' },
            'GET'
        );
        try {
            const response = await apiService.makeCall();
            setListViews(response.list_views); // Update state with fetched data
        } catch (error) {
            console.error("Error fetching list views:", error); // Log any errors
        } finally {
            setLoading(false); // Set loading to false after the API call
        }
    };
    useEffect(() => { 
        fetchListViews(); // Call the fetch function
    }, [object.name]); // Run effect when the object name changes

    const handleCloneClick =(record)=>{
      if (record) {
        // Clone the selected list view without the id and modify the name
        const clonedListView = {
          ...record, // clone the selected list view
          _id: undefined, // remove the id
          list_view_name: `Cloned by ${record.list_view_name}`, // replace name with the cloned name
        };
        console.log('Cloning selected list view:');
        console.log(clonedListView);
  
        // Show the drawer with the cloned list view
        showCreateListDrawer(clonedListView);
      }
    }

    // Define columns for the Ant Design Table
    const columns = [
        {
            title: 'List View Name',
            dataIndex: 'list_view_name', // Using the name from the response
            key: 'list_view_name',
        },
        {
            title: 'Object Name',
            dataIndex: 'object_name', // Using the name from the response
            key: 'object_name',
        },
       
        { 
            title: 'Fields to display',
            dataIndex: 'fields_to_display',
            key: 'fields_to_display',
            render: (fields) => fields.join(', '), // Join for display
          },
        {
            title: 'Filters',
            dataIndex: 'conditions', // Display filters
            key: 'conditions',
            render: (filters) => {
              // Check if filters is an object and has entries
              if (filters && typeof filters === 'object') {
                  return Object.entries(filters)
                      .map(([key, { field, value }]) => `${key}: ${field} : ${JSON.stringify(value)}`) // Adjusted to access field and value
                      .join(', ');
              }
              return ''; // Return an empty string if there are no filters
          }
        },
        {
          title: 'Logic for filters',
          dataIndex: 'logic_string', // Using sort_by from the response
          key: 'logic_string',
      },
        {
            title: 'Sort By',
            dataIndex: 'sort_by', // Using sort_by from the response
            key: 'sort_by',
        },
        {
            title: 'Sort Order',
            dataIndex: 'sort_order', // Using sort_order from the response
            key: 'sort_order',
        },
        {
            title: 'Created At',
            dataIndex: 'created_at', // Using created_at from the response
            key: 'created_at',
            render: (text) => new Date(text).toLocaleString() // Format the date
        },

    ];
    columns.push({
        title: 'Action',
        key: 'operation',
        render: (_, record) => (
          <>
            <Tooltip title="Edit"
              onClick={() => showCreateListDrawer(record)} // Pass the selected record to the drawer
>
              <EditOutlined
            
                style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip title="Clone">
              <CopyOutlined
                onClick={() => handleCloneClick(record)}
                style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this item?"
                
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined style={{  color: 'red',marginRight: 8, fontSize: '14px', cursor: 'pointer' }} />
              </Popconfirm>
            </Tooltip>
          </>
        ),
      });
  return (
    <div>
       <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
      <Col>
        <Title level={3} style={{ marginTop:'10px' }}>Create List Views</Title>
      </Col>
      <Col  style={{ marginTop:'10px' }}>
        <Button type="primary" onClick={showCreateListDrawer} style={{ marginBottom: 5 }}>
          Create List View
        </Button>
      </Col>
    </Row> 
      
    <CreateListViewDrawer
        visible={drawerVisible}
        onClose={closeCreateListDrawer}
        object={object}
        fetchListViews={fetchListViews}
        selectedListView={selectedListView} // Pass selected list view for editing

      />

            <Table
                dataSource={listViews}
                columns={columns}
                loading={loading} // Show loading state
                rowKey="id" // Adjust if you have a unique key for each item
                style={{ marginTop: 20 }} // Add margin for better spacing
            />

    </div>
  );
};

export default CreateListView;
