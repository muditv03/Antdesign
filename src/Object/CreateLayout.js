import React, { useEffect, useState } from "react";
import ApiService from '../Components/apiService';
import { BASE_URL } from '../Components/Constant';
import { Table, Button, Typography, Checkbox,Row,Col,Tooltip,Popconfirm } from 'antd';
import { CopyOutlined, DeleteOutlined,EditOutlined} from '@ant-design/icons';
 
import LayoutEditor from "./LayoutEditor";
import dayjs from 'dayjs';


const { Title } = Typography;

const CreateLayout = ({ object }) => {
    const [layouts, setLayouts] = useState([]);
    const [showLayoutEditor, setShowLayoutEditor] = useState(false);
    const [fields, setFields] = useState({});
    const [selectedLayout, setSelectedLayout] = useState(null);
    const [isCloning, setIsCloning] = useState(false); // State for cloning


    // Fetch all layouts and fields for the given object
    const getAllLayouts = async () => {
        try {
            const apiService = new ApiService(`${BASE_URL}/get_by_objectName/${object.name}`, {}, 'GET');
            const fieldApiService = new ApiService(`${BASE_URL}/mt_fields/object/${object.name}`, {}, 'GET');
            const responseData = await apiService.makeCall();
            const fieldResponse = await fieldApiService.makeCall();
            const filteredFields =fieldResponse.filter(
                field => !['recordCount', 'CreatedBy', 'LastModifiedBy'].includes(field.name)
              );
 
            setLayouts(responseData);
            setFields(filteredFields);
        } catch (error) {
            console.error('Error fetching layouts or fields:', error);
        }
    };

    useEffect(() => {
        getAllLayouts();
    }, [object]);

    // Handle editing a layout
    const handleEditLayout = (layout,clone=false) => {
        setSelectedLayout(layout);
        setIsCloning(clone); 
        setShowLayoutEditor(true);
    };

    // Define columns for the table
    const columns = [
        {
            title: "Layout Name",
            dataIndex: "layout_name",
            key: "layout_name",
            render: (text, record) => (
                <a onClick={() => handleEditLayout(record)}>{text}</a>
            ), // Make layout name clickable
        },
        {
            title: "Active",
            dataIndex: "active",
            key: "active",
            render: (active) => <Checkbox checked={active} disabled />,
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            render:(text)=>dayjs(text).utc().format('DD/MM/YYYY HH:mm:ss')
        },

    ];

    columns.push({
        title: 'Action',
        key: 'operation',
        render: (_, layout) => (
          <>
           <Tooltip title="Edit">
            <EditOutlined
                onClick={() => handleEditLayout(layout,false)}
                style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
            />
            </Tooltip>                 
            
            <Tooltip title="Clone">
              <CopyOutlined
                onClick={() => handleEditLayout(layout,true)}
                style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this item?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => {
                  console.log('Confirm clicked'); // Add this line
                }
                }
    
              >
                <DeleteOutlined style={{ color: 'red', marginRight: 8, fontSize: '14px', cursor: 'pointer' }} />
              </Popconfirm>
            </Tooltip>
          </>
        ),
      });

    return (
        <div>
            {!showLayoutEditor ? (
                <div>
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>Layouts</Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            onClick={() => {
                                setSelectedLayout(null);
                                setIsCloning(false); 
                                setShowLayoutEditor(true);
                            }}
                        >
                            Create Layout
                        </Button>
                    </Col>
                </Row>

                    {/* Render layouts in a table */}
                    <Table
                        dataSource={layouts}
                        columns={columns}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            ) : (
                <LayoutEditor
                    object={object.name}
                    fields={fields}
                    Editinglayout={selectedLayout}
                    getAllLayouts={getAllLayouts}
                    isCloning={isCloning}
                    onBack={() => setShowLayoutEditor(false)}
                />
            )}
        </div>
    );
};

export default CreateLayout;
