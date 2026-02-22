import { Button, Group, Badge, Modal, TextInput, Select, Stack, Loader, Center, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUserPlus, IconLogout, IconPrinter } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { useState, useEffect } from 'react';
import { visitorsService, VisitorStatus } from '../../services/visitorsService';
import type { Visitor } from '../../services/visitorsService';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';

export default function Visitors() {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm({
        initialValues: {
            name: '',
            phone: '',
            purpose: 'Parent Meeting',
            personToMeet: '',
            idProof: '',
            vehicleNo: '',
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
            phone: (value) => (value.length < 5 ? 'Invalid phone' : null),
        },
    });

    useEffect(() => {
        loadVisitors();
    }, []);

    const loadVisitors = async () => {
        setLoading(true);
        try {
            const data = await visitorsService.getAll();
            setVisitors(data);
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to load visitors', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async (id: string) => {
        try {
            await visitorsService.checkout(id);
            notifications.show({ title: 'Checked Out', message: 'Visitor marked as exited', color: 'green' });
            loadVisitors();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to check out visitor', color: 'red' });
        }
    };

    const handleCheckIn = async (values: typeof form.values) => {
        setSubmitting(true);
        try {
            await visitorsService.create(values);
            notifications.show({ title: 'Success', message: 'Visitor checked in', color: 'green' });
            form.reset();
            close();
            loadVisitors();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to check in visitor', color: 'red' });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrintBadge = (visitor: Visitor) => {
        alert(`Printing badge for ${visitor.name}\nTime In: ${new Date(visitor.checkIn).toLocaleTimeString()}`);
    };

    const filteredVisitors = visitors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.personToMeet && v.personToMeet.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            <PageHeader
                title="Visitor Management"
                subtitle="Log and track school visitors"
                actions={<Button leftSection={<IconUserPlus size={16} />} onClick={open}>Check In Visitor</Button>}
            />

            {loading ? (
                <Center p="xl"><Loader /></Center>
            ) : (
                <DataTable
                    data={filteredVisitors}
                    columns={[
                        { accessor: 'name', header: 'Visitor Name' },
                        { accessor: 'purpose', header: 'Purpose' },
                        { accessor: 'personToMeet', header: 'Meeting With' },
                        { accessor: 'idProof', header: 'ID Proof' },
                        { accessor: 'vehicleNo', header: 'Vehicle No.' },
                        {
                            accessor: 'checkIn',
                            header: 'Time In',
                            render: (item) => new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        },
                        {
                            accessor: 'checkOut',
                            header: 'Time Out',
                            render: (item) => item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
                        },
                        {
                            accessor: 'status',
                            header: 'Status',
                            render: (item) => (
                                <Badge color={item.status === VisitorStatus.IN ? 'green' : 'gray'}>{item.status}</Badge>
                            )
                        },
                        {
                            accessor: 'actions',
                            header: 'Actions',
                            width: 180,
                            render: (item) => (
                                <Group gap="xs">
                                    {item.status === VisitorStatus.IN && (
                                        <Button
                                            size="compact-xs"
                                            color="orange"
                                            variant="light"
                                            leftSection={<IconLogout size={14} />}
                                            onClick={() => handleCheckOut(item.id)}
                                        >
                                            Out
                                        </Button>
                                    )}
                                    <Button
                                        size="compact-xs"
                                        color="blue"
                                        variant="subtle"
                                        leftSection={<IconPrinter size={14} />}
                                        onClick={() => handlePrintBadge(item)}
                                    >
                                        Badge
                                    </Button>
                                </Group>
                            )
                        }
                    ]}
                    search={search}
                    onSearchChange={setSearch}
                />
            )}

            <Modal opened={opened} onClose={close} title="Visitor Check In">
                <form onSubmit={form.onSubmit(handleCheckIn)}>
                    <Stack>
                        <TextInput label="Visitor Name" placeholder="Full Name" required {...form.getInputProps('name')} />
                        <TextInput label="Phone Number" placeholder="e.g. +123456789" required {...form.getInputProps('phone')} />
                        <Select
                            label="Purpose"
                            placeholder="Select purpose"
                            data={['Parent Meeting', 'Delivery', 'Inquiry', 'Official Visit', 'Maintenance']}
                            {...form.getInputProps('purpose')}
                        />
                        <TextInput label="Person to Meet" placeholder="Staff Name" {...form.getInputProps('personToMeet')} />
                        <TextInput label="ID Proof" placeholder="e.g., Driver's License" {...form.getInputProps('idProof')} />
                        <TextInput label="Vehicle No." placeholder="Optional" {...form.getInputProps('vehicleNo')} />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={close}>Cancel</Button>
                            <Button type="submit" loading={submitting}>Check In</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
