


import React, { useState } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import AppHeader from './Header';
import AppSidebar from './Sidebar';
import DataTable from './DataTable';
import ObjectSetupDetail from './ObjectSetupDetail';
import ObjectFieldDetail from './ObjectFieldDetail'; // Import the new component
import RecordComponent from  './Components/recordComponent';
import RecordDetail from  './RecordDetailPage';
import AppFooter from './Footer';  // Import the footer component
import Profile from './Profile';  // Import the Profile component

const { Content } = Layout;

const App = () => {
  const location = useLocation();
  
  const [sidebarWidth, setSidebarWidth] = useState('80px'); // Default to collapsed width

  const handleSidebarToggle = (width) => {
    setSidebarWidth(width);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check if the current path is login, signup, or forgot-password
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname.toLowerCase());

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {!isAuthPage && <AppHeader />} {/* Conditionally render header */}
      {!isAuthPage && <AppSidebar />} {/* Conditionally render sidebar */}
       
      <Layout style={{ marginLeft: !isAuthPage ? '80px' : '0', marginTop: !isAuthPage ? '64px' : '0', overflow: 'hidden' }}>
        <Content style={{ padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/object-setup" element={<DataTable />} />
            <Route path="/object-setup/:id" element={<ObjectFieldDetail />} />
            <Route path="/record/:objectid/:objectName/:id" element={<RecordDetail />} />

            <Route path="/object/:id" element={<ObjectSetupDetail />} /> {/* Add route for ObjectSetupDetail */}

            {/* Add more routes as needed */}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;

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





