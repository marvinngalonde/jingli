import { Container } from '@mantine/core';
import { NoticeBoard } from '../components/communication/NoticeBoard';

export default function NoticesPage() {
    return (
        <Container size="xl" py="md">
            <NoticeBoard />
        </Container>
    );
}
