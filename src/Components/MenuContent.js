// MenuContent.js
import React from 'react';
import OrganisationSetup from './OrganisationSetup'; // Import the new component
import CustomTabs from './CustomTabs';

const MenuContent = ({ selectedItem }) => {
  switch (selectedItem) {
    case 'Organisation Setup':
      return <OrganisationSetup />; // Use the new OrganisationSetup component
    case 'Users':
      return <UsersList />; // Component for Settings
    case 'Custom Tabs':
      return <Tabs />; // Component for Reports
    default:
      return <div>Select an item from the sidebar</div>;
  }
};

const UsersList = () => (
  <div style={{ marginTop: '3px' }}> {/* Adjust margin as needed */}
    <h2>Users</h2>
  </div>
);

const Tabs = () => (
  <div style={{ marginTop: '3px' }}> {/* Adjust margin as needed */}
    <h2>Custom Tabs</h2>
    <CustomTabs />
  </div>
);

export default MenuContent;
