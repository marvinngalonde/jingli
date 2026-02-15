import {
    Table,
    Paper,
    TextInput,
    Group,
    Button,
    rem,
    Center,
    Text,
    LoadingOverlay,
    Pagination,
    Select
} from '@mantine/core';
import { IconSearch, IconFilter, IconDownload } from '@tabler/icons-react';
import { ReactNode } from 'react';

export interface Column<T> {
    accessor: keyof T | string; // key of data object or custom identifier
    header: string;
    render?: (item: T) => ReactNode; // Custom render function
    width?: string | number;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    search?: string;
    onSearchChange?: (value: string) => void;
    filterSlot?: ReactNode; // Optional slot for extra filters (e.g., Status dropdown)
    pagination?: {
        total: number;
        page: number;
        onChange: (page: number) => void;
    };
    onExport?: () => void;
    exportLabel?: string;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    loading = false,
    search,
    onSearchChange,
    filterSlot,
    pagination,
    onExport,
    exportLabel = 'Export'
}: DataTableProps<T>) {

    const rows = data.map((item) => (
        <Table.Tr key={item.id}>
            {columns.map((col) => (
                <Table.Td key={String(col.accessor)} width={col.width}>
                    {col.render ? col.render(item) : (item as any)[col.accessor]}
                </Table.Td>
            ))}
        </Table.Tr>
    ));

    return (
        <Paper withBorder p="md" radius="md" shadow="sm" style={{ overflow: 'hidden' }}>
            <Group justify="space-between" mb="md">
                <Group gap="xs">
                    {onSearchChange !== undefined && (
                        <TextInput
                            placeholder="Search..."
                            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                            value={search}
                            onChange={(event) => onSearchChange(event.currentTarget.value)}
                            w={300}
                        />
                    )}
                    {filterSlot}
                </Group>
                {onExport && (
                    <Button variant="light" leftSection={<IconDownload size={16} />} onClick={onExport}>
                        {exportLabel}
                    </Button>
                )}
            </Group>

            <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            {columns.map((col) => (
                                <Table.Th key={String(col.accessor)}>{col.header}</Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length}>
                                    <Center h={200}>
                                        <LoadingOverlay visible={true} zIndex={100} overlayProps={{ radius: "sm", blur: 2 }} />
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        ) : rows.length > 0 ? rows : (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length}>
                                    <Center h={100}>
                                        <Text c="dimmed">No data found</Text>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            {pagination && (
                <Group justify="flex-end" mt="md">
                    <Pagination
                        total={pagination.total}
                        value={pagination.page}
                        onChange={pagination.onChange}
                    />
                </Group>
            )}
        </Paper>
    );
}
