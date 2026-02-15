import { useState, useEffect } from 'react';
import { Box, rem, Loader, Center } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { authService } from '../services/authService';

export default function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const navigate = useNavigate();

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                navigate('/login');
            }
        } catch (error) {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Center style={{ minHeight: '100vh' }}>
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Box style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f7' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <Box
                style={{
                    flex: 1,
                    marginLeft: isMobile ? 0 : (sidebarCollapsed ? rem(80) : rem(258)),
                    transition: 'margin-left 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden',
                }}
            >
                <DashboardHeader />
                <Box style={{ flex: 1, overflowY: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
