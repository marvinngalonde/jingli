import { ActionIcon, Drawer, LoadingOverlay, Stack, Select, NumberInput, Button, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks'; // Add this import if missing in parent
import { notifications } from '@mantine/notifications';
import { IconPencil, IconTrash } from '@tabler/icons-react'; // Add imports
import { useState, useEffect } from 'react'; // Add imports
import { financeService } from '../services/financeService';
import type { Invoice } from '../types/finance';

// This is a sub-component to be used inside Finance.tsx or kept in the same file
export function InvoiceActionMenu({ invoice, onUpdate }: { invoice: Invoice, onUpdate: () => void }) {
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await financeService.deleteInvoice(invoice.id);
            notifications.show({ title: 'Deleted', message: 'Invoice deleted', color: 'blue' });
            onUpdate();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to delete invoice', color: 'red' });
        }
    };

    const form = useForm({
        initialValues: {
            amount: invoice.amount,
            dueDate: new Date(invoice.dueDate),
            status: invoice.status
        },
    });

    const handleEdit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            await financeService.updateInvoice(invoice.id, values);
            notifications.show({ title: 'Updated', message: 'Invoice updated', color: 'green' });
            closeEdit();
            onUpdate();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to update invoice', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ActionIcon variant="subtle" color="blue" onClick={openEdit}>
                <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={handleDelete} ml="xs">
                <IconTrash size={16} />
            </ActionIcon>

            <Drawer
                opened={editOpened}
                onClose={closeEdit}
                title={`Edit Invoice #${invoice.id.substring(0, 8)}`}
                position="right"
                padding="md"
            >
                <LoadingOverlay visible={loading} />
                <form onSubmit={form.onSubmit(handleEdit)}>
                    <Stack>
                        <NumberInput
                            label="Amount"
                            prefix="$"
                            {...form.getInputProps('amount')}
                        />
                        <DateInput
                            label="Due Date"
                            {...form.getInputProps('dueDate')}
                        />
                        <Select
                            label="Status"
                            data={['PENDING', 'PARTIAL', 'PAID', 'OVERDUE']}
                            {...form.getInputProps('status')}
                        />
                        <Button type="submit" mt="md">Save Changes</Button>
                    </Stack>
                </form>
            </Drawer>
        </>
    );
}
