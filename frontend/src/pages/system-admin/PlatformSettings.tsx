import { Box, Title, Text, Card, Group, ThemeIcon, Switch, Divider, Stack, Badge, Button, TextInput, Textarea } from '@mantine/core';
import { IconShield, IconBell, IconDatabase, IconServer, IconDeviceFloppy } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

const SettingSection = ({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) => (
    <Card withBorder radius="lg" shadow="xs" p="lg" mb="lg">
        <Group mb="md" gap="sm">
            <ThemeIcon variant="light" color={color} radius="md" size={36}>
                <Icon size={18} stroke={1.5} />
            </ThemeIcon>
            <Title order={5} fw={700}>{title}</Title>
        </Group>
        <Divider mb="md" />
        {children}
    </Card>
);

export default function PlatformSettings() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationsOpen, setRegistrationsOpen] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleSave = () => {
        notifications.show({ title: 'Settings saved', message: 'Platform configuration updated.', color: 'green' });
    };

    return (
        <Box p="md">
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} c="dark.8" fw={800}>Platform Settings</Title>
                    <Text c="dimmed" size="sm" mt={2}>Global configuration for the entire Jingli platform.</Text>
                </Box>
                <Badge color="indigo" variant="light" size="lg">v2.0</Badge>
            </Group>

            <SettingSection icon={IconServer} title="Platform Operations" color="indigo">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Box>
                            <Text size="sm" fw={600}>Maintenance Mode</Text>
                            <Text size="xs" c="dimmed">Block all school access with a maintenance banner</Text>
                        </Box>
                        <Switch
                            checked={maintenanceMode}
                            onChange={(e) => setMaintenanceMode(e.currentTarget.checked)}
                            color="red"
                        />
                    </Group>
                    <Group justify="space-between">
                        <Box>
                            <Text size="sm" fw={600}>Open Registrations</Text>
                            <Text size="xs" c="dimmed">Allow new schools to self-register via /install</Text>
                        </Box>
                        <Switch
                            checked={registrationsOpen}
                            onChange={(e) => setRegistrationsOpen(e.currentTarget.checked)}
                            color="indigo"
                        />
                    </Group>
                </Stack>
            </SettingSection>

            <SettingSection icon={IconBell} title="Platform Notifications" color="blue">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Box>
                            <Text size="sm" fw={600}>Email Notifications to Admin</Text>
                            <Text size="xs" c="dimmed">Receive an email when a new school registers</Text>
                        </Box>
                        <Switch
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.currentTarget.checked)}
                            color="blue"
                        />
                    </Group>
                    <TextInput
                        label="Admin Notification Email"
                        description="Platform-wide alerts will be sent here"
                        placeholder="admin@jingli.co.zw"
                    />
                </Stack>
            </SettingSection>

            <SettingSection icon={IconShield} title="Security" color="grape">
                <Stack gap="md">
                    <TextInput
                        label="Bootstrap Secret Key"
                        description="Required to call the /system-admin/bootstrap endpoint in production"
                        placeholder="Enter a long random secret..."
                        type="password"
                    />
                    <Textarea
                        label="Allowed Origins (CORS)"
                        description="One origin per line. Restart the backend to apply."
                        placeholder="https://jingli.co.zw"
                        rows={3}
                    />
                </Stack>
            </SettingSection>

            <SettingSection icon={IconDatabase} title="Database & Storage" color="teal">
                <Stack gap="sm">
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">Database Engine</Text>
                        <Text size="sm" fw={600}>PostgreSQL (Supabase)</Text>
                    </Group>
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">ORM</Text>
                        <Text size="sm" fw={600}>Prisma</Text>
                    </Group>
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">Auth Provider</Text>
                        <Text size="sm" fw={600}>Supabase Auth</Text>
                    </Group>
                </Stack>
            </SettingSection>

            <Group justify="flex-end">
                <Button leftSection={<IconDeviceFloppy size={16} />} color="indigo" onClick={handleSave}>
                    Save Platform Settings
                </Button>
            </Group>
        </Box>
    );
}
