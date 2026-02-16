import { Button, Paper, Title, Text, Switch, Group, Stack, TextInput, Select, Textarea } from '@mantine/core';
import { PageHeader } from '../../components/common/PageHeader';

export default function Settings() {
    return (
        <>
            <PageHeader
                title="System Settings"
                subtitle="Configure application preferences"
                actions={<Button variant="light">Reset to Defaults</Button>}
            />

            <Stack gap="xl">
                <Paper p="md" radius="md" withBorder>
                    <Title order={4} mb="md">General Settings</Title>
                    <Stack gap="md">
                        <TextInput label="School Name" placeholder="Enter school name" defaultValue="Jingli International School" />
                        <TextInput label="Contact Email" placeholder="Enter contact email" defaultValue="admin@jingli.edu" />
                        <Textarea label="Address" placeholder="Enter school address" />
                    </Stack>
                </Paper>

                <Paper p="md" radius="md" withBorder>
                    <Title order={4} mb="md">Preferences</Title>
                    <Stack gap="md">
                        <Group justify="space-between">
                            <div>
                                <Text fw={500}>Notifications</Text>
                                <Text size="sm" c="dimmed">Receive email notifications for important updates</Text>
                            </div>
                            <Switch defaultChecked />
                        </Group>
                        <Group justify="space-between">
                            <div>
                                <Text fw={500}>Dark Mode</Text>
                                <Text size="sm" c="dimmed">Enable dark theme for the interface</Text>
                            </div>
                            <Switch />
                        </Group>
                        <Select
                            label="Language"
                            placeholder="Select language"
                            data={['English', 'Spanish', 'French', 'Chinese']}
                            defaultValue="English"
                            w={200}
                        />
                    </Stack>
                </Paper>

                <Group justify="flex-end">
                    <Button>Save Changes</Button>
                </Group>
            </Stack>
        </>
    );
}
