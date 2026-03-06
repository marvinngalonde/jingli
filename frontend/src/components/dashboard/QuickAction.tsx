import { Paper, Group, ThemeIcon, Text } from '@mantine/core';

interface QuickActionProps {
    title: string;
    icon: any;
    color: string;
    onClick: () => void;
}

export function QuickAction({ title, icon: Icon, color, onClick }: QuickActionProps) {
    return (
        <Paper shadow="sm" p="md" radius="md" withBorder style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={onClick}>
            <Group>
                <ThemeIcon variant="light" color={color} size="lg" radius="md">
                    <Icon size={20} />
                </ThemeIcon>
                <Text fw={600} size="sm">{title}</Text>
            </Group>
        </Paper>
    )
}
