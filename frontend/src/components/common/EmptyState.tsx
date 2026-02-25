import { Center, Stack, Text, ThemeIcon, type MantineColor } from '@mantine/core';
import { IconDatabaseOff } from '@tabler/icons-react';
import type { ReactNode } from 'react';

/**
 * EmptyState — Chief "no data" placeholder component.
 *
 * Provides a consistent empty state with icon, title, description, and optional action.
 * Use anywhere data might be empty: tables, lists, search results, etc.
 */

interface EmptyStateProps {
    /** Title text (e.g. "No students found") */
    title?: string;
    /** Description text */
    description?: string;
    /** Custom icon (defaults to database icon) */
    icon?: ReactNode;
    /** Icon color */
    color?: MantineColor;
    /** Optional action button or link */
    action?: ReactNode;
    /** Height of the container */
    h?: number | string;
}

export function EmptyState({
    title = 'No data found',
    description,
    icon,
    color = 'gray',
    action,
    h = 200,
}: EmptyStateProps) {
    return (
        <Center h={h}>
            <Stack align="center" gap="xs">
                <ThemeIcon variant="light" color={color} size={48} radius="xl">
                    {icon || <IconDatabaseOff size={24} />}
                </ThemeIcon>
                <Text fw={500} c="dimmed" size="md">
                    {title}
                </Text>
                {description && (
                    <Text c="dimmed" size="sm" ta="center" maw={300}>
                        {description}
                    </Text>
                )}
                {action}
            </Stack>
        </Center>
    );
}
