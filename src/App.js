import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppHeader from './Header';
import AppSidebar from './Sidebar';
import DataTable from './DataTable';
import ObjectSetupDetail from './ObjectSetupDetail'; // Import the new component
 
const { Content } = Layout;

const App = () => (
  <Router>
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <AppHeader />
      <AppSidebar />
      <Layout style={{ marginLeft: '80px', marginTop: '64px', overflow: 'hidden' }}>
        <Content style={{ padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Routes>
            <Route path="/object-setup" element={<DataTable />} />
            <Route path="/object-setup/:id" element={<ObjectSetupDetail />} /> {/* Add route for ObjectSetupDetail */}
            {/* Add more routes as needed */}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  </Router>
);

export default App;
