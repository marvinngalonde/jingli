import { useState, useEffect } from 'react';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, NumberInput, Select, Textarea, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBuildingFortress, IconCategory, IconPlus, IconTrash, IconSearch, IconEdit } from '@tabler/icons-react';
import { api } from '../services/api';

export default function Facilities() {
    const [activeTab, setActiveTab] = useState<string | null>('categories');
    const [categories, setCategories] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState({ totalCategories: 0, totalAssets: 0, totalValue: 0 });
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [drawerType, setDrawerType] = useState<'category' | 'asset'>('category');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; type: 'category' | 'asset'; name: string }>({ opened: false, id: '', type: 'category', name: '' });

    const categoryForm = useForm({
        initialValues: { name: '', description: '' },
        validate: { name: (v) => (!v ? 'Name is required' : null) },
    });

    const assetForm = useForm({
        initialValues: { name: '', categoryId: '', location: '', purchasePrice: 0, purchaseDate: '', condition: 'GOOD', serialNumber: '' },
        validate: {
            name: (v) => (!v ? 'Name is required' : null),
            categoryId: (v) => (!v ? 'Category is required' : null),
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, assetRes, statsRes] = await Promise.allSettled([
                api.get('/assets/categories'),
                api.get('/assets'),
                api.get('/assets/stats'),
            ]);
            if (catRes.status === 'fulfilled') setCategories(catRes.value.data || []);
            if (assetRes.status === 'fulfilled') setAssets(assetRes.value.data || []);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenDrawer = (type: 'category' | 'asset', item?: any) => {
        setDrawerType(type);
        setEditingId(item?.id || null);
        if (type === 'category') {
            categoryForm.setValues(item ? { name: item.name || '', description: item.description || '' } : { name: '', description: '' });
        } else {
            assetForm.setValues(item ? {
                name: item.name || '',
                categoryId: item.categoryId || '',
                location: item.location || '',
                purchasePrice: item.purchasePrice || 0,
                purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
                condition: item.condition || 'GOOD',
                serialNumber: item.serialNumber || '',
            } : { name: '', categoryId: '', location: '', purchasePrice: 0, purchaseDate: '', condition: 'GOOD', serialNumber: '' });
        }
        openDrawer();
    };

    const handleSaveCategory = async (values: typeof categoryForm.values) => {
        setSubmitting(true);
        try {
            if (editingId) {
                await api.patch(`/assets/categories/${editingId}`, values);
                notifications.show({ title: 'Success', message: 'Category updated', color: 'green' });
            } else {
                await api.post('/assets/categories', values);
                notifications.show({ title: 'Success', message: 'Category added', color: 'green' });
            }
            closeDrawer(); categoryForm.reset(); setEditingId(null); fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally { setSubmitting(false); }
    };

    const handleSaveAsset = async (values: typeof assetForm.values) => {
        setSubmitting(true);
        try {
            const payload = { ...values, purchasePrice: Number(values.purchasePrice) };
            if (editingId) {
                await api.patch(`/assets/${editingId}`, payload);
                notifications.show({ title: 'Success', message: 'Asset updated', color: 'green' });
            } else {
                await api.post('/assets', payload);
                notifications.show({ title: 'Success', message: 'Asset added', color: 'green' });
            }
            closeDrawer(); assetForm.reset(); setEditingId(null); fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally { setSubmitting(false); }
    };

    const confirmDelete = (id: string, type: 'category' | 'asset', name: string) => {
        setDeleteModal({ opened: true, id, type, name });
    };

    const handleDelete = async () => {
        const { id, type } = deleteModal;
        try {
            await api.delete(`/assets${type === 'category' ? '/categories' : ''}/${id}`);
            notifications.show({ title: 'Deleted', message: `${type === 'category' ? 'Category' : 'Asset'} removed`, color: 'green' });
            fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally {
            setDeleteModal({ opened: false, id: '', type: 'category', name: '' });
        }
    };

    const filteredCategories = categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredAssets = assets.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()) || a.serialNumber?.toLowerCase().includes(search.toLowerCase()));
    let snCounter = 0;

    return (
        <div>
            <Title order={2} mb="lg">Facilities & Assets</Title>
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Categories</Text><ThemeIcon variant="light" color="blue"><IconCategory size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.totalCategories}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Total Assets</Text><ThemeIcon variant="light" color="green"><IconBuildingFortress size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.totalAssets}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Total Value</Text><ThemeIcon variant="light" color="orange"><IconBuildingFortress size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">${stats.totalValue?.toLocaleString()}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="categories" leftSection={<IconCategory size={16} />}>Categories</Tabs.Tab>
                    <Tabs.Tab value="assets" leftSection={<IconBuildingFortress size={16} />}>Assets</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="categories">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search categories..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenDrawer('category')}>Add Category</Button>
                        </Group>
                        {filteredCategories.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No categories found. Click "Add Category" to get started.</Text>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Description</Table.Th><Table.Th>Assets</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filteredCategories.map(c => (
                                    <Table.Tr key={c.id}>
                                        <Table.Td fw={500}>{c.name}</Table.Td>
                                        <Table.Td>{c.description || '—'}</Table.Td>
                                        <Table.Td><Badge variant="light">{c._count?.assets || 0}</Badge></Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenDrawer('category', c)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon color="red" variant="subtle" onClick={() => confirmDelete(c.id, 'category', c.name)}><IconTrash size={16} /></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="assets">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search assets..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenDrawer('asset')}>Add Asset</Button>
                        </Group>
                        {filteredAssets.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No assets found. Click "Add Asset" to get started.</Text>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead><Table.Tr><Table.Th>S/N</Table.Th><Table.Th>Name</Table.Th><Table.Th>Category</Table.Th><Table.Th>Serial No.</Table.Th><Table.Th>Location</Table.Th><Table.Th>Condition</Table.Th><Table.Th>Value</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filteredAssets.map((a, idx) => (
                                    <Table.Tr key={a.id}>
                                        <Table.Td>{idx + 1}</Table.Td>
                                        <Table.Td fw={500}>{a.name}</Table.Td>
                                        <Table.Td>{a.category?.name || '—'}</Table.Td>
                                        <Table.Td>{a.serialNumber || '—'}</Table.Td>
                                        <Table.Td>{a.location || '—'}</Table.Td>
                                        <Table.Td><Badge color={a.condition === 'GOOD' || a.condition === 'NEW' ? 'green' : a.condition === 'FAIR' ? 'orange' : 'red'} variant="light">{a.condition}</Badge></Table.Td>
                                        <Table.Td>${a.purchasePrice?.toLocaleString()}</Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenDrawer('asset', a)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon color="red" variant="subtle" onClick={() => confirmDelete(a.id, 'asset', a.name)}><IconTrash size={16} /></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? `Edit ${drawerType === 'category' ? 'Category' : 'Asset'}` : `Add ${drawerType === 'category' ? 'Category' : 'Asset'}`} position="right" size="md">
                {drawerType === 'category' ? (
                    <form onSubmit={categoryForm.onSubmit(handleSaveCategory)}>
                        <Stack>
                            <TextInput label="Name" placeholder="e.g. Furniture" required {...categoryForm.getInputProps('name')} />
                            <Textarea label="Description" {...categoryForm.getInputProps('description')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={submitting}>{editingId ? 'Update' : 'Save'}</Button></Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={assetForm.onSubmit(handleSaveAsset)}>
                        <Stack>
                            <TextInput label="Asset Name" required {...assetForm.getInputProps('name')} />
                            <Select label="Category" data={categories.map(c => ({ value: c.id, label: c.name }))} required searchable {...assetForm.getInputProps('categoryId')} />
                            <TextInput label="Serial Number" {...assetForm.getInputProps('serialNumber')} />
                            <TextInput label="Location" {...assetForm.getInputProps('location')} />
                            <NumberInput label="Purchase Price" prefix="$" min={0} {...assetForm.getInputProps('purchasePrice')} />
                            <TextInput label="Purchase Date" type="date" {...assetForm.getInputProps('purchaseDate')} />
                            <Select label="Condition" data={['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']} {...assetForm.getInputProps('condition')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={submitting}>{editingId ? 'Update' : 'Save'}</Button></Group>
                        </Stack>
                    </form>
                )}
            </Drawer>

            {/* Delete Confirmation */}
            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Confirm Deletion">
                <Stack>
                    <Text size="sm">Are you sure you want to delete <b>{deleteModal.name}</b>? This cannot be undone.</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
