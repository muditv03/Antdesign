import axios from 'axios';

class ApiService {
  constructor(endpoint, headers = {}, method = '', body = null) {
    this.endpoint = endpoint;
    this.headers = headers;
    this.method = method;
    this.body = body;
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

      // Equivalent to response.ok in Fetch API
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error(`API call failed with status code ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with a status outside of the 2xx range
        console.error(`API call failed: ${error.response.status} - ${error.response.statusText}`);
        throw new Error(`API call failed with status code ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response was received
        console.error('API call failed: No response received');
        throw new Error('API call failed: No response received');
      } else {
        // Something else happened during the request setup
        console.error('API call failed:', error.message);
        throw new Error(`API call failed: ${error.message}`);
      }
    }
  }
}

export default ApiService;
