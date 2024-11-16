import React, { useState } from 'react';
import { Layout, Menu, Avatar, Input, Drawer, Button, Grid, Dropdown ,Select} from 'antd';
import { UserOutlined, SearchOutlined, MenuOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
import { Link,useNavigate } from 'react-router-dom';
import logo from '../CompanyLogo.png'; // Import your logo file
import Cookies from 'js-cookie';
import { responsiveArray } from 'antd/es/_util/responsiveObserver';
import ApiService from '../Components/apiService'; // Import ApiService class
import { BASE_URL,DateFormat } from '../Components/Constant';

 
const { Header } = Layout;
const { Search } = Input;
const { useBreakpoint } = Grid;

const AppHeader = () => {
  const [visible, setVisible] = useState(false);
  const screens = useBreakpoint();
  const navigate = useNavigate(); // Use navigate hook for programmatic navigation
  const [seachResults,setSearchResults]=useState([]);

  const username = Cookies.get('username') || 'Aptclouds';
  console.log('Retrieved username from cookie:', username);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onSearch =async (value) => {
    console.log(value);
    console.log( value)
    if (value) {
      console.log(value);
      try {
        const apiService = new ApiService(`${BASE_URL}/global_search/${value}`, {
          'Content-Type': 'application/json', // Add any necessary headers, such as content type
        }, 'GET', );
        const response=await apiService.makeCall();
        console.log('response of lookups ar');
        console.log(response);
    
        const searchOptions=[];
        Object.keys(response).forEach((objectName) => {
          const records = response[objectName]?.records || [];
          records.forEach((record) => {
            searchOptions.push({
              label: `${objectName} - ${record.Name || 'Unnamed Record'}`,
              value: record._id,
              objectName, // Include the object name for navigation

            });
          });
        });


        setSearchResults(searchOptions);
       } catch (error) {
        console.error("API request failed:", error);
        setSearchResults([]);
      } finally {
      }
    } else {
          
    }
  };

  const handleRecordChange = (value, option) => {
    const { objectName } = option;
    navigate(`/record/${objectName}/${value}`);
  };

  const handleLogout = () => {
    // Perform any logout-related tasks here (e.g., clearing tokens, session storage, etc.)
    Cookies.remove('username');
    Cookies.remove('tokenRes');
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
      <Menu.Item key="1" icon={<SettingOutlined />} onClick={() => navigate('/setup')}>
        Setup
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
        <img src={logo} alt="Company Logo" style={{ height: '40px', margin: '28px 16px 0 0' }} />
        </Link>
        

        {screens.md && (
          <Select
            showSearch
            notFoundContent="Search for records"
            placeholder="Search..."
            onSearch={(value) => onSearch(value)} 
            options={seachResults} // Assuming searchResults is the state with transformed options
            onChange={handleRecordChange}
            style={{
              width: '500px',
              borderRadius: '4px',
            }}
            prefix={<SearchOutlined />}
            dropdownRender={(menu) => <div>{menu}</div>} // Allows for dropdown customization
          >
            {seachResults.map((option) => (
              <Select.Option key={option.value} value={option.value} label={option.label}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold' }}>{option.objectName}</span>
                  <span style={{ color: '#888' }}>{option.label.split(' - ')[1]}</span>
                </div>
              </Select.Option>
            ))}

          </Select>
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
