import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true, // 👈 SEND cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
