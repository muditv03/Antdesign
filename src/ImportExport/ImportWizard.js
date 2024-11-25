// UploadRecords.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Table, Tooltip } from "antd";
import { UploadOutlined, SyncOutlined } from "@ant-design/icons";
import axios from "axios";
import ApiService from '../Components/apiService';
import { BASE_URL } from '../Components/Constant';

const { Title } = Typography;

const Import = () => {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState([]);

  const handleStartImport = () => {
    navigate("/import/new-import");
  };

  // Fetch job data from API
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const apiService = new ApiService(`${BASE_URL}/get_all_jobs`, {
          'Content-Type': "application/json"
        }, 'GET');

        const response = await apiService.makeCall();

        setJobData(response);
      } catch (error) {
        console.error("Error fetching job data:", error);
      }
    };

    fetchJobData();
  }, []);

  const columns = [
    { title: "Job ID", dataIndex: "job_id", key: "job_id" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Total Records", dataIndex: "total_records", key: "total_records" },
    { title: "Successful Records", dataIndex: "successful_records", key: "successful_records" },
    { title: "Pending Records", dataIndex: "pending_records", key: "pending_records" },
    { title: "Total Chunks", dataIndex: "total_chunks", key: "total_chunks" },
    { title: "Processed Chunks", dataIndex: "processed_chunks", key: "processed_chunks" },
    { title: "Pending Chunks", dataIndex: "pending_chunks", key: "pending_chunks" },
    {
      title: "Errors",
      dataIndex: "errors",
      key: "errors",
      render: (errors) =>
        errors.length ? (
          <Tooltip
            title={errors.map((error, index) => (
              <div key={index}>
                Row {error.row_number}: {error.messages.join(", ")}
              </div>
            ))}
          >
            <span>{errors.length} errors</span>
          </Tooltip>
        ) : (
          "No errors"
        ),
    },
  ];

  return (
    <div style={styles.container}>
      <Title level={3} style={styles.heading}>Imports</Title>
      <div style={styles.cardsContainer}>
        <Card style={styles.card} hoverable onClick={handleStartImport}>
          <UploadOutlined style={styles.icon} />
          <h3>Import</h3>
          <p>Import contact, company, deal, ticket, or product information into the CRM.</p>
          <Button type="primary" style={styles.button}>Start an Import</Button>
        </Card>

        <Card style={styles.card} hoverable>
          <SyncOutlined style={styles.icon} />
          <h3>Sync</h3>
          <p>Sync data between the CRM and other apps.</p>
          <Button type="primary" style={styles.button}>Set up a Sync</Button>
        </Card>
      </div>

      <div style={styles.tableContainer}>
        <Title level={4}>Past Imports</Title>
        <Table columns={columns} dataSource={jobData} rowKey="job_id" pagination={false} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
  },
  heading: {
    fontWeight: "bold",
    marginBottom: "20px",
  },
  cardsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
  },
  card: {
    width: 300,
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    padding: "20px",
  },
  icon: {
    fontSize: "48px",
    color: "#1890ff",
    marginBottom: "10px",
  },
  button: {
    marginTop: "20px",
  },
  tableContainer: {
    width: "100%",
    marginTop: "40px",
  },
};

export default Import;
