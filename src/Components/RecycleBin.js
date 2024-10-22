import React, { useState,useEffect } from "react";
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';
import { Table, Form, Card, Button, Row, Col, Typography, Tabs, Tooltip,Popconfirm,message } from 'antd';

import {RedoOutlined,DeleteOutlined,QuestionCircleOutlined,QuestionOutlined} from '@ant-design/icons';
const {Title}=Typography;


const Recyclebin =()=>{

    const [deletedFields,setDeletedFields]=useState([]);
    const [loading,setLoading]=useState('false');


    const fetchDeleteFields = async () => {
        setLoading(true); // Set loading to true before API call
        const apiService = new ApiService(
            `${BASE_URL}/deleted_fields`,
            { 'Content-Type': 'application/json' },
            'GET'
        );
        try {
            const response = await apiService.makeCall();
            setDeletedFields(response); // Update state with fetched data
        } catch (error) {
            console.error("Error fetching list views:", error); // Log any errors
        } finally {
            setLoading(false); // Set loading to false after the API call
        }
    };


    useEffect(() => { 
        fetchDeleteFields(); 
    }, []); 
 
    const handleRestore=async(field)=>{

        console.log(field.field_id);
        try {
            // Create ApiService instance for DELETE request
            const apiService = new ApiService(
              `${BASE_URL}/${field.field_id}/restore`,
              {}, // Headers (if any)
              'POST'
            );
        
            await apiService.makeCall();
            message.success('Field restored successfully.');
            fetchDeleteFields();
          } catch (error) {
            message.error('Failed to restore field.');
            console.error('Error deleting record:', error);
          }

    }
    const columns = [
        {
            title: 'Field API Name',
            dataIndex: 'field_name', // Using the name from the response
            key: 'field_name',
        },
        {
            title: 'Object Name',
            dataIndex: 'object_name', // Using the name from the response
            key: 'object_name',
        },
    ];
    columns.push({
        title: 'Action',
        key: 'operation',
        render: (_, record) => (
          <>
            <Tooltip title="Restore"
              onClick={() => handleRestore(record)}>
              <RedoOutlined 
                style={{ marginRight: 8, fontSize: '14px', cursor: 'pointer' }}
              />
            </Tooltip>

            <Tooltip title="Fields will automatically delete after 7 days ">
              <QuestionCircleOutlined 
                style={{ marginRight: 8, fontSize: '16px', cursor: 'pointer' }}
              />
            </Tooltip>
           
           
          </>
        ),
      });



      return (
        <div>
           <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
          <Col>
            <Title level={3} style={{ marginTop:'10px' }}>Deleted Fields</Title>
          </Col>
          <Col style={{ marginTop:'10px' }}>
           
          </Col>
        </Row> 
            <Table
                dataSource={deletedFields}
                columns={columns}
                loading={loading} // Show loading state
                rowKey="id" // Adjust if you have a unique key for each item
                style={{ marginTop: 20 }} // Add margin for better spacing
            />

    </div>
  );    
};

export default Recyclebin;