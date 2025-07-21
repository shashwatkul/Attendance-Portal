import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend URL
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Configure the header to send the token
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;