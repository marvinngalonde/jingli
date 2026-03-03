import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, NumberInput, Select, Textarea, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBuildingFortress, IconCategory, IconPlus, IconTrash, IconSearch, IconEdit } from '@tabler/icons-react';
import { api } from '../../services/api';

export default function Facilities() {
    const [activeTab, setActiveTab] = useState<string | null>('categories');
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();

    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [drawerType, setDrawerType] = useState<'category' | 'asset'>('category');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; type: 'category' | 'asset'; name: string }>({ opened: false, id: '', type: 'category', name: '' });

    // Queries
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['assetCategories'],
        queryFn: () => api.get('/assets/categories').then(res => res.data || [])
    });

    const { data: assets = [], isLoading: assetsLoading } = useQuery({
        queryKey: ['assets'],
        queryFn: () => api.get('/assets').then(res => res.data || [])
    });

    const { data: stats = { totalCategories: 0, totalAssets: 0, totalValue: 0 }, isLoading: statsLoading } = useQuery({
        queryKey: ['assetStats'],
        queryFn: () => api.get('/assets/stats').then(res => res.data)
    });

    const loading = categoriesLoading || assetsLoading || statsLoading;

    // Mutations
    const categoryMutation = useMutation({
        mutationFn: (values: any) => editingId
            ? api.patch(`/assets/categories/${editingId}`, values)
            : api.post('/assets/categories', values),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: editingId ? 'Category updated' : 'Category added', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
            queryClient.invalidateQueries({ queryKey: ['assetStats'] });
            closeDrawer();
            categoryForm.reset();
            setEditingId(null);
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' })
    });

    const assetMutation = useMutation({
        mutationFn: (values: any) => editingId
            ? api.patch(`/assets/${editingId}`, values)
            : api.post('/assets', values),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: editingId ? 'Asset updated' : 'Asset added', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['assetStats'] });
            closeDrawer();
            assetForm.reset();
            setEditingId(null);
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' })
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, type }: { id: string, type: 'category' | 'asset' }) => api.delete(`/assets${type === 'category' ? '/categories' : ''}/${id}`),
        onSuccess: (_, { type }) => {
            notifications.show({ title: 'Deleted', message: `${type === 'category' ? 'Category' : 'Asset'} removed`, color: 'green' });
            queryClient.invalidateQueries({ queryKey: [type === 'category' ? 'assetCategories' : 'assets'] });
            queryClient.invalidateQueries({ queryKey: ['assetStats'] });
            setDeleteModal({ opened: false, id: '', type: 'category', name: '' });
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' })
    });

    const categoryForm = useForm({
        initialValues: { name: '', description: '' },
        validate: { name: (v) => (!v ? 'Name is required' : null) },
    });

    const assetForm = useForm({
        initialValues: { name: '', categoryId: '', location: '', purchasePrice: 0, purchaseDate: '', condition: 'GOOD', serialNo: '' },
        validate: {
            name: (v) => (!v ? 'Name is required' : null),
            categoryId: (v) => (!v ? 'Category is required' : null),
        },
    });

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
                serialNo: item.serialNo || '',
            } : { name: '', categoryId: '', location: '', purchasePrice: 0, purchaseDate: '', condition: 'GOOD', serialNo: '' });
        }
        openDrawer();
    };

    const handleSaveCategory = (values: typeof categoryForm.values) => categoryMutation.mutate(values);
    const handleSaveAsset = (values: typeof assetForm.values) => assetMutation.mutate({ ...values, purchasePrice: Number(values.purchasePrice) });
    const confirmDelete = (id: string, type: 'category' | 'asset', name: string) => setDeleteModal({ opened: true, id, type, name });
    const handleDelete = () => deleteMutation.mutate({ id: deleteModal.id, type: deleteModal.type });

    const filteredCategories = categories.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredAssets = assets.filter((a: any) => a.name?.toLowerCase().includes(search.toLowerCase()) || a.serialNo?.toLowerCase().includes(search.toLowerCase()));
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
                                <Table.Tbody>{filteredCategories.map((c: any) => (
                                    <Table.Tr key={c.id}>
                                        <Table.Td fw={500}>{c.name}</Table.Td>
                                        <Table.Td>{c.description || '—'}</Table.Td>
                                        <Table.Td><Badge variant="light">{c._count?.assets || 0}</Badge></Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenDrawer('category', c)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon color="red" variant="subtle" loading={deleteMutation.isPending && deleteMutation.variables?.id === c.id} onClick={() => confirmDelete(c.id, 'category', c.name)}><IconTrash size={16} /></ActionIcon>
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
                                <Table.Tbody>{filteredAssets.map((a: any, idx: number) => (
                                    <Table.Tr key={a.id}>
                                        <Table.Td>{idx + 1}</Table.Td>
                                        <Table.Td fw={500}>{a.name}</Table.Td>
                                        <Table.Td>{a.category?.name || '—'}</Table.Td>
                                        <Table.Td>{a.serialNo || '—'}</Table.Td>
                                        <Table.Td>{a.location || '—'}</Table.Td>
                                        <Table.Td><Badge color={a.condition === 'GOOD' || a.condition === 'NEW' ? 'green' : a.condition === 'FAIR' ? 'orange' : 'red'} variant="light">{a.condition}</Badge></Table.Td>
                                        <Table.Td>${a.purchasePrice?.toLocaleString()}</Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenDrawer('asset', a)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon color="red" variant="subtle" loading={deleteMutation.isPending && deleteMutation.variables?.id === a.id} onClick={() => confirmDelete(a.id, 'asset', a.name)}><IconTrash size={16} /></ActionIcon>
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
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={categoryMutation.isPending}>{editingId ? 'Update' : 'Save'}</Button></Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={assetForm.onSubmit(handleSaveAsset)}>
                        <Stack>
                            <TextInput label="Asset Name" required {...assetForm.getInputProps('name')} />
                            <Select label="Category" data={categories.map((c: any) => ({ value: c.id, label: c.name }))} required searchable {...assetForm.getInputProps('categoryId')} />
                            <TextInput label="Serial Number" {...assetForm.getInputProps('serialNo')} />
                            <TextInput label="Location" {...assetForm.getInputProps('location')} />
                            <NumberInput label="Purchase Price" prefix="$" min={0} {...assetForm.getInputProps('purchasePrice')} />
                            <TextInput label="Purchase Date" type="date" {...assetForm.getInputProps('purchaseDate')} />
                            <Select label="Condition" data={['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']} {...assetForm.getInputProps('condition')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={assetMutation.isPending}>{editingId ? 'Update' : 'Save'}</Button></Group>
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
                        <Button color="red" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
