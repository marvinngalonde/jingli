import { Container, Title, Text, Space, Paper, useMantineTheme, useMantineColorScheme, ThemeIcon, Group, Box, Divider } from '@mantine/core';
import { IconShieldLock, IconEye, IconDatabase, IconShare, IconUserCheck } from '@tabler/icons-react';

export function PrivacyPolicy() {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const renderSection = (icon: React.ReactNode, title: string, content: string) => (
        <Box mb="xl">
            <Group mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="brand">
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
                        ? 'radial-gradient(circle, #1a3a6e 0%, #0a1e4a 100%)'
                        : 'radial-gradient(circle, #255bb5 0%, #0d328b 100%)',
                    color: 'white',
                    textAlign: 'center'
                }}
            >
                <Container size="md">
                    <Title order={1} size="h1" fw={900} style={{ fontSize: '3rem', letterSpacing: '-1px' }}>
                        Privacy Policy
                    </Title>
                    <Text size="xl" mt="md" opacity={0.9} maw={600} mx="auto">
                        Your privacy is critically important to us. Learn how we collect, use, and protect your data securely.
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
                        <IconEye size={20} />,
                        "1. Information We Collect",
                        "We collect personal information that you provide to us, such as name, email address, phone number, and school association details. We also collect usage data automatically when you interact with our platform. This collection aligns with Zimbabwean and international data protection standards."
                    )}

                    <Divider my="xl" variant="dotted" />

                    {renderSection(
                        <IconDatabase size={20} />,
                        "2. How We Use Your Information",
                        "We use your information to provide, manage, and improve the school management services. This includes authentication, communication, grading, and facilitating school operations."
                    )}

                    <Divider my="xl" variant="dotted" />

                    {renderSection(
                        <IconShieldLock size={20} />,
                        "3. Data Security and Encryption",
                        "We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, or unauthorized access. All data traffic between your browser and our servers is encrypted using standard Transport Layer Security (TLS)."
                    )}

                    <Divider my="xl" variant="dotted" />

                    {renderSection(
                        <IconShare size={20} />,
                        "4. Data Sharing",
                        "We do not sell your personal information. We may share information with third-party service providers who help us operate our platform, or when required by Zimbabwean law enforcement or international legal obligations."
                    )}

                    <Divider my="xl" variant="dotted" />

                    {renderSection(
                        <IconUserCheck size={20} />,
                        "5. Your Rights",
                        "Depending on your location and applicable data protection laws, you may have the right to access, correct, or delete your personal data. Please contact your school administrator or our support team to exercise these rights."
                    )}

                    <Space h="xl" />
                    <Paper
                        p="lg"
                        radius="md"
                        style={{
                            backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.brand[0],
                            borderLeft: `4px solid ${theme.colors.brand[6]}`,
                        }}
                    >
                        <Text size="sm" ta="center" fw={500} style={{ color: isDark ? theme.colors.gray[3] : theme.colors.brand[9] }}>
                            For questions about this Privacy Policy, please contact our dedicated data protection support team.
                        </Text>
                    </Paper>
                </Paper>
            </Container>
        </Box>
    );
}
