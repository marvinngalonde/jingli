import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import {
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    Grid,
    Title,
    Divider,
    NumberInput,
    LoadingOverlay
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { classesApi } from '../../services/academics';
import type { ClassLevel, ClassSection } from '../../types/academics';

interface StudentFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
    isEditing?: boolean;
}

export function StudentForm({ initialValues, onSubmit, onCancel, loading, isEditing }: StudentFormProps) {
    const [levels, setLevels] = useState<ClassLevel[]>([]);
    const [sections, setSections] = useState<ClassSection[]>([]);
    const [fetchingClasses, setFetchingClasses] = useState(false);

    // Derived state for section filtering
    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

    const form = useForm({
        initialValues: initialValues || {
            admissionNo: '',
            rollNo: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '', // Optional in backend, kept for future
            dob: null,
            gender: '',
            address: '',
            sectionId: '',
            enrollmentDate: new Date(),
            // parentName: '',
            // parentEmail: '',
            // parentPhone: '',
        },
        validate: {
            // admissionNo: (value) => (value?.length > 0 ? null : 'Admission No is required'), // Now optional
            firstName: (value) => (value?.length < 2 ? 'First name must have at least 2 letters' : null),
            lastName: (value) => (value?.length < 2 ? 'Last name must have at least 2 letters' : null),
            sectionId: (value) => (value ? null : 'Class Section is required'),
            gender: (value) => (value ? null : 'Gender is required'),
            // email: (value) => (!value || /^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    useEffect(() => {
        // console.log('StudentForm mounted. InitialValues:', initialValues);
    }, [initialValues]);

    useEffect(() => {
        loadClasses();
    }, []);

    // When levels load or initial section is set, try to find the level for that section
    useEffect(() => {
        if (levels.length > 0 && form.values.sectionId && !selectedLevelId) {
            // Find level containing this section
            const level = levels.find(l => l.sections?.some(s => s.id === form.values.sectionId));
            if (level) {
                setSelectedLevelId(level.id);
                setSections(level.sections || []);
            }
        }
    }, [levels, form.values.sectionId, selectedLevelId]);

    const loadClasses = async () => {
        setFetchingClasses(true);
        try {
            const data = await classesApi.getAll();
            setLevels(data);
        } catch (error) {
            console.error(error);
        } finally {
            setFetchingClasses(false);
        }
    };

    const handleLevelChange = (levelId: string | null) => {
        setSelectedLevelId(levelId);
        form.setFieldValue('sectionId', ''); // Reset section when level changes

        if (levelId) {
            const level = levels.find(l => l.id === levelId);
            setSections(level?.sections || []);
        } else {
            setSections([]);
        }
    };

    const handleSubmit = (values: any) => {
        // Format dates for API
        const payload = {
            ...values,
            enrollmentDate: values.enrollmentDate ? values.enrollmentDate.toISOString() : new Date().toISOString(),
            dob: values.dob ? values.dob.toISOString() : undefined,
        };
        // Remove empty admissionNo so backend generates it
        if (!payload.admissionNo) delete payload.admissionNo;
        // Remove empty rollNo so backend generates it
        if (!payload.rollNo) delete payload.rollNo;

        onSubmit(payload);
    };

    const levelOptions = levels.map(l => ({ value: l.id, label: l.name }));
    const sectionOptions = sections.map(s => ({ value: s.id, label: s.name }));

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <LoadingOverlay visible={fetchingClasses} />
            <Stack>
                <Title order={4}>Personal Details</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <TextInput
                            label="Admission No"
                            placeholder="Auto-generated (e.g. 2024-0001)"
                            {...form.getInputProps('admissionNo')}
                            disabled={isEditing}
                            description={!isEditing ? "Leave blank to auto-generate" : undefined}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput
                            label="Roll No"
                            placeholder="Auto-generated (e.g. 1, 2...)"
                            {...form.getInputProps('rollNo')}
                            description={!isEditing ? "Leave blank to auto-generate based on class count" : undefined}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="First Name" placeholder="John" required {...form.getInputProps('firstName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Last Name" placeholder="Doe" required {...form.getInputProps('lastName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Select
                            label="Gender"
                            placeholder="Select"
                            data={['MALE', 'FEMALE', 'OTHER']}
                            required
                            {...form.getInputProps('gender')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <DateInput
                            label="Date of Birth"
                            placeholder="Pick date"
                            {...form.getInputProps('dob')}
                            valueFormat="DD MMM YYYY"
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <TextInput label="Address" placeholder="123 Main St" {...form.getInputProps('address')} />
                    </Grid.Col>
                </Grid>

                <Divider />

                <Title order={4}>Academic Info</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <Select
                            label="Class Level"
                            placeholder="Select Level"
                            data={levelOptions}
                            value={selectedLevelId}
                            onChange={handleLevelChange}
                            searchable
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Select
                            label="Section"
                            placeholder="Select Section"
                            data={sectionOptions}
                            required
                            {...form.getInputProps('sectionId')}
                            disabled={!selectedLevelId}
                            searchable
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <DateInput
                            label="Enrollment Date"
                            placeholder="Pick date"
                            required
                            {...form.getInputProps('enrollmentDate')}
                            valueFormat="DD MMM YYYY"
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Student Email" placeholder="student@school.com" description="Used for login credentials" required={!isEditing} {...form.getInputProps('email')} />
                    </Grid.Col>
                </Grid>

                <Divider />

                {/* 
                <Title order={4}>Parent / Guardian Info</Title>
                <Text size="sm" c="dimmed" mb="sm">Parent creation coming soon via separate flow.</Text>
                 */}

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" loading={loading}>{isEditing ? 'Update Student' : 'Save Student'}</Button>
                </Group>
            </Stack>
        </form>
    );
}
