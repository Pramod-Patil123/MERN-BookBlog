// Setup Axios or Fetch utility functions for API calls.

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;

