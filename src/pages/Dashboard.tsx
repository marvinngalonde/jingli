import { useState } from 'react';
import { Box, rem } from '@mantine/core';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardContent from '../components/DashboardContent';

export default function Dashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <Box style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f7' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <Box
                style={{
                    flex: 1,
                    marginLeft: sidebarCollapsed ? rem(70) : rem(220),
                    transition: 'margin-left 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden',
                }}
            >
                <DashboardHeader />
                <Box style={{ flex: 1, overflowY: 'auto' }}>
                    <DashboardContent />
                </Box>
            </Box>
        </Box>
    );
}
