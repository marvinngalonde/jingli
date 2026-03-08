import { Paper, SimpleGrid, Text, Box, Group, ActionIcon, Menu, Badge, HoverCard, Stack, Divider, Tabs, Center } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconClock, IconMapPin, IconUser, IconDotsVertical, IconPencil, IconTrash, IconBook } from '@tabler/icons-react';
import type { TimetableEntry, DayOfWeek } from '../../types/academics';

interface TimetableGridProps {
    entries: TimetableEntry[];
    onEdit?: (entry: TimetableEntry) => void;
    onDelete?: (id: string) => void;
    /** For teachers: only show edit/delete on entries they own */
    canEditEntry?: (entry: TimetableEntry) => boolean;
    loading?: boolean;
}

const ALL_DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const DAY_LABELS: Record<string, string> = {
    MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday',
    FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday'
};

interface TimeSlot {
    label: string;
    start: string;
    end: string;
}

const TIME_SLOTS: TimeSlot[] = [
    { label: '07:00 - 08:00', start: '07:00', end: '08:00' },
    { label: '08:00 - 09:00', start: '08:00', end: '09:00' },
    { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
    { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
    { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
    { label: '12:00 - 13:00', start: '12:00', end: '13:00' },
    { label: '13:00 - 14:00', start: '13:00', end: '14:00' },
    { label: '14:00 - 15:00', start: '14:00', end: '15:00' },
    { label: '15:00 - 16:00', start: '15:00', end: '16:00' },
    { label: '16:00 - 17:00', start: '16:00', end: '17:00' },
];

function getActiveDays(entries: TimetableEntry[]): DayOfWeek[] {
    const weekdays: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    const entryDays = new Set(entries.map(e => e.day));
    const hasWeekend = entryDays.has('SAT') || entryDays.has('SUN');
    return hasWeekend ? ALL_DAYS : weekdays;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function TimetableGrid({ entries, onEdit, onDelete, canEditEntry }: TimetableGridProps) {
    const isMobile = useMediaQuery('(max-width: 48em)');
    const days = getActiveDays(entries);

    const getEntriesForSlot = (day: DayOfWeek, slot: TimeSlot) => {
        return entries.filter(e => {
            const entryStart = new Date(e.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            return e.day === day && entryStart >= slot.start && entryStart < slot.end;
        });
    };

    const COLORS = ['blue.0', 'teal.0', 'violet.0', 'orange.0', 'pink.0', 'cyan.0', 'lime.0', 'indigo.0'];
    const BORDER_COLORS = ['blue.3', 'teal.3', 'violet.3', 'orange.3', 'pink.3', 'cyan.3', 'lime.3', 'indigo.3'];
    const subjectColorMap = new Map<string, { bg: string; border: string }>();
    let colorIdx = 0;
    entries.forEach(e => {
        if (e.subject?.code && !subjectColorMap.has(e.subject.code)) {
            subjectColorMap.set(e.subject.code, {
                bg: COLORS[colorIdx % COLORS.length],
                border: BORDER_COLORS[colorIdx % BORDER_COLORS.length]
            });
            colorIdx++;
        }
    });

    if (isMobile) {
        return (
            <Tabs defaultValue={days[0] || 'MON'} variant="outline" radius="md">
                <Tabs.List grow mb="md" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                    {days.map(day => (
                        <Tabs.Tab key={day} value={day}>{DAY_LABELS[day].substring(0, 3)}</Tabs.Tab>
                    ))}
                </Tabs.List>

                {days.map(day => {
                    const dayEntries = entries.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                    return (
                        <Tabs.Panel key={day} value={day}>
                            {dayEntries.length === 0 ? (
                                <Center py="xl">
                                    <Text c="dimmed" size="sm">No classes scheduled for this day</Text>
                                </Center>
                            ) : (
                                <Stack gap="sm">
                                    {dayEntries.map(entry => {
                                        const teacherName = `${(entry.teacher as any)?.firstName || ''} ${(entry.teacher as any)?.lastName || ''}`.trim();
                                        const editable = canEditEntry ? canEditEntry(entry) : true;
                                        return (
                                            <Paper key={entry.id} p="md" withBorder radius="md">
                                                <Group justify="space-between" mb="xs">
                                                    <div>
                                                        <Text fw={600}>{entry.subject?.name}</Text>
                                                        <Text size="xs" c="dimmed">{formatTime(entry.startTime)} – {formatTime(entry.endTime)}</Text>
                                                    </div>
                                                    {editable && (onEdit || onDelete) && (
                                                        <Menu position="bottom-end">
                                                            <Menu.Target>
                                                                <ActionIcon variant="subtle" color="gray">
                                                                    <IconDotsVertical size={16} />
                                                                </ActionIcon>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                {onEdit && <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(entry)}>Edit</Menu.Item>}
                                                                {onDelete && <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(entry.id)}>Delete</Menu.Item>}
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    )}
                                                </Group>
                                                <Group gap="lg">
                                                    <Group gap={4}>
                                                        <IconUser size={14} color="gray" />
                                                        <Text size="xs">{teacherName || 'N/A'}</Text>
                                                    </Group>
                                                    {entry.roomNo && (
                                                        <Group gap={4}>
                                                            <IconMapPin size={14} color="gray" />
                                                            <Text size="xs">Room {entry.roomNo}</Text>
                                                        </Group>
                                                    )}
                                                </Group>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Tabs.Panel>
                    );
                })}
            </Tabs>
        );
    }

    return (
        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <Box p="md" bg="gray.1" style={{ overflowX: 'auto' }}>
                <SimpleGrid cols={TIME_SLOTS.length + 1} spacing="xs" style={{ minWidth: 1200 }}>
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
                    {days.map(day => (
                        <Box key={day} style={{ display: 'contents' }}>
                            <Box fw={700} py="sm" style={{ display: 'flex', alignItems: 'center' }}>
                                <Badge
                                    variant={day === 'SAT' || day === 'SUN' ? 'filled' : 'light'}
                                    color={day === 'SAT' || day === 'SUN' ? 'orange' : 'blue'}
                                    size="sm"
                                >
                                    {DAY_LABELS[day]}
                                </Badge>
                            </Box>

                            {TIME_SLOTS.map((slot, index) => {
                                const slotEntries = getEntriesForSlot(day, slot);

                                if (slotEntries.length === 0) {
                                    return (
                                        <Paper key={`${day}-${index}`} p="xs" radius="sm" withBorder bg="white" style={{ minHeight: 80 }} />
                                    );
                                }

                                return (
                                    <Box key={`${day}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {slotEntries.map(entry => {
                                            const colors = subjectColorMap.get(entry.subject?.code || '') || { bg: 'blue.0', border: 'blue.3' };
                                            const editable = canEditEntry ? canEditEntry(entry) : true;
                                            const teacherName = `${(entry.teacher as any)?.firstName || ''} ${(entry.teacher as any)?.lastName || ''}`.trim();

                                            const entryCard = (
                                                <Paper
                                                    key={entry.id}
                                                    p="xs"
                                                    radius="sm"
                                                    bg={colors.bg}
                                                    withBorder
                                                    style={{
                                                        minHeight: 80,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        position: 'relative',
                                                        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e: any) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e: any) => {
                                                        e.currentTarget.style.boxShadow = 'none';
                                                        e.currentTarget.style.transform = 'none';
                                                    }}
                                                >
                                                    {editable && (onEdit || onDelete) && (
                                                        <Group justify="space-between" align="flex-start" style={{ position: 'absolute', top: 4, right: 4, zIndex: 10 }}>
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
                                                        </Group>
                                                    )}

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
                                                        <Text size="xs" c="dimmed">{teacherName || 'N/A'}</Text>
                                                    </Group>
                                                </Paper>
                                            );

                                            // Wrap in HoverCard for tooltip
                                            return (
                                                <HoverCard
                                                    key={entry.id}
                                                    width={260}
                                                    shadow="md"
                                                    position="top"
                                                    withArrow
                                                    openDelay={300}
                                                    closeDelay={100}
                                                >
                                                    <HoverCard.Target>
                                                        {entryCard}
                                                    </HoverCard.Target>
                                                    <HoverCard.Dropdown>
                                                        <Stack gap="xs">
                                                            <Group gap="xs">
                                                                <IconBook size={16} />
                                                                <Text fw={600} size="sm">{entry.subject?.name}</Text>
                                                            </Group>
                                                            <Badge variant="light" size="sm" style={{ alignSelf: 'flex-start' }}>
                                                                {entry.subject?.code}
                                                            </Badge>
                                                            <Divider />
                                                            <Group gap="xs">
                                                                <IconUser size={14} />
                                                                <Text size="sm">{teacherName || 'No teacher'}</Text>
                                                            </Group>
                                                            <Group gap="xs">
                                                                <IconClock size={14} />
                                                                <Text size="sm">{formatTime(entry.startTime)} – {formatTime(entry.endTime)}</Text>
                                                            </Group>
                                                            {entry.roomNo && (
                                                                <Group gap="xs">
                                                                    <IconMapPin size={14} />
                                                                    <Text size="sm">Room {entry.roomNo}</Text>
                                                                </Group>
                                                            )}
                                                            <Text size="xs" c="dimmed">{DAY_LABELS[entry.day]}</Text>
                                                        </Stack>
                                                    </HoverCard.Dropdown>
                                                </HoverCard>
                                            );
                                        })}
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
