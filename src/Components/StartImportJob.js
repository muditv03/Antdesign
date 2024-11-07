import React, { useState } from "react";
import { Card, Button, message,Typography } from "antd";
import ApiService from '../apiService'; 
import { BASE_URL } from '../Constant';

const StartImport = ({bulkImportJobId}) => {
  const [loading, setLoading] = useState(false);

  const handleStartImport = async () => {
    setLoading(true);
    try {
      const apiService = new ApiService(`${BASE_URL}/start_job/${bulkImportJobId}`, {
        'Content-Type': 'application/json'
      }, 'POST'); 

      const response = await apiService.makeCall();
      message.success("Import started successfully");
      console.log(response);
    } catch (error) {
      message.error("Failed to start import");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px'}}>
        <Typography.Title level={4}>Start Importing</Typography.Title>
      </div>
      <div>
        <Button type="default"  loading={loading} onClick={handleStartImport}>
          Start Import
        </Button>
      </div>
    </Card>
  );
};

export default StartImport;
