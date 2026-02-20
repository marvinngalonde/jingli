import {
    Tabs,
} from '@mantine/core';
import {
    IconSpeakerphone,
    IconMessage,
} from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { NoticeBoard } from '../components/communication/NoticeBoard';
import { Messenger } from '../components/communication/Messenger';

export default function Communication() {
    return (
        <>
            <PageHeader
                title="Communication"
                subtitle="School announcements and messages"
            />

            <Tabs defaultValue="notices" radius="md" mt="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="notices" leftSection={<IconSpeakerphone size={16} />}>
                        Notice Board
                    </Tabs.Tab>
                    <Tabs.Tab value="messages" leftSection={<IconMessage size={16} />}>
                        Messages
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="notices" pt="md">
                    <NoticeBoard />
                </Tabs.Panel>

                <Tabs.Panel value="messages" pt="md">
                    <Messenger />
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
