import { useState } from 'react';
import { Title, Text, Paper, Group, Button, Stack, Card, Badge, Grid, ActionIcon, Table, Modal, Drawer, Tabs, ThemeIcon, SimpleGrid, Box, Avatar, Progress, Select, TextInput, Textarea, Divider, ScrollArea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconTrophy, IconMedal, IconSearch, IconAward,
    IconFlame, IconStar, IconChevronUp, IconChevronDown, IconMinus,
    IconTargetArrow, IconUsers, IconBookmark,IconClipboardList,
} from '@tabler/icons-react';

// Badge definitions
const BADGES = [
    { id: 'math_whiz', name: 'Math Whiz', icon: '🧮', color: 'blue', description: 'Scored 90%+ on 3 consecutive math assignments' },
    { id: 'top_submitter', name: 'Top Submitter', icon: '📝', color: 'green', description: 'Submitted all assignments on time for a full month' },
    { id: 'perfect_attendance', name: 'Perfect Attendance', icon: '🏆', color: 'orange', description: 'No absences for 4 consecutive weeks' },
    { id: 'cala_champion', name: 'CALA Champion', icon: '🎯', color: 'grape', description: 'Completed all CALA tasks with distinction' },
    { id: 'science_star', name: 'Science Star', icon: '🔬', color: 'teal', description: 'Top performer in Science practicals' },
    { id: 'bookworm', name: 'Bookworm', icon: '📚', color: 'indigo', description: 'Read and reviewed 10+ library books this term' },
    { id: 'quiz_master', name: 'Quiz Master', icon: '🧠', color: 'pink', description: 'Scored 100% on 5 quizzes' },
    { id: 'early_bird', name: 'Early Bird', icon: '🐦', color: 'cyan', description: 'Submitted assignments 24+ hours before deadline' },
    { id: 'team_player', name: 'Team Player', icon: '🤝', color: 'violet', description: 'Actively participated in 10+ discussion threads' },
    { id: 'rising_star', name: 'Rising Star', icon: '⭐', color: 'yellow', description: 'Improved grades by 20%+ this term' },
];

// Mock student data for demo
const mockStudents = [
    { id: '1', name: 'Takudzwa Moyo', class: 'Form 2 Blue', points: 1450, rank: 1, change: 'up', badges: ['math_whiz', 'top_submitter', 'quiz_master'], assignments: 24, quizScore: 92, calaScore: 88, attendance: 98 },
    { id: '2', name: 'Rudo Chikwanha', class: 'Form 2 Blue', points: 1380, rank: 2, change: 'up', badges: ['top_submitter', 'bookworm', 'perfect_attendance'], assignments: 24, quizScore: 88, calaScore: 90, attendance: 100 },
    { id: '3', name: 'Blessing Madziva', class: 'Form 2 Red', points: 1295, rank: 3, change: 'same', badges: ['cala_champion', 'science_star'], assignments: 22, quizScore: 85, calaScore: 95, attendance: 96 },
    { id: '4', name: 'Tatenda Sibanda', class: 'Form 2 Red', points: 1180, rank: 4, change: 'down', badges: ['early_bird', 'team_player'], assignments: 20, quizScore: 78, calaScore: 82, attendance: 94 },
    { id: '5', name: 'Nyasha Chimani', class: 'Form 3 Green', points: 1120, rank: 5, change: 'up', badges: ['rising_star'], assignments: 18, quizScore: 80, calaScore: 75, attendance: 90 },
    { id: '6', name: 'Farai Dube', class: 'Form 3 Green', points: 1050, rank: 6, change: 'same', badges: ['bookworm'], assignments: 19, quizScore: 72, calaScore: 80, attendance: 92 },
    { id: '7', name: 'Chipo Munyoro', class: 'Form 2 Blue', points: 980, rank: 7, change: 'down', badges: [], assignments: 16, quizScore: 68, calaScore: 70, attendance: 88 },
    { id: '8', name: 'Tinotenda Gumbo', class: 'Form 3 Green', points: 920, rank: 8, change: 'up', badges: ['team_player'], assignments: 15, quizScore: 65, calaScore: 72, attendance: 85 },
];

