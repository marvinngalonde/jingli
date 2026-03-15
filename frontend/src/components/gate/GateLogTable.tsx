import { DataTable, type Column } from '../common/DataTable';
import { Badge, Text, Group } from '@mantine/core';

interface GateLog {
    id: string;
    staff?: {
        firstName: string;
        lastName: string;
        employeeId: string;
    };
    student?: {
        firstName: string;
        lastName: string;
        admissionNo: string;
        section?: {
            name: string;
            classLevel?: {
                name: string;
                level: string;
            };
        };
    };
    checkInTime?: string;
    checkOutTime?: string;
    arrivalTime?: string;
    date?: string;
    reason?: string;
    notes?: string;
    recordedBy?: string;
}

interface Props {
    data: GateLog[];
    loading?: boolean;
    type: 'staff' | 'student';
    pagination?: {
        total: number;
        page: number;
        onChange: (page: number) => void;
    };
}

export function GateLogTable({ data, loading, type, pagination }: Props) {
    const columns: Column<GateLog>[] = [
        {
            accessor: 'person',
            header: type === 'staff' ? 'Staff Member' : 'Student',
            render: (item) => {
                if (type === 'staff') {
                    return (
                        <div>
                            <Text size="sm" fw={500}>{item.staff?.firstName} {item.staff?.lastName}</Text>
                            <Text size="xs" c="dimmed">{item.staff?.employeeId}</Text>
                        </div>
                    );
                }
                return (
                    <div>
                        <Text size="sm" fw={500}>{item.student?.firstName} {item.student?.lastName}</Text>
                        <Text size="xs" c="dimmed">{item.student?.admissionNo}</Text>
                    </div>
                );
            }
        },
        ...(type === 'student' ? [{
            accessor: 'class',
            header: 'Class',
            render: (item: GateLog) => {
                const s = item.student?.section;
                return s ? `${s.classLevel?.name || ''} ${s.classLevel?.level || ''} ${s.name || ''}`.trim() : 'N/A';
            }
        }] : []),
        {
            accessor: 'time',
            header: type === 'staff' ? 'Check In/Out' : 'Arrival Time',
            render: (item) => {
                if (type === 'staff') {
                    return (
                        <Group gap="xs">
                            <Badge color="green" variant="light">
                                IN: {new Date(item.checkInTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Badge>
                            {item.checkOutTime && (
                                <Badge color="red" variant="light">
                                    OUT: {new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Badge>
                            )}
                        </Group>
                    );
                }
                return (
                    <Text size="sm">
                        {new Date(item.arrivalTime!).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                );
            }
        },
        {
            accessor: 'details',
            header: 'Details',
            render: (item) => <Text size="sm">{item.reason || item.notes || '-'}</Text>
        },
        {
            accessor: 'recordedBy',
            header: 'Recorded By',
            render: (item) => <Text size="sm">{item.recordedBy}</Text>
        }
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            loading={loading}
            pagination={pagination}
        />
    );
}
