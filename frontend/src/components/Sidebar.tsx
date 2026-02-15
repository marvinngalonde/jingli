import { useState } from 'react';
import { Box, Stack, Text, UnstyledButton, rem, Tooltip, Drawer, Burger, Collapse, Group } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
    LayoutDashboard,
    Users,
    UserCog,
    BookOpen,
    DollarSign,
    MessageSquare,
    FileText,
    Settings,
    ChevronDown,
    Bus,
    Book,
    ClipboardList,
    Building,
    Calendar,
    GraduationCap,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
    icon: React.ElementType;
    label: string;
    path?: string;
    children?: NavItem[];
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: 'Main',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        ],
    },
    {
        title: 'Academic',
        items: [
            {
                icon: Users,
                label: 'Students',
                children: [
                    { icon: Users, label: 'All Students', path: '/students' },
                    { icon: ClipboardList, label: 'Attendance', path: '/attendance' },
                ]
            },
            { icon: BookOpen, label: 'Academics', path: '/academics' },
            { icon: FileText, label: 'Marks Entry', path: '/marks' },
            { icon: Book, label: 'Library', path: '/library' },
        ],
    },
    {
        title: 'Administrative',
        items: [
            { icon: UserCog, label: 'Staff & Payroll', path: '/staff' },
            { icon: DollarSign, label: 'Finance', path: '/finance' },
            { icon: MessageSquare, label: 'Communication', path: '/communication' },
            { icon: FileText, label: 'Reports', path: '/reports' },
        ],
    },
    {
        title: 'Operations',
        items: [
            { icon: Bus, label: 'Transport', path: '/transport' },
            { icon: Building, label: 'Facilities', path: '/facilities' },
            { icon: ClipboardList, label: 'Visitor Log', path: '/visitor-log' },
        ],
    },
    {
        title: 'System',
        items: [
            { icon: Settings, label: 'Settings', path: '/settings' },
        ],
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

function NavItemComponent({ item, collapsed, isMobile, closeMobile }: { item: NavItem; collapsed: boolean; isMobile: boolean; closeMobile: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [opened, setOpened] = useState(false);
    const Icon = item.icon;

    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path ? location.pathname === item.path : false;
    const hasActiveChild = hasChildren && item.children?.some(child => child.path === location.pathname);

    const handleClick = () => {
        if (hasChildren) {
            setOpened(!opened);
        } else if (item.path) {
            navigate(item.path);
            if (isMobile) closeMobile();
        }
    };

    const button = (
        <Box>
            <UnstyledButton
                onClick={handleClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: rem(12),
                    padding: `${rem(10)} ${rem(12)}`,
                    borderRadius: rem(4),
                    textDecoration: 'none',
                    backgroundColor: isActive || hasActiveChild ? 'var(--mantine-color-navy-0)' : 'transparent',
                    color: isActive || hasActiveChild ? 'var(--mantine-color-navy-9)' : 'var(--mantine-color-gray-7)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    fontWeight: isActive || hasActiveChild ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                    if (!isActive && !hasActiveChild) {
                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive && !hasActiveChild) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }}
            >
                <Icon size={20} strokeWidth={1.5} />
                {(!collapsed || isMobile) && (
                    <>
                        <Text size="sm" fw={500} style={{ flex: 1 }}>
                            {item.label}
                        </Text>
                        {hasChildren && <ChevronDown size={16} style={{ transform: opened ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
                    </>
                )}
            </UnstyledButton>

            {hasChildren && (!collapsed || isMobile) && (
                <Collapse in={opened}>
                    <Stack gap={2} pl="md" mt={4}>
                        {item.children?.map((child, idx) => (
                            <UnstyledButton
                                key={idx}
                                onClick={() => {
                                    if (child.path) {
                                        navigate(child.path);
                                        if (isMobile) closeMobile();
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: rem(8),
                                    padding: `${rem(8)} ${rem(12)}`,
                                    borderRadius: rem(4),
                                    backgroundColor: child.path === location.pathname ? 'var(--mantine-color-navy-0)' : 'transparent',
                                    color: child.path === location.pathname ? 'var(--mantine-color-navy-9)' : 'var(--mantine-color-gray-7)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (child.path !== location.pathname) {
                                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (child.path !== location.pathname) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                {child.icon && <child.icon size={16} strokeWidth={1.5} />}
                                <Text size="xs">{child.label}</Text>
                            </UnstyledButton>
                        ))}
                    </Stack>
                </Collapse>
            )}
        </Box>
    );

    return collapsed && !isMobile && !hasChildren ? (
        <Tooltip label={item.label} position="right" withArrow>
            {button}
        </Tooltip>
    ) : (
        button
    );
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const NavItems = () => (
        <Stack
            gap={0}
            p="md"
            style={{
                flex: 1,
                overflowY: 'auto',
                // Custom scrollbar styling
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0, 0, 0, 0.1) transparent',
            }}
            className="custom-scrollbar"
        >
            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.1);
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(0, 0, 0, 0.2);
                    }
                `}
            </style>

            {/* Collapse button as first item when sidebar is collapsed */}
            {collapsed && !isMobile && (
                <Box mb="md">
                    <Tooltip label="Expand Sidebar" position="right" withArrow>
                        <UnstyledButton
                            onClick={onToggle}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: `${rem(10)} ${rem(12)}`,
                                borderRadius: rem(4),
                                backgroundColor: 'transparent',
                                color: 'var(--mantine-color-gray-7)',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                width: '100%',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <PanelLeftOpen size={20} strokeWidth={1.5} />
                        </UnstyledButton>
                    </Tooltip>
                </Box>
            )}

            {navSections.map((section, sectionIdx) => (
                <Box key={sectionIdx} mb="md">
                    {(!collapsed || isMobile) && (
                        <Group justify="space-between" mb="xs" px="xs">
                            <Text
                                size="xs"
                                fw={500}
                                c="dimmed"
                                mb={4}
                                tt="uppercase"
                            >
                                {section.title}
                            </Text>
                            {/* Collapse button next to MAIN header */}
                            {section.title === 'Main' && !isMobile && (
                                <UnstyledButton
                                    onClick={onToggle}
                                    style={{
                                        width: rem(20),
                                        height: rem(20),
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                    }}
                                >
                                    <PanelLeftClose size={12} />
                                </UnstyledButton>
                            )}
                        </Group>
                    )}
                    <Stack gap={2}>
                        {section.items.map((item, itemIdx) => (
                            <NavItemComponent
                                key={itemIdx}
                                item={item}
                                collapsed={collapsed}
                                isMobile={isMobile}
                                closeMobile={closeMobile}
                            />
                        ))}
                    </Stack>
                </Box>
            ))}
        </Stack>
    );

    // Mobile Drawer
    if (isMobile) {
        return (
            <>
                <Drawer
                    opened={mobileOpened}
                    onClose={closeMobile}
                    size="70%"
                    padding={0}
                    withCloseButton={false}
                    styles={{
                        content: {
                            backgroundColor: 'white',
                        },
                    }}
                >
                    <Box
                        p="md"
                        style={{
                            borderBottom: '1px solid var(--mantine-color-gray-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: rem(60),
                        }}
                    >
                        <Text size="lg" fw={700} c="navy.9" style={{ letterSpacing: '-0.5px' }}>
                            Jingli 经理
                        </Text>
                        <Burger opened={mobileOpened} onClick={toggleMobile} color="var(--mantine-color-navy-9)" size="sm" />
                    </Box>
                    <NavItems />
                </Drawer>

                {/* Mobile Burger Button - Fixed */}
                <Box
                    style={{
                        position: 'fixed',
                        top: rem(10),
                        left: rem(10),
                        zIndex: 200,
                    }}
                >
                    <Burger opened={mobileOpened} onClick={toggleMobile} color="var(--mantine-color-navy-9)" />
                </Box>
            </>
        );
    }

    // Desktop Sidebar
    return (
        <Box
            style={{
                width: collapsed ? rem(80) : rem(258),
                height: '100vh',
                backgroundColor: 'white',
                borderRight: '1px solid var(--mantine-color-gray-2)',
                color: 'var(--mantine-color-gray-7)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                transition: 'width 0.3s ease',
                zIndex: 100,
            }}
        >
            {/* Logo Section */}
            <Box
                p="md"
                style={{
                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    minHeight: rem(60),
                }}
            >
                {collapsed ? (
                    <Text size="xl" fw={700} c="navy.9" style={{ letterSpacing: '-0.5px' }}>
                        经
                    </Text>
                ) : (
                    <Text size="lg" fw={700} c="navy.9" style={{ letterSpacing: '-0.5px' }}>
                        Jingli 经理
                    </Text>
                )}
            </Box>

            {/* Navigation Items */}
            <NavItems />
        </Box>
    );
}
