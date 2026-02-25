import { Card, Group, Text, ThemeIcon, type MantineColor } from '@mantine/core';
import type { ReactNode } from 'react';

/**
 * StatCard — Chief dashboard stat card component.
 *
 * Displays a metric label, value, and optional icon in a consistent card format.
 * Used across Dashboard, Finance, Reports, and other summary views.
 */

interface StatCardProps {
    /** Metric label (e.g. "Total Students") */
    label: string;
    /** Metric value (e.g. "1,234" or "$5,000") */
    value: string | number;
    /** Optional icon to display */
    icon?: ReactNode;
    /** Color for the icon background */
    color?: MantineColor;
    /** Optional description or trend text */
    description?: string;
    /** Optional onClick handler to make card interactive */
    onClick?: () => void;
}

export function StatCard({
    label,
    value,
    icon,
    color = 'brand',
    description,
    onClick,
}: StatCardProps) {
    return (
        <Card
            p="md"
            style={onClick ? { cursor: 'pointer' } : undefined}
            onClick={onClick}
        >
            <Group justify="space-between" mb="xs">
                <Text fw={500} c="dimmed" size="sm">
                    {label}
                </Text>
                {icon && (
                    <ThemeIcon variant="light" color={color} size="lg" radius="md">
                        {icon}
                    </ThemeIcon>
                )}
            </Group>
            <Text fw={700} size="xl">
                {value}
            </Text>
            {description && (
                <Text size="xs" c="dimmed" mt={4}>
                    {description}
                </Text>
            )}
        </Card>
    );
}
