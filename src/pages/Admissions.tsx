import { useState } from 'react';
import {
    Box,
    Card,
    Stepper,
    TextInput,
    Button,
    Group,
    Stack,
    Title,
    Text,
    FileInput,
    Select,
    rem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Shield, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const studentInfoSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
    gender: z.string().min(1, 'Gender is required'),
    previousSchool: z.string().optional(),
    gradeApplying: z.string().min(1, 'Grade is required'),
});

const parentsSchema = z.object({
    fatherName: z.string().min(1, 'Father name is required'),
    fatherPhone: z.string().min(10, 'Valid phone number required'),
    fatherEmail: z.string().email('Valid email required'),
    motherName: z.string().min(1, 'Mother name is required'),
    motherPhone: z.string().min(10, 'Valid phone number required'),
    motherEmail: z.string().email('Valid email required'),
    address: z.string().min(1, 'Address is required'),
});

export default function Admissions() {
    const [active, setActive] = useState(0);
    const [studentData, setStudentData] = useState<any>({});
    const [parentsData, setParentsData] = useState<any>({});

    const {
        register: registerStudent,
        handleSubmit: handleSubmitStudent,
        formState: { errors: studentErrors },
        setValue: setStudentValue,
        watch: watchStudent,
    } = useForm({
        resolver: zodResolver(studentInfoSchema),
    });

    const {
        register: registerParents,
        handleSubmit: handleSubmitParents,
        formState: { errors: parentsErrors },
    } = useForm({
        resolver: zodResolver(parentsSchema),
    });

    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const onStudentSubmit = (data: any) => {
        setStudentData(data);
        nextStep();
    };

    const onParentsSubmit = (data: any) => {
        setParentsData(data);
        nextStep();
    };

    const onDocumentsNext = () => {
        nextStep();
    };

    const onFinalSubmit = () => {
        console.log('Application submitted:', { ...studentData, ...parentsData });
        // Handle final submission
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                backgroundColor: '#f0f2f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: rem(20),
            }}
        >
            <Card
                shadow="lg"
                padding="xl"
                radius={8}
                style={{
                    width: '100%',
                    maxWidth: rem(600),
                }}
            >
                {/* Header */}
                <Group mb="xl" gap="sm">
                    <Shield size={32} color="var(--mantine-color-navy-7)" />
                    <Title order={3}>2025 Admission Application</Title>
                </Group>

                {/* Stepper */}
                <Stepper active={active} onStepClick={setActive} mb="xl" size="sm">
                    <Stepper.Step label="Student Info" description="Basic details">
                        <form onSubmit={handleSubmitStudent(onStudentSubmit)}>
                            <Stack gap="md" mt="md">
                                <TextInput
                                    label="Child's First Name"
                                    placeholder="Enter first name"
                                    {...registerStudent('firstName')}
                                    error={studentErrors.firstName?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <TextInput
                                    label="Child's Last Name"
                                    placeholder="Enter last name"
                                    {...registerStudent('lastName')}
                                    error={studentErrors.lastName?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <DateInput
                                    label="Date of Birth"
                                    placeholder="Select date"
                                    value={watchStudent('dateOfBirth')}
                                    onChange={(date) => setStudentValue('dateOfBirth', date as Date)}
                                    error={studentErrors.dateOfBirth?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <Select
                                    label="Gender"
                                    placeholder="Select gender"
                                    data={['Male', 'Female', 'Other']}
                                    {...registerStudent('gender')}
                                    error={studentErrors.gender?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <Select
                                    label="Grade Applying For"
                                    placeholder="Select grade"
                                    data={['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']}
                                    {...registerStudent('gradeApplying')}
                                    error={studentErrors.gradeApplying?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <TextInput
                                    label="Previous School"
                                    placeholder="Enter previous school (optional)"
                                    {...registerStudent('previousSchool')}
                                    size="sm"
                                    radius={2}
                                />

                                <Button type="submit" fullWidth size="sm" radius={2} color="navy.9" mt="md">
                                    Next Step
                                </Button>
                            </Stack>
                        </form>
                    </Stepper.Step>

                    <Stepper.Step label="Parents" description="Guardian info">
                        <form onSubmit={handleSubmitParents(onParentsSubmit)}>
                            <Stack gap="md" mt="md">
                                <Title order={5}>Father's Information</Title>
                                <TextInput
                                    label="Full Name"
                                    placeholder="Enter father's name"
                                    {...registerParents('fatherName')}
                                    error={parentsErrors.fatherName?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <TextInput
                                    label="Phone Number"
                                    placeholder="Enter phone number"
                                    {...registerParents('fatherPhone')}
                                    error={parentsErrors.fatherPhone?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <TextInput
                                    label="Email Address"
                                    placeholder="Enter email"
                                    {...registerParents('fatherEmail')}
                                    error={parentsErrors.fatherEmail?.message as string}
                                    size="sm"
                                    radius={2}
                                />

                                <Title order={5} mt="md">Mother's Information</Title>
                                <TextInput
                                    label="Full Name"
                                    placeholder="Enter mother's name"
                                    {...registerParents('motherName')}
                                    error={parentsErrors.motherName?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <TextInput
                                    label="Phone Number"
                                    placeholder="Enter phone number"
                                    {...registerParents('motherPhone')}
                                    error={parentsErrors.motherPhone?.message as string}
                                    size="sm"
                                    radius={2}
                                />
                                <TextInput
                                    label="Email Address"
                                    placeholder="Enter email"
                                    {...registerParents('motherEmail')}
                                    error={parentsErrors.motherEmail?.message as string}
                                    size="sm"
                                    radius={2}
                                />

                                <TextInput
                                    label="Home Address"
                                    placeholder="Enter complete address"
                                    {...registerParents('address')}
                                    error={parentsErrors.address?.message as string}
                                    size="sm"
                                    radius={2}
                                    mt="md"
                                />

                                <Group justify="space-between" mt="md">
                                    <Button variant="outline" onClick={prevStep} size="sm" radius={2} color="gray">
                                        Back
                                    </Button>
                                    <Button type="submit" size="sm" radius={2} color="navy.9">
                                        Next Step
                                    </Button>
                                </Group>
                            </Stack>
                        </form>
                    </Stepper.Step>

                    <Stepper.Step label="Documents" description="Upload files">
                        <Stack gap="md" mt="md">
                            <Box
                                p="xl"
                                style={{
                                    border: '2px dashed var(--mantine-color-gray-4)',
                                    borderRadius: rem(8),
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <Upload size={32} style={{ margin: '0 auto', color: 'var(--mantine-color-gray-6)' }} />
                                <Text size="sm" fw={500} mt="sm">
                                    Upload Birth Certificate
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Drag and drop or click to upload
                                </Text>
                            </Box>

                            <Box
                                p="xl"
                                style={{
                                    border: '2px dashed var(--mantine-color-gray-4)',
                                    borderRadius: rem(8),
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <Upload size={32} style={{ margin: '0 auto', color: 'var(--mantine-color-gray-6)' }} />
                                <Text size="sm" fw={500} mt="sm">
                                    Upload Previous School Records
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Drag and drop or click to upload
                                </Text>
                            </Box>

                            <Group justify="space-between" mt="md">
                                <Button variant="outline" onClick={prevStep} size="sm" radius={2} color="gray">
                                    Back
                                </Button>
                                <Button onClick={onDocumentsNext} size="sm" radius={2} color="navy.9">
                                    Next Step
                                </Button>
                            </Group>
                        </Stack>
                    </Stepper.Step>

                    <Stepper.Step label="Review" description="Confirm details">
                        <Stack gap="md" mt="md">
                            <Title order={5}>Review Your Application</Title>

                            <Box p="md" style={{ backgroundColor: '#f9fafb', borderRadius: rem(4) }}>
                                <Text size="sm" fw={600} mb="xs">Student Information</Text>
                                <Text size="sm">Name: {studentData.firstName} {studentData.lastName}</Text>
                                <Text size="sm">Grade: {studentData.gradeApplying}</Text>
                            </Box>

                            <Box p="md" style={{ backgroundColor: '#f9fafb', borderRadius: rem(4) }}>
                                <Text size="sm" fw={600} mb="xs">Parent Information</Text>
                                <Text size="sm">Father: {parentsData.fatherName}</Text>
                                <Text size="sm">Mother: {parentsData.motherName}</Text>
                                <Text size="sm">Address: {parentsData.address}</Text>
                            </Box>

                            <Group justify="space-between" mt="md">
                                <Button variant="outline" onClick={prevStep} size="sm" radius={2} color="gray">
                                    Back
                                </Button>
                                <Button onClick={onFinalSubmit} size="sm" radius={2} color="navy.9">
                                    Submit Application
                                </Button>
                            </Group>
                        </Stack>
                    </Stepper.Step>
                </Stepper>
            </Card>
        </Box>
    );
}
