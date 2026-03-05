import {
    Title,
    Text,
    Grid,
    Paper,
    Avatar,
    Group,
    Stack,
    Box,
    Divider,
    ThemeIcon,
    Badge,
    Container
} from '@mantine/core';
import {
    IconId,
    IconMail,
    IconMapPin,
    IconSchool,
    IconCalendar,
    IconFileAnalytics,
    IconUser,
    IconGenderFemale,
    IconGenderMale,
    IconUsers
} from '@tabler/icons-react';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/common/PageHeader';

export default function StudentProfile() {
    const { user } = useAuth();
    const student = user?.profile;

    if (!student) {
        return (
            <Box p="md">
                <Text>Profile information not available.</Text>
            </Box>
        );
    }

    const getGenderIcon = (gender: string) => {
        if (gender?.toLowerCase() === 'female') return <IconGenderFemale size={16} />;
        return <IconGenderMale size={16} />;
    };

    return (
        <Container size="xl" p="md">
            <PageHeader
                title="My Profile"
                subtitle="View your personal and academic information"
            />

            {/* Header / Profile Card */}
            <Paper p="xl" radius="lg" mb="lg" withBorder style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 140,
                    background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-indigo-6) 100%)',
                    zIndex: 0
                }} />

                <Group align="flex-end" mt={80} style={{ position: 'relative', zIndex: 1 }}>
                    <Avatar
                        src={student.photoUrl}
                        size={120}
                        radius={120}
                        style={{ border: '4px solid var(--app-surface)', boxShadow: 'var(--mantine-shadow-md)' }}
                        color="blue"
                    >
                        {student.firstName?.[0]}{student.lastName?.[0]}
                    </Avatar>
                    <div style={{ flex: 1, paddingBottom: 10 }}>
                        <Title order={2} mb={4}>{student.firstName} {student.lastName}</Title>
                        <Group gap="xs">
                            <Badge variant="filled" color="blue" radius="sm">Student</Badge>
                            <Text c="dimmed" size="sm" fw={500}>Admission No: {student.admissionNo}</Text>
                        </Group>
                    </div>
                </Group>
            </Paper>

            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="lg">
                        <Paper p="xl" radius="lg" withBorder bg="var(--app-surface)">
                            <Group mb="xl">
                                <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                                    <IconUser size={20} />
                                </ThemeIcon>
                                <Title order={4}>Personal Details</Title>
                            </Group>

                            <Stack gap="md">
                                <InfoItem
                                    icon={<IconMail size={16} />}
                                    label="Email Address"
                                    value={user?.email || 'N/A'}
                                />
                                <InfoItem
                                    icon={<IconCalendar size={16} />}
                                    label="Date of Birth"
                                    value={student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                                />
                                <InfoItem
                                    icon={getGenderIcon(student.gender)}
                                    label="Gender"
                                    value={student.gender || 'N/A'}
                                />
                                <InfoItem
                                    icon={<IconMapPin size={16} />}
                                    label="Home Address"
                                    value={student.address || 'N/A'}
                                />
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="lg">
                        <Paper p="xl" radius="lg" withBorder bg="var(--app-surface)">
                            <Group mb="xl">
                                <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                                    <IconSchool size={20} />
                                </ThemeIcon>
                                <Title order={4}>Academic Information</Title>
                            </Group>

                            <Stack gap="md">
                                <InfoItem
                                    icon={<IconSchool size={16} />}
                                    label="Class / Section"
                                    value={student.section ? `${student.section.classLevel?.name || ''} ${student.section.name || ''}`.trim() : 'Unassigned'}
                                    highlight
                                />
                                <InfoItem
                                    icon={<IconId size={16} />}
                                    label="Roll Number"
                                    value={student.rollNo || 'N/A'}
                                />
                                <InfoItem
                                    icon={<IconCalendar size={16} />}
                                    label="Enrollment Date"
                                    value={student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                                />
                                <InfoItem
                                    icon={<IconFileAnalytics size={16} />}
                                    label="Account Status"
                                    value={<Badge color="green" variant="light">{student.status || 'ACTIVE'}</Badge>}
                                />
                            </Stack>
                        </Paper>

                        {student.guardians && student.guardians.length > 0 && (
                            <Paper p="xl" radius="lg" withBorder bg="var(--app-surface)">
                                <Group mb="xl">
                                    <ThemeIcon variant="light" color="orange" size="lg" radius="md">
                                        <IconUsers size={20} />
                                    </ThemeIcon>
                                    <Title order={4}>Guardian Details</Title>
                                </Group>

                                <Stack gap="lg">
                                    {student.guardians.map((g: any, index: number) => (
                                        <Box key={g.id}>
                                            {index > 0 && <Divider mb="lg" variant="dashed" />}
                                            <Group align="flex-start" wrap="nowrap">
                                                <ThemeIcon variant="light" color="orange" size="md">
                                                    <IconUser size={14} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="sm" fw={600}>{g.guardian.firstName} {g.guardian.lastName}</Text>
                                                    <Text size="xs" c="dimmed" mb={4}>{g.relation}</Text>
                                                    <Group gap="xs">
                                                        <Text size="xs" c="blue">{g.guardian.phone || 'No Phone'}</Text>
                                                        <Text size="xs" c="dimmed">|</Text>
                                                        <Text size="xs" c="blue">{g.guardian.email || 'No Email'}</Text>
                                                    </Group>
                                                </div>
                                            </Group>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
}

function InfoItem({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: React.ReactNode, highlight?: boolean }) {
    return (
        <Group align="flex-start" wrap="nowrap">
            <ThemeIcon variant="subtle" color="gray" size="md">
                {icon}
            </ThemeIcon>
            <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">{label}</Text>
                {typeof value === 'string' ? (
                    <Text size="sm" fw={highlight ? 700 : 500} c={highlight ? 'blue' : undefined}>
                        {value}
                    </Text>
                ) : (
                    <Box mt={2}>{value}</Box>
                )}
            </div>
        </Group>
    );
}
