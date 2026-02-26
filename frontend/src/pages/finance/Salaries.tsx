import { Title, Paper, Text, Group, Button, Card, ThemeIcon, Grid, Stack, Table, Badge, Drawer, TextInput, NumberInput, Textarea, Select, ActionIcon, LoadingOverlay, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconWallet, IconPlus, IconTrash, IconEdit, IconSearch } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function Salaries() {
    const [salaries, setSalaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const form = useForm({
        initialValues: { staffId: '', month: '', year: new Date().getFullYear(), basicSalary: 0, allowances: 0, deductions: 0, netSalary: 0, status: 'PENDING' },
        validate: { staffId: (v) => (!v ? 'Staff member required' : null) },
    });

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/salaries');
            setSalaries(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchSalaries(); }, []);

    return (
        <div>
            <Title order={2} mb="lg">Salaries Management</Title>

            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Total Payroll</Text><ThemeIcon variant="light" color="blue"><IconWallet size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{salaries.length} Records</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Pending</Text><ThemeIcon variant="light" color="orange"><IconWallet size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{salaries.filter(s => s.status === 'PENDING').length}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Paid</Text><ThemeIcon variant="light" color="green"><IconWallet size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{salaries.filter(s => s.status === 'PAID').length}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                <LoadingOverlay visible={loading} />
                <Group justify="space-between" mb="md">
                    <TextInput placeholder="Search..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                    <Button leftSection={<IconPlus size={16} />} onClick={openDrawer}>Add Salary Record</Button>
                </Group>
                <Text ta="center" c="dimmed" py="xl">
                    Salary management module. Records will appear here once payroll data is available.
                    {salaries.length > 0 && ` ${salaries.length} records found.`}
                </Text>
            </Paper>
        </div>
    );
}
