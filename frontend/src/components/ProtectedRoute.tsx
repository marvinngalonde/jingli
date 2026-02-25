import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingOverlay, Box } from '@mantine/core';
import { getDashboardPath } from '../utils/roles';

interface ProtectedRouteProps {
    allowedRoles?: string[];
    children?: React.ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box w="100vw" h="100vh" pos="relative">
                <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            </Box>
        );
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User authorized but role verification failed
        const defaultPath = getDashboardPath(user.role);

        return <Navigate to={defaultPath} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
