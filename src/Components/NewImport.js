import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Button, Affix } from "antd";
import { FileOutlined } from "@ant-design/icons";

const { Title, Text, Link } = Typography;

const NewImport = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null); // State to track the selected card

  const handleCardSelect = (card) => {
    setSelectedCard(card); // Update the selected card state
  };

  const handleNext = () => {
    // Handle next button logic here, e.g., navigating to the next step
    navigate('/import/new-import/standard'); // Adjust this path as needed
  };

  const handleCancel=()=>{
    navigate('/import');
  }

  return (
    <div style={styles.container}>
      <Title level={3} style={styles.heading}>How would you like to start?</Title>

      <div style={styles.cardsContainer}>
        <Card
          style={selectedCard === 'importFile' ? styles.cardSelected : styles.card} // Apply selected styles conditionally
          hoverable
          onClick={() => handleCardSelect('importFile')}
        >
          <div style={styles.circleContainer(selectedCard === 'importFile')}>
            <div style={styles.circle(selectedCard === 'importFile')} />
          </div>
          <FileOutlined style={styles.icon} />
          <h3>Import file from computer</h3>
          <p>Upload any CSV, XLS, or XLSX files with contact, company, deal, ticket, and product information.</p>
        </Card>
      </div>

      <div style={styles.helpContainer}>
        <Text>Need help getting started?</Text> &nbsp;
        <Link href="#">View import guide</Link> &nbsp;|&nbsp;
        <Link href="#">Download sample spreadsheet</Link> &nbsp;|&nbsp;
        <Link href="#">View the FAQ</Link>
      </div>

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
          <Button style={{ margin: '0 10px' }} onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            style={{ margin: '0 10px' }} 
            onClick={handleNext} 
            disabled={!selectedCard} // Disable button if no card is selected
          >
            Next
          </Button>
        </div>
      </Affix>

    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  heading: {
    fontWeight: "bold",
    marginBottom: "30px",
  },
  cardsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
  },
  card: {
    width: 300,
    textAlign: "center",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    position: "relative", // Enable positioning for the circle
  },
  cardSelected: {
    width: 300,
    textAlign: "center",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)", // Change shadow when selected
    border: "2px solid #1890ff", // Add border when selected
    position: "relative", // Enable positioning for the circle
  },
  icon: {
    fontSize: "48px",
    color: "#1890ff",
    marginBottom: "10px",
  },
  helpContainer: {
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "40px",
  },
  circleContainer: (isSelected) => ({
    width: 30, // Size of the outer circle
    height: 30,
    borderRadius: "50%",
    backgroundColor: isSelected ? "white" : "transparent", // White background when selected
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 10,
    right: 10,
    border: "2px solid #1890ff", // Border color for the outer circle
  }),
  circle: (isSelected) => ({
    width: 20, // Size of the inner circle
    height: 20,
    borderRadius: "50%",
    backgroundColor: isSelected ? "green" : "transparent", // Change color based on selection
  }),
};

export default NewImport;
