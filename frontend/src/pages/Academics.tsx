import { useState } from 'react';
import {
    Box,
    Card,
    Select,
    Group,
    Text,
    Title,
    Stack,
    ActionIcon,
    TextInput,
    rem,
    ScrollArea,
} from '@mantine/core';
import { X } from 'lucide-react';

const timetableData = {
    periods: [
        { name: 'Period 1', time: '8:00 - 9:00' },
        { name: 'Period 2', time: '9:00 - 10:00' },
        { name: 'Period 3', time: '10:00 - 11:00' },
        { name: 'Period 4', time: '11:00 - 12:00' },
        { name: 'Lunch Break', time: '12:00 - 13:00' },
        { name: 'Period 5', time: '13:00 - 14:00' },
        { name: 'Period 6', time: '14:00 - 15:00' },
        { name: 'Period 7', time: '15:00 - 16:00' },
        { name: 'Period 8', time: '16:00 - 17:00' },
    ],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    schedule: {
        Monday: [
            { subject: 'Maths', teacher: 'Mr. Smith', room: 'Rm 101', color: '#dbeafe' },
            { subject: 'Physics', teacher: 'Ms. Johnson', room: 'Rm 203', color: '#d1fae5' },
            { subject: 'English', teacher: 'Mrs. Davis', room: 'Rm 105', color: '#e5e7eb' },
            { subject: 'Chemistry', teacher: 'Mr. Lee', room: 'Rm 204', color: '#dbeafe' },
            null,
            { subject: 'Biology', teacher: 'Ms. Brown', room: 'Rm 202', color: '#d1fae5' },
            { subject: 'History', teacher: 'Mr. Wilson', room: 'Rm 106', color: '#e5e7eb' },
            { subject: 'Geography', teacher: 'Mrs. Taylor', room: 'Rm 107', color: '#d1fae5' },
            { subject: 'Art', teacher: 'Mr. Clark', room: 'Art Studio', color: '#d1fae5' },
        ],
        Tuesday: [
            { subject: 'Maths', teacher: 'Mr. Smith', room: 'Rm 101', color: '#dbeafe' },
            { subject: 'Physics', teacher: 'Ms. Johnson', room: 'Rm 203', color: '#d1fae5' },
            { subject: 'English', teacher: 'Mrs. Davis', room: 'Rm 105', color: '#e5e7eb' },
            { subject: 'Chemistry', teacher: 'Mr. Lee', room: 'Rm 204', color: '#dbeafe' },
            null,
            { subject: 'Biology', teacher: 'Ms. Brown', room: 'Rm 202', color: '#d1fae5' },
            { subject: 'History', teacher: 'Mr. Wilson', room: 'Rm 106', color: '#e5e7eb' },
            { subject: 'Geography', teacher: 'Mrs. Taylor', room: 'Rm 107', color: '#d1fae5' },
            { subject: 'Art', teacher: 'Mr. Clark', room: 'Art Studio', color: '#d1fae5' },
        ],
        Wednesday: [
            { subject: 'Maths', teacher: 'Mr. Smith', room: 'Rm 101', color: '#dbeafe' },
            { subject: 'Physics', teacher: 'Ms. Johnson', room: 'Rm 203', color: '#d1fae5' },
            { subject: 'English', teacher: 'Mrs. Davis', room: 'Rm 105', color: '#e5e7eb' },
            { subject: 'Chemistry', teacher: 'Mr. Lee', room: 'Rm 204', color: '#dbeafe' },
            null,
            { subject: 'Biology', teacher: 'Ms. Brown', room: 'Rm 202', color: '#d1fae5' },
            { subject: 'History', teacher: 'Mr. Wilson', room: 'Rm 106', color: '#e5e7eb' },
            { subject: 'Geography', teacher: 'Mrs. Taylor', room: 'Rm 107', color: '#d1fae5' },
            { subject: 'Art', teacher: 'Mr. Clark', room: 'Art Studio', color: '#d1fae5' },
        ],
        Thursday: [
            { subject: 'Maths', teacher: 'Mr. Smith', room: 'Rm 101', color: '#dbeafe' },
            { subject: 'Physics', teacher: 'Ms. Johnson', room: 'Rm 203', color: '#d1fae5' },
            { subject: 'English', teacher: 'Mrs. Davis', room: 'Rm 105', color: '#e5e7eb' },
            { subject: 'Chemistry', teacher: 'Mr. Lee', room: 'Rm 204', color: '#dbeafe' },
            null,
            { subject: 'Biology', teacher: 'Ms. Brown', room: 'Rm 202', color: '#d1fae5' },
            { subject: 'History', teacher: 'Mr. Wilson', room: 'Rm 106', color: '#e5e7eb' },
            { subject: 'Geography', teacher: 'Mrs. Taylor', room: 'Rm 107', color: '#d1fae5' },
            { subject: 'Art', teacher: 'Mr. Clark', room: 'Art Studio', color: '#d1fae5' },
        ],
        Friday: [
            { subject: 'Maths', teacher: 'Mr. Smith', room: 'Rm 101', color: '#dbeafe' },
            { subject: 'Physics', teacher: 'Ms. Johnson', room: 'Rm 203', color: '#d1fae5' },
            { subject: 'English', teacher: 'Mrs. Davis', room: 'Rm 105', color: '#e5e7eb' },
            { subject: 'Chemistry', teacher: 'Mr. Lee', room: 'Rm 204', color: '#dbeafe' },
            null,
            { subject: 'Biology', teacher: 'Ms. Brown', room: 'Rm 202', color: '#d1fae5' },
            { subject: 'History', teacher: 'Mr. Wilson', room: 'Rm 106', color: '#e5e7eb' },
            { subject: 'Geography', teacher: 'Mrs. Taylor', room: 'Rm 107', color: '#d1fae5' },
            { subject: 'Art', teacher: 'Mr. Clark', room: 'Art Studio', color: '#d1fae5' },
        ],
    },
};

