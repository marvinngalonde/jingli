import { Title, SimpleGrid, Card, Text, Badge, Group, Button } from '@mantine/core';
import { IconTrophy, IconPlus } from '@tabler/icons-react';

export function ECARecord() {
    return (
        <div>
            <Group justify="space-between" mb="md">
                <Title order={5}>Activities & Achievements</Title>
                <Button variant="light" size="xs" leftSection={<IconPlus size={14} />}>Add Activity</Button>
            </Group>

            <SimpleGrid cols={3}>
                <Card withBorder padding="lg" radius="md">
                    <Card.Section>
                        {/* Placeholder for activity image */}
                        <div style={{ height: 100, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconTrophy size={40} color="orange" />
                        </div>
                    </Card.Section>

                    <Group justify="space-between" mt="md" mb="xs">
                        <Text fw={500}>Debate Club</Text>
                        <Badge color="pink" variant="light">
                            President
                        </Badge>
                    </Group>

                    <Text size="sm" c="dimmed">
                        Active member since 2022. Won Regional Debate Championship 2023.
                    </Text>
                </Card>

                <Card withBorder padding="lg" radius="md">
                    <Card.Section>
                        <div style={{ height: 100, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconTrophy size={40} color="blue" />
                        </div>
                    </Card.Section>

                    <Group justify="space-between" mt="md" mb="xs">
                        <Text fw={500}>Swimming Team</Text>
                        <Badge color="blue" variant="light">
                            Member
                        </Badge>
                    </Group>

                    <Text size="sm" c="dimmed">
                        Junior Varsity team. Training: Mon/Wed/Fri.
                    </Text>
                </Card>
            </SimpleGrid>
        </div>
    );
}
