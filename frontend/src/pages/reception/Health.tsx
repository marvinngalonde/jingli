import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, Textarea, Select, Modal, Divider, List } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconHeartbeat, IconStethoscope, IconUser, IconPlus, IconTrash, IconSearch, IconEdit, IconEye } from '@tabler/icons-react';
import { api } from '../../services/api';
import { StudentPicker } from '../../components/common/StudentPicker';
import { StaffPicker } from '../../components/common/StaffPicker';

export default function Health() {
    const [activeTab, setActiveTab] = useState<string | null>('visits');
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();

    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [drawerMode, setDrawerMode] = useState<'visit' | 'profile'>('visit');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; name: string }>({ opened: false, id: '', name: '' });

    // Integrated Medical History View State
    const [historyModal, setHistoryModal] = useState<{ opened: boolean; studentId: string | null; studentName: string }>({ opened: false, studentId: null, studentName: '' });

    // Queries
    const { data: visits = [], isLoading: visitsLoading } = useQuery({
        queryKey: ['healthVisits'],
        queryFn: () => api.get('/health/visits').then(res => res.data || [])
    });

    const { data: stats = { totalVisits: 0, todayVisits: 0, profilesRecorded: 0 }, isLoading: statsLoading } = useQuery({
        queryKey: ['healthStats'],
        queryFn: () => api.get('/health/stats').then(res => res.data)
    });

    // Query for viewing a specific student's full history Profile
    const { data: selectedProfile, isLoading: profileLoading } = useQuery({
        queryKey: ['healthProfile', historyModal.studentId],
        queryFn: () => historyModal.studentId ? api.get(`/health/profiles/${historyModal.studentId}`).then(res => res.data) : null,
        enabled: !!historyModal.studentId
    });

    const loading = visitsLoading || statsLoading;

    // Mutations
    const visitMutation = useMutation({
        mutationFn: (values: any) => editingId
            ? api.patch(`/health/visits/${editingId}`, values)
            : api.post('/health/visits', values),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: editingId ? 'Visit updated' : 'Visit logged', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['healthVisits'] });
            queryClient.invalidateQueries({ queryKey: ['healthStats'] });
            closeDrawer();
            visitForm.reset();
            setEditingId(null);
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save visit', color: 'red' })
    });

    const profileMutation = useMutation({
        mutationFn: (values: any) => api.post('/health/profiles', values),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Medical profile saved', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['healthStats'] });
            queryClient.invalidateQueries({ queryKey: ['healthProfile', profileForm.values.studentId] });
            closeDrawer();
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save profile', color: 'red' })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/health/visits/${id}`),
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: 'Visit removed', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['healthVisits'] });
            queryClient.invalidateQueries({ queryKey: ['healthStats'] });
            setDeleteModal({ opened: false, id: '', name: '' });
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' })
    });

    const visitForm = useForm({
        initialValues: { studentId: '', complaint: '', diagnosis: '', treatment: '', attendedBy: '', referral: '', notes: '' },
        validate: {
            studentId: (v) => (!v ? 'Please select a student' : null),
            complaint: (v) => (!v ? 'Complaint required' : null),
            attendedBy: (v) => (!v ? 'Please select attending staff' : null),
        },
    });

    const profileForm = useForm({
        initialValues: { studentId: '', bloodType: '', allergies: '', chronicConditions: '', emergencyContact: '', emergencyPhone: '', medicalAidProvider: '', medicalAidNumber: '', doctorName: '', doctorPhone: '', notes: '' },
        validate: { studentId: (v) => (!v ? 'Please select a student' : null) },
    });

    const openVisitDrawer = (item?: any) => {
        setDrawerMode('visit');
        setEditingId(item?.id || null);
        if (item) {
            visitForm.setValues({
                studentId: item.studentId || '',
                complaint: item.complaint || '',
                diagnosis: item.diagnosis || '',
                treatment: item.treatment || '',
                attendedBy: item.attendedBy || '',
                referral: item.referral || '',
                notes: item.notes || '',
            });
        } else {
            visitForm.reset();
        }
        openDrawer();
    };

    const openProfileDrawer = (studentId?: string) => {
        setDrawerMode('profile');
        setEditingId(null);
        if (studentId) {
            // In a real scenario we might fetch and prepopulate this if we had the data already, 
            // but here we allow picking and editing or just blank form.
            profileForm.setFieldValue('studentId', studentId);
        } else {
            profileForm.reset();
        }
        openDrawer();
    };

    const openHistoryModal = (studentId: string, studentName: string) => {
        setHistoryModal({ opened: true, studentId, studentName });
    }

    const handleSaveVisit = (values: typeof visitForm.values) => visitMutation.mutate(values);
    const handleSaveProfile = (values: typeof profileForm.values) => profileMutation.mutate(values);
    const confirmDelete = (id: string, name: string) => setDeleteModal({ opened: true, id, name });
    const handleDelete = () => deleteMutation.mutate(deleteModal.id);

    const filtered = visits.filter((v: any) =>
        (v.student?.firstName + ' ' + v.student?.lastName).toLowerCase().includes(search.toLowerCase()) ||
        v.complaint?.toLowerCase().includes(search.toLowerCase())
    );

    // Get visits for the currently selected history student
    const historyVisits = visits.filter((v: any) => v.studentId === historyModal.studentId);

    return (
        <div>
            <Title order={2} mb="lg">Health & Clinic</Title>

            {/* Stats */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Total Visits</Text><ThemeIcon variant="light" color="red"><IconHeartbeat size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.totalVisits}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Today's Visits</Text><ThemeIcon variant="light" color="blue"><IconStethoscope size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.todayVisits}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Medical Profiles</Text><ThemeIcon variant="light" color="green"><IconUser size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.profilesRecorded}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="visits" leftSection={<IconStethoscope size={16} />}>Clinic Visits</Tabs.Tab>
                    <Tabs.Tab value="profiles" leftSection={<IconUser size={16} />}>Medical Profiles</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="visits">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search visits..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={() => openVisitDrawer()}>Log Visit</Button>
                        </Group>
                        {filtered.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No clinic visits found. Click "Log Visit" to get started.</Text>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Date</Table.Th><Table.Th>Complaint</Table.Th><Table.Th>Diagnosis</Table.Th><Table.Th>Treatment</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filtered.map((v: any) => (
                                    <Table.Tr key={v.id}>
                                        <Table.Td fw={500}>{v.student?.firstName} {v.student?.lastName}</Table.Td>
                                        <Table.Td>{new Date(v.date).toLocaleDateString()}</Table.Td>
                                        <Table.Td>{v.complaint}</Table.Td>
                                        <Table.Td>{v.diagnosis || '—'}</Table.Td>
                                        <Table.Td>{v.treatment || '—'}</Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon color="teal" variant="subtle" title="View Full History" onClick={() => openHistoryModal(v.studentId, `${v.student?.firstName} ${v.student?.lastName}`)}><IconEye size={16} /></ActionIcon>
                                                <ActionIcon color="blue" variant="subtle" onClick={() => openVisitDrawer(v)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon color="red" variant="subtle" loading={deleteMutation.isPending && deleteMutation.variables === v.id} onClick={() => confirmDelete(v.id, `${v.student?.firstName} ${v.student?.lastName}`)}><IconTrash size={16} /></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="profiles">
                    <Paper p="lg" radius="md" shadow="sm" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text c="dimmed">Create or update a student's medical profile</Text>
                            <Button leftSection={<IconPlus size={16} />} onClick={() => openProfileDrawer()}>New Profile</Button>
                        </Group>
                        <Text ta="center" c="dimmed" py="xl">Use the "View Full History" icon in the Clinic Visits tab to see a student's complete medical profile, or use the form above to record/update properties for any general student.</Text>
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* History Modal */}
            <Modal
                opened={historyModal.opened}
                onClose={() => setHistoryModal({ opened: false, studentId: null, studentName: '' })}
                title={<Title order={3}>Medical History: {historyModal.studentName}</Title>}
                size="xl"
            >
                <div style={{ position: 'relative', minHeight: 200 }}>
                    <LoadingOverlay visible={profileLoading || visitsLoading} />

                    <Grid>
                        {/* Profile Summary Column */}
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Card withBorder shadow="sm" radius="md">
                                <Group justify="space-between" mb="sm">
                                    <Text fw={600}>Medical Profile</Text>
                                    <ActionIcon variant="subtle" color="blue" onClick={() => openProfileDrawer(historyModal.studentId!)}><IconEdit size={16} /></ActionIcon>
                                </Group>

                                {selectedProfile ? (
                                    <Stack gap="xs">
                                        {selectedProfile.bloodType && <Group justify="space-between"><Text size="sm" c="dimmed">Blood Type</Text> <Badge color="red" variant="light">{selectedProfile.bloodType}</Badge></Group>}
                                        {selectedProfile.allergies && <div><Text size="sm" c="dimmed">Allergies</Text><Text size="sm">{selectedProfile.allergies}</Text></div>}
                                        {selectedProfile.chronicConditions && <div><Text size="sm" c="dimmed">Chronic Conditions</Text><Text size="sm">{selectedProfile.chronicConditions}</Text></div>}
                                        {selectedProfile.doctorName && <div><Text size="sm" c="dimmed">Doctor</Text><Text size="sm">{selectedProfile.doctorName} {selectedProfile.doctorPhone && `(${selectedProfile.doctorPhone})`}</Text></div>}
                                        {selectedProfile.medicalAidProvider && <div><Text size="sm" c="dimmed">Medical Aid</Text><Text size="sm">{selectedProfile.medicalAidProvider} {selectedProfile.medicalAidNumber && `[#${selectedProfile.medicalAidNumber}]`}</Text></div>}
                                        {selectedProfile.emergencyContact && <div><Text size="sm" c="dimmed">Emergency Contact</Text><Text size="sm">{selectedProfile.emergencyContact} {selectedProfile.emergencyPhone && `(${selectedProfile.emergencyPhone})`}</Text></div>}
                                        {selectedProfile.notes && <div><Text size="sm" c="dimmed">General Notes</Text><Text size="sm">{selectedProfile.notes}</Text></div>}
                                    </Stack>
                                ) : (
                                    <Text size="sm" c="dimmed" ta="center" py="md">No profile recorded for this student.</Text>
                                )}
                            </Card>
                        </Grid.Col>

                        {/* Recent Visits Column */}
                        <Grid.Col span={{ base: 12, md: 8 }}>
                            <Text fw={600} mb="sm">Recent Clinic Visits ({historyVisits.length})</Text>
                            {historyVisits.length === 0 ? (
                                <Text size="sm" c="dimmed">No visits on record.</Text>
                            ) : (
                                <List spacing="sm" size="sm" center={false}>
                                    {historyVisits.map((v: any) => (
                                        <List.Item key={v.id} icon={<ThemeIcon color="blue" size={24} radius="xl"><IconStethoscope size={14} /></ThemeIcon>}>
                                            <Paper p="sm" withBorder radius="md">
                                                <Group justify="space-between" mb="xs">
                                                    <Text fw={500}>{new Date(v.date).toLocaleDateString()}</Text>
                                                    {v.parentNotified && <Badge color="green" variant="light" size="xs">Parent Notified</Badge>}
                                                </Group>
                                                <Text size="sm"><b>Complaint:</b> {v.complaint}</Text>
                                                {v.diagnosis && <Text size="sm"><b>Diagnosis:</b> {v.diagnosis}</Text>}
                                                {v.treatment && <Text size="sm"><b>Treatment:</b> {v.treatment}</Text>}
                                                {v.referral && <Text size="sm"><b>Referral:</b> <Badge color="orange" variant="light">{v.referral}</Badge></Text>}
                                                {v.notes && <Text size="sm" c="dimmed" mt="xs"><i>Notes: {v.notes}</i></Text>}
                                            </Paper>
                                        </List.Item>
                                    ))}
                                </List>
                            )}
                        </Grid.Col>
                    </Grid>
                </div>
            </Modal>

            {/* Drawer */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={drawerMode === 'profile' ? 'Medical Profile' : (editingId ? 'Edit Clinic Visit' : 'Log Clinic Visit')} position="right" size="md">
                {drawerMode === 'profile' ? (
                    <form onSubmit={profileForm.onSubmit(handleSaveProfile)}>
                        <Stack>
                            <StudentPicker
                                value={profileForm.values.studentId}
                                onChange={(val) => profileForm.setFieldValue('studentId', val || '')}
                                required
                                error={profileForm.errors.studentId as string}
                            />
                            <Select label="Blood Type" data={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} {...profileForm.getInputProps('bloodType')} />
                            <Textarea label="Allergies" placeholder="List known allergies" {...profileForm.getInputProps('allergies')} />
                            <Textarea label="Chronic Conditions" {...profileForm.getInputProps('chronicConditions')} />
                            <TextInput label="Emergency Contact Name" placeholder="Parent/Guardian name" {...profileForm.getInputProps('emergencyContact')} />
                            <TextInput label="Emergency Phone" placeholder="+263..." {...profileForm.getInputProps('emergencyPhone')} />
                            <TextInput label="Medical Aid Provider" {...profileForm.getInputProps('medicalAidProvider')} />
                            <TextInput label="Medical Aid Number" {...profileForm.getInputProps('medicalAidNumber')} />
                            <TextInput label="Doctor Name" {...profileForm.getInputProps('doctorName')} />
                            <TextInput label="Doctor Phone" {...profileForm.getInputProps('doctorPhone')} />
                            <Textarea label="Notes" {...profileForm.getInputProps('notes')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={profileMutation.isPending}>Save Profile</Button></Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={visitForm.onSubmit(handleSaveVisit)}>
                        <Stack>
                            <StudentPicker
                                value={visitForm.values.studentId}
                                onChange={(val) => visitForm.setFieldValue('studentId', val || '')}
                                required
                                error={visitForm.errors.studentId as string}
                            />
                            <Textarea label="Complaint" required {...visitForm.getInputProps('complaint')} />
                            <TextInput label="Diagnosis" {...visitForm.getInputProps('diagnosis')} />
                            <Textarea label="Treatment Given" {...visitForm.getInputProps('treatment')} />
                            <StaffPicker
                                label="Attended By"
                                value={visitForm.values.attendedBy}
                                onChange={(val) => visitForm.setFieldValue('attendedBy', val || '')}
                                required
                                error={visitForm.errors.attendedBy as string}
                            />
                            <TextInput label="Referral" placeholder="External referral if needed" {...visitForm.getInputProps('referral')} />
                            <Textarea label="Notes" {...visitForm.getInputProps('notes')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={visitMutation.isPending}>{editingId ? 'Update Visit' : 'Save Visit'}</Button></Group>
                        </Stack>
                    </form>
                )}
            </Drawer>

            {/* Delete Confirmation */}
            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Confirm Deletion">
                <Stack>
                    <Text size="sm">Are you sure you want to delete this clinic visit for <b>{deleteModal.name}</b>?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
