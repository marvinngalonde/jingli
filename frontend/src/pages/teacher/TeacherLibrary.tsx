import { useState, useEffect } from 'react';
import { Title, Text, Paper, Group, Stack, Card, Badge, Table, ThemeIcon, SimpleGrid, TextInput, ScrollArea, LoadingOverlay } from '@mantine/core';
import { IconBook, IconSearch, IconBookmark } from '@tabler/icons-react';
import { api } from '../../services/api';
import { notifications } from '@mantine/notifications';

interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    accessionNo: string;
    status: string;
}

export default function TeacherLibrary() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/library/books');
                setBooks(Array.isArray(data) ? data : []);
            } catch {
                notifications.show({ title: 'Error', message: 'Failed to load library catalog', color: 'red' });
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase())
    );

    const availableCount = books.filter(b => b.status === 'AVAILABLE').length;

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

            <Group justify="space-between">
                <div>
                    <Title order={2}>Library Catalog</Title>
                    <Text c="dimmed" size="sm">Browse available books in the school library</Text>
                </div>
            </Group>

            <SimpleGrid cols={{ base: 2, md: 3 }}>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="blue" size="lg"><IconBook size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Total Books</Text>
                            <Text fw={700} size="lg">{books.length}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="green" size="lg"><IconBookmark size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Available</Text>
                            <Text fw={700} size="lg">{availableCount}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="orange" size="lg"><IconBook size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Checked Out</Text>
                            <Text fw={700} size="lg">{books.length - availableCount}</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            <Paper p="lg" radius="md" shadow="sm" withBorder>
                <TextInput
                    placeholder="Search by title, author, or category..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    mb="md"
                    style={{ maxWidth: 400 }}
                />

                {filtered.length === 0 && !loading ? (
                    <Stack align="center" py="xl" gap="xs">
                        <IconBook size={40} color="var(--mantine-color-gray-4)" />
                        <Text c="dimmed">No books found.</Text>
                    </Stack>
                ) : (
                    <ScrollArea>
                        <Table verticalSpacing="md" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Title</Table.Th>
                                    <Table.Th>Author</Table.Th>
                                    <Table.Th>Category</Table.Th>
                                    <Table.Th>Accession No.</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filtered.map(book => (
                                    <Table.Tr key={book.id}>
                                        <Table.Td>
                                            <Group gap="sm">
                                                <ThemeIcon variant="light" color="blue" size="md" radius="md">
                                                    <IconBook size={14} />
                                                </ThemeIcon>
                                                <Text size="sm" fw={500}>{book.title}</Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td><Text size="sm">{book.author}</Text></Table.Td>
                                        <Table.Td><Badge variant="light" color="grape">{book.category || '—'}</Badge></Table.Td>
                                        <Table.Td><Text size="sm" c="dimmed">{book.accessionNo}</Text></Table.Td>
                                        <Table.Td>
                                            <Badge color={book.status === 'AVAILABLE' ? 'green' : 'orange'} variant="filled" size="sm">
                                                {book.status}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Paper>
        </Stack>
    );
}
