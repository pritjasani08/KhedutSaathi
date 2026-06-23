import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL}/api`;

// Create a central Axios instance
const apiClient = axios.create({
  // Default to the main API URL, services can override this if needed
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Inject auth tokens here if needed in the future
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Centralized error handling
    let errorMsg = 'An unexpected error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code outside 2xx
      const data = error.response.data;
      if (data && data.detail) {
        if (Array.isArray(data.detail)) {
          errorMsg = data.detail.map(d => typeof d === 'object' ? d.msg || JSON.stringify(d) : String(d)).join(', ');
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else {
          errorMsg = JSON.stringify(data.detail);
        }
      } else if (data && data.message) {
        errorMsg = data.message;
      } else {
        errorMsg = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMsg = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      errorMsg = error.message;
    }

    // Attach custom parsed message to error object
    error.customMessage = errorMsg;

    return Promise.reject(error);
  }
);

export default apiClient;
