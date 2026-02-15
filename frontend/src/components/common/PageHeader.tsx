import { Title, Text, Group, Box } from '@mantine/core';
import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <Box mb="lg">
            <Group justify="space-between" align="flex-end">
                <div>
                    <Title order={2} style={{ fontFamily: 'Inter, sans-serif' }}>{title}</Title>
                    {subtitle && <Text c="dimmed" size="sm" mt={4}>{subtitle}</Text>}
                </div>
                {actions && <Group>{actions}</Group>}
            </Group>
        </Box>
    );
}
