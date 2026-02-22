import axios from 'axios';

// Create an Axios instance for the NestJS Backend
export const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
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
    async (error) => {
        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized access. Session might be expired.');
            // Import supabase dynamically to avoid potential circular dependencies if any (though likely safe)
            // Or just import at top if safe. Let's check lib/supabase.ts. 
            // It seems safe to import at top.

            // Trigger logout via Supabase, which AuthContext listens to.
            const { supabase } = await import('../lib/supabase');
            await supabase.auth.signOut();

            // Optional: User will be redirected by AuthContext state change.
        }
        return Promise.reject(error);
    }
);

