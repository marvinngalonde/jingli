import { Button, Paper, Title, Text, Switch, Group, Stack, TextInput, Select, Textarea, Loader, Center } from '@mantine/core';
import { PageHeader } from '../../components/common/PageHeader';
import { settingsService } from '../../services/settingsService';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function Settings() {
    const queryClient = useQueryClient();

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

    const { data: settingsData, isLoading: loading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => await settingsService.getSettings()
    });

    useEffect(() => {
        if (settingsData) {
            form.setValues({
                name: settingsData.name,
                contactEmail: settingsData.config?.contactEmail || '',
                address: settingsData.config?.address || '',
                notifications: settingsData.config?.notifications ?? true,
                darkMode: settingsData.config?.darkMode ?? false,
                language: settingsData.config?.language || 'English',
            });
        }
    }, [settingsData]);

    const saveMutation = useMutation({
        mutationFn: (values: typeof form.values) => settingsService.updateSettings({
            name: values.name,
            config: {
                contactEmail: values.contactEmail,
                address: values.address,
                notifications: values.notifications,
                darkMode: values.darkMode,
                language: values.language,
            }
        }),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Settings updated successfully', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to update settings', color: 'red' });
        }
    });

    const handleSave = async (values: typeof form.values) => {
        saveMutation.mutate(values);
    };

    if (loading) {
        return <Center h={400}><Loader /></Center>;
    }

    return (
        <>
            <PageHeader
                title="System Settings"
                subtitle="Configure application preferences"
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
                        <Button type="submit" loading={saveMutation.isPending}>Save Changes</Button>
                    </Group>
                </Stack>
            </form>
        </>
    );
}
