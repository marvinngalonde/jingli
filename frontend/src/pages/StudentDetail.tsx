import { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    Avatar,
    Text,
    Title,
    Tabs,
    Table,
    Group,
    Stack,
    rem,
} from '@mantine/core';
import { useParams } from 'react-router-dom';

const studentData = {
    name: 'Liam Thompson',
    admissionId: '2023-001',
    class: '10A',
    dob: '15 Mar 2008',
    gender: 'Male',
    bloodGroup: 'O+',
    contact: '(555) 987-8543',
    email: 'liam.t@school.edu',
    father: 'Mr. Robert Thompson',
    fatherContact: '(555) 111-2222',
    mother: 'Mrs. Sarah Thompson',
    motherContact: '(555) 333-4444',
    address: '123 Maple Avenue, Springfield, IL 62704',
    allergies: 'None',
    conditions: 'Asthma (Mild)',
};

const gradesData = [
    { subject: 'Mathematics', midterm: '85%', finals: '90%', grade: 'A' },
    { subject: 'Science', midterm: '78%', finals: '82%', grade: 'B+' },
    { subject: 'English', midterm: '92%', finals: '88%', grade: 'A-' },
    { subject: 'History', midterm: '75%', finals: '79%', grade: 'B' },
];

export default function StudentDetail() {
    const { id } = useParams();

    return (
        <Box p="xl">
            <Grid gutter="md">
                {/* Left Sidebar - Student Info */}
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Stack align="center" gap="md">
                            <Avatar
                                size={100}
                                radius="xl"
                                src={null}
                                alt={studentData.name}
                            />
                            <Box ta="center">
                                <Title order={3}>{studentData.name}</Title>
                                <Text size="sm" c="dimmed">
                                    Admission ID: {studentData.admissionId}
                                </Text>
                            </Box>

                            <Stack gap="xs" w="100%" mt="md">
                                <Group justify="space-between">
                                    <Text size="sm" fw={500}>
                                        Class:
                                    </Text>
                                    <Text size="sm">{studentData.class}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" fw={500}>
                                        DOB:
                                    </Text>
                                    <Text size="sm">{studentData.dob}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" fw={500}>
                                        Gender:
                                    </Text>
                                    <Text size="sm">{studentData.gender}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" fw={500}>
                                        Blood Group:
                                    </Text>
                                    <Text size="sm">{studentData.bloodGroup}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" fw={500}>
                                        Contact:
                                    </Text>
                                    <Text size="sm">{studentData.contact}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" fw={500}>
                                        Email:
                                    </Text>
                                    <Text size="sm">{studentData.email}</Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* Right Content - Tabs */}
                <Grid.Col span={{ base: 12, md: 9 }}>
                    <Tabs defaultValue="overview" radius={2}>
                        <Tabs.List>
                            <Tabs.Tab value="overview">Overview</Tabs.Tab>
                            <Tabs.Tab value="academics">Academics</Tabs.Tab>
                            <Tabs.Tab value="attendance">Attendance</Tabs.Tab>
                            <Tabs.Tab value="fees">Fees</Tabs.Tab>
                            <Tabs.Tab value="documents">Documents</Tabs.Tab>
                        </Tabs.List>

                        <Box mt="md">
                            <Tabs.Panel value="overview">
                                <Grid gutter="md">
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Card shadow="sm" padding="lg" radius={2} withBorder>
                                            <Title order={4} mb="md">
                                                Guardian Details
                                            </Title>
                                            <Stack gap="xs">
                                                <Box>
                                                    <Text size="sm" fw={500}>
                                                        Father:
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {studentData.father}
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {studentData.fatherContact}
                                                    </Text>
                                                </Box>
                                                <Box>
                                                    <Text size="sm" fw={500}>
                                                        Mother:
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {studentData.mother}
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {studentData.motherContact}
                                                    </Text>
                                                </Box>
                                            </Stack>
                                        </Card>
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Card shadow="sm" padding="lg" radius={2} withBorder>
                                            <Title order={4} mb="md">
                                                Medical Info
                                            </Title>
                                            <Stack gap="xs">
                                                <Box>
                                                    <Text size="sm" fw={500}>
                                                        Allergies:
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {studentData.allergies}
                                                    </Text>
                                                </Box>
                                                <Box>
                                                    <Text size="sm" fw={500}>
                                                        Conditions:
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {studentData.conditions}
                                                    </Text>
                                                </Box>
                                            </Stack>
                                        </Card>
                                    </Grid.Col>

                                    <Grid.Col span={12}>
                                        <Card shadow="sm" padding="lg" radius={2} withBorder>
                                            <Title order={4} mb="md">
                                                Current Address
                                            </Title>
                                            <Text size="sm">{studentData.address}</Text>
                                        </Card>
                                    </Grid.Col>

                                    <Grid.Col span={12}>
                                        <Card shadow="sm" padding="lg" radius={2} withBorder>
                                            <Title order={4} mb="md">
                                                Current Term Grades
                                            </Title>
                                            <Table>
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        <Table.Th>Subject</Table.Th>
                                                        <Table.Th>Midterm</Table.Th>
                                                        <Table.Th>Finals</Table.Th>
                                                        <Table.Th>Grade</Table.Th>
                                                    </Table.Tr>
                                                </Table.Thead>
                                                <Table.Tbody>
                                                    {gradesData.map((grade) => (
                                                        <Table.Tr key={grade.subject}>
                                                            <Table.Td>{grade.subject}</Table.Td>
                                                            <Table.Td>{grade.midterm}</Table.Td>
                                                            <Table.Td>{grade.finals}</Table.Td>
                                                            <Table.Td>
                                                                <Text fw={600}>{grade.grade}</Text>
                                                            </Table.Td>
                                                        </Table.Tr>
                                                    ))}
                                                </Table.Tbody>
                                            </Table>
                                        </Card>
                                    </Grid.Col>
                                </Grid>
                            </Tabs.Panel>

                            <Tabs.Panel value="academics">
                                <Card shadow="sm" padding="lg" radius={2} withBorder>
                                    <Text>Academic records and performance data will appear here.</Text>
                                </Card>
                            </Tabs.Panel>

                            <Tabs.Panel value="attendance">
                                <Card shadow="sm" padding="lg" radius={2} withBorder>
                                    <Text>Attendance records will appear here.</Text>
                                </Card>
                            </Tabs.Panel>

                            <Tabs.Panel value="fees">
                                <Card shadow="sm" padding="lg" radius={2} withBorder>
                                    <Text>Fee payment history will appear here.</Text>
                                </Card>
                            </Tabs.Panel>

                            <Tabs.Panel value="documents">
                                <Card shadow="sm" padding="lg" radius={2} withBorder>
                                    <Text>Student documents will appear here.</Text>
                                </Card>
                            </Tabs.Panel>
                        </Box>
                    </Tabs>
                </Grid.Col>
            </Grid>
        </Box>
    );
}
