import React,{useState,useEffect} from "react";
import ApiService from '../Components/apiService';
import { BASE_URL } from '../Components/Constant';
import { Table, Button, Typography, Checkbox,Row,Col,Tooltip,Popconfirm } from 'antd';
import { CopyOutlined, DeleteOutlined,EditOutlined } from '@ant-design/icons';
import CompactLayoutEditor from "./CompactLayoutEditor";
const { Title } = Typography;
  
const CompactLayout=({object})=>{

    const [allcompactLayout,setAllCompactLayout]=useState([]);
    const [fields,setFields]=useState({});
    const [selectedCompactLayout, setSelectedCompactLayout] = useState(null);
    const [showCompactLayoutEditor, setShowCompactLayoutEditor] = useState(false);


    useEffect(() => {
        fetchCompactLayout();
    }, [object]);

    const fetchCompactLayout=async()=>{

        try {
            const apiService = new ApiService(`${BASE_URL}/get_compact_layout/${object.name}`, {}, 'GET');
            const fieldApiService = new ApiService(`${BASE_URL}/mt_fields/object/${object.name}`, {}, 'GET');
            const responseData = await apiService.makeCall();
            const fieldResponse = await fieldApiService.makeCall();
            const filteredFields =fieldResponse.filter(
                field => !['recordCount'].includes(field.name)
              );
            
            setAllCompactLayout(responseData);
            setFields(filteredFields);
        } catch (error) {
            console.error('Error fetching layouts or fields:', error);
        }

    }

    const handleEditCompactLayout=(layout)=>{
        setSelectedCompactLayout(layout); // Set the selected layout
        setShowCompactLayoutEditor(true); // Show the editor
    }


    const columns = [
        {
            title: "Object Name",
            dataIndex: "object_name",
            key: "object_name",
            render: (text, record) => (
                <a onClick={() => handleEditCompactLayout(record)}>{text}</a>
            )
        },
        {
            title: "Title Field",
            dataIndex: "title_field",
            key: "title_field",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
       
        {
            title: "Layout Fields",
            dataIndex: "layout_fields",
            key: "layout_fields",
            render: (_, record) => (
                <>
                    {record.layout_fields &&
                        record.layout_fields.map((field, index) => (
                            <div key={index}>
                                <strong>{field.display_label}</strong>: {field.field_name} (Order: {field.order})
                            </div>
                        ))}
                </>
            ),
        },


    ];

    columns.push({
        title: 'Action',
        key: 'operation',
        render: (_, layout) => (
          <>
          <Tooltip title="Edit">
            <EditOutlined
                onClick={() => handleEditCompactLayout(layout)}
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


      return(

        <div>
          {!showCompactLayoutEditor ? (
        <div>

            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>Compact Layouts</Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            onClick={() => {
                                setSelectedCompactLayout(null);
                                setShowCompactLayoutEditor(true);
                            }}
                        >
                            Create Compact Layout
                        </Button>
                    </Col>
                </Row>

                    {/* Render layouts in a table */}
                    <Table
                        dataSource={allcompactLayout}
                        columns={columns}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                        fetchCompactLayout={fetchCompactLayout}
                    />


        </div>
          ) : (
            <CompactLayoutEditor
                object={object.name}
                fields={fields}
                selectedLayout={selectedCompactLayout}
                fetchCompactLayout={fetchCompactLayout}
                onBack={() => setShowCompactLayoutEditor(false)}
            />
        )}

        </div>


      );



}

export default CompactLayout;