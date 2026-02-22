import { Button, Paper, Title, Text, Switch, Group, Stack, TextInput, Select, Textarea, Loader, Center } from '@mantine/core';
import { PageHeader } from '../../components/common/PageHeader';
import { settingsService } from '../../services/settingsService';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm({
        initialValues: {
            name: '',
            contactEmail: '',
            address: '',
            notifications: true,
            darkMode: false,
            language: 'English',
        },
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await settingsService.getSettings();
            form.setValues({
                name: data.name,
                contactEmail: data.config?.contactEmail || '',
                address: data.config?.address || '',
                notifications: data.config?.notifications ?? true,
                darkMode: data.config?.darkMode ?? false,
                language: data.config?.language || 'English',
            });
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to load settings', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values: typeof form.values) => {
        setSaving(true);
        try {
            await settingsService.updateSettings({
                name: values.name,
                config: {
                    contactEmail: values.contactEmail,
                    address: values.address,
                    notifications: values.notifications,
                    darkMode: values.darkMode,
                    language: values.language,
                }
            });
            notifications.show({ title: 'Success', message: 'Settings updated successfully', color: 'green' });
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to update settings', color: 'red' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Center h={400}><Loader /></Center>;
    }

    return (
        <>
            <PageHeader
                title="System Settings"
                subtitle="Configure application preferences"
                actions={<Button variant="light" onClick={loadSettings}>Refresh</Button>}
            />

            <form onSubmit={form.onSubmit(handleSave)}>
                <Stack gap="xl">
                    <Paper p="md" radius="md" withBorder>
                        <Title order={4} mb="md">General Settings</Title>
                        <Stack gap="md">
                            <TextInput label="School Name" placeholder="Enter school name" required {...form.getInputProps('name')} />
                            <TextInput label="Contact Email" placeholder="Enter contact email" {...form.getInputProps('contactEmail')} />
                            <Textarea label="Address" placeholder="Enter school address" {...form.getInputProps('address')} />
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
                                <Switch {...form.getInputProps('notifications', { type: 'checkbox' })} />
                            </Group>
                            <Group justify="space-between">
                                <div>
                                    <Text fw={500}>Dark Mode</Text>
                                    <Text size="sm" c="dimmed">Enable dark theme for the interface</Text>
                                </div>
                                <Switch {...form.getInputProps('darkMode', { type: 'checkbox' })} />
                            </Group>
                            <Select
                                label="Language"
                                placeholder="Select language"
                                data={['English', 'Spanish', 'French', 'Chinese']}
                                w={200}
                                {...form.getInputProps('language')}
                            />
                        </Stack>
                    </Paper>

                    <Group justify="flex-end">
                        <Button type="submit" loading={saving}>Save Changes</Button>
                    </Group>
                </Stack>
            </form>
        </>
    );
}
