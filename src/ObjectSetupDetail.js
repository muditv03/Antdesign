// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { Table, Typography, Button, Row, Col, Drawer, Form, Input, DatePicker, message, Card, Flex, Checkbox } from 'antd';
// import { useNavigate } from 'react-router-dom';

// const { Title } = Typography;

// const ObjectSetupDetail = () => {
//   const { id } = useParams(); 
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [objectName, setObjectName] = useState(null);
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const [fieldsData, setFieldsData] = useState([]); // State to store fields data from API response
//   const [form] = Form.useForm();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchRecords = async () => {
//       try {
//         const response = await axios.get(`http://localhost:3000/mt_objects/${id}`);
//         const objName = response.data.name;
//         const records = await axios.get(`http://localhost:3000/fetch_records/${objName}`);
//         setRecords(records.data); 
//         setObjectName(response.data.label);
//       } catch (err) {
//         setError(err.response.data.error || 'Error fetching records');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRecords();
//   }, [id]);

//   const handleCreateClick = async () => {
//     setDrawerVisible(true); 
//     try {
//       const response = await axios.get(`http://localhost:3000/mt_fields/object/${id}`);
//       console.log(`res data -> `, response.data)
//       setFieldsData(response.data); // Store the response in state
//     } catch (error) {
//       console.error('Error fetching API response:', error);
//     }
//   };

//   const handleFinish = async (values) => {
//     console.log(objectName);
//     console.log('Form Values:', values);
//     const body = {
//       "object_name": objectName,
//       "data": {
//         ...values, // Spread the values object directly into the data field
//       }
//     };
  
//     console.log('Final Body:', JSON.stringify(body, null, 2));
//     try {
//          const response = await axios.post('http://localhost:3000/insert_or_update_records', 
//            body
//          );
//          window.location.reload();
//          console.log('Response:', response.data);
  
//       message.success('Record created successfully');
//       setDrawerVisible(false);
//       form.resetFields();
//     } catch (error) {
//       console.error('Error creating object:', error);
//       message.error('Failed to create object');
//     }
//   };

//   const handleLabelClick = (record) => {
//     if (record._id) {
//       navigate(`/record/${id}/${objectName}/${record._id}`, { state: { record } });
//     } else {
//       console.error("Record ID is undefined");
//     }
//   };

//   // Function to render the appropriate input based on the field type
//   const renderFormItem = (field) => {
//     switch (field.type) {
//       case 'String':
//         return (
//           <Form.Item
//             key={field.name} // Use a unique key for each form item
//             name={field.name}
//             label={field.label}
//             rules={[{ required: field.required, message: `Please enter ${field.label}` }]}
//           >
//             <Input placeholder={`Enter ${field.label}`} />
//           </Form.Item>
//         );
//       case 'Integer':
//         return (
//           <Form.Item
//             key={field.name}
//             name={field.name}
//             label={field.label}
//             rules={[{ required: field.required, type: 'InputNumber', message: `Please enter a valid ${field.label}` }]}
//           >
//             <Input type="InputNumber" placeholder={`Enter ${field.label}`} />
//           </Form.Item>
//         );
//       case 'Boolean':
//         return (
//           <Form.Item
//             key={field.name}
//             name={field.name}
//             // label={field.label}
//             valuePropName="checked"
//             rules={[{ required: field.required, message: `Please select ${field.label}` }]}
//             wrapperCol={{
//               offset: 0,
//               span: 1,
//             }}
//           >
//             <Checkbox>{field.label}</Checkbox>
//             {/* <Input type="checkbox" /> */}
//           </Form.Item>
//         );
//       // Add more cases as needed based on the possible field types
//       default:
//         return (
//           <Form.Item
//             key={field.name}
//             name={field.name}
//             label={field.label}
//             rules={[{ required: field.required, message: `Please enter ${field.label}` }]}
//           >
//             <Input placeholder={`Enter ${field.label}`} />
//           </Form.Item>
//         );
//     }
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   const columns = [
//     {
//       title: 'ID',
//       dataIndex: '_id',
//       key: '_id',
//       render: (text, record) => (
//         <a onClick={() => handleLabelClick(record)}>{text}</a>
//       ),
//     },
//     {
//       title: 'Name',
//       dataIndex: 'Name',
//       key: 'Name',
//     },
//   ];

//   return (
//     <div>
//       <Row justify="space-between" align="middle">
//         <Col>
//           <Title level={3}>Records for {objectName}</Title>
//         </Col>
//         <Col>
//           <Button type="primary" onClick={handleCreateClick}>
//             Create+
//           </Button>
//         </Col>
//       </Row>
//       <Table columns={columns} dataSource={records} rowKey="_id" />

//       <Drawer
//         title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>Create New Record</div>}
//         width="40%"
//         onClose={() => setDrawerVisible(false)}
//         visible={drawerVisible}
//         bodyStyle={{ paddingBottom: 80 }}
//         headerStyle={{
//           padding: '20px 16px',
//           background: '#20b2aa',
//           borderBottom: '1px solid #e8e8e8',
//         }}
//         footer={
//           <div
//             style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               padding: '16px 16px',
//               background: '#f0f2f5',
//               borderTop: '1px solid #e8e8e8',
//             }}
//           >
//             <Button onClick={() => setDrawerVisible(false)} style={{ height: '47px', width: '120px', fontSize: '18px' }}>
//               Cancel
//             </Button>
//             <Button 
//               onClick={() => form.submit()} 
//               type="primary" 
//               style={{ 
//                 height: '47px', 
//                 width: '120px', 
//                 fontSize: '18px', 
//                 backgroundColor: 'white', 
//                 color: '#1890ff', 
//                 border: '1px solid #1890ff' 
//               }}
//             >
//               Save
//             </Button>
//           </div>
//         }
//         footerStyle={{ textAlign: 'right', padding: '0' }}
//       >
//         <Card
//           style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
//         >
//           <Form
//             form={form}
//             layout="vertical"
//             hideRequiredMark
//             onFinish={handleFinish}
//             style={{ fontSize: '16px' }}
//           >
//               {fieldsData?.map((field) => renderFormItem(field))} {/* Render form items dynamically */}
//           </Form>
//         </Card>
//       </Drawer>
//     </div>
//   );
// };

// export default ObjectSetupDetail;



import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Typography, Button, Row, Col, Drawer, Form, Input, message, Card, Checkbox, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Content, Sider } = Layout;

