import axios from 'axios';
import Cookies from 'js-cookie';
 
class ApiService {
  constructor(endpoint, headers = {}, method = '', body = null) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json',  // Ensure 'Content-Type' is always set to 'application/json'
      ...headers,                          // Merge any custom headers passed in
    };
    this.method = method;
    this.body = body;
    
    //console.log('Cookie is '+ JSON.stringify(Cookies.get('tokenRes')));
    // Add cookie data to headers if available
    const authToken = Cookies.get('tokenRes'); // Replace 'auth_token' with the actual cookie name
    if (authToken) {
      this.headers['Authorization'] = `Bearer ${authToken}`; // Add the Authorization header
    }
  }

  async makeCall() {
    try {
      const options = {
        url: this.endpoint,
        method: this.method,
        headers: this.headers,
        data: this.body,
      };

      const response = await axios(options);

      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error(`API call failed with status code ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(`API call failed: ${error.response.status} - ${error.response.statusText}`);
        throw new Error(`API call failed with status code ${error.response.status}`);
      } else if (error.request) {
        console.error('API call failed: No response received');
        throw new Error('API call failed: No response received');
      } else {
        console.error('API call failed:', error.message);
        throw new Error(`API call failed: ${error.message}`);
      }
    }
  }
}

export default ApiService;
