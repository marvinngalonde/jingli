import { useState, useMemo } from 'react';
import { Paper, Text, Box, Group, Badge, SimpleGrid, ActionIcon, Stack, Select, SegmentedControl, HoverCard, Divider } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconClock, IconCalendar, IconUser, IconBook } from '@tabler/icons-react';
import type { Exam } from '../../types/exams';

interface ExamTimetableGridProps {
    exams: Exam[];
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]; // Sun to Sat
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function formatDateKey(date: Date) {
    return date.toISOString().split('T')[0];
}

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

export function ExamTimetableGrid({ exams }: ExamTimetableGridProps) {
    const [viewMode, setViewMode] = useState<'columns' | 'grid'>('grid');
    // Current viewed week start (Monday)
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        // Default to the current week, or if exams exist, the week of the first upcoming exam
        const now = new Date();
        const upcomingExams = exams.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return getStartOfWeek(upcomingExams.length > 0 ? new Date(upcomingExams[0].date) : now);
    });

    const nextWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + 7);
        setCurrentWeekStart(d);
    };

    const prevWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() - 7);
        setCurrentWeekStart(d);
    };

    // Calculate the dates for the currently viewed week (Mon-Fri)
    const weekDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 5; i++) { // Monday to Friday
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [currentWeekStart]);

    // Derive unique class levels from exams data for the filter dropdown
    const classLevels = useMemo(() => {
        const levels = new Set<string>();
        exams.forEach(e => {
            if (e.classLevel?.name) {
                const label = `${e.classLevel.name} ${(e.classLevel as any).level || ''}`.trim();
                levels.add(label);
            }
        });
        return Array.from(levels).sort();
    }, [exams]);

    // Helper to get the full class name
    const getClassName = (classLevel: any) =>
        classLevel ? `${classLevel.name} ${classLevel.level || ''}`.trim() : '';

    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    // Filter exams based on selected class level full name
    const filteredExams = useMemo(() => {
        if (!selectedLevel) return exams;
        return exams.filter(e => getClassName(e.classLevel) === selectedLevel);
    }, [exams, selectedLevel]);

    // Group filtered exams by the date string (YYYY-MM-DD)
    const examsByDate = useMemo(() => {
        const grouped: Record<string, Exam[]> = {};
        filteredExams.forEach(exam => {
            const date = new Date(exam.date);
            const key = formatDateKey(date);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(exam);
        });

        // Sort exams within each day by start time
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        });

        return grouped;
    }, [filteredExams]);

    const COLORS = ['blue.0', 'teal.0', 'violet.0', 'orange.0', 'pink.0', 'cyan.0', 'lime.0', 'indigo.0'];
    const subjectColorMap = new Map<string, string>();
    let colorIdx = 0;
    exams.forEach(e => {
        if (e.subject?.code && !subjectColorMap.has(e.subject.code)) {
            subjectColorMap.set(e.subject.code, COLORS[colorIdx % COLORS.length]);
            colorIdx++;
        }
    });

    const getEntriesForSlot = (dateKey: string, slot: TimeSlot) => {
        const dayExams = examsByDate[dateKey] || [];
        return dayExams.filter(e => {
            const entryStart = new Date(e.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            return entryStart >= slot.start && entryStart < slot.end;
        });
    };

    return (
        <Stack gap="lg">
            {/* Week Selector and Filters */}
            <Group justify="space-between" align="flex-end">
                <Box>
                    <Select
                        label="Filter by Class"
                        placeholder="All Classes"
                        data={[
                            { value: '', label: 'All Classes' },
                            ...classLevels.map(lvl => ({ value: lvl, label: lvl }))
                        ]}
                        value={selectedLevel || ''}
                        onChange={(val) => setSelectedLevel(val || null)}
                        clearable
                        style={{ minWidth: 200 }}
                    />
                </Box>
                <Group align="center">
                    <Text fw={600} size="md" mr="md">
                        {weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {weekDates[4].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    <Group gap="xs">
                        <ActionIcon variant="light" onClick={prevWeek} size="lg">
                            <IconChevronLeft size={20} />
                        </ActionIcon>
                        <ActionIcon variant="light" onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))} size="lg">
                            <IconCalendar size={20} />
                        </ActionIcon>
                        <ActionIcon variant="light" onClick={nextWeek} size="lg">
                            <IconChevronRight size={20} />
                        </ActionIcon>
                    </Group>
                    <SegmentedControl
                        value={viewMode}
                        onChange={(value: string) => setViewMode(value as 'columns' | 'grid')}
                        data={[
                            { label: 'Grid View', value: 'grid' },
                            { label: 'Column View', value: 'columns' },
                        ]}
                    />
                </Group>
            </Group>

            {/* Timetable Grid */}
            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
                <Box p="md" bg="gray.0" style={{ overflowX: 'auto' }}>
                    {viewMode === 'columns' ? (
                        <SimpleGrid cols={5} spacing="md" style={{ minWidth: 1000 }}>
                            {weekDates.map((date, index) => {
                                const dateKey = formatDateKey(date);
                                const dayExams = examsByDate[dateKey] || [];
                                const isToday = formatDateKey(new Date()) === dateKey;

                                return (
                                    <Stack key={dateKey} gap="sm">
                                        {/* Column Header */}
                                        <Paper shadow="sm" radius="md" p="sm" bg={isToday ? 'blue.1' : 'white'} withBorder style={{ borderColor: isToday ? 'var(--mantine-color-blue-4)' : undefined }}>
                                            <Group justify="space-between" align="center" gap="xs">
                                                <Stack gap={0}>
                                                    <Text fw={700} size="sm" c={isToday ? 'blue.8' : undefined}>{DAY_LABELS[date.getDay()]}</Text>
                                                    <Text size="xs" c="dimmed" fw={500}>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                                                </Stack>
                                                <Badge variant={isToday ? 'filled' : 'light'} color={isToday ? 'blue' : 'gray'}>
                                                    {dayExams.length}
                                                </Badge>
                                            </Group>
                                        </Paper>

                                        {/* Exams List for Day */}
                                        <Stack gap="xs" style={{ flexGrow: 1 }}>
                                            {dayExams.length === 0 ? (
                                                <Paper p="xl" ta="center" radius="md" bg="transparent" style={{ border: '2px dashed var(--mantine-color-gray-3)' }}>
                                                    <Text size="sm" c="dimmed">No exams</Text>
                                                </Paper>
                                            ) : (
                                                dayExams.map(exam => {
                                                    const bg = subjectColorMap.get(exam.subject?.code || '') || 'blue.0';

                                                    return (
                                                        <Paper
                                                            key={exam.id}
                                                            p="sm"
                                                            radius="md"
                                                            bg={bg}
                                                            withBorder
                                                            style={{
                                                                transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                                                            }}
                                                            onMouseEnter={(e: any) => {
                                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                            }}
                                                            onMouseLeave={(e: any) => {
                                                                e.currentTarget.style.boxShadow = 'none';
                                                                e.currentTarget.style.transform = 'none';
                                                            }}
                                                        >
                                                            <Stack gap="xs">
                                                                <Group justify="space-between" align="flex-start" wrap="nowrap">
                                                                    <Text fw={600} size="sm" lineClamp={2}>{exam.name}</Text>
                                                                    <Badge variant="outline" color="orange" size="xs">{exam.duration}m</Badge>
                                                                </Group>

                                                                <Group gap={4}>
                                                                    <IconBook size={12} style={{ opacity: 0.6 }} />
                                                                    <Text size="xs" fw={500}>{exam.subject?.name}</Text>
                                                                </Group>

                                                                <Group justify="space-between" mt="xs">
                                                                    <Group gap={4}>
                                                                        <IconUser size={12} style={{ opacity: 0.6 }} />
                                                                        <Text size="xs" c="dimmed">{getClassName(exam.classLevel) || 'All'}</Text>
                                                                    </Group>
                                                                    <Group gap={4}>
                                                                        <IconClock size={12} style={{ opacity: 0.6 }} />
                                                                        <Text size="xs" fw={500}>{new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                                                    </Group>
                                                                </Group>
                                                            </Stack>
                                                        </Paper>
                                                    );
                                                })
                                            )}
                                        </Stack>
                                    </Stack>
                                );
                            })}
                        </SimpleGrid>
                    ) : (
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
                            {weekDates.map(date => {
                                const dateKey = formatDateKey(date);
                                const isToday = formatDateKey(new Date()) === dateKey;

                                return (
                                    <Box key={dateKey} style={{ display: 'contents' }}>
                                        <Box fw={700} py="sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <Badge
                                                variant={isToday ? 'filled' : 'light'}
                                                color={isToday ? 'blue' : 'gray'}
                                                size="md"
                                                mb={4}
                                            >
                                                {DAY_LABELS[date.getDay()].substring(0, 3)}
                                            </Badge>
                                            <Text size="xs" c="dimmed" ta="center">
                                                {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </Text>
                                        </Box>

                                        {TIME_SLOTS.map((slot, index) => {
                                            const slotEntries = getEntriesForSlot(dateKey, slot);

                                            if (slotEntries.length === 0) {
                                                return (
                                                    <Paper key={`${dateKey}-${index}`} p="xs" radius="sm" withBorder bg="white" style={{ minHeight: 80 }} />
                                                );
                                            }

                                            return (
                                                <Box key={`${dateKey}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    {slotEntries.map(exam => {
                                                        const bg = subjectColorMap.get(exam.subject?.code || '') || 'blue.0';

                                                        const entryCard = (
                                                            <Paper
                                                                key={exam.id}
                                                                p="xs"
                                                                radius="sm"
                                                                bg={bg}
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
                                                                <Text ta="center" size="sm" fw={600} c="black" lineClamp={2}>
                                                                    {exam.subject?.name}
                                                                </Text>

                                                                <Group gap={4} justify="center" mt={4}>
                                                                    <IconClock size={10} style={{ opacity: 0.5 }} />
                                                                    <Text size="xs" c="dimmed">
                                                                        {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </Text>
                                                                </Group>

                                                                <Group gap={4} justify="center">
                                                                    <IconUser size={10} style={{ opacity: 0.5 }} />
                                                                    <Text size="xs" c="dimmed">{getClassName(exam.classLevel) || 'All'}</Text>
                                                                </Group>
                                                            </Paper>
                                                        );

                                                        return (
                                                            <HoverCard
                                                                key={exam.id}
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
                                                                            <Text fw={600} size="sm">{exam.name}</Text>
                                                                        </Group>
                                                                        <Badge variant="light" size="sm" style={{ alignSelf: 'flex-start' }}>
                                                                            {exam.subject?.name} ({exam.subject?.code})
                                                                        </Badge>
                                                                        <Divider />
                                                                        <Group gap="xs">
                                                                            <IconUser size={14} />
                                                                            <Text size="sm">{getClassName(exam.classLevel) || 'All Classes'}</Text>
                                                                        </Group>
                                                                        <Group gap="xs">
                                                                            <IconClock size={14} />
                                                                            <Text size="sm">
                                                                                {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                {' '}({exam.duration} mins)
                                                                            </Text>
                                                                        </Group>
                                                                    </Stack>
                                                                </HoverCard.Dropdown>
                                                            </HoverCard>
                                                        );
                                                    })}
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    )}
                </Box>
            </Paper>
        </Stack>
    );
}