const ObjectSetupDetail = () => {
  const { id } = useParams(); 
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [objectName, setObjectName] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [fieldsData, setFieldsData] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/mt_objects/${id}`);
        const objName = response.data.name;
        const records = await axios.get(`http://localhost:3000/fetch_records/${objName}`);
        setRecords(records.data); 
        setObjectName(response.data.label);
      } catch (err) {
        setError(err.response.data.error || 'Error fetching records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [id]);

  const handleCreateClick = async () => {
    setDrawerVisible(true); 
    try {
      const response = await axios.get(`http://localhost:3000/mt_fields/object/${id}`);
      setFieldsData(response.data); 
    } catch (error) {
      console.error('Error fetching API response:', error);
    }
  };

  const handleFinish = async (values) => {
    const body = {
      "object_name": objectName,
      "data": {
        ...values,
      }
    };
    try {
      const response = await axios.post('http://localhost:3000/insert_or_update_records', body);
      window.location.reload();
      message.success('Record created successfully');
      setDrawerVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating object:', error);
      message.error('Failed to create object');
    }
  };

  const handleLabelClick = (record) => {
    if (record._id) {
      navigate(`/record/${id}/${objectName}/${record._id}`, { state: { record } });
    } else {
      console.error("Record ID is undefined");
    }
  };

  const renderFormItem = (field) => {
    switch (field.type) {
      case 'String':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `Please enter ${field.label}` }]}
          >
            <Input placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );
      case 'Integer':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, type: 'InputNumber', message: `Please enter a valid ${field.label}` }]}
          >
            <Input type="InputNumber" placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );
      case 'Boolean':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            valuePropName="checked"
            rules={[{ required: field.required, message: `Please select ${field.label}` }]}
            wrapperCol={{
              offset: 0,
              span: 1,
            }}
          >
            <Checkbox>{field.label}</Checkbox>
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `Please enter ${field.label}` }]}
          >
            <Input placeholder={`Enter ${field.label}`} />
          </Form.Item>
        );
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      render: (text, record) => (
        <a onClick={() => handleLabelClick(record)}>{text}</a>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        {/* Sidebar content */}
      </Sider>
      <Layout style={{ overflow: 'hidden' }}>
        <Content style={{ padding: '24px', minHeight: '100vh', overflowY: 'auto' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3}>Records for {objectName}</Title>
            </Col>
            <Col>
              <Button type="primary" onClick={handleCreateClick}>
                Create+
              </Button>
            </Col>
          </Row>
          <Table columns={columns} dataSource={records} rowKey="_id" />
        </Content>
      </Layout>

      <Drawer
        title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>Create New Record</div>}
        width="40%"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        headerStyle={{
          padding: '20px 16px',
          background: '#20b2aa',
          borderBottom: '1px solid #e8e8e8',
        }}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 16px',
              background: '#f0f2f5',
              borderTop: '1px solid #e8e8e8',
            }}
          >
            <Button onClick={() => setDrawerVisible(false)} style={{ height: '47px', width: '120px', fontSize: '18px' }}>
              Cancel
            </Button>
            <Button 
              onClick={() => form.submit()} 
              type="primary" 
              style={{ 
                height: '47px', 
                width: '120px', 
                fontSize: '18px', 
                backgroundColor: 'white', 
                color: '#1890ff', 
                border: '1px solid #1890ff' 
              }}
            >
              Save
            </Button>
          </div>
        }
        footerStyle={{ textAlign: 'right', padding: '0' }}
      >
        <Card
          style={{ margin: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            hideRequiredMark
            onFinish={handleFinish}
            style={{ fontSize: '16px' }}
          >
              {fieldsData?.map((field) => renderFormItem(field))}
          </Form>
        </Card>
      </Drawer>
    </Layout>
  );
};

export default ObjectSetupDetail;
