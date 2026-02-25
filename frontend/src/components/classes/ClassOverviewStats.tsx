import { Paper, Group, Text, ThemeIcon, Grid, Center, RingProgress } from '@mantine/core';
import { IconUsers, IconChalkboard, IconSchool, IconBook } from '@tabler/icons-react';

interface ClassOverviewStatsProps {
    studentCount: number;
    capacity: number;
    teacherCount: number;
    subjectCount: number;
}

export function ClassOverviewStats({ studentCount, capacity, teacherCount, subjectCount }: ClassOverviewStatsProps) {
    const occupancyPercent = capacity > 0 ? Math.round((studentCount / capacity) * 100) : 0;

    return (
        <Grid mb="lg">
            <Grid.Col span={{ base: 6, md: 3 }}>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <RingProgress
                            size={56} thickness={5} roundCaps
                            sections={[{ value: occupancyPercent, color: occupancyPercent > 90 ? 'red' : 'blue' }]}
                            label={<Center><IconUsers size={18} /></Center>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Students</Text>
                            <Text fw={700} size="xl">{studentCount} <Text span size="sm" c="dimmed">/ {capacity}</Text></Text>
                        </div>
                    </Group>
                </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 3 }}>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                            <IconChalkboard size={20} />
                        </ThemeIcon>
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Capacity</Text>
                            <Text fw={700} size="xl">{capacity}</Text>
                        </div>
                    </Group>
                </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 3 }}>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <ThemeIcon size="lg" radius="md" variant="light" color="green">
                            <IconSchool size={20} />
                        </ThemeIcon>
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Teachers</Text>
                            <Text fw={700} size="xl">{teacherCount}</Text>
                        </div>
                    </Group>
                </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 3 }}>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                            <IconBook size={20} />
                        </ThemeIcon>
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Subjects</Text>
                            <Text fw={700} size="xl">{subjectCount}</Text>
                        </div>
                    </Group>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}
