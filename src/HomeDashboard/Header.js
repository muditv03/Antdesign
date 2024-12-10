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
  const [placeholder,setplaceholder]=useState('search');
  const username = Cookies.get('username') || 'Aptclouds';
  console.log('Retrieved username from cookie:', username);
  const [searchResults, setSearchResults] = useState([]); // Stores search results
  const [loading, setLoading] = useState(false); // Loading state
  const [showDropdown, setShowDropdown] = useState(false);
  const[responseToSend,setResponseToSend] = useState([]);
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
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
  const handleSelect = ({ key,item }) => {
    console.log( menu);
    console.log('key'+key);
    const { objectName } = item.props;
    console.log(objectName);
    navigate(`/record/${objectName}/${key}`);
    setShowDropdown(false); // Hide the dropdown after selection
  };

  const fetchSearchResults = async (value) => {
    if(value.length >2){
      console.log('inside fetchSearchRes'+value);
    if (!value) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    try {
            const apiService = new ApiService(`${BASE_URL}/global_search/${value}`, {
              'Content-Type': 'application/json', // Add any necessary headers, such as content type
            }, 'GET', );
            const response= await apiService.makeCall();
            console.log(response);
        setResponseToSend(response);

      const formattedResults = [];
      console.log('response header');
      console.log(response);
      Object.keys(response).forEach((objectName) => {
        const records = response[objectName]?.records || [];
        records.forEach((record) => {
          formattedResults.push({
            label: `${objectName} - ${record.Name || 'Unnamed Record'}`,
            value: record._id,
            objectName, // Include the object name for navigation

          });
        });
      });


      setSearchResults(formattedResults);
      console.log('formattedresult');
      console.log(formattedResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
    }
    
  };
  const menu = (
    <div
      style={{
        maxHeight: '200px', // Limit the height
        overflowY: 'auto',  // Enable vertical scrolling
      }}
    >

    <Menu onClick={handleSelect}>
      {searchResults.map((result) => (
        <Menu.Item key={result.value} objectName={result.objectName}>
          {result.label}
        </Menu.Item>

      ))}
    </Menu>
    </div>
  ); 
  const handleEnter = async ()=>{
    console.log('inside handle Enter');  
  // Serialize the response data to a query string
  // const queryParams = new URLSearchParams({
  //   results: JSON.stringify(searchResults),  // Encoding response as a string
  // }).toString();
  setShowDropdown(false);
  // Navigate to SearchResults with query parameters
  // navigate(`/SearchResults?${queryParams}`);
    navigate('/SearchResults', { state: { searchResults: responseToSend } });

  };
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
        
        <Search
        style = {{
          width: '60%',
        }}
        placeholder="Search for records"
        onSearch={handleEnter}
        onChange={(e) => fetchSearchResults(e.target.value)}
        enterButton
        // loading={loading}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow selection before hiding
        // onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
        onPressEnter={handleEnter}
      />
      <div>
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '90px',
            
            width: '28%',
            backgroundColor: 'white',
            // border: '1px solid #d9d9d9',
            // borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
          }}
        >
          <Dropdown overlay={menu} visible={showDropdown} >
            <div />
          </Dropdown>
          </div>
        )}  
      </div>
      
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