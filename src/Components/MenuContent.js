// MenuContent.js
import React from 'react';
import OrganisationSetup from './OrganisationSetup'; // Import the new component
import CustomTabs from './CustomTabs';
import UserComponent from './User';
import Recyclebin from './RecycleBin';

const MenuContent = ({ selectedItem }) => {
  switch (selectedItem) {
    case 'Organisation Setup':
      return <OrganisationSetup />; // Use the new OrganisationSetup component
    case 'Users':
      return <UserComponent />; // Component for Settings
    case 'Custom Tabs':
      return <Tabs />; // Component for Reports
    case 'Recycle bin':
      return <Recyclebin/>  
    default:
      return <div>Select an item from the sidebar</div>;
  }
};

 
const Tabs = () => (
  <div style={{ marginTop: '3px' }}> {/* Adjust margin as needed */}
    <h2>Custom Tabs</h2>
    <CustomTabs />
  </div>
);

export default MenuContent;
