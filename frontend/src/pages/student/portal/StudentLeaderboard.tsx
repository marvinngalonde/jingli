import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
    Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center,
    Table, TextInput, ScrollArea, SimpleGrid, Avatar, RingProgress, Divider
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconTrophy, IconMedal, IconFlame, IconStar, IconChevronUp, IconChevronDown,
    IconMinus, IconUsers, IconClipboardList, IconBookmark,
} from '@tabler/icons-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuth } from '../../../context/AuthContext';

interface StudentRank {
    id: string;
    name: string;
    admissionNo: string;
    class: string;
    points: number;
    rank: number;
    change: string;
    badges: string[];
    assignments: number;
    quizScore: number;
    attendance: number;
}

const BADGES = [
    { id: 'math_whiz', name: 'Math Whiz', icon: '🧮', color: 'blue' },
    { id: 'perfect_attendance', name: 'Perfect Attendance', icon: '🏆', color: 'green' },
    { id: 'quick_learner', name: 'Quick Learner', icon: '⚡', color: 'yellow' },
    { id: 'team_player', name: 'Team Player', icon: '🤝', color: 'cyan' },
    { id: 'rising_star', name: 'Rising Star', icon: '⭐', color: 'yellow' },
];

const medalColor = (rank: number) =>
    rank === 1 ? 'gold' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--mantine-color-dimmed)';

const changeIcon = (change: string) => {
    if (change === 'up') return <IconChevronUp size={14} color="green" />;
    if (change === 'down') return <IconChevronDown size={14} color="red" />;
    return <IconMinus size={14} color="gray" />;
};

export default function StudentLeaderboard() {
    const { user } = useAuth();
    const [students, setStudents] = useState<StudentRank[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/students/leaderboard');
                setStudents(Array.isArray(data) ? data : []);
            } catch {
                notifications.show({ title: 'Error', message: 'Failed to load leaderboard', color: 'red' });
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <Center h={400}><Loader /></Center>;

    const filtered = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.class?.toLowerCase().includes(search.toLowerCase())
    );

    const top3 = filtered.slice(0, 3);
    const rest = filtered.slice(3);

    // Find current student's rank
    const myRank = students.find(s => s.id === user?.profile?.id);

    return (
        <div>
            <PageHeader
                title="Leaderboard"
                subtitle="See how you rank among your classmates"
            />

            {/* My rank card */}
            {myRank && (
                <Paper withBorder radius="md" p="lg" mb="lg" bg="var(--mantine-color-blue-light)">
                    <Group justify="space-between">
                        <Group>
                            <ThemeIcon variant="filled" color="blue" size="xl" radius="md">
                                <IconTrophy size={22} />
                            </ThemeIcon>
                            <div>
                                <Text fw={700} size="lg">Your Rank: #{myRank.rank}</Text>
                                <Text size="sm" c="dimmed">{myRank.points} points</Text>
                            </div>
                        </Group>
                        <Group>
                            <Badge variant="light" color="teal">Attendance {myRank.attendance}%</Badge>
                            <Badge variant="light" color="orange">Quiz avg {myRank.quizScore}%</Badge>
                        </Group>
                    </Group>
                </Paper>
            )}

            {/* Top 3 Podium */}
            {top3.length >= 1 && (
                <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl" spacing="lg">
                    {[top3[1], top3[0], top3[2]].filter(Boolean).map((student, idx) => {
                        if (!student) return null;
                        const podiumPos = student.rank;
                        const heights = { 1: '180px', 2: '140px', 3: '120px' }[podiumPos] || '120px';
                        return (
                            <Paper
                                key={student.id}
                                withBorder
                                radius="md"
                                p="lg"
                                ta="center"
                                bg="var(--app-surface)"
                                style={{
                                    border: podiumPos === 1 ? '2px solid gold' : undefined,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {podiumPos <= 3 && (
                                    <Text size="2rem" mb="xs">{podiumPos === 1 ? '🥇' : podiumPos === 2 ? '🥈' : '🥉'}</Text>
                                )}
                                <Avatar color="blue" radius="xl" size="lg" mx="auto" mb="sm">
                                    {student.name?.[0]}
                                </Avatar>
                                <Text fw={700} size="sm">{student.name}</Text>
                                <Text size="xs" c="dimmed" mb="xs">{student.class}</Text>
                                <Badge variant="filled" color={podiumPos === 1 ? 'yellow' : podiumPos === 2 ? 'gray' : 'orange'} size="lg">
                                    {student.points} pts
                                </Badge>
                                <Group justify="center" gap={4} mt="sm">
                                    {(student.badges || []).map(b => {
                                        const def = BADGES.find(bd => bd.id === b);
                                        return def ? <Text key={b} title={def.name}>{def.icon}</Text> : null;
                                    })}
                                </Group>
                            </Paper>
                        );
                    })}
                </SimpleGrid>
            )}

            {/* Full Ranking Table */}
            <Paper withBorder radius="md" bg="var(--app-surface)">
                <Group p="md" justify="space-between">
                    <Text fw={600}>Full Rankings</Text>
                    <TextInput
                        size="xs"
                        placeholder="Search student..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        maw={200}
                    />
                </Group>
                <ScrollArea>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w={60}>Rank</Table.Th>
                                <Table.Th>Student</Table.Th>
                                <Table.Th>Class</Table.Th>
                                <Table.Th>Points</Table.Th>
                                <Table.Th>Quizzes</Table.Th>
                                <Table.Th>Attendance</Table.Th>
                                <Table.Th>Badges</Table.Th>
                                <Table.Th w={40}>Trend</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filtered.map(s => (
                                <Table.Tr
                                    key={s.id}
                                    style={{ background: s.id === user?.profile?.id ? 'var(--mantine-color-blue-light)' : undefined }}
                                >
                                    <Table.Td>
                                        <Text fw={700} style={{ color: medalColor(s.rank) }}>
                                            {s.rank <= 3 ? (s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : '🥉') : `#${s.rank}`}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <Avatar color="blue" radius="xl" size="sm">{s.name?.[0]}</Avatar>
                                            <div>
                                                <Text size="sm" fw={500}>{s.name}</Text>
                                                <Text size="xs" c="dimmed">{s.admissionNo}</Text>
                                            </div>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td><Text size="sm" c="dimmed">{s.class}</Text></Table.Td>
                                    <Table.Td><Badge variant="filled" color="blue" size="sm">{s.points}</Badge></Table.Td>
                                    <Table.Td><Text size="sm">{s.quizScore}%</Text></Table.Td>
                                    <Table.Td>
                                        <Badge
                                            variant="light"
                                            color={s.attendance >= 90 ? 'green' : s.attendance >= 75 ? 'yellow' : 'red'}
                                            size="sm"
                                        >
                                            {s.attendance}%
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap={2}>
                                            {(s.badges || []).map(b => {
                                                const def = BADGES.find(bd => bd.id === b);
                                                return def ? <Text key={b} title={def.name} size="sm">{def.icon}</Text> : null;
                                            })}
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>{changeIcon(s.change)}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Paper>
        </div>
    );
}
