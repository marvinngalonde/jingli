import { Paper, SimpleGrid, Text, Box, Group, ActionIcon, Menu } from '@mantine/core';
import { IconClock, IconMapPin, IconUser, IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import type { TimetableEntry, DayOfWeek } from '../../types/academics';

interface TimetableGridProps {
    entries: TimetableEntry[];
    onEdit?: (entry: TimetableEntry) => void;
    onDelete?: (id: string) => void;
    loading?: boolean;
}

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

// Define standard time slots to match the visual grid
// We will try to map actual entries to these slots
interface TimeSlot {
    label: string;
    start: string; // HH:mm
    end: string;   // HH:mm
}

// Continuous hourly slots from 08:00 to 16:00
const TIME_SLOTS: TimeSlot[] = [
    { label: '08:00 - 09:00', start: '08:00', end: '09:00' },
    { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
    { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
    { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
    { label: '12:00 - 13:00', start: '12:00', end: '13:00' },
    { label: '13:00 - 14:00', start: '13:00', end: '14:00' },
    { label: '14:00 - 15:00', start: '14:00', end: '15:00' },
    { label: '15:00 - 16:00', start: '15:00', end: '16:00' },
];

export function TimetableGrid({ entries, onEdit, onDelete }: TimetableGridProps) {
    const getEntriesForSlot = (day: DayOfWeek, slot: TimeSlot) => {
        return entries.filter(e => {
            const entryStart = new Date(e.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

            // Basic conflict check: does the entry start within this slot?
            const dayMatch = e.day === day;

            // Simple string compare for now
            // We consider it a match if it starts in this hour
            const timeMatch = entryStart >= slot.start && entryStart < slot.end;

            return dayMatch && timeMatch;
        });
    };

    return (
        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <Box p="md" bg="gray.1" style={{ overflowX: 'auto' }}>
                <SimpleGrid cols={TIME_SLOTS.length + 1} spacing="xs" style={{ minWidth: 1000 }}>
                    {/* Header Row */}
                    <Box fw={700} c="dimmed">Day / Time</Box>
                    {TIME_SLOTS.map((slot, index) => (
                        <Box key={index} fw={700} ta="center" fz="xs" c="dimmed">
                            <Group justify="center" gap={4}>
                                <IconClock size={12} />
                                {slot.label}
                            </Group>
                        </Box>
                    ))}

                    {/* Schedule Rows */}
                    {DAYS.map(day => (
                        <Box key={day} style={{ display: 'contents' }}>
                            {/* Day Label */}
                            <Box fw={700} py="sm" style={{ display: 'flex', alignItems: 'center' }}>
                                {day}
                            </Box>

                            {/* Time Slots */}
                            {TIME_SLOTS.map((slot, index) => {
                                const slotEntries = getEntriesForSlot(day, slot);

                                if (slotEntries.length === 0) {
                                    return (
                                        <Paper
                                            key={`${day}-${index}`}
                                            p="xs"
                                            radius="sm"
                                            withBorder
                                            bg="white"
                                            style={{ minHeight: 80 }}
                                        />
                                    );
                                }

                                return (
                                    <Box key={`${day}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {slotEntries.map(entry => (
                                            <Paper
                                                key={entry.id}
                                                p="xs"
                                                radius="sm"
                                                bg="blue.0"
                                                withBorder
                                                style={{
                                                    minHeight: 80,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    position: 'relative'
                                                }}
                                            >
                                                <Group justify="space-between" align="flex-start" style={{ position: 'absolute', top: 4, right: 4, zIndex: 10 }}>
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

                                                <Text ta="center" size="sm" fw={600} c="black" lineClamp={2}>
                                                    {entry.subject?.name}
                                                </Text>

                                                {entry.roomNo && (
                                                    <Group gap={4} justify="center">
                                                        <IconMapPin size={10} style={{ opacity: 0.5 }} />
                                                        <Text size="xs" c="dimmed">{entry.roomNo}</Text>
                                                    </Group>
                                                )}

                                                <Group gap={4} justify="center">
                                                    <IconUser size={10} style={{ opacity: 0.5 }} />
                                                    <Text size="xs" c="dimmed">
                                                        {entry.teacher?.firstName} {entry.teacher?.lastName}
                                                    </Text>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </Box>
                                );
                            })}
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>
        </Paper>
    );
}
