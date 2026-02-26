import { Title, Paper, Text, Group, Button, Card, ThemeIcon, Grid, Stack, Table, Badge, Drawer, TextInput, NumberInput, Textarea, Select, ActionIcon, LoadingOverlay, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconReceipt, IconPlus, IconTrash, IconEdit, IconSearch } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function Expenses() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const form = useForm({
        initialValues: { title: '', amount: 0, category: '', description: '', date: '', approvedBy: '', status: 'PENDING' },
        validate: {
            title: (v) => (!v ? 'Title required' : null),
            amount: (v) => (v <= 0 ? 'Amount must be > 0' : null),
        },
    });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchExpenses(); }, []);

    return (
        <div>
            <Title order={2} mb="lg">Expenses Management</Title>

            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Total Expenses</Text><ThemeIcon variant="light" color="red"><IconReceipt size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{expenses.length} Records</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Pending Approval</Text><ThemeIcon variant="light" color="orange"><IconReceipt size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{expenses.filter(e => e.status === 'PENDING').length}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Approved</Text><ThemeIcon variant="light" color="green"><IconReceipt size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{expenses.filter(e => e.status === 'APPROVED').length}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                <LoadingOverlay visible={loading} />
                <Group justify="space-between" mb="md">
                    <TextInput placeholder="Search..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                    <Button leftSection={<IconPlus size={16} />} onClick={openDrawer}>Add Expense</Button>
                </Group>
                <Text ta="center" c="dimmed" py="xl">
                    Expense tracking module. Records will appear here once expense data is available.
                    {expenses.length > 0 && ` ${expenses.length} records found.`}
                </Text>
            </Paper>
        </div>
    );
}
