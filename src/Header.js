// import React, { useState } from 'react';
// import { Layout, Menu, Avatar, Input, Drawer, Button, Grid, Dropdown } from 'antd';
// import { UserOutlined, SearchOutlined, MenuOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
// import { Link, useNavigate } from 'react-router-dom';
// import logo from './CompanyLogo.png'; // Import your logo file

// const { Header } = Layout;
// const { Search } = Input;
// const { useBreakpoint } = Grid;

// const AppHeader = () => {
//   const [visible, setVisible] = useState(false);
//   const screens = useBreakpoint();
//   const navigate = useNavigate(); // Use navigate hook for programmatic navigation

//   const showDrawer = () => {
//     setVisible(true);
//   };

//   const onClose = () => {
//     setVisible(false);
//   };

//   const onSearch = (value) => {
//     console.log(value);
//   };

//   const profileMenu = (
//     <Menu>
//       <Menu.Item key="1">Profile</Menu.Item>
//       <Menu.Item key="2">Settings</Menu.Item>
//       <Menu.Item key="3">Logout</Menu.Item>
//     </Menu>
//   );

//   const settingsMenu = (
//     <Menu>
//       <Menu.Item key="1" icon={<SettingOutlined />} onClick={() => navigate('/object-setup')}>
//         Object Setup
//       </Menu.Item>
//     </Menu>
//   );

//   return (
//     <Header
//       style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: '0 24px',
//         backgroundColor: '#001529', // Dark theme background
//         position: 'fixed',
//         top: 0,
//         width: '100%',
//         zIndex: 1000,
//       }}
//     >
//       <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
//         {!screens.md && (
//           <Button
//             icon={<MenuOutlined />}
//             onClick={showDrawer}
//             style={{
//               marginRight: '16px',
//               color: '#fff',
//               backgroundColor: '#001529',
//               borderColor: '#001529',
//             }}
//           />
//         )}
//         <img src={logo} alt="Aptclouds Logo" style={{ height: '40px', margin: '0 16px 0 0' }} />
//         {screens.md && (
//           <Search
//             placeholder="Search..."
//             onSearch={onSearch}
//             style={{
//               width: '500px',
//               borderRadius: '4px',
//             }}
//             prefix={<SearchOutlined />}
//           />
//         )}
//       </div>
//       <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
//         {/* Vertical Line */}
//         <div
//           style={{
//             height: '24px',
//             width: '1px',
//             backgroundColor: '#ffffff',
//             marginRight: '16px',
//           }}
//         />
//         <Dropdown overlay={settingsMenu} trigger={['click']}>
//           <Button
//             icon={<SettingOutlined />}
//             style={{
//               color: '#fff',
//               backgroundColor: '#001529',
//               borderColor: '#001529',
//               marginRight: '8px', // Reduced space
//             }}
//           />
//         </Dropdown>
//         <Dropdown overlay={profileMenu} trigger={['click']}>
//           <Button
//             style={{
//               backgroundColor: '#001529',
//               borderColor: '#001529',
//               color: '#fff',
//               display: 'flex',
//               alignItems: 'center',
//             }}
//           >
//             <Avatar
//               icon={<UserOutlined />}
//               size="small" // Reduced size
//               style={{ backgroundColor: '#1890ff', color: '#fff', marginRight: '8px' }}
//             />
//             Aptclouds
//             <DownOutlined style={{ marginLeft: '8px' }} />
//           </Button>
//         </Dropdown>
//       </div>
//     </Header>
//   );
// };

// export default AppHeader;


import React, { useState } from 'react';
import { Layout, Menu, Avatar, Input, Drawer, Button, Grid, Dropdown } from 'antd';
import { UserOutlined, SearchOutlined, MenuOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from './CompanyLogo.png'; // Import your logo file
import Cookies from 'js-cookie';

const { Header } = Layout;
const { Search } = Input;
const { useBreakpoint } = Grid;

const AppHeader = () => {
  const [visible, setVisible] = useState(false);
  const screens = useBreakpoint();
  const navigate = useNavigate(); // Use navigate hook for programmatic navigation

  const username = Cookies.get('username') || 'Aptclouds';
  console.log('Retrieved username from cookie:', username);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onSearch = (value) => {
    console.log(value);
  };

  const handleLogout = () => {
    // Perform any logout-related tasks here (e.g., clearing tokens, session storage, etc.)
    Cookies.remove('username');
    navigate('/login'); // Redirect to the login page
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate('/object-profile')}> {/* Navigate to profile page */}
        Profile
      </Menu.Item>
      <Menu.Item key="2">Settings</Menu.Item>
      <Menu.Item key="3" onClick={handleLogout}>Logout</Menu.Item>
    </Menu>
  );

  const settingsMenu = (
    <Menu>
      <Menu.Item key="1" icon={<SettingOutlined />} onClick={() => navigate('/object-setup')}>
        Object Setup
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        backgroundColor: '#001529', // Dark theme background
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {!screens.md && (
          <Button
            icon={<MenuOutlined />}
            onClick={showDrawer}
            style={{
              marginRight: '16px',
              color: '#fff',
              backgroundColor: '#001529',
              borderColor: '#001529',
            }}
          />
        )}

        <Link to="/">
        <img src={logo} alt="Company Logo" style={{ height: '40px', margin: '0px 16px 0 0' }} />
        </Link>
        

        {screens.md && (
          <Search
            placeholder="Search..."
            onSearch={onSearch}
            style={{
              width: '500px',
              borderRadius: '4px',
            }}
            prefix={<SearchOutlined />}
          />
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Vertical Line */}
        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: '#ffffff',
            marginRight: '16px',
          }}
        />
        <Dropdown overlay={settingsMenu} trigger={['click']}>
          <Button
            icon={<SettingOutlined />}
            style={{
              color: '#fff',
              backgroundColor: '#001529',
              borderColor: '#001529',
              marginRight: '8px', // Reduced space
            }}
          />
        </Dropdown>
        <Dropdown overlay={profileMenu} trigger={['click']}>
          <Button
            style={{
              backgroundColor: '#001529',
              borderColor: '#001529',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar
              icon={<UserOutlined />}
              size="small" // Reduced size
              style={{ backgroundColor: '#1890ff', color: '#fff', marginRight: '8px' }}
            />
            {username} {/* Display the dynamic username */}
            <DownOutlined style={{ marginLeft: '8px' }} />
          </Button>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
