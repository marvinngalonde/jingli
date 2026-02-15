import { Paper, Title, Group, Badge, Timeline, Text, Grid, Button, ThemeIcon } from '@mantine/core';
import { IconStethoscope, IconVaccine, IconAlertCircle, IconPlus } from '@tabler/icons-react';

export function HealthRecord() {
    return (
        <Grid>
            <Grid.Col span={8}>
                <Paper withBorder p="md" radius="md" mb="md">
                    <Group justify="space-between" mb="md">
                        <Title order={5}>Medical History</Title>
                        <Button variant="light" size="xs" leftSection={<IconPlus size={14} />}>Add Record</Button>
                    </Group>

                    <Timeline active={1} bulletSize={24} lineWidth={2}>
                        <Timeline.Item bullet={<IconStethoscope size={12} />} title="Yearly Checkup">
                            <Text size="sm">General physical examination passed.</Text>
                            <Text size="xs" c="dimmed">12 Jan 2024 - Dr. Smith</Text>
                        </Timeline.Item>
                        <Timeline.Item bullet={<IconVaccine size={12} />} title="Vaccination: Influenza">
                            <Text size="sm">Administered annual flu shot.</Text>
                            <Text size="xs" c="dimmed">10 Nov 2023</Text>
                        </Timeline.Item>
                        <Timeline.Item bullet={<IconAlertCircle size={12} />} title="Allergic Reaction" color="red">
                            <Text size="sm">Mild reaction to peanuts during lunch. Epipen administered.</Text>
                            <Text size="xs" c="dimmed">15 Aug 2023</Text>
                        </Timeline.Item>
                    </Timeline>
                </Paper>
            </Grid.Col>

            <Grid.Col span={4}>
                <Paper withBorder p="md" radius="md" mb="md">
                    <Title order={5} mb="md">Alerts & Allergies</Title>
                    <Group gap="xs">
                        <Badge color="red" variant="light" size="lg" leftSection={<IconAlertCircle size={14} />}>
                            Peanuts (Severe)
                        </Badge>
                        <Badge color="orange" variant="light" size="lg" leftSection={<IconAlertCircle size={14} />}>
                            Asthma
                        </Badge>
                    </Group>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Title order={5} mb="md">Emergency Contacts</Title>
                    <Group mb="xs">
                        <ThemeIcon variant="light" color="red"><IconPlus size={16} /></ThemeIcon>
                        <div>
                            <Text size="sm" fw={500}>Dr. House (Primary Care)</Text>
                            <Text size="xs" c="dimmed">+1 555 0199</Text>
                        </div>
                    </Group>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}
