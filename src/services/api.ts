import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('weise_token');
    console.log('DEBUG: Interceptor - Token from localStorage:', token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('DEBUG: Interceptor - Header set:', config.headers.Authorization);
    } else {
        console.log('DEBUG: Interceptor - No token found');
    }
    return config;
});

export default api;