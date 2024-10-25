import React, { useState, useEffect } from "react";
import { Button, Upload, Card, Row, Col, Table, Select, message,Typography } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams } from 'react-router-dom';
import ApiService from '../apiService'; // Import ApiService class
import { BASE_URL } from '../Constant';
import Papa from 'papaparse'; // Importing PapaParse for CSV parsing

const { Title } = Typography;


const UploadRecords = () => {
  const { objectName } = useParams(); // Extracting objectName from URL
  const [fileName, setFileName] = useState("");
  const [fieldsData, setFieldsData] = useState([]); // State to hold fields data
  const [csvColumns, setCsvColumns] = useState([]); // State to hold CSV column names
  const [mappings, setMappings] = useState({}); // State to hold column-field mappings

  // Sample picklist options for each field (ensure this matches actual field names)
  const picklistOptions = {
    Field1: ["Option1", "Option2", "Option3"], // Replace with actual field names
    Field2: ["Choice1", "Choice2", "Choice3"],
    // Add more fields and their options here
  };

  useEffect(() => {
    const fetchFields = async () => {
      const apiServiceForFields = new ApiService(
        `${BASE_URL}/mt_fields/object/${objectName}`,
        { 'Content-Type': 'application/json' },
        'GET'
      );

      const response = await apiServiceForFields.makeCall();
      const filteredFields = response.filter(field => 
        field.name !== 'recordCount' && 
        !field.is_formula && 
        !field.is_auto_number
      );
      console.log(response);
      setFieldsData(filteredFields);
    };

    fetchFields();
  }, [objectName]);

  // Function to handle file selection and parse CSV
  const handleFileChange = (info) => {
    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
      setFileName(file.name);

      // Use PapaParse to read the CSV file
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          // Extract column names from the CSV
          if (results.data.length > 0) {
            console.log('columns are');
            console.log(Object.keys(results.data[0]));
            setCsvColumns(Object.keys(results.data[0]));
          }
        },
      });
    } else {
      setFileName(""); // Reset if no file is selected
      setCsvColumns([]); // Reset CSV columns
    }
  };

  // Function to remove the selected file
  const handleRemoveFile = () => {
    setFileName(""); // Clear the file name
    setCsvColumns([]); // Clear CSV columns
    setMappings({}); // Clear mappings
  };

  // Function to handle mapping button click
  const handleMapping = () => {
    console.log("Mappings:");
    console.log(mappings);
    message.success('Mapping initiated! Check console for details.');
  };

  // Function to handle fuzzy matching
  const handleFuzzyMatch = () => {
    const newMappings = {};
    
    fieldsData.forEach(field => {
      const fieldName = field.name;

      // Check for matches between field names and CSV column names
      const matchedColumn = csvColumns.find(column => 
        column.toLowerCase().includes(fieldName.toLowerCase())
      );

      // If a match is found, update the mappings
      if (matchedColumn) {
        newMappings[fieldName] = matchedColumn; // Select the matched column
      }
    });

    // Update the mappings state
    setMappings(prevMappings => ({
      ...prevMappings,
      ...newMappings
    }));

    message.success('Fuzzy matching completed! Check the console for results.');
    console.log("Updated Mappings after Fuzzy Match:", newMappings);
  };

  // Prepare data for the table
  const tableData = fieldsData.map(field => ({
    key: field.name, // Use appropriate field property as key
    fieldName: field.name,
    picklist: picklistOptions[field.name] || [], // Ensure to match field names
  }));

  // Columns for the table
  const columns = [
    {
      title: 'Field Name',
      dataIndex: 'fieldName',
      key: 'fieldName',
    },
    {
      title: 'Picklist Options',
      dataIndex: 'picklist',
      key: 'picklist',
      render: (options, record) => (
        <Select
          allowClear
          showSearch
          placeholder="Select an option"
          value={mappings[record.fieldName]} // Set selected value from mappings
          onChange={(value) => {
            setMappings((prev) => ({
              ...prev,
              [record.fieldName]: value, // Map field name to selected value
            }));
          }}
          style={{ width: '100%' }}
        >
          {options.concat(csvColumns).map(option => ( // Include CSV columns in options
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Upload CSV for {objectName}</h1>

      <Card>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Upload
            beforeUpload={() => false} // Prevent automatic upload
            onChange={handleFileChange}
            showUploadList={false} // Hide default upload list
          >
            <Button icon={<UploadOutlined />} style={{ marginRight: "10px" }}>
              Upload CSV
            </Button>
          </Upload>

          {fileName && (
            <span style={{ display: "flex", alignItems: "center" }}>
              {fileName}
              <DeleteOutlined
                onClick={handleRemoveFile}
                style={{ marginLeft: "10px", cursor: "pointer", color: "red" }}
              />
            </span>
          )}
        </div>
      </Card>

      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={24}>
          <Card  style={{ height: 'auto', overflowY: 'auto' }}>
            <Row gutter={16} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',marginBottom:15

             }}>
                <Col flex="auto" style={{ textAlign: 'start' }}>
                <Title level={3} style={{ margin: 0 }}>Map CSV Columns with Fields</Title>
                </Col>
                <Col>
                <Button type="primary" onClick={handleFuzzyMatch} style={{ marginRight: 8 }}>
                    Fuzzy Match
                </Button>
                <Button type="primary" onClick={handleMapping}>
                    Insert Data
                </Button>
                </Col>
            </Row>
            <Table
              dataSource={tableData}
              columns={columns}
              pagination={false}
              rowKey="key"
            />

          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UploadRecords;
