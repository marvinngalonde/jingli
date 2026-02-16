import { useState } from 'react';
import { Tabs, Button, Group, Text, Modal, TextInput, Select, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconClock, IconDoorExit, IconPlus, IconPrinter } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';

// --- Mock Data ---
const mockLateArrivals = [
    { id: '1', student: 'Tom Holland (10A)', time: '08:15 AM', reason: 'Bus Delay', reportedBy: 'Parent' },
    { id: '2', student: 'Zendaya Coleman (10A)', time: '08:20 AM', reason: 'Traffic', reportedBy: 'Self' },
];

const mockGatePasses = [
    { id: '1', student: 'Peter Parker (10B)', timeOut: '11:00 AM', reason: 'Medical Appointment', guardian: 'May Parker', status: 'Active' },
    { id: '2', student: 'Ned Leeds (10B)', timeOut: '10:00 AM', reason: 'Family Emergency', guardian: 'Mrs. Leeds', status: 'Returned' },
];

export default function StudentLogistics() {
    const [activeTab, setActiveTab] = useState<string | null>('late');
    const [lateOpened, { open: openLate, close: closeLate }] = useDisclosure(false);
    const [passOpened, { open: openPass, close: closePass }] = useDisclosure(false);

    // Lists
    const [lateArrivals, setLateArrivals] = useState(mockLateArrivals);
    const [gatePasses, setGatePasses] = useState(mockGatePasses);

    const handlePrintPass = (student: string) => {
        alert(`Printing Gate Pass for ${student}`);
    };

    const handleLogLate = () => {
        setLateArrivals([...lateArrivals]); // Mock update
        closeLate();
    };

    const handleIssuePass = () => {
        setGatePasses([...gatePasses]); // Mock update
        closePass();
        handlePrintPass("Student Name");
    };

    const LateArrivalsTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Log students arriving after school start time.</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openLate}>Log Late Arrival</Button>
            </Group>
            <DataTable
                data={lateArrivals}
                columns={[
                    { accessor: 'student', header: 'Student' },
                    { accessor: 'time', header: 'Arrival Time' },
                    { accessor: 'reason', header: 'Reason' },
                    { accessor: 'reportedBy', header: 'Reported By' },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        render: () => <Badge color="orange" variant="light">Recorded</Badge>
                    }
                ]}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    const GatePassTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Issue gate passes for early dismissal.</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openPass}>Issue Gate Pass</Button>
            </Group>
            <DataTable
                data={gatePasses}
                columns={[
                    { accessor: 'student', header: 'Student' },
                    { accessor: 'timeOut', header: 'Time Out' },
                    { accessor: 'reason', header: 'Reason' },
                    { accessor: 'guardian', header: 'Guardian/Escort' },
                    {
                        accessor: 'status',
                        header: 'Status',
                        render: (item) => <Badge color={item.status === 'Active' ? 'blue' : 'gray'}>{item.status}</Badge>
                    },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        render: (item) => (
                            <Button
                                size="compact-xs"
                                variant="light"
                                leftSection={<IconPrinter size={14} />}
                                onClick={() => handlePrintPass(item.student)}
                            >
                                Print Pass
                            </Button>
                        )
                    }
                ]}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    return (
        <>
            <PageHeader
                title="Student Logistics"
                subtitle="Manage late arrivals and early exits"
            />

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="late" leftSection={<IconClock size={16} />}>Late Arrivals</Tabs.Tab>
                    <Tabs.Tab value="gatepass" leftSection={<IconDoorExit size={16} />}>Gate Pass</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="late">
                    <LateArrivalsTab />
                </Tabs.Panel>

                <Tabs.Panel value="gatepass">
                    <GatePassTab />
                </Tabs.Panel>
            </Tabs>

            {/* Modals */}
            <Modal opened={lateOpened} onClose={closeLate} title="Log Late Arrival">
                <TextInput label="Student Name/ID" placeholder="Search student..." mb="md" />
                <TextInput label="Arrival Time" defaultValue={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} mb="md" />
                <Select label="Reason" data={['Traffic', 'Bus Delay', 'Overslept', 'Medical', 'Other']} mb="md" />
                <TextInput label="Reported By" placeholder="Parent / Self" mb="lg" />
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeLate}>Cancel</Button>
                    <Button onClick={handleLogLate}>Log</Button>
                </Group>
            </Modal>

            <Modal opened={passOpened} onClose={closePass} title="Issue Gate Pass">
                <TextInput label="Student Name/ID" placeholder="Search student..." mb="md" />
                <TextInput label="Time Out" defaultValue={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} mb="md" />
                <TextInput label="Reason" placeholder="e.g. Medical Appointment" mb="md" />
                <TextInput label="Guardian Name" placeholder="Person picking up student" mb="md" />
                <TextInput label="Guardian Phone" placeholder="Contact number" mb="lg" />
                <Group justify="flex-end">
                    <Button variant="default" onClick={closePass}>Cancel</Button>
                    <Button onClick={handleIssuePass}>Issue & Print</Button>
                </Group>
            </Modal>
        </>
    );
}
