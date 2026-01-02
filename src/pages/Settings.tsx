import {
    Box,
    Card,
    Title,
    Stack,
    TextInput,
    Select,
    Switch,
    Button,
    Group,
    Text,
    Divider,
    rem,
} from '@mantine/core';
import { Upload } from 'lucide-react';

export default function Settings() {
    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            <Title order={2} mb="lg">
                System Settings & Configuration
            </Title>

            <Card shadow="sm" padding="lg" radius={2} withBorder>
                <Stack gap="xl">
                    {/* General Settings */}
                    <Box>
                        <Title order={4} mb="md">
                            General
                        </Title>
                        <Stack gap="md">
                            <TextInput
                                label="School Name"
                                defaultValue="Jingli School"
                                size="sm"
                                radius={2}
                            />
                            <TextInput
                                label="Registration Number"
                                defaultValue="SCH/2023/001"
                                size="sm"
                                radius={2}
                            />
                            <TextInput
                                label="Contact Email"
                                defaultValue="admin@jinglisc hool.edu"
                                size="sm"
                                radius={2}
                            />
                            <Group>
                                <Text size="sm" fw={500}>
                                    Upload School Logo
                                </Text>
                                <Button
                                    variant="outline"
                                    leftSection={<Upload size={16} />}
                                    size="xs"
                                    radius={2}
                                    color="gray"
                                >
                                    Upload
                                </Button>
                            </Group>
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Regional Settings */}
                    <Box>
                        <Title order={4} mb="md">
                            Regional
                        </Title>
                        <Group grow>
                            <Select
                                label="Timezone"
                                data={['UTC', 'EST', 'PST', 'GMT']}
                                defaultValue="UTC"
                                size="sm"
                                radius={2}
                            />
                            <Select
                                label="Currency Format"
                                data={['USD', 'EUR', 'GBP', 'CNY']}
                                defaultValue="USD"
                                size="sm"
                                radius={2}
                            />
                            <Select
                                label="Date Format"
                                data={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']}
                                defaultValue="MM/DD/YYYY"
                                size="sm"
                                radius={2}
                            />
                        </Group>
                    </Box>

                    <Divider />

                    {/* Features */}
                    <Box>
                        <Title order={4} mb="md">
                            Features
                        </Title>
                        <Stack gap="md">
                            <Switch
                                label="Enable Parent Portal"
                                defaultChecked
                                size="sm"
                            />
                            <Switch
                                label="Enable Online Fee Payment"
                                defaultChecked
                                size="sm"
                            />
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Save Button */}
                    <Group justify="flex-end">
                        <Button variant="outline" size="sm" radius={2} color="gray">
                            Cancel
                        </Button>
                        <Button size="sm" radius={2} color="navy.9">
                            Save Configuration
                        </Button>
                    </Group>
                </Stack>
            </Card>
        </Box>
    );
}
