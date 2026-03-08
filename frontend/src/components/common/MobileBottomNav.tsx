import { Box, Group, UnstyledButton, Text, rem, Tooltip, ActionIcon, ThemeIcon, Stack } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './MobileBottomNav.module.css';
import type { NavItem } from '../../types/nav';


interface MobileBottomNavProps {
    links: NavItem[];
}

export function MobileBottomNav({ links }: MobileBottomNavProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (to: string) =>
        to === '/student/dashboard' || to === '/student-portal/dashboard'
            ? location.pathname === to
            : location.pathname.startsWith(to);

    return (
        <Box className={classes.wrapper} hiddenFrom="sm">
            <Group grow gap={0} h="100%" align="center">
                {links.map((link) => {
                    const active = isActive(link.to);
                    return (
                        <UnstyledButton
                            key={link.label}
                            className={classes.link}
                            data-active={active || undefined}
                            onClick={() => navigate(link.to)}
                        >
                            <Stack gap={4} align="center">
                                <link.icon
                                    style={{ width: rem(22), height: rem(22) }}
                                    stroke={1.5}
                                    color={active ? `var(--mantine-color-${link.color}-6)` : 'var(--mantine-color-gray-6)'}
                                />
                                <Text size="10px" fw={active ? 700 : 500} c={active ? `${link.color}.6` : 'dimmed'}>
                                    {link.label}
                                </Text>
                            </Stack>
                        </UnstyledButton>
                    );
                })}
            </Group>
        </Box>
    );
}
