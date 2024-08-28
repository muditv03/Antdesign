import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import AppHeader from './Header';
import AppSidebar from './Sidebar';
import DataTable from './DataTable';
import ObjectSetupDetail from './ObjectSetupDetail';
import ObjectFieldDetail from './ObjectFieldDetail'; 
import RecordDetail from './RecordDetailPage';

const { Content } = Layout;

const App = () => {
  const location = useLocation();

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
            <Route path="/object/:id" element={<ObjectSetupDetail />} />
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
