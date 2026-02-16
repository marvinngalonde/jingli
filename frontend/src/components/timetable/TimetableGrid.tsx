import { Paper, Grid, Text, Box, Group, ActionIcon, Menu } from '@mantine/core';
import { IconClock, IconMapPin, IconUser, IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import type { TimetableEntry, DayOfWeek } from '../../types/academics';

interface TimetableGridProps {
    entries: TimetableEntry[];
    onEdit?: (entry: TimetableEntry) => void;
    onDelete?: (id: string) => void;
    loading?: boolean;
}

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'
];

export function TimetableGrid({ entries, onEdit, onDelete }: TimetableGridProps) {
    const getEntriesForSlot = (day: DayOfWeek, time: string) => {
        return entries.filter(e => {
            const entryStart = new Date(e.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            // Simple check if admission starts at this hour (e.g. 08:00)
            return entryStart.startsWith(time) && e.day === day;
        });
    };

    return (
        <Box style={{ overflowX: 'auto' }}>
            <Box style={{ minWidth: 800 }}>
                {/* Header Row */}
                <Grid gutter={0}>
                    <Grid.Col span={1}>
                        <Box p="sm" bg="gray.1" style={{ borderBottom: '1px solid #dee2e6' }}>
                            <Text fw={700} size="sm" ta="center">Time</Text>
                        </Box>
                    </Grid.Col>
                    {DAYS.map(day => (
                        <Grid.Col key={day} span={2}>
                            <Box p="sm" bg="gray.1" style={{ borderBottom: '1px solid #dee2e6', borderLeft: '1px solid #dee2e6' }}>
                                <Text fw={700} size="sm" ta="center">{day}</Text>
                            </Box>
                        </Grid.Col>
                    ))}
                    <Grid.Col span="auto">
                        <Box p="sm" bg="gray.1" style={{ borderBottom: '1px solid #dee2e6', borderLeft: '1px solid #dee2e6' }}>
                            <Text></Text>
                        </Box>
                    </Grid.Col>
                </Grid>

                {/* Grid Body */}
                {TIME_SLOTS.map(time => (
                    <Grid key={time} gutter={0}>
                        {/* Time Column */}
                        <Grid.Col span={1}>
                            <Box h={120} p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
                                <Group gap={4} justify="center" h="100%">
                                    <IconClock size={14} style={{ opacity: 0.5 }} />
                                    <Text size="xs" c="dimmed" fw={500}>{time}</Text>
                                </Group>
                            </Box>
                        </Grid.Col>

                        {/* Days Columns */}
                        {DAYS.map(day => {
                            const slotEntries = getEntriesForSlot(day, time);
                            return (
                                <Grid.Col key={`${day}-${time}`} span={2}>
                                    <Box
                                        h={120}
                                        p={4}
                                        style={{ borderBottom: '1px solid #dee2e6', borderLeft: '1px solid #dee2e6', backgroundColor: '#fff' }}
                                    >
                                        {slotEntries.map(entry => (
                                            <Paper
                                                key={entry.id}
                                                p="xs"
                                                withBorder
                                                radius="sm"
                                                bg="blue.0"
                                                style={{ height: '100%', cursor: 'pointer', position: 'relative' }}
                                            >
                                                <Group justify="space-between" align="flex-start" mb={4}>
                                                    <Text size="xs" fw={700} lineClamp={1} title={entry.subject?.name}>
                                                        {entry.subject?.code || entry.subject?.name}
                                                    </Text>

                                                    {(onEdit || onDelete) && (
                                                        <Menu position="bottom-end" shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon variant="subtle" size="xs" color="gray">
                                                                    <IconDotsVertical size={12} />
                                                                </ActionIcon>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                {onEdit && <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(entry)}>Edit</Menu.Item>}
                                                                {onDelete && <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(entry.id)}>Delete</Menu.Item>}
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    )}
                                                </Group>

                                                <Group gap={4} mb={2}>
                                                    <IconUser size={10} style={{ opacity: 0.5 }} />
                                                    <Text size="xs" c="dimmed" lineClamp={1}>
                                                        {entry.teacher?.firstName} {entry.teacher?.lastName}
                                                    </Text>
                                                </Group>

                                                {entry.roomNo && (
                                                    <Group gap={4}>
                                                        <IconMapPin size={10} style={{ opacity: 0.5 }} />
                                                        <Text size="xs" c="dimmed">
                                                            {entry.roomNo}
                                                        </Text>
                                                    </Group>
                                                )}
                                            </Paper>
                                        ))}
                                    </Box>
                                </Grid.Col>
                            );
                        })}
                        <Grid.Col span="auto">
                            <Box h={120} style={{ borderBottom: '1px solid #dee2e6', borderLeft: '1px solid #dee2e6' }}></Box>
                        </Grid.Col>
                    </Grid>
                ))}
            </Box>
        </Box>
    );
}
