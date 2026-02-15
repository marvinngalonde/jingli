import {
    Modal,
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    FileInput,
} from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload } from 'lucide-react';
import { libraryService } from '../services/libraryService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

const bookSchema = z.object({
    title: z.string().min(2, 'Book title is required'),
    author: z.string().min(2, 'Author name is required'),
    isbn: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    publisher: z.string().optional(),
    shelfNumber: z.string().min(1, 'Shelf number is required'),
    coverImage: z.any().optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface AddBookModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddBookModal({ opened, onClose, onSuccess }: AddBookModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm<BookFormValues>({
        resolver: zodResolver(bookSchema),
    });

    const onSubmit = async (values: BookFormValues) => {
        try {
            // Generate accession number
            const accessionNumber = `ACC${Date.now().toString().slice(-6)}`;

            // Create book record
            await libraryService.create({
                accession_number: accessionNumber,
                title: values.title,
                author: values.author,
                isbn: values.isbn || null,
                category: values.category,
                publisher: values.publisher || null,
                shelf_number: values.shelfNumber,
                status: 'available',
            });

            showSuccessNotification('Book added successfully!');
            reset();
            onSuccess?.();
            onClose();
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to add book');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Add New Book"
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Book Title"
                        placeholder="Enter book title"
                        required
                        size="sm"
                        radius={2}
                        error={errors.title?.message}
                        {...register('title')}
                    />

                    <Group grow>
                        <TextInput
                            label="Author"
                            placeholder="Enter author name"
                            required
                            size="sm"
                            radius={2}
                            error={errors.author?.message}
                            {...register('author')}
                        />
                        <TextInput
                            label="ISBN"
                            placeholder="Enter ISBN"
                            size="sm"
                            radius={2}
                            error={errors.isbn?.message}
                            {...register('isbn')}
                        />
                    </Group>

                    <Group grow>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Category"
                                    placeholder="Select category"
                                    data={['Fiction', 'Non-Fiction', 'Science', 'History', 'Mathematics', 'Literature', 'Reference']}
                                    required
                                    size="sm"
                                    radius={2}
                                    error={errors.category?.message}
                                />
                            )}
                        />
                        <TextInput
                            label="Publisher"
                            placeholder="Enter publisher"
                            size="sm"
                            radius={2}
                            error={errors.publisher?.message}
                            {...register('publisher')}
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Accession Number"
                            placeholder="Auto-generated"
                            disabled
                            size="sm"
                            radius={2}
                            value="Auto-generated"
                        />
                        <TextInput
                            label="Shelf Number"
                            placeholder="e.g., A-12-C"
                            required
                            size="sm"
                            radius={2}
                            error={errors.shelfNumber?.message}
                            {...register('shelfNumber')}
                        />
                    </Group>

                    <Controller
                        name="coverImage"
                        control={control}
                        render={({ field }) => (
                            <FileInput
                                {...field}
                                label="Book Cover Image"
                                placeholder="Upload image"
                                leftSection={<Upload size={16} />}
                                size="sm"
                                radius={2}
                                accept="image/*"
                                error={errors.coverImage?.message}
                            />
                        )}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            size="sm"
                            radius={2}
                            color="gray"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            radius={2}
                            color="navy.9"
                            loading={isSubmitting}
                        >
                            Add Book
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