const unassignedTeachers = [
    'Mr. Anderson (PE)',
    'Ms. Martinez (Music)',
    'Mr. Thomas (CS)',
    'Mrs. White (French)',
    'Mr. Harris (Drama)',
];

export default function Academics() {
    return (
        <Box p="xl">
            <Group justify="space-between" mb="lg">
                <Group>
                    <Select
                        label="Select Class"
                        data={['Class 10A', 'Class 10B', 'Class 11A', 'Class 11B']}
                        defaultValue="Class 10A"
                        size="sm"
                        w={rem(150)}
                        radius={2}
                    />
                    <Select
                        label="Select Teacher"
                        data={['All', 'Mr. Smith', 'Ms. Johnson', 'Mrs. Davis']}
                        defaultValue="All"
                        size="sm"
                        w={rem(150)}
                        radius={2}
                    />
                    <Select
                        label="View Mode"
                        data={['Week View', 'Day View', 'Month View']}
                        defaultValue="Week View"
                        size="sm"
                        w={rem(150)}
                        radius={2}
                    />
                </Group>
            </Group>

            <Group align="flex-start" gap="md">
                {/* Timetable Grid */}
                <Card shadow="sm" padding="lg" radius={2} withBorder style={{ flex: 1 }}>
                    <Title order={4} mb="md">
                        Matrix Grid
                    </Title>
                    <ScrollArea>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: rem(900) }}>
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            padding: rem(8),
                                            textAlign: 'left',
                                            fontSize: rem(12),
                                            fontWeight: 600,
                                            borderBottom: '2px solid #e5e7eb',
                                            position: 'sticky',
                                            left: 0,
                                            backgroundColor: 'white',
                                            zIndex: 2,
                                        }}
                                    ></th>
                                    {timetableData.periods.map((period, idx) => (
                                        <th
                                            key={idx}
                                            style={{
                                                padding: rem(8),
                                                textAlign: 'center',
                                                fontSize: rem(12),
                                                fontWeight: 600,
                                                borderBottom: '2px solid #e5e7eb',
                                                minWidth: rem(120),
                                            }}
                                        >
                                            <div>{period.name}</div>
                                            <div style={{ fontSize: rem(10), color: '#6b7280', fontWeight: 400 }}>
                                                {period.time}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timetableData.days.map((day, dayIdx) => (
                                    <tr key={day}>
                                        <td
                                            style={{
                                                padding: rem(8),
                                                fontSize: rem(12),
                                                fontWeight: 600,
                                                borderRight: '2px solid #e5e7eb',
                                                position: 'sticky',
                                                left: 0,
                                                backgroundColor: 'white',
                                                zIndex: 1,
                                            }}
                                        >
                                            {day}
                                        </td>
                                        {timetableData.schedule[day as keyof typeof timetableData.schedule].map(
                                            (slot, slotIdx) => (
                                                <td
                                                    key={slotIdx}
                                                    style={{
                                                        padding: rem(4),
                                                        border: '1px solid #e5e7eb',
                                                    }}
                                                >
                                                    {slot ? (
                                                        <Box
                                                            p="xs"
                                                            style={{
                                                                backgroundColor: slot.color,
                                                                borderRadius: rem(4),
                                                                minHeight: rem(60),
                                                            }}
                                                        >
                                                            <Text size="xs" fw={600}>
                                                                {slot.subject}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                {slot.teacher}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                {slot.room}
                                                            </Text>
                                                        </Box>
                                                    ) : (
                                                        <Box
                                                            p="xs"
                                                            style={{
                                                                backgroundColor: '#f9fafb',
                                                                borderRadius: rem(4),
                                                                minHeight: rem(60),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Text size="xs" c="dimmed">
                                                                Lunch Break
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </td>
                                            )
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                </Card>

                {/* Unassigned Teachers */}
                <Card shadow="sm" padding="lg" radius={2} withBorder w={rem(250)}>
                    <Title order={5} mb="md">
                        Unassigned Teachers
                    </Title>
                    <TextInput
                        placeholder="Search"
                        size="xs"
                        mb="sm"
                        radius={2}
                    />
                    <Stack gap="xs">
                        {unassignedTeachers.map((teacher, idx) => (
                            <Group
                                key={idx}
                                justify="space-between"
                                p="xs"
                                style={{
                                    backgroundColor: '#f9fafb',
                                    borderRadius: rem(4),
                                    cursor: 'pointer',
                                }}
                            >
                                <Text size="xs">{teacher}</Text>
                                <ActionIcon size="xs" variant="subtle" color="gray">
                                    <X size={12} />
                                </ActionIcon>
                            </Group>
                        ))}
                    </Stack>
                </Card>
            </Group>
        </Box>
    );
}
