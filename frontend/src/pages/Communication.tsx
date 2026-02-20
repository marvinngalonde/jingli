import {
    Tabs,
    Paper,
    Text,
} from '@mantine/core';
import {
    IconSpeakerphone,
    IconMessage,
} from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { NoticeBoard } from '../components/communication/NoticeBoard';
import { useAuth } from '../context/AuthContext';

export default function Communication() {
    return (
        <>
            <PageHeader
                title="Communication"
                subtitle="School announcements and messages"
            />

            <Tabs defaultValue="notices" variant="outline" mt="md">
                <Tabs.List>
                    <Tabs.Tab value="notices" leftSection={<IconSpeakerphone size={16} />}>
                        Notice Board
                    </Tabs.Tab>
                    <Tabs.Tab value="messages" leftSection={<IconMessage size={16} />}>
                        Messages (Coming Soon)
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="notices" pt="md">
                    <NoticeBoard />
                </Tabs.Panel>

                <Tabs.Panel value="messages" pt="md">
                    <Paper p="xl" withBorder radius="md">
                        <Text c="dimmed" ta="center">Direct messaging system is coming soon in a future update.</Text>
                    </Paper>
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
