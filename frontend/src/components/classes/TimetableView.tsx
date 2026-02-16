import { Paper, Text, Grid, Box, Badge } from '@mantine/core';

interface TimeSlot {
    time: string;
    subject: string;
    teacher: string;
    room: string;
    color: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

// Mock timetable data generator
const getSchedule = (day: string, time: string): TimeSlot | null => {
    if (time === '12:00') return { time, subject: 'Lunch Break', teacher: '', room: '', color: 'gray' };

    // Randomly assign subjects for demo
    const subjects = [
        { name: 'Mathematics', teacher: 'S. Connor', color: 'blue' },
        { name: 'Physics', teacher: 'E. Ripley', color: 'cyan' },
        { name: 'History', teacher: 'M. McFly', color: 'orange' },
        { name: 'English', teacher: 'J. Cameron', color: 'pink' },
        { name: 'Chemistry', teacher: 'K. Reese', color: 'green' },
    ];

    const hash = (day.length + time.length) % 10;
    if (hash > 4) return null; // Free period

    const subj = subjects[hash];
    return {
        time,
        subject: subj.name,
        teacher: subj.teacher,
        room: '101',
        color: subj.color
    };
};

export function TimetableView() {
    return (
        <Paper withBorder radius="md" p="md" style={{ overflowX: 'auto' }}>
            <Box style={{ minWidth: 800 }}>
                {/* Header Row */}
                <Grid gutter={0}>
                    <Grid.Col span={1} p="xs" bg="gray.1">
                        <Text fw={700} size="xs" ta="center">TIME</Text>
                    </Grid.Col>
                    {days.map(day => (
                        <Grid.Col key={day} span={2.2} p="xs" bg="gray.1" style={{ borderLeft: '1px solid #eee' }}>
                            <Text fw={700} size="xs" ta="center">{day.toUpperCase()}</Text>
                        </Grid.Col>
                    ))}
                </Grid>

                {/* Time Slots */}
                {times.map(time => (
                    <Grid key={time} gutter={0} style={{ borderTop: '1px solid #eee' }}>
                        <Grid.Col span={1} p="xs" bg="gray.0">
                            <Text size="xs" fw={600} ta="center" mt={10}>{time}</Text>
                        </Grid.Col>
                        {days.map(day => {
                            const slot = getSchedule(day, time);
                            return (
                                <Grid.Col key={`${day}-${time}`} span={2.2} p={4} style={{ borderLeft: '1px solid #eee', height: 80 }}>
                                    {slot ? (
                                        <Paper
                                            p={6}
                                            radius="sm"
                                            bg={slot.subject === 'Lunch Break' ? 'gray.1' : `${slot.color}.0`}
                                            style={{ height: '100%', border: `1px solid var(--mantine-color-${slot.color}-2)` }}
                                        >
                                            <Text size="xs" fw={700} c={slot.subject === 'Lunch Break' ? 'dimmed' : `${slot.color}.9`} lineClamp={1}>
                                                {slot.subject}
                                            </Text>
                                            {slot.subject !== 'Lunch Break' && (
                                                <>
                                                    <Text size="xs" c="dimmed" lineClamp={1}>{slot.teacher}</Text>
                                                    <Badge size="xs" variant="outline" color={slot.color} mt={4}>Rm {slot.room}</Badge>
                                                </>
                                            )}
                                        </Paper>
                                    ) : (
                                        <Text size="xs" c="dimmed" ta="center" mt={20}>-</Text>
                                    )}
                                </Grid.Col>
                            );
                        })}
                    </Grid>
                ))}
            </Box>
        </Paper>
    );
}
