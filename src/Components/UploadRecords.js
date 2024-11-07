import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Affix, Select, Steps,Upload,message, Checkbox } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';
import Papa from 'papaparse'; // Importing PapaParse for CSV parsing
import MapContent from './MapContent';
import StartImport from './StartImportJob';

 
const { Step } = Steps;

const UploadRecords = () => {

  const navigate = useNavigate();
  const { Option } = Select;


  const [currentStep, setCurrentStep] = useState(0);
  const [selectedObject, setSelectedObject] = useState(null);
  const [objects, setObjects] = useState([]);
  const [fileName, setFileName] = useState("");
  const [csvData, setCsvData] = useState([]); // State to store parsed CSV data
  const [csvColumns, setCsvColumns] = useState([]); // State to hold CSV column names
  const [importMethod,setImportMethod]=useState(`Create and update ${selectedObject}`);
  const [uploadedCSVID,setUploadedCSVID]=useState(null);
  const [mappedData, setMappedData] = useState([]);
  const [unmappedCount, setUnMappedCount] = useState(0);
  const [importReady,setImportReady]=useState(false);
  const [bulkImportJobId,setBulkImportJobId]=useState(null);

  // Fetch objects from the API when the component mounts
  useEffect(() => {
    const fetchObjects = async () => {
      const apiService = new ApiService(`${BASE_URL}/mt_objects`, {
        'Content-Type': 'application/json'
      }, 'GET'); 

      const response = await apiService.makeCall();
      setObjects(response); // Assuming 'data' is an array of objects
    };
    fetchObjects();
  }, []);

  const handleFileChange = async(info) => {
    console.log('file is ');
    console.log(info.file);
    const formData = new FormData();
    formData.append('file', info.file);

    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
        try{
            const apiService = new ApiService(`${BASE_URL}/csv_upload`, {
                'Content-Type':  "application/x-www-form-urlencoded"
            }, 'POST',formData); 

            const response = await apiService.makeCall();
            setFileName(file.name);
            message.success('File uploaded successfully');
            setUploadedCSVID(response.file_id);
            console.log(response);
        }
        catch(error){

            const errorMessage = error && typeof error === 'object'
            ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
            : 'Failed to save field due to an unknown error';
            message.error(errorMessage);
            console.log(error);
            
        }

    } else {
      setFileName(""); // Reset if no file is selected\
    }
  };

  const handleRemoveFile = () => {
    setFileName(""); // Clear the file name
    setCsvColumns([]); // Clear CSV columns

  };
  const handleNext = async () => {
    if (currentStep === 2) {
      try {
        console.log('mapped data is ');
        console.log(mappedData);
        // Callout to update CSV mappings
        const filteredMappings = mappedData.reduce((acc, item) => {
            if (item.field !== null) { // Only include mappings with non-null fields
              acc[item.header] = item.field;
            }
            return acc;
          }, {});
        const mappingPayload = {
          bulk_import_job: {
            object_name:selectedObject,
            file_id: uploadedCSVID,
            mappings: filteredMappings
          }
        };
        
        const apiService = new ApiService(`${BASE_URL}/csv_mappings`, {
          'Content-Type': 'application/json'
        }, 'POST', mappingPayload);
        
        const response=await apiService.makeCall();
        message.success("CSV mappings updated successfully.");
        console.log(response);
        setBulkImportJobId(response.bulk_import_job_id);
  
        // Add any additional callouts here if needed
  
        // Move to the next step
        setCurrentStep(currentStep + 1);
      } catch (error) {
        message.error("Failed to update CSV mappings.");
        console.error(error);
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  


  const handleCancel=()=>{
    navigate('/import');
  }


  const handleSelect = (value) => {
    console.log('handle select is called');
    console.log(value);
    setSelectedObject(value);
  };


  const handleImportMethod =(value)=>{
    setImportMethod(value);
  }

  const handleDownloadCSV=async()=>{
    
    try{
        const apiService = new ApiService(`${BASE_URL}/csv_download/${uploadedCSVID}`, {
            'Content-Type':  "application/json"
        }, 'GET'); 

        const response = await apiService.makeCall();

        // Check if the response is in Blob format
        const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' }); // Adjust MIME type as needed
        const url = window.URL.createObjectURL(blob); // Create a Blob URL
        const a = document.createElement('a'); // Create a temporary anchor element
        a.href = url; // Set the href to the Blob URL
        a.download = `${selectedObject}.csv`; // Set the filename for download
        document.body.appendChild(a); // Append anchor to the body
        a.click(); // Programmatically click the anchor to trigger the download
        a.remove(); // Remove the anchor from the document
        window.URL.revokeObjectURL(url); // Free up memory


        message.success('File downloaded successfully');
        console.log('download api called');
        console.log(response);
    }
    catch(error){

        const errorMessage = error && typeof error === 'object'
        ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ')
        : 'Failed to save field due to an unknown error';
        message.error(errorMessage);
        console.log(error);
        
    }

  }

  useEffect(() => {
    setImportMethod(`Create and update ${selectedObject}`);
  }, [selectedObject]);

  const handleMappedDataChange = (data, count) => {
    setMappedData(data);
    setUnMappedCount(count);
    if(count===0){
      setImportReady(true);
    }else{
      setImportReady(false);

    }

};
  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
            <Typography.Title level={4}>What kind of data is in your file?</Typography.Title>
            <Select
              allowClear
              placeholder="Select an object"
              style={{ width: '50%', minWidth: '300px', marginTop: '20px' }} // Centered width
              value={selectedObject}
              onChange={(e)=>handleSelect(e)}
            >
                 {objects.map((object) => (
                    <Option key={object.id} value={object.name}>
                      {object.name}
                    </Option>
                  ))}

            </Select>
          </Card>
        );
      case 1:
        return (
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '70vh', justifyContent: 'center' }}>
              <Typography.Title level={4} style={{ textAlign: 'center',marginTop:'5px' }}>
                Upload CSV for {selectedObject}
              </Typography.Title>
          
              <div style={{ display: "flex", flexDirection: 'column', alignItems: 'center', marginTop: '40px', width: '100%' }}>
                <Typography.Text strong style={{ textAlign: 'center' }}>{selectedObject} file</Typography.Text>
                {!fileName ? (
                  <Upload
                    beforeUpload={() => false} // Prevent automatic upload
                    onChange={handleFileChange}
                    showUploadList={false} // Hide default upload list
                  >
                    <Button icon={<UploadOutlined />} style={{ marginTop: "10px" }}>
                      Upload CSV
                    </Button>
                  </Upload>
                ) : (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px dashed #d9d9d9",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    backgroundColor: "#fafafa",
                    width: "100%",
                    justifyContent: "space-between",
                    marginTop: "10px"
                  }}>
                    <span>{fileName}</span>
                    <DeleteOutlined
                      onClick={handleRemoveFile}
                      style={{ cursor: "pointer", color: "red" }}
                    />
                  </div>
                )}
              </div>
          
              <div style={{ marginTop: "50px", width: "100%", textAlign: 'center' }}>
                <Typography.Text strong>Choose how to import for {selectedObject}</Typography.Text>
                <Select
                  value={importMethod}
                  onChange={(e) => handleImportMethod(e)}
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  <Option value={`Create and update ${selectedObject}`}>
                    Create and update {selectedObject}
                  </Option>
                  <Option value={`Create new ${selectedObject} only`}>
                    Create new {selectedObject} only
                  </Option>
                  <Option value={`Update existing ${selectedObject} only`}>
                    Update existing {selectedObject} only
                  </Option>
                </Select>

                <Button 
                    variant="outlined"
                    style={{ marginTop: '20px' }} 
                    onClick={handleDownloadCSV} 
                    disabled={!fileName} // Disable if no file is uploaded
                >
                    Download Uploaded CSV
            </Button>
              </div>

           
            </Card>
          );
          
      case 2:
        return  <MapContent uploadedCSVID={uploadedCSVID} object={selectedObject} onDataChange={handleMappedDataChange}/>;
      case 3:
        return   <StartImport bulkImportJobId={bulkImportJobId}></StartImport>
        ;
      default:
        return null;
    }
  };

  return (
    <div>
      <Card>
        {/* Breadcrumb/Timeline for Steps */}
        <Steps current={currentStep} style={{ margin: '20px 0' }}>
          <Step title="Type" />
          <Step title="Upload" />
          <Step title="Map" />
          <Step title="Details" />
        </Steps>

        {/* Content based on current step */}
        {renderContent()}

        {/* Footer with buttons */}
        <Affix offsetBottom={0}>
          <div
            style={{
              width: '90%', 
              height: '10vh',
              padding: '10px 0',
              background: '#f0f2f5',
              position: 'fixed',
              bottom: 0,
              left: 110,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ justifyContent: 'start' }}>
            {currentStep >= 1 && (
                <Button 
                  danger 
                  style={{ margin: '0 10px' }} 
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}
              <Button style={{ margin: '0 10px' }} onClick={handleCancel}>
                Cancel
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center',flexDirection:'row',padding:'auto',margin:'auto' }}>
                { currentStep===2 &&  (
                    <div style={{display:'flex',flexDirection:'column',justifyContent: 'flex-end', marginRight: '10px' ,marginBottom:'10px'}}>
                    <h3 style={{ marginRight: '10px', marginBottom: 0,textAlign: 'right' }}>You have {unmappedCount} unmapped columns</h3>
                    <Checkbox checked={importReady} onChange={(e)=>setImportReady(e.target.checked)}>Don't import data in unmapped columns</Checkbox>
                    </div>  
                )}

                    <Button
                        type="primary"
                        onClick={handleNext}
                        style={{marginRight:'10px'}}
                        disabled={(currentStep === 0 && !selectedObject) || (currentStep === 1 && !fileName) || ((currentStep === 2 && !importReady) || (currentStep===3))}
                    >
                        Next
                    </Button>
                </div>
    
            </div>


          </div>
        </Affix>
      </Card>
    </div>
  );
};

export default UploadRecords;
