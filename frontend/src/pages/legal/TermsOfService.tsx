import { Container, Title, Text, Space, Paper, useMantineTheme, useMantineColorScheme, ThemeIcon, Group, Box, Divider } from '@mantine/core';
import { IconFileCheck, IconUserExclamation, IconShieldX, IconCopyright, IconScale } from '@tabler/icons-react';

export function TermsOfService() {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const renderSection = (icon: React.ReactNode, title: string, content: string) => (
        <Box mb="xl">
            <Group mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                    {icon}
                </ThemeIcon>
                <Title order={2} size="h3" style={{ color: isDark ? theme.colors.gray[1] : theme.colors.dark[9] }}>
                    {title}
                </Title>
            </Group>
            <Text c="dimmed" lh={1.6}>
                {content}
            </Text>
        </Box>
    );

    return (
        <Box style={{ backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[0], minHeight: '100vh', paddingBottom: 'calc(var(--mantine-spacing-xl) * 2)' }}>
            {/* Hero Section */}
            <Box
                py={80}
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #152b53 0%, #0d1b36 100%)'
                        : 'linear-gradient(135deg, #1c4a97 0%, #112d5f 100%)',
                    color: 'white',
                    textAlign: 'center',
                    borderBottom: `1px solid ${isDark ? theme.colors.dark[6] : 'transparent'}`
                }}
            >
                <Container size="md">
                    <Title order={1} size="h1" fw={900} style={{ fontSize: '3rem', letterSpacing: '-1px' }}>
                        Terms of Service
                    </Title>
                    <Text size="xl" mt="md" opacity={0.9} maw={600} mx="auto">
                        Please read these terms carefully before using the Jingli Education Platform.
                    </Text>
                </Container>
            </Box>

            {/* Content Section */}
            <Container size="md" style={{ marginTop: '-40px' }}>
                <Paper p={40} radius="lg" shadow="xl" style={{ backgroundColor: isDark ? theme.colors.dark[7] : theme.white, position: 'relative', zIndex: 1 }}>
                    <Text ta="right" c="dimmed" size="sm" mb="xl">
                        <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
                    </Text>

                    {renderSection(
                        <IconFileCheck size={20} />,
                        "1. Acceptance of Terms",
                        "By accessing or using the Jingli School Management System, you agree to be bound by these Terms of Service. If you do not agree, you may not access the platform."
                    )}

                    <Divider my="xl" variant="dotted" />

                    {renderSection(
                        <IconUserExclamation size={20} />,
                        "2. User Accounts and Responsibilities",
                        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the platform for any illegal or unauthorized purpose, in compliance with the laws of Zimbabwe."
                    )}

                    <Divider my="xl" variant="dotted" />

                    {renderSection(
                        <IconShieldX size={20} />,
                        "3. Acceptable Use Policy",
                        "You must not transmit any malicious code, unauthorized promotional materials, or content that violates the rights of others. We reserve the right to suspend or terminate accounts that violate this policy."
                    )}

                    <Divider my="xl" variant="dotted" />

                    {renderSection(
                        <IconCopyright size={20} />,
                        "4. Intellectual Property",
                        "All intellectual property rights in the platform, including design, code, and content, remain the exclusive property of Jingli and its licensors."
                    )}

                    <Divider my="xl" variant="dotted" />

                    {renderSection(
                        <IconScale size={20} />,
                        "5. Limitation of Liability",
                        "To the maximum extent permitted by applicable law, Jingli shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the platform."
                    )}

                    <Space h="xl" />
                    <Paper
                        p="lg"
                        radius="md"
                        style={{
                            backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.blue[0],
                            borderLeft: `4px solid ${theme.colors.blue[6]}`,
                        }}
                    >
                        <Text size="sm" ta="center" fw={500} style={{ color: isDark ? theme.colors.gray[3] : theme.colors.blue[9] }}>
                            These terms create a legally binding agreement. Keep them in mind when navigating our platform.
                        </Text>
                    </Paper>
                </Paper>
            </Container>
        </Box>
    );
}