export default function TeacherLeaderboard() {
    const [students] = useState(mockStudents);
    const [badgeModal, setBadgeModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
    const [filterClass, setFilterClass] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<string | null>('leaderboard');

    const awardBadge = () => {
        if (!selectedStudent || !selectedBadge) {
            notifications.show({ id: 'award-err', title: 'Error', message: 'Select a student and badge', color: 'red' });
            return;
        }
        const student = students.find(s => s.id === selectedStudent);
        const badge = BADGES.find(b => b.id === selectedBadge);
        notifications.show({
            id: 'award-ok',
            title: '🎉 Badge Awarded!',
            message: `"${badge?.name}" awarded to ${student?.name}`,
            color: 'green',
        });
        setBadgeModal(false);
        setSelectedStudent(null);
        setSelectedBadge(null);
    };

    const filtered = students.filter(s => {
        if (filterClass && s.class !== filterClass) return false;
        return s.name.toLowerCase().includes(search.toLowerCase());
    }).sort((a, b) => b.points - a.points);

    const uniqueClasses = [...new Set(students.map(s => s.class))];

    const changeIcon = (c: string) => {
        if (c === 'up') return <IconChevronUp size={14} color="green" />;
        if (c === 'down') return <IconChevronDown size={14} color="red" />;
        return <IconMinus size={14} color="gray" />;
    };

    const medalColor = (rank: number) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return '#CD7F32';
        return 'transparent';
    };

    return (
        <div>
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>Leaderboard & Gamification</Title>
                    <Text c="dimmed" size="sm">Track student rankings, award badges, and encourage healthy competition</Text>
                </div>
                <Button leftSection={<IconAward size={16} />} color="yellow" variant="filled" onClick={() => setBadgeModal(true)}>
                    Award Badge
                </Button>
            </Group>

            <Tabs value={tab} onChange={setTab} mb="lg">
                <Tabs.List>
                    <Tabs.Tab value="leaderboard" leftSection={<IconTrophy size={16} />}>Leaderboard</Tabs.Tab>
                    <Tabs.Tab value="badges" leftSection={<IconAward size={16} />}>Badge Gallery</Tabs.Tab>
                    <Tabs.Tab value="points" leftSection={<IconFlame size={16} />}>Points System</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {tab === 'leaderboard' && (
                <>
                    {/* Top 3 Podium */}
                    <SimpleGrid cols={{ base: 1, md: 3 }} mb="lg">
                        {filtered.slice(0, 3).map((student, i) => (
                            <Card key={student.id} shadow="md" radius="lg" p="lg" withBorder style={{
                                borderTop: `3px solid ${medalColor(i + 1)}`,
                                transform: i === 0 ? 'scale(1.02)' : undefined,
                            }}>
                                <Stack align="center" gap="sm">
                                    <Box style={{ position: 'relative' }}>
                                        <Avatar size={60} radius="xl" color={i === 0 ? 'yellow' : i === 1 ? 'gray' : 'orange'} variant="filled">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <Badge
                                            size="lg"
                                            variant="filled"
                                            color={i === 0 ? 'yellow' : i === 1 ? 'gray' : 'orange'}
                                            style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)' }}
                                        >
                                            #{i + 1}
                                        </Badge>
                                    </Box>
                                    <Text fw={700} ta="center" mt="xs">{student.name}</Text>
                                    <Text size="sm" c="dimmed">{student.class}</Text>
                                    <Text fw={800} size="xl" c={i === 0 ? 'yellow.7' : 'brand'}>{student.points.toLocaleString()} pts</Text>
                                    <Group gap={4}>
                                        {student.badges.slice(0, 3).map(bId => {
                                            const b = BADGES.find(x => x.id === bId);
                                            return b ? (
                                                <Badge key={bId} size="xs" variant="light" color={b.color}>{b.icon} {b.name}</Badge>
                                            ) : null;
                                        })}
                                    </Group>
                                </Stack>
                            </Card>
                        ))}
                    </SimpleGrid>

                    {/* Full Rankings Table */}
                    <Paper p="lg" radius="md" shadow="sm" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={600}>Full Rankings</Text>
                            <Group>
                                <TextInput placeholder="Search..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
                                <Select placeholder="Class" data={uniqueClasses} value={filterClass} onChange={setFilterClass} clearable style={{ width: 150 }} />
                            </Group>
                        </Group>

                        <ScrollArea>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Rank</Table.Th>
                                        <Table.Th>Student</Table.Th>
                                        <Table.Th>Class</Table.Th>
                                        <Table.Th>Points</Table.Th>
                                        <Table.Th>Assignments</Table.Th>
                                        <Table.Th>Quiz Avg</Table.Th>
                                        <Table.Th>CALA</Table.Th>
                                        <Table.Th>Attendance</Table.Th>
                                        <Table.Th>Badges</Table.Th>
                                        <Table.Th>Trend</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {filtered.map((s, i) => (
                                        <Table.Tr key={s.id}>
                                            <Table.Td>
                                                <Group gap={4}>
                                                    {i < 3 ? <IconMedal size={16} style={{ color: medalColor(i + 1) }} /> : null}
                                                    <Text fw={i < 3 ? 700 : 400}>#{i + 1}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Avatar size={28} radius="xl" color="brand" variant="light">{s.name.split(' ').map(n => n[0]).join('')}</Avatar>
                                                    <Text fw={600} size="sm">{s.name}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td><Text size="sm">{s.class}</Text></Table.Td>
                                            <Table.Td><Text fw={700} c="brand">{s.points.toLocaleString()}</Text></Table.Td>
                                            <Table.Td>{s.assignments}/24</Table.Td>
                                            <Table.Td>
                                                <Group gap={4}>
                                                    <Progress value={s.quizScore} size="xs" w={40} color={s.quizScore >= 80 ? 'green' : s.quizScore >= 60 ? 'yellow' : 'red'} />
                                                    <Text size="xs">{s.quizScore}%</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap={4}>
                                                    <Progress value={s.calaScore} size="xs" w={40} color={s.calaScore >= 80 ? 'green' : s.calaScore >= 60 ? 'yellow' : 'red'} />
                                                    <Text size="xs">{s.calaScore}%</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td><Badge size="sm" color={s.attendance >= 95 ? 'green' : s.attendance >= 85 ? 'yellow' : 'red'} variant="light">{s.attendance}%</Badge></Table.Td>
                                            <Table.Td>
                                                <Group gap={2}>
                                                    {s.badges.slice(0, 2).map(bId => {
                                                        const b = BADGES.find(x => x.id === bId);
                                                        return b ? <Badge key={bId} size="xs" variant="light" color={b.color}>{b.icon}</Badge> : null;
                                                    })}
                                                    {s.badges.length > 2 && <Badge size="xs" variant="light">+{s.badges.length - 2}</Badge>}
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>{changeIcon(s.change)}</Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Paper>
                </>
            )}

            {tab === 'badges' && (
                <SimpleGrid cols={{ base: 2, md: 3, lg: 5 }}>
                    {BADGES.map(badge => (
                        <Card key={badge.id} shadow="sm" radius="md" withBorder>
                            <Stack align="center" gap="xs" py="sm">
                                <Text size="2rem">{badge.icon}</Text>
                                <Text fw={700} size="sm" ta="center">{badge.name}</Text>
                                <Badge color={badge.color} variant="light" size="xs">Achievement</Badge>
                                <Text size="xs" c="dimmed" ta="center">{badge.description}</Text>
                                <Text size="xs" c="dimmed">{students.filter(s => s.badges.includes(badge.id)).length} students earned</Text>
                            </Stack>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {tab === 'points' && (
                <Paper p="lg" radius="md" shadow="sm" withBorder>
                    <Title order={4} mb="md">Points System</Title>
                    <Text c="dimmed" size="sm" mb="lg">Students earn points automatically based on their academic activities:</Text>
                    <SimpleGrid cols={{ base: 1, md: 2 }}>
                        {[
                            { action: 'Assignment Submission', points: '+10', color: 'blue', icon: <IconClipboardList size={16} /> },
                            { action: 'On-time Submission', points: '+5 bonus', color: 'green', icon: <IconTargetArrow size={16} /> },
                            { action: 'Quiz High Score (90%+)', points: '+15', color: 'grape', icon: <IconStar size={16} /> },
                            { action: 'CALA Task Completion', points: '+10', color: 'orange', icon: <IconBookmark size={16} /> },
                            { action: 'Perfect Attendance (week)', points: '+20', color: 'teal', icon: <IconUsers size={16} /> },
                            { action: 'Discussion Participation', points: '+3', color: 'violet', icon: <IconFlame size={16} /> },
                            { action: 'Live Class Attendance', points: '+5', color: 'cyan', icon: <IconFlame size={16} /> },
                            { action: 'Library Book Read', points: '+8', color: 'indigo', icon: <IconFlame size={16} /> },
                        ].map(item => (
                            <Paper key={item.action} p="md" withBorder radius="md">
                                <Group justify="space-between">
                                    <Group gap="sm">
                                        <ThemeIcon variant="light" color={item.color} size="md">{item.icon}</ThemeIcon>
                                        <Text size="sm" fw={500}>{item.action}</Text>
                                    </Group>
                                    <Badge color={item.color} variant="filled" size="lg">{item.points}</Badge>
                                </Group>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Paper>
            )}

            {/* Award Badge Modal */}
            <Modal opened={badgeModal} onClose={() => setBadgeModal(false)} title="🎖️ Award Badge" size="md">
                <Stack>
                    <Select
                        label="Select Student"
                        data={students.map(s => ({ value: s.id, label: `${s.name} (${s.class})` }))}
                        value={selectedStudent}
                        onChange={setSelectedStudent}
                        searchable
                        required
                    />
                    <Select
                        label="Select Badge"
                        data={BADGES.map(b => ({ value: b.id, label: `${b.icon} ${b.name}` }))}
                        value={selectedBadge}
                        onChange={setSelectedBadge}
                        required
                    />
                    {selectedBadge && (
                        <Paper p="sm" withBorder radius="md" style={{ background: 'var(--mantine-color-gray-0)' }}>
                            <Text size="sm" c="dimmed">{BADGES.find(b => b.id === selectedBadge)?.description}</Text>
                        </Paper>
                    )}
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setBadgeModal(false)}>Cancel</Button>
                        <Button color="yellow" onClick={awardBadge}>Award Badge 🎉</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
