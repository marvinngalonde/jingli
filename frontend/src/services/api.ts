import axios from 'axios';

// Create an Axios instance for the NestJS Backend
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to set the Auth Token
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized access. Session might be expired.');
            // Ideally, trigger a logout action in AuthContext via event or callback
        }
        return Promise.reject(error);
    }
);

