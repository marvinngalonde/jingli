import { Button, Group, Badge, Modal, TextInput, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUserPlus, IconLogout } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable'; // Fix path if needed
import { useState } from 'react';

interface Visitor {
    id: string;
    name: string;
    purpose: string;
    personToMeet: string;
    timeIn: string;
    timeOut?: string;
    status: 'In' | 'Out';
    date: string;
    idProof?: string;
    vehicleNo?: string;
}

const mockVisitors: Visitor[] = [
    { id: '1', name: 'John Doe', purpose: 'Parent Meeting', personToMeet: 'Sarah Teacher', timeIn: '09:00 AM', status: 'In', date: '2024-03-15', idProof: 'DL-12345', vehicleNo: 'KA-01-AB-1234' },
    { id: '2', name: 'Jane Smith', purpose: 'Delivery', personToMeet: 'Admin', timeIn: '10:30 AM', timeOut: '10:45 AM', status: 'Out', date: '2024-03-15', idProof: 'PAN-ABCDE', vehicleNo: '-' },
];

export default function Visitors() {
    const [visitors, setVisitors] = useState<Visitor[]>(mockVisitors);
    const [search, setSearch] = useState('');
    const [opened, { open, close }] = useDisclosure(false);

    const filteredVisitors = visitors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.personToMeet.toLowerCase().includes(search.toLowerCase())
    );

    const handleCheckOut = (id: string) => {
        setVisitors(prev => prev.map(v =>
            v.id === id ? { ...v, status: 'Out', timeOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : v
        ));
    };

    const handlePrintBadge = (visitor: Visitor) => {
        // Mock print logic
        console.log("Printing badge for", visitor.name);
        alert(`Printing badge for ${visitor.name}`);
    };

    return (
        <>
            <PageHeader
                title="Visitor Management"
                subtitle="Log and track school visitors"
                actions={<Button leftSection={<IconUserPlus size={16} />} onClick={open}>Check In Visitor</Button>}
            />

            <DataTable
                data={filteredVisitors}
                columns={[
                    { accessor: 'name', header: 'Visitor Name' },
                    { accessor: 'purpose', header: 'Purpose' },
                    { accessor: 'personToMeet', header: 'Meeting With' },
                    { accessor: 'idProof', header: 'ID Proof' }, // New Column
                    { accessor: 'vehicleNo', header: 'Vehicle No.' }, // New Column
                    { accessor: 'timeIn', header: 'Time In' },
                    { accessor: 'timeOut', header: 'Time Out' },
                    {
                        accessor: 'status',
                        header: 'Status',
                        render: (item) => (
                            <Badge color={item.status === 'In' ? 'green' : 'gray'}>{item.status}</Badge>
                        )
                    },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        width: 180,
                        render: (item) => (
                            <Group gap="xs">
                                {item.status === 'In' && (
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
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />

            <Modal opened={opened} onClose={close} title="Visitor Check In">
                <TextInput label="Visitor Name" placeholder="Full Name" mb="md" />
                <Select
                    label="Purpose"
                    placeholder="Select purpose"
                    data={['Parent Meeting', 'Delivery', 'Inquiry', 'Official Visit']}
                    mb="md"
                />
                <TextInput label="Person to Meet" placeholder="Staff Name" mb="md" />
                <TextInput label="ID Proof" placeholder="e.g., Driver's License" mb="md" />
                <TextInput label="Vehicle No." placeholder="Optional" mb="lg" />
                <Group justify="flex-end">
                    <Button variant="default" onClick={close}>Cancel</Button>
                    <Button onClick={close}>Check In</Button>
                </Group>
            </Modal>
        </>
    );
}
