import { Button, type ButtonProps } from '@mantine/core';
import type { ReactNode } from 'react';

/**
 * AppButton — Chief button component with standardized variants.
 *
 * Variants:
 *  - `primary`  (default) — filled brand color
 *  - `secondary` — outline brand
 *  - `danger`   — filled red for destructive actions
 *  - `ghost`    — subtle/transparent for tertiary actions
 *  - `success`  — filled green for confirmation actions
 */

type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';

interface AppButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
    /** Button intent variant */
    intent?: AppButtonVariant;
    /** Click handler */
    onClick?: () => void;
    /** Left icon/section */
    leftIcon?: ReactNode;
    /** Right icon/section */
    rightIcon?: ReactNode;
    children: ReactNode;
}

const VARIANT_MAP: Record<AppButtonVariant, { variant: ButtonProps['variant']; color: string }> = {
    primary: { variant: 'filled', color: 'brand' },
    secondary: { variant: 'outline', color: 'brand' },
    danger: { variant: 'filled', color: 'red' },
    ghost: { variant: 'subtle', color: 'gray' },
    success: { variant: 'filled', color: 'green' },
};

export function AppButton({
    intent = 'primary',
    leftIcon,
    rightIcon,
    children,
    ...props
}: AppButtonProps) {
    const { variant, color } = VARIANT_MAP[intent];

    return (
        <Button
            variant={variant}
            color={color}
            leftSection={leftIcon}
            rightSection={rightIcon}
            {...props}
        >
            {children}
        </Button>
    );
}
