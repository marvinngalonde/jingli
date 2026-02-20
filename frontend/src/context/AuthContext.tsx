import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { api, setAuthToken } from '../services/api';
import { notifications } from '@mantine/notifications';

// Define User Structure based on Backend Response
export interface UserProfile {
    id: string; // Internal User ID (UUID)
    email: string;
    role: 'admin' | 'teacher' | 'student' | 'parent' | 'reception' | 'finance';
    schoolId: string;
    supabaseUid: string;
    profile?: any; // The linked domain profile (Staff/Student/Guardian)
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    fetchProfile: () => Promise<void>;
    setSkipNextProfileFetch: (skip: boolean) => void;
    isInstalled: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
    const skipNextProfileFetchRef = useRef(false);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/me');
            // Normalize role to lowercase to match Frontend expectations
            const normalizedUser = {
                ...data,
                role: data.role.toLowerCase(),
            };
            setUser(normalizedUser);
        } catch (error: any) {
            console.error('Failed to fetch user profile:', error);
            setUser(null);

            // If 401 (Unauthorized), it means the token is invalid or expired backend-side.
            // We should silently log out to clear the stale session.
            if (error.response?.status === 401) {
                await supabase.auth.signOut();
            } else {
                // For other errors (network, 500), show a notification
                notifications.show({
                    title: 'Profile Error',
                    message: 'Could not load user profile. Please try logging in again.',
                    color: 'red',
                });
            }
        }
    };

    const setSkipNextProfileFetch = (skip: boolean) => {
        skipNextProfileFetchRef.current = skip;
    };

    useEffect(() => {
        // 0. Check Installation Status
        api.get('/system/status')
            .then(res => setIsInstalled(res.data.isInstalled))
            .catch(() => setIsInstalled(false));

        // 1. Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setAuthToken(session.access_token);
                fetchProfile().finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                setAuthToken(session.access_token);
                // If signup is in progress, skip auto-fetching profile.
                // The Signup page will call fetchProfile manually after /auth/sync.
                if (skipNextProfileFetchRef.current) {
                    skipNextProfileFetchRef.current = false;
                } else {
                    await fetchProfile();
                }
            } else {
                setAuthToken(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (username: string, password: string) => {
        setLoading(true);

        try {
            // First, resolve the email from the username
            const resolveRes = await api.post('/auth/resolve-email', { username });
            const email = resolveRes.data.email;

            // Then sign in with the resolved email
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setLoading(false);
                throw signInError;
            }
        } catch (error: any) {
            setLoading(false);
            throw error;
        }
        // onAuthStateChange will handle the rest
    };

    const logout = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // onAuthStateChange will handle the rest
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, fetchProfile, setSkipNextProfileFetch, isInstalled }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

