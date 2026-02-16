import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

// Define available roles
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'reception';

interface User {
    name: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Check localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('jingli_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (role: UserRole) => {
        // Mock user data based on role
        let mockUser: User = { name: 'Admin User', role: 'admin', avatar: 'AU' };

        switch (role) {
            case 'teacher':
                mockUser = { name: 'Sarah Teacher', role: 'teacher', avatar: 'ST' };
                break;
            case 'student':
                mockUser = { name: 'Alice Student', role: 'student', avatar: 'AS' };
                break;
            case 'parent':
                mockUser = { name: 'John Parent', role: 'parent', avatar: 'JP' };
                break;
            case 'reception':
                mockUser = { name: 'Rachel Reception', role: 'reception', avatar: 'RR' };
                break;
        }

        setUser(mockUser);
        localStorage.setItem('jingli_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('jingli_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
