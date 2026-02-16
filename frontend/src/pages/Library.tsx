import { Tabs, Button, Group, Text, Badge, ActionIcon } from '@mantine/core';
import { IconBook, IconExchange, IconPlus, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { useState } from 'react';
import { StatusBadge } from '../components/common/StatusBadge';

// --- Mock Data ---
interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    status: 'Available' | 'Issued' | 'Lost';
}

interface CirculationRecord {
    id: string;
    bookTitle: string;
    studentName: string;
    issueDate: string;
    dueDate: string;
    status: 'Issued' | 'Returned' | 'Overdue';
}

const mockBooks: Book[] = [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Fiction', status: 'Available' },
    { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0446310789', category: 'Fiction', status: 'Issued' },
    { id: '3', title: '1984', author: 'George Orwell', isbn: '978-0451524935', category: 'Science Fiction', status: 'Available' },
    { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-1503290563', category: 'Romance', status: 'Available' },
    { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '978-0316769488', category: 'Fiction', status: 'Lost' },
];

const mockCirculation: CirculationRecord[] = [
    { id: '1', bookTitle: 'To Kill a Mockingbird', studentName: 'Alice Johnson (10A01)', issueDate: '2024-03-01', dueDate: '2024-03-15', status: 'Issued' },
    { id: '2', bookTitle: '1984', studentName: 'Bob Smith (10A02)', issueDate: '2024-02-15', dueDate: '2024-03-01', status: 'Returned' },
    { id: '3', bookTitle: 'Thinking, Fast and Slow', studentName: 'Charlie Brown (10A03)', issueDate: '2024-02-01', dueDate: '2024-02-15', status: 'Overdue' },
];

export default function Library() {
    const [activeTab, setActiveTab] = useState<string | null>('books');
    const [search, setSearch] = useState('');
    const [books] = useState<Book[]>(mockBooks);

    // filtered data
    const filteredBooks = books.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase()) ||
        item.isbn.includes(search)
    );

    const filteredCirculation = mockCirculation.filter(item =>
        item.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        item.studentName.toLowerCase().includes(search.toLowerCase())
    );

    const BooksTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Manage library inventory.</Text>
                <Button leftSection={<IconPlus size={16} />}>Add New Book</Button>
            </Group>
            <DataTable
                data={filteredBooks}
                columns={[
                    { accessor: 'title', header: 'Title', width: 250 },
                    { accessor: 'author', header: 'Author' },
                    { accessor: 'category', header: 'Category' },
                    { accessor: 'isbn', header: 'ISBN' },
                    {
                        accessor: 'status',
                        header: 'Status',
                        render: (item) => (
                            <Badge color={item.status === 'Available' ? 'green' : item.status === 'Issued' ? 'blue' : 'red'}>
                                {item.status}
                            </Badge>
                        )
                    },
                    {
                        accessor: 'actions',
                        header: '',
                        width: 80,
                        render: () => (
                            <ActionIcon variant="subtle" color="red"><IconTrash size={16} /></ActionIcon>
                        )
                    }
                ]}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    const CirculationTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Track book issues and returns.</Text>
                <Button leftSection={<IconExchange size={16} />}>Issue Book</Button>
            </Group>
            <DataTable
                data={filteredCirculation}
                columns={[
                    { accessor: 'bookTitle', header: 'Book Title', width: 200 },
                    { accessor: 'studentName', header: 'Student' },
                    { accessor: 'issueDate', header: 'Issue Date' },
                    { accessor: 'dueDate', header: 'Due Date' },
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
                                disabled={item.status === 'Returned'}
                            >
                                Return
                            </Button>
                        )
                    }

                ]}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    return (
        <>
            <PageHeader
                title="Library Management"
                subtitle="Manage books, inventory, and circulation"
            />

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
        </>
    );
}
