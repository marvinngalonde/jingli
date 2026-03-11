import { Tabs, Button, Group, Text, Badge, ActionIcon, Modal, TextInput, Stack, Select, Loader, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBook, IconExchange, IconPlus, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusBadge } from '../../components/common/StatusBadge';
import { libraryService, BookStatus, CirculationStatus } from '../../services/libraryService';
import type { Book, CirculationRecord } from '../../services/libraryService';
import { studentService } from '../../services/studentService';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';

export default function Library() {
    const [activeTab, setActiveTab] = useState<string | null>('books');
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();

    // Modals
    const [bookOpened, { open: openBook, close: closeBook }] = useDisclosure(false);
    const [issueOpened, { open: openIssue, close: closeIssue }] = useDisclosure(false);

    // Queries
    const { data: booksData = [], isLoading: booksLoading } = useQuery({
        queryKey: ['libraryBooks'],
        queryFn: libraryService.getAllBooks
    });
    const books: Book[] = Array.isArray(booksData) ? booksData : (booksData as any).data || [];

    const { data: circData = [], isLoading: circLoading } = useQuery({
        queryKey: ['libraryCirculation'],
        queryFn: libraryService.getCirculation
    });
    const circulation: CirculationRecord[] = Array.isArray(circData) ? circData : (circData as any).data || [];

    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ['libraryStudents'],
        queryFn: () => studentService.getAll({ limit: 1000 })
    });

    const students = useMemo(() => (studentsData?.data || []).map((s: any) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName} (${s.admissionNo})`
    })), [studentsData]);

    const loading = booksLoading || circLoading || studentsLoading;

    // Mutations
    const addBookMutation = useMutation({
        mutationFn: libraryService.createBook,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Book added to inventory', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
            bookForm.reset();
            closeBook();
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to add book', color: 'red' })
    });

    const issueBookMutation = useMutation({
        mutationFn: libraryService.issueBook,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Book issued successfully', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['libraryCirculation'] });
            queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
            issueForm.reset();
            closeIssue();
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to issue book', color: 'red' })
    });

    const returnBookMutation = useMutation({
        mutationFn: libraryService.returnBook,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Book returned', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['libraryCirculation'] });
            queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to return book', color: 'red' })
    });

    const deleteBookMutation = useMutation({
        mutationFn: libraryService.deleteBook,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Book removed', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to delete book', color: 'red' })
    });

    // Forms
    const bookForm = useForm({
        initialValues: { title: '', author: '', isbn: '', category: '', accessionNo: '' },
        validate: {
            title: (v) => (!v ? 'Required' : null),
            author: (v) => (!v ? 'Required' : null),
        }
    });

    const issueForm = useForm({
        initialValues: { bookId: '', studentId: '', dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), remarks: '' },
        validate: {
            bookId: (v) => (!v ? 'Required' : null),
            studentId: (v) => (!v ? 'Required' : null),
            dueDate: (v) => (!v ? 'Required' : null),
        }
    });

    const handleAddBook = (values: typeof bookForm.values) => addBookMutation.mutate(values);
    const handleIssueBook = (values: typeof issueForm.values) => issueBookMutation.mutate(values);
    const handleReturnBook = (id: string) => returnBookMutation.mutate(id);
    const handleDeleteBook = (id: string) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        deleteBookMutation.mutate(id);
    };

    const filteredBooks = books.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase()) ||
        (item.isbn && item.isbn.includes(search))
    );

    const filteredCirculation = circulation.filter(item =>
        item.book.title.toLowerCase().includes(search.toLowerCase()) ||
        `${item.student.firstName} ${item.student.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    const BooksTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Manage library inventory.</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openBook}>Add New Book</Button>
            </Group>
            <DataTable
                data={filteredBooks}
                columns={[
                    { accessor: 'title', header: 'Title', width: 250 },
                    { accessor: 'author', header: 'Author' },
                    { accessor: 'category', header: 'Category' },
                    { accessor: 'accessionNo', header: 'Accession No' },
                    {
                        accessor: 'status',
                        header: 'Status',
                        render: (item) => (
                            <Badge color={item.status === BookStatus.AVAILABLE ? 'green' : item.status === BookStatus.ISSUED ? 'blue' : 'red'}>
                                {item.status}
                            </Badge>
                        )
                    },
                    {
                        accessor: 'actions',
                        header: '',
                        width: 80,
                        render: (item) => (
                            <ActionIcon variant="subtle" color="red" loading={deleteBookMutation.isPending && deleteBookMutation.variables === item.id} onClick={() => handleDeleteBook(item.id)}><IconTrash size={16} /></ActionIcon>
                        )
                    }
                ]}
                search={search}
                onSearchChange={setSearch}
            />
        </>
    );

    const CirculationTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Track book issues and returns.</Text>
                <Button leftSection={<IconExchange size={16} />} onClick={openIssue}>Issue Book</Button>
            </Group>
            <DataTable
                data={filteredCirculation}
                columns={[
                    { accessor: 'bookTitle', header: 'Book Title', width: 200, render: (item) => item.book.title },
                    {
                        accessor: 'student',
                        header: 'Student',
                        render: (item) => `${item.student.firstName} ${item.student.lastName} (${item.student.admissionNo})`
                    },
                    {
                        accessor: 'issueDate',
                        header: 'Issue Date',
                        render: (item) => new Date(item.issueDate).toLocaleDateString()
                    },
                    {
                        accessor: 'dueDate',
                        header: 'Due Date',
                        render: (item) => new Date(item.dueDate).toLocaleDateString()
                    },
                    {
                        accessor: 'status',
                        header: 'Status',
                        render: (item) => <StatusBadge status={item.status} />
                    },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        render: (item) => (
                            <Button
                                size="compact-xs"
                                variant="light"
                                loading={returnBookMutation.isPending && returnBookMutation.variables === item.id}
                                disabled={item.status === CirculationStatus.RETURNED}
                                onClick={() => handleReturnBook(item.id)}
                            >
                                Return
                            </Button>
                        )
                    }
                ]}
                search={search}
                onSearchChange={setSearch}
            />
        </>
    );

    return (
        <>
            <PageHeader
                title="Library Management"
                subtitle="Manage books, inventory, and circulation"
            />

            {loading ? (
                <Center p="xl"><Loader /></Center>
            ) : (
                <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="books" leftSection={<IconBook size={16} />}>Books Inventory</Tabs.Tab>
                        <Tabs.Tab value="circulation" leftSection={<IconExchange size={16} />}>Circulation</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="books">
                        <BooksTab />
                    </Tabs.Panel>

                    <Tabs.Panel value="circulation">
                        <CirculationTab />
                    </Tabs.Panel>
                </Tabs>
            )}

            {/* Modals */}
            <Modal opened={bookOpened} onClose={closeBook} title="Add New Book">
                <form onSubmit={bookForm.onSubmit(handleAddBook)}>
                    <Stack>
                        <TextInput label="Title" placeholder="Book Title" required {...bookForm.getInputProps('title')} />
                        <TextInput label="Author" placeholder="Author Name" required {...bookForm.getInputProps('author')} />
                        <TextInput label="ISBN" placeholder="e.g. 978-..." {...bookForm.getInputProps('isbn')} />
                        <TextInput label="Category" placeholder="e.g. Fiction, Science" {...bookForm.getInputProps('category')} />
                        <TextInput label="Accession No" placeholder="Library Reference" {...bookForm.getInputProps('accessionNo')} />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={closeBook}>Cancel</Button>
                            <Button type="submit" loading={addBookMutation.isPending}>Add Book</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Modal opened={issueOpened} onClose={closeIssue} title="Issue Book">
                <form onSubmit={issueForm.onSubmit(handleIssueBook)}>
                    <Stack>
                        <Select
                            label="Book"
                            placeholder="Select available book"
                            data={books.filter(b => b.status === BookStatus.AVAILABLE).map(b => ({ value: b.id, label: `${b.title} (${b.accessionNo || 'No Accession'})` }))}
                            searchable
                            required
                            {...issueForm.getInputProps('bookId')}
                        />
                        <Select
                            label="Student"
                            placeholder="Search student..."
                            data={students}
                            searchable
                            required
                            {...issueForm.getInputProps('studentId')}
                        />
                        <DateInput label="Due Date" required {...issueForm.getInputProps('dueDate')} />
                        <TextInput label="Remarks" placeholder="Optional notes" {...issueForm.getInputProps('remarks')} />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={closeIssue}>Cancel</Button>
                            <Button type="submit" loading={issueBookMutation.isPending}>Issue Book</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
