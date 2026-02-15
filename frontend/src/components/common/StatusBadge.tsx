import { Badge, type BadgeProps } from '@mantine/core';

interface StatusBadgeProps extends Omit<BadgeProps, 'color' | 'variant'> {
    status: string;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'active' || s === 'paid' || s === 'present' || s === 'approved') return 'green';
        if (s === 'inactive' || s === 'absent' || s === 'rejected') return 'red';
        if (s === 'pending' || s === 'suspended' || s === 'late') return 'orange';
        if (s === 'completed') return 'blue';
        return 'gray';
    };

    return (
        <Badge
            color={getStatusColor(status)}
            variant="light"
            transform="capitalize"
            {...props}
        >
            {status}
        </Badge>
    );
}
