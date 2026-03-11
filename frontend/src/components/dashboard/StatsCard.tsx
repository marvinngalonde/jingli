import { Paper, Group, ThemeIcon, Text, Badge, RingProgress, Center, rem } from '@mantine/core';

interface StatsCardProps {
    title: string;
    value: string;
    subtext?: string;
    subtextColor?: string;
    icon: any;
    color: string;
    iconBg?: string;
    isProgress?: boolean;
}

export function StatsCard({ title, value, subtext, subtextColor, icon: Icon, color, iconBg, isProgress }: StatsCardProps) {
    return (
        <Paper
            shadow="sm"
            p="md"
            radius="md"
            withBorder
            style={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
        >
            {/* Accent border line */}
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: rem(4), backgroundColor: `var(--mantine-color-${color}-5)` }} />

            {/* Background watermark icon */}
            <Icon
                style={{
                    position: 'absolute',
                    right: rem(-15),
                    bottom: rem(-15),
                    width: rem(80),
                    height: rem(80),
                    opacity: 0.05,
                    transform: 'rotate(-15deg)',
                    pointerEvents: 'none'
                }}
                color={`var(--mantine-color-${color}-9)`}
            />

            <Group justify="space-between" align="flex-start" style={{ position: 'relative', zIndex: 1 }}>
                <div>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={1}>
                        {title}
                    </Text>

                    {isProgress ? (
                        <Group justify="flex-start" mt="xs">
                            <RingProgress
                                size={64}
                                roundCaps
                                thickness={6}
                                sections={[{ value: 94, color: color }]}
                                label={
                                    <Center>
                                        <Text c="dark" fw={800} size="sm">
                                            94%
                                        </Text>
                                    </Center>
                                }
                            />
                        </Group>
                    ) : (
                        <Text fw={800} style={{ fontSize: rem(28), lineHeight: 1 }} mt="xs">
                            {value}
                        </Text>
                    )}
                </div>

                <ThemeIcon size={40} radius="md" variant="light" color={color}>
                    <Icon style={{ width: rem(22), height: rem(22) }} />
                </ThemeIcon>
            </Group>

            {!isProgress && subtext && (
                <Group gap="xs" mt="sm" style={{ position: 'relative', zIndex: 1 }}>
                    <Badge variant="dot" color={subtextColor || 'gray'} size="sm">
                        {subtext}
                    </Badge>
                </Group>
            )}
        </Paper>
    );
}
