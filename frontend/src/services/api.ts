import axios from 'axios';

// Create an Axios instance for the NestJS Backend
export const api = axios.create({
    baseURL: 'http://localhost:3000', // Update this for production
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized (e.g., redirect to login)
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized access. Please login.');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);
