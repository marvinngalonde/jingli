import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Paper,
    Text,
    Stack,
    Group,
    Button,
    TextInput,
    ActionIcon,
    Title,
    SimpleGrid,
    Card,
    Badge,
    rem,
    Modal,
    ThemeIcon,
    Loader,
    Center,
    Transition,
    Textarea,
    UnstyledButton,
    Box,
    useMantineTheme,
    useMantineColorScheme
} from '@mantine/core';
import {
    IconSearch,
    IconClock,
    IconShieldCheck,
    IconUserExclamation,
    IconArrowLeft,
    IconScan,
    IconUsers,
    IconCheck,
    IconX,
    IconLogout,
    IconArrowRight
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

type KioskMode = 'HOME' | 'STAFF' | 'STUDENT' | 'VISITOR';

export function GateKiosk() {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [mode, setMode] = useState<KioskMode>('HOME');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [notes, setNotes] = useState('');
    const [confirmModal, setConfirmModal] = useState(false);
    const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-focus search on mode change
    useEffect(() => {
        if (mode !== 'HOME' && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [mode]);

    // Data Fetching
    const { data: staffData = [], isLoading: staffLoading } = useQuery({
        queryKey: ['staff'],
        queryFn: async () => {
            const { data } = await api.get('/staff');
            return data.data || [];
        },
        enabled: mode === 'STAFF'
    });

    const { data: studentData = [], isLoading: studentLoading } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const { data } = await api.get('/students');
            return data.data || [];
        },
        enabled: mode === 'STUDENT'
    });

    // Filtering
    const filteredResults = mode === 'STAFF' 
        ? staffData.filter((s: any) => 
            `${s.firstName} ${s.lastName} ${s.employeeId}`.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : mode === 'STUDENT'
        ? studentData.filter((s: any) => 
            `${s.firstName} ${s.lastName} ${s.admissionNo}`.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];

    // Attendance Mutation
    const attendanceMutation = useMutation({
        mutationFn: async (payload: any) => {
            if (mode === 'STAFF') {
                const endpoint = actionType === 'IN' ? '/attendance/staff/check-in' : '/attendance/staff/check-out';
                return api.post(endpoint, { staffId: selectedPerson.id, notes });
            } else if (mode === 'STUDENT') {
                return api.post('/gate/students/late', { studentId: selectedPerson.id, reason: notes });
            }
        },
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Entry recorded successfully',
                color: 'green',
                icon: <IconCheck size={16} />,
            });
            queryClient.invalidateQueries({ queryKey: ['staff-attendance-today'] });
            queryClient.invalidateQueries({ queryKey: ['student-late-today'] });
            resetKiosk();
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Transaction failed',
                color: 'red',
                icon: <IconX size={16} />,
            });
        }
    });

    const resetKiosk = () => {
        setSearchQuery('');
        setSelectedPerson(null);
        setNotes('');
        setConfirmModal(false);
        setMode('HOME');
    };

    const handleSelect = (person: any) => {
        setSelectedPerson(person);
        if (mode === 'STAFF') {
            setConfirmModal(true);
        } else if (mode === 'STUDENT') {
            setConfirmModal(true);
        }
    };

    const renderHeader = () => (
        <Group justify="space-between" mb={40} align="center">
            <Group>
                {mode !== 'HOME' && (
                    <ActionIcon variant="light" size="xl" radius="xl" onClick={() => setMode('HOME')}>
                        <IconArrowLeft size={24} />
                    </ActionIcon>
                )}
                <div>
                    <Title order={2} style={{ color: isDark ? 'white' : theme.colors.dark[9] }}>
                        {mode === 'HOME' ? 'Gate Kiosk' : `${mode.charAt(0) + mode.slice(1).toLowerCase()} Access`}
                    </Title>
                    <Text c="dimmed" size="sm">Jingli Security Management</Text>
                </div>
            </Group>
            
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: isDark ? theme.colors.dark[6] : theme.white }}>
                <Group gap="xs">
                    <IconClock size={20} color={theme.colors.brand[6]} />
                    <Text fw={700} size="xl" style={{ fontFamily: 'monospace' }}>
                        {currentTime.toLocaleTimeString([], { hour12: false })}
                    </Text>
                </Group>
            </Paper>
        </Group>
    );

    const renderHomeScreen = () => (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={30} mt={40}>
            <UnstyledButton
                onClick={() => setMode('STAFF')}
                style={{
                    height: 250,
                    backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                    borderRadius: theme.radius.lg,
                    border: `2px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.spacing.md,
                    transition: 'all 0.2s ease',
                    boxShadow: theme.shadows.sm
                }}
            >
                <ThemeIcon size={80} radius={40} color="green" variant="light">
                    <IconShieldCheck size={40} />
                </ThemeIcon>
                <Title order={3}>Staff In / Out</Title>
                <Text c="dimmed" size="sm" ta="center" px="xl">Record daily attendance for teachers and staff members.</Text>
            </UnstyledButton>

            <UnstyledButton
                onClick={() => setMode('STUDENT')}
                style={{
                    height: 250,
                    backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                    borderRadius: theme.radius.lg,
                    border: `2px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.spacing.md,
                    transition: 'all 0.2s ease',
                    boxShadow: theme.shadows.sm
                }}
            >
                <ThemeIcon size={80} radius={40} color="red" variant="light">
                    <IconUserExclamation size={40} />
                </ThemeIcon>
                <Title order={3}>Student Late Entry</Title>
                <Text c="dimmed" size="sm" ta="center" px="xl">Log students arriving after the morning bell.</Text>
            </UnstyledButton>

            <UnstyledButton
                onClick={() => notifications.show({ title: 'Coming Soon', message: 'Visitor kiosk is under maintenance.' })}
                style={{
                    height: 180,
                    backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                    borderRadius: theme.radius.lg,
                    border: `2px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.spacing.md,
                    transition: 'all 0.2s ease',
                    boxShadow: theme.shadows.sm
                }}
            >
                <ThemeIcon size={60} radius={30} color="blue" variant="light">
                    <IconUsers size={30} />
                </ThemeIcon>
                <Title order={4}>Visitor Registration</Title>
            </UnstyledButton>

            <UnstyledButton
                onClick={() => navigate('/dashboard/security')}
                style={{
                    height: 180,
                    backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                    borderRadius: theme.radius.lg,
                    border: `2px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.spacing.md,
                    transition: 'all 0.2s ease',
                    boxShadow: theme.shadows.sm
                }}
            >
                <ThemeIcon size={60} radius={30} color="gray" variant="light">
                    <IconArrowLeft size={30} />
                </ThemeIcon>
                <Title order={4}>Exit Kiosk</Title>
            </UnstyledButton>
        </SimpleGrid>
    );

    const renderSearchScreen = () => (
        <Stack gap="xl">
            <TextInput
                ref={searchInputRef}
                placeholder={mode === 'STAFF' ? "Search Staff Name or ID..." : "Search Student Name or ADM..."}
                size="xl"
                radius="xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={24} />}
                rightSection={
                    <ActionIcon variant="transparent" size="xl">
                        <IconScan size={24} color={theme.colors.brand[6]} />
                    </ActionIcon>
                }
                styles={{
                    input: {
                        height: 70,
                        fontSize: rem(22),
                        border: `2px solid ${theme.colors.brand[5]}`
                    }
                }}
            />

            {(staffLoading || studentLoading) ? (
                <Center py={50}><Loader size="xl" /></Center>
            ) : (
                <Stack gap="md" style={{ maxHeight: '60vh', overflowY: 'auto', padding: rem(4) }}>
                    {searchQuery.length > 1 && filteredResults.map((person: any) => (
                        <Card 
                            key={person.id} 
                            withBorder 
                            shadow="xs" 
                            p="md" 
                            radius="md"
                            padding="md"
                            onClick={() => handleSelect(person)}
                            className="kiosk-item"
                            style={{ 
                                transition: 'all 0.1s',
                                backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                                cursor: 'pointer'
                            }}
                        >
                            <Group justify="space-between">
                                <Group>
                                    <ThemeIcon size="lg" radius="xl" variant="light" color={mode === 'STAFF' ? 'green' : 'red'}>
                                        {mode === 'STAFF' ? <IconShieldCheck size={18} /> : <IconUserExclamation size={18} />}
                                    </ThemeIcon>
                                    <div>
                                        <Text fw={700} size="lg">{person.firstName} {person.lastName}</Text>
                                        <Text size="sm" c="dimmed">
                                            {mode === 'STAFF' ? `ID: ${person.employeeId} • ${person.designation}` : `ADM: ${person.admissionNo} • ${person.section?.classLevel?.name}`}
                                        </Text>
                                    </div>
                                </Group>
                                <IconCheck size={24} color={theme.colors.gray[4]} />
                            </Group>
                        </Card>
                    ))}
                    {searchQuery.length > 1 && filteredResults.length === 0 && (
                        <Text ta="center" c="dimmed" py="xl">No results found for "{searchQuery}"</Text>
                    )}
                    {searchQuery.length <= 1 && (
                        <Text ta="center" c="dimmed" py="xl">Start typing to search...</Text>
                    )}
                </Stack>
            )}
        </Stack>
    );

    return (
        <Box 
            style={{ 
                minHeight: '100vh', 
                backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[0],
                paddingTop: 50
            }}
        >
            <Container size="md">
                {renderHeader()}
                
                <Transition mounted={mode === 'HOME'} transition="fade" duration={200}>
                    {(styles) => <div style={styles}>{renderHomeScreen()}</div>}
                </Transition>

                <Transition mounted={mode !== 'HOME'} transition="slide-up" duration={200}>
                    {(styles) => <div style={styles}>{renderSearchScreen()}</div>}
                </Transition>
            </Container>

            {/* Confirmation Modal */}
            <Modal
                opened={confirmModal}
                onClose={() => setConfirmModal(false)}
                title={null}
                size="xl"
                radius="lg"
                padding={30}
                centered
            >
                {selectedPerson && (
                    <Stack gap="xl">
                        <Group justify="space-between">
                            <div>
                                <Title order={2} mb={5}>{selectedPerson.firstName} {selectedPerson.lastName}</Title>
                                <Text c="dimmed">
                                    {mode === 'STAFF' ? selectedPerson.designation : `Admission No: ${selectedPerson.admissionNo}`}
                                </Text>
                            </div>
                            <ThemeIcon size={64} radius="xl" variant="light" color={mode === 'STAFF' ? 'green' : 'red'}>
                                {mode === 'STAFF' ? <IconShieldCheck size={32} /> : <IconUserExclamation size={32} />}
                            </ThemeIcon>
                        </Group>

                        {mode === 'STAFF' && (
                            <SimpleGrid cols={2} spacing="md">
                                <Button 
                                    size="xl" 
                                    style={{ height: 100 }}
                                    color="green" 
                                    radius="md" 
                                    leftSection={<IconArrowRight size={24} />}
                                    onClick={() => { setActionType('IN'); attendanceMutation.mutate({}); }}
                                    loading={attendanceMutation.isPending && actionType === 'IN'}
                                >
                                    CHECK IN
                                </Button>
                                <Button 
                                    size="xl" 
                                    style={{ height: 100 }}
                                    color="orange" 
                                    variant="outline"
                                    radius="md" 
                                    leftSection={<IconLogout size={24} />}
                                    onClick={() => { setActionType('OUT'); attendanceMutation.mutate({}); }}
                                    loading={attendanceMutation.isPending && actionType === 'OUT'}
                                >
                                    CHECK OUT
                                </Button>
                            </SimpleGrid>
                        )}

                        {mode === 'STUDENT' && (
                            <Stack gap="md">
                                <Textarea
                                    label="Reason for Delay"
                                    placeholder="e.g. Transport, Health, Family..."
                                    size="lg"
                                    minRows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.currentTarget.value)}
                                />
                                <Button 
                                    size="xl" 
                                    fullWidth 
                                    color="red" 
                                    radius="md"
                                    onClick={() => attendanceMutation.mutate({})}
                                    loading={attendanceMutation.isPending}
                                    disabled={!notes}
                                >
                                    Mark as Late Entry
                                </Button>
                            </Stack>
                        )}

                        <Button variant="subtle" color="gray" onClick={() => setConfirmModal(false)} disabled={attendanceMutation.isPending}>
                            Cancel
                        </Button>
                    </Stack>
                )}
            </Modal>

            <style>{`
                .kiosk-item:active {
                    transform: scale(0.98);
                }
            `}</style>
        </Box>
    );
}
