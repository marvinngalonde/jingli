import { Card, type CardProps } from '@mantine/core';
import type { ReactNode } from 'react';

/**
 * AppCard — Chief card component with contextual variants.
 *
 * Variants:
 *  - `default`  — standard bordered card
 *  - `flat`     — no border, subtle background
 *  - `elevated` — heavier shadow, no border
 *  - `outlined` — border only, no shadow
 */

type AppCardVariant = 'default' | 'flat' | 'elevated' | 'outlined';

interface AppCardProps extends Omit<CardProps, 'variant'> {
    /** Card visual variant */
    variant?: AppCardVariant;
    children: ReactNode;
}

const CARD_STYLES: Record<AppCardVariant, Partial<CardProps> & { style?: React.CSSProperties }> = {
    default: {
        shadow: 'sm',
        withBorder: true,
    },
    flat: {
        shadow: undefined,
        withBorder: false,
        style: { backgroundColor: 'var(--app-surface-dim)' },
    },
    elevated: {
        shadow: 'md',
        withBorder: false,
    },
    outlined: {
        shadow: undefined,
        withBorder: true,
    },
};

export function AppCard({
    variant = 'default',
    children,
    style,
    ...props
}: AppCardProps) {
    const variantProps = CARD_STYLES[variant];
    const { style: variantStyle, ...restVariant } = variantProps;

    return (
        <Card
            radius="lg"
            p="md"
            {...restVariant}
            style={{ ...variantStyle, ...style }}
            {...props}
        >
            {children}
        </Card>
    );
}
