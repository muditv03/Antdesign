


import React, { useState } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppHeader from './Header';
import AppSidebar from './Sidebar';
import DataTable from './DataTable';
import ObjectSetupDetail from './ObjectSetupDetail';
import ObjectFieldDetail from './ObjectFieldDetail';
import RecordComponent from './Components/recordComponent';
import AppFooter from './Footer';  // Import the footer component
import Profile from './Profile';  // Import the Profile component
const { Content } = Layout;

const App = () => {
  const [sidebarWidth, setSidebarWidth] = useState('80px'); // Default to collapsed width

  const handleSidebarToggle = (width) => {
    setSidebarWidth(width);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Router>
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <AppHeader />
        <Layout style={{ display: 'flex', height: 'calc(100vh - 64px)', flexDirection: 'column' }}>
          <Layout style={{ flex: 1, display: 'flex' }}>
            <AppSidebar
              onSidebarToggle={handleSidebarToggle}
              collapsedWidth="80px"
              expandedWidth="20%" // Use 20% width for expanded sidebar
            />
            <Content
              style={{
                marginLeft: sidebarWidth,
                transition: 'margin-left 0.2s',
                flexGrow: 1,
                height: '100%', // Ensure content uses full height
                overflow: 'auto', // Enable scrolling if content overflows
                padding: '20px',
              }}
            >
              <Routes>
                <Route path="/object-setup" element={<DataTable />} />
                <Route path="/object-setup/:id" element={<ObjectFieldDetail />} />
                <Route path="/record/:objectid/:objectName/:id" element={<RecordComponent />} />
                <Route path="/object/:id" element={<ObjectSetupDetail />} />
                <Route path="/object-profile" element={<Profile />} /> 
                {/* Add more routes as needed */}
              </Routes>
             
           
     

            </Content>
          </Layout>
          <AppFooter />  {/* Add the footer component here */}
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;




