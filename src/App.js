//App.js

import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Routes, useLocation,useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import AppHeader from './Header';
import AppSidebar from './Sidebar';
import DataTable from './ObjectSetupView';
import ObjectSetupDetail from './ObjectSetupDetail';
import ObjectFieldDetail from './ObjectDetail';
import AppFooter from './Footer';  // Import the footer component
import Profile from './Profile';  // Import the Profile component
import RecordDetail from './RecordDetailPage';
import ErrorPage from './Error'
import ForbiddenError from './Error-403'
import NotFoundError from './Error-404'
import InternalServerError from './Error-500'
import UnprocessableEntity from './Error-422';
import SetupPage from './Components/Setup';
import Home from './Components/Home';
import Cookies from 'js-cookie';

   
const { Content } = Layout;
  
// Define the sidebar routes
const sidebarRoutes = [
  '/object-setup',
  '/object-setup/:id',
  '/record/:objectid/:objectName/:id',
  '/object/:id',
  '/object-profile',
];

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();


  // Check if the current path is login, signup, or forgot-password
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname.toLowerCase());
  const [sidebarWidth, setSidebarWidth] = useState('80px'); // Default to collapsed width
 
  useEffect(() => {
    // Check if the user is authenticated
    const token = Cookies.get('tokenRes'); // Check for JWT token in cookies
    if (!token && !isAuthPage) {
      // If no token and not on an auth page, redirect to login
      navigate('/login');
    }
  }, [location, navigate, isAuthPage]);

  useEffect(() => {
    // Deselect the tab if the current route is not in the sidebarRoutes array
    const isSidebarRoute = sidebarRoutes.some(route => location.pathname.startsWith(route));
    
    if (!isSidebarRoute) {
      localStorage.removeItem('selectedKey');
    }
  }, [location.pathname]);

  const handleSidebarToggle = (width) => {
    setSidebarWidth(width);
  };

  return (

    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {!isAuthPage && <AppHeader />} {/* Conditionally render header */}
      {!isAuthPage && (
        <AppSidebar
          onSidebarToggle={handleSidebarToggle}
          collapsedWidth="80px"
          expandedWidth="20%" // Use 20% width for expanded sidebar
        />
      )} {/* Conditionally render sidebar */}
      <Layout
        style={{
          marginLeft: !isAuthPage ? sidebarWidth : '0',
          marginTop: !isAuthPage ? '64px' : '0',
          overflow: 'auto',
        }}
      >

       
        <Content
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: '100%', // Ensure content uses full height
            overflow: 'auto', // Enable scrolling if content overflows
          }}
        > 
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="setup/objectManager" element={<DataTable />} />
            <Route path="/object-setup/:id" element={<ObjectFieldDetail />} />
            <Route path="/record/:objectName/:id" element={<RecordDetail />} />
            <Route path="/object/:id" element={<ObjectSetupDetail />} />
            <Route path="/object-profile" element={<Profile />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/Error" element={<ErrorPage />} />
            <Route path ="/Error/403" element={<ForbiddenError/>}/>
            <Route path ="/Error/404" element={<NotFoundError/>}/>
            <Route path ="/Error/500" element={<InternalServerError/>}/>
            <Route path ="/Error/422" element={<UnprocessableEntity/>}/>


            {/* Add more routes as needed */}
          </Routes>
        </Content>
        {!isAuthPage && <AppFooter />} {/* Conditionally render footer */}
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