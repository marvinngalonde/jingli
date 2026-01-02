import { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    Table,
    Button,
    Group,
    Text,
    TextInput,
    Badge,
    Title,
    Stack,
    Avatar,
    rem,
} from '@mantine/core';
import { Search, Filter, Barcode } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import AddBookModal from '../components/AddBookModal';
import { libraryService } from '../services/libraryService';
import { showErrorNotification } from '../utils/notifications';


function getStatusColor(status: string) {
    return status === 'Available' ? 'green' : 'gray';
}


export default function Library() {
    const [addBookOpened, { open: openAddBook, close: closeAddBook }] = useDisclosure(false);
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await libraryService.getAll();
            setBooks(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch books');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            fetchBooks();
            return;
        }
        try {
            const data = await libraryService.search(query);
            setBooks(data || []);
        } catch (error: any) {
            showErrorNotification(error.message);
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'available' ? 'green' : 'gray';
    };

    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            <Grid gutter="md">
                {/* Book Inventory */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Group justify="space-between" mb="md" wrap="wrap">
                            <Title order={4}>Book Inventory</Title>
                            <Group>
                                <Button
                                    variant="outline"
                                    leftSection={<Filter size={16} />}
                                    size="sm"
                                    radius={2}
                                    color="gray"
                                >
                                    Filter
                                </Button>
                                <Button
                                    leftSection={<Barcode size={16} />}
                                    size="sm"
                                    radius={2}
                                    color="navy.9"
                                    onClick={openAddBook}
                                >
                                    Add Book
                                </Button>
                            </Group>
                        </Group>

                        <TextInput
                            placeholder="Scan ISBN or Search Title"
                            leftSection={<Search size={16} />}
                            mb="md"
                            size="sm"
                            radius={2}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.currentTarget.value)}
                        />

                        <Box style={{ overflowX: 'auto' }}>
                            <Table highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <Table.Th>Accession No.</Table.Th>
                                        <Table.Th>Book Title</Table.Th>
                                        <Table.Th>Author</Table.Th>
                                        <Table.Th>Category</Table.Th>
                                        <Table.Th>Shelf No.</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {loading ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={6} style={{ textAlign: 'center', padding: rem(40) }}>
                                                <Text c="dimmed">Loading books...</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : books.length === 0 ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={6} style={{ textAlign: 'center', padding: rem(40) }}>
                                                <Text c="dimmed">No books found</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : (
                                        books.map((book) => (
                                            <Table.Tr key={book.id}>
                                                <Table.Td>
                                                    <Text size="sm">{book.accession_number}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>
                                                        {book.title}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{book.author}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{book.category}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{book.shelf_number}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge color={getStatusColor(book.status)} variant="light" size="sm" radius={2}>
                                                        {book.status}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </Card>
                </Grid.Col>
            </Grid>

            <AddBookModal
                opened={addBookOpened}
                onClose={closeAddBook}
                onSuccess={fetchBooks}
            />
        </Box>
    );
}
