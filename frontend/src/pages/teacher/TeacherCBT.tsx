import { useState, useEffect } from 'react';
import { Title, Text, Paper, Group, Button, Stack, TextInput, NumberInput, Select, Textarea, Card, Badge, Grid, ActionIcon, Table, Modal, Drawer, Tabs, ThemeIcon, SimpleGrid, Box, Switch, Divider, ScrollArea, Radio, LoadingOverlay, Progress } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconPlus, IconTrash, IconEdit, IconSearch, IconPlayerPlay, IconClock,
    IconCheck, IconFileAnalytics, IconPencil, IconQuestionMark, IconChevronRight,
    IconCircleCheck, IconCircleX, IconLock, IconMaximize,
} from '@tabler/icons-react';
import { api } from '../../services/api';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    points: number;
}

interface Quiz {
    id: string;
    title: string;
    subject: string;
    classSection: string;
    timeLimit: number;
    totalQuestions: number;
    totalPoints: number;
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    randomize: boolean;
    showAnswers: boolean;
    autoGrade: boolean;
    secureMode: boolean;
    questions: Question[];
    createdAt: string;
}

// Since quiz backend may not exist yet, we use local state for demo
let nextQuizId = 1;
let nextQId = 1;

export default function TeacherCBT() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [questionModal, setQuestionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [currentPreviewQ, setCurrentPreviewQ] = useState(0);
    const [previewAnswers, setPreviewAnswers] = useState<Record<string, number>>({});
    const [previewSubmitted, setPreviewSubmitted] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; title: string }>({ opened: false, id: '', title: '' });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<string | null>('all');

    const quizForm = useForm({
        initialValues: {
            title: '', subject: '', classSection: '', timeLimit: 30,
            randomize: true, showAnswers: true, autoGrade: true, secureMode: false,
        },
        validate: {
            title: (v) => (!v ? 'Title required' : null),
            subject: (v) => (!v ? 'Subject required' : null),
            timeLimit: (v) => (v < 1 ? 'Must be at least 1 minute' : null),
        },
    });

    const questionForm = useForm({
        initialValues: {
            text: '', optionA: '', optionB: '', optionC: '', optionD: '',
            correctAnswer: 0, explanation: '', points: 1,
        },
        validate: {
            text: (v) => (!v ? 'Question text required' : null),
            optionA: (v) => (!v ? 'Option A required' : null),
            optionB: (v) => (!v ? 'Option B required' : null),
        },
    });

    const handleCreateQuiz = (values: typeof quizForm.values) => {
        const newQuiz: Quiz = {
            id: `quiz-${nextQuizId++}`,
            title: values.title,
            subject: values.subject,
            classSection: values.classSection,
            timeLimit: values.timeLimit,
            totalQuestions: 0,
            totalPoints: 0,
            status: 'DRAFT',
            randomize: values.randomize,
            showAnswers: values.showAnswers,
            autoGrade: values.autoGrade,
            secureMode: values.secureMode,
            questions: [],
            createdAt: new Date().toISOString(),
        };
        setQuizzes(prev => [...prev, newQuiz]);
        setActiveQuiz(newQuiz);
        closeDrawer();
        quizForm.reset();
        notifications.show({ id: 'quiz-created', title: 'Quiz Created', message: `"${newQuiz.title}" created. Add questions now.`, color: 'green' });
    };

    const handleAddQuestion = (values: typeof questionForm.values) => {
        if (!activeQuiz) return;
        const q: Question = {
            id: `q-${nextQId++}`,
            text: values.text,
            options: [values.optionA, values.optionB, values.optionC, values.optionD].filter(Boolean),
            correctAnswer: values.correctAnswer,
            explanation: values.explanation,
            points: values.points,
        };

        if (editingQuestion) {
            // Update existing
            const updated = { ...activeQuiz, questions: activeQuiz.questions.map(eq => eq.id === editingQuestion.id ? q : eq) };
            updated.totalQuestions = updated.questions.length;
            updated.totalPoints = updated.questions.reduce((a, q) => a + q.points, 0);
            setActiveQuiz(updated);
            setQuizzes(prev => prev.map(qz => qz.id === updated.id ? updated : qz));
        } else {
            // Add new
            const updated = { ...activeQuiz, questions: [...activeQuiz.questions, q] };
            updated.totalQuestions = updated.questions.length;
            updated.totalPoints = updated.questions.reduce((a, q) => a + q.points, 0);
            setActiveQuiz(updated);
            setQuizzes(prev => prev.map(qz => qz.id === updated.id ? updated : qz));
        }

        setQuestionModal(false);
        setEditingQuestion(null);
        questionForm.reset();
        notifications.show({ id: 'q-added', title: editingQuestion ? 'Question Updated' : 'Question Added', message: 'Question saved successfully', color: 'green' });
    };

    const removeQuestion = (qId: string) => {
        if (!activeQuiz) return;
        const updated = { ...activeQuiz, questions: activeQuiz.questions.filter(q => q.id !== qId) };
        updated.totalQuestions = updated.questions.length;
        updated.totalPoints = updated.questions.reduce((a, q) => a + q.points, 0);
        setActiveQuiz(updated);
        setQuizzes(prev => prev.map(qz => qz.id === updated.id ? updated : qz));
    };

    const editQuestion = (q: Question) => {
        setEditingQuestion(q);
        questionForm.setValues({
            text: q.text,
            optionA: q.options[0] || '',
            optionB: q.options[1] || '',
            optionC: q.options[2] || '',
            optionD: q.options[3] || '',
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
        });
        setQuestionModal(true);
    };

    const publishQuiz = (quiz: Quiz) => {
        if (quiz.questions.length === 0) {
            notifications.show({ id: 'pub-err', title: 'Cannot Publish', message: 'Add at least one question first', color: 'red' });
            return;
        }
        const updated = { ...quiz, status: 'PUBLISHED' as const };
        setQuizzes(prev => prev.map(qz => qz.id === updated.id ? updated : qz));
        if (activeQuiz?.id === updated.id) setActiveQuiz(updated);
        notifications.show({ id: 'pub-ok', title: 'Published', message: `"${quiz.title}" is now live`, color: 'green' });
    };

    const deleteQuiz = () => {
        setQuizzes(prev => prev.filter(q => q.id !== deleteModal.id));
        if (activeQuiz?.id === deleteModal.id) setActiveQuiz(null);
        setDeleteModal({ opened: false, id: '', title: '' });
        notifications.show({ id: 'quiz-del', title: 'Deleted', message: 'Quiz removed', color: 'green' });
    };

    // ─── Preview Mode Logic ───
    const startPreview = (quiz: Quiz) => {
        setActiveQuiz(quiz);
        setPreviewMode(true);
        setCurrentPreviewQ(0);
        setPreviewAnswers({});
        setPreviewSubmitted(false);
        setTimerSeconds(quiz.timeLimit * 60);
    };

    useEffect(() => {
        if (!previewMode || previewSubmitted) return;
        if (timerSeconds <= 0) {
            setPreviewSubmitted(true);
            return;
        }
        const t = setTimeout(() => setTimerSeconds(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timerSeconds, previewMode, previewSubmitted]);

    const submitPreview = () => setPreviewSubmitted(true);

    const getPreviewScore = () => {
        if (!activeQuiz) return { score: 0, total: 0, pct: 0 };
        let score = 0;
        activeQuiz.questions.forEach(q => {
            if (previewAnswers[q.id] === q.correctAnswer) score += q.points;
        });
        const total = activeQuiz.totalPoints;
        return { score, total, pct: total > 0 ? Math.round((score / total) * 100) : 0 };
    };

    const filtered = quizzes.filter(q => {
        if (tab !== 'all' && q.status !== tab?.toUpperCase()) return false;
        return q.title.toLowerCase().includes(search.toLowerCase());
    });

    const statusColor = (s: string) => s === 'PUBLISHED' ? 'green' : s === 'DRAFT' ? 'gray' : 'red';
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // ─── PREVIEW SCREEN (Fullscreen Exam Mode) ───
    if (previewMode && activeQuiz) {
        const q = activeQuiz.questions[currentPreviewQ];
        const result = getPreviewScore();

        if (previewSubmitted) {
            return (
                <Box p="xl" style={{ minHeight: '100vh', background: 'var(--mantine-color-gray-0)' }}>
                    <Paper p="xl" radius="lg" shadow="lg" maw={600} mx="auto" mt="xl">
                        <Stack align="center" gap="lg">
                            <ThemeIcon size={80} radius="xl" color={result.pct >= 50 ? 'green' : 'red'} variant="light">
                                {result.pct >= 50 ? <IconCircleCheck size={50} /> : <IconCircleX size={50} />}
                            </ThemeIcon>
                            <Title order={2}>Quiz Complete!</Title>
                            <Text size="xl" fw={800} c={result.pct >= 50 ? 'green' : 'red'}>
                                {result.score} / {result.total} ({result.pct}%)
                            </Text>
                            <Progress value={result.pct} color={result.pct >= 50 ? 'green' : 'red'} size="xl" radius="xl" w="100%" />

                            {activeQuiz.showAnswers && (
                                <>
                                    <Divider w="100%" />
                                    <Text fw={600}>Review Answers</Text>
                                    <Stack w="100%" gap="md">
                                        {activeQuiz.questions.map((q, i) => {
                                            const isCorrect = previewAnswers[q.id] === q.correctAnswer;
                                            return (
                                                <Paper key={q.id} p="md" withBorder radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${isCorrect ? 'green' : 'red'}-5)` }}>
                                                    <Text size="sm" fw={600} mb="xs">Q{i + 1}. {q.text}</Text>
                                                    <Stack gap={4}>
                                                        {q.options.map((opt, oi) => (
                                                            <Group key={oi} gap="xs">
                                                                {oi === q.correctAnswer ? <IconCircleCheck size={14} color="green" /> :
                                                                    oi === previewAnswers[q.id] ? <IconCircleX size={14} color="red" /> :
                                                                        <Box w={14} />}
                                                                <Text size="xs" fw={oi === q.correctAnswer ? 700 : 400} c={oi === q.correctAnswer ? 'green' : oi === previewAnswers[q.id] && oi !== q.correctAnswer ? 'red' : undefined}>
                                                                    {String.fromCharCode(65 + oi)}. {opt}
                                                                </Text>
                                                            </Group>
                                                        ))}
                                                    </Stack>
                                                    {q.explanation && <Text size="xs" c="dimmed" mt="xs" fs="italic">💡 {q.explanation}</Text>}
                                                </Paper>
                                            );
                                        })}
                                    </Stack>
                                </>
                            )}

                            <Button onClick={() => { setPreviewMode(false); }} size="lg" mt="md">Back to Quiz Manager</Button>
                        </Stack>
                    </Paper>
                </Box>
            );
        }

        return (
            <Box style={{ minHeight: '100vh', background: 'var(--mantine-color-gray-0)' }}>
                {/* Exam Header */}
                <Paper p="md" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '2px solid var(--mantine-color-brand-3)' }}>
                    <Group justify="space-between">
                        <Group>
                            {activeQuiz.secureMode && <Badge color="red" leftSection={<IconLock size={12} />}>Secure Mode</Badge>}
                            <Text fw={700}>{activeQuiz.title}</Text>
                        </Group>
                        <Group>
                            <Badge size="lg" variant="light" color={timerSeconds < 60 ? 'red' : 'blue'} leftSection={<IconClock size={14} />}>
                                {formatTime(timerSeconds)}
                            </Badge>
                            <Text size="sm" c="dimmed">{currentPreviewQ + 1} / {activeQuiz.questions.length}</Text>
                        </Group>
                    </Group>
                    <Progress value={((currentPreviewQ + 1) / activeQuiz.questions.length) * 100} size="xs" mt="xs" radius="xl" />
                </Paper>

                {/* Question Card */}
                <Box p="xl" maw={800} mx="auto" mt="xl">
                    {q && (
                        <Paper p="xl" radius="lg" shadow="lg">
                            <Badge mb="md" variant="light">{q.points} point{q.points > 1 ? 's' : ''}</Badge>
                            <Title order={3} mb="lg">{q.text}</Title>
                            <Stack gap="sm">
                                {q.options.map((opt, i) => (
                                    <Paper
                                        key={i}
                                        p="md"
                                        radius="md"
                                        withBorder
                                        onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: i }))}
                                        style={{
                                            cursor: 'pointer',
                                            borderColor: previewAnswers[q.id] === i ? 'var(--mantine-color-brand-5)' : undefined,
                                            background: previewAnswers[q.id] === i ? 'var(--mantine-color-brand-0)' : undefined,
                                        }}
                                    >
                                        <Group>
                                            <ThemeIcon variant={previewAnswers[q.id] === i ? 'filled' : 'light'} color="brand" size="sm" radius="xl">
                                                <Text size="xs" fw={700}>{String.fromCharCode(65 + i)}</Text>
                                            </ThemeIcon>
                                            <Text fw={previewAnswers[q.id] === i ? 600 : 400}>{opt}</Text>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>

                            <Group justify="space-between" mt="xl">
                                <Button variant="default" disabled={currentPreviewQ === 0} onClick={() => setCurrentPreviewQ(p => p - 1)}>Previous</Button>
                                <Group>
                                    {currentPreviewQ < activeQuiz.questions.length - 1 ? (
                                        <Button onClick={() => setCurrentPreviewQ(p => p + 1)}>Next</Button>
                                    ) : (
                                        <Button color="green" onClick={submitPreview}>Submit Quiz</Button>
                                    )}
                                </Group>
                            </Group>
                        </Paper>
                    )}

                    {/* Question Navigator */}
                    <Paper p="md" radius="md" mt="md" withBorder>
                        <Text size="sm" fw={600} mb="xs">Questions</Text>
                        <Group gap="xs">
                            {activeQuiz.questions.map((q, i) => (
                                <ActionIcon
                                    key={q.id}
                                    variant={currentPreviewQ === i ? 'filled' : previewAnswers[q.id] !== undefined ? 'light' : 'default'}
                                    color="brand"
                                    size="md"
                                    onClick={() => setCurrentPreviewQ(i)}
                                >
                                    <Text size="xs" fw={600}>{i + 1}</Text>
                                </ActionIcon>
                            ))}
                        </Group>
                    </Paper>

                    <Group justify="center" mt="md">
                        <Button variant="subtle" color="red" onClick={() => setPreviewMode(false)}>Exit Preview</Button>
                    </Group>
                </Box>
            </Box>
        );
    }

    // ─── QUIZ BUILDER VIEW ───
    if (activeQuiz && !previewMode) {
        return (
            <div>
                <Group justify="space-between" mb="lg">
                    <Group>
                        <Button variant="subtle" onClick={() => setActiveQuiz(null)}>← Back</Button>
                        <div>
                            <Title order={3}>{activeQuiz.title}</Title>
                            <Text size="sm" c="dimmed">{activeQuiz.subject} • {activeQuiz.classSection || 'All Classes'}</Text>
                        </div>
                    </Group>
                    <Group>
                        <Badge size="lg" color={statusColor(activeQuiz.status)}>{activeQuiz.status}</Badge>
                        {activeQuiz.questions.length > 0 && (
                            <Button variant="light" leftSection={<IconPlayerPlay size={16} />} onClick={() => startPreview(activeQuiz)}>Preview</Button>
                        )}
                        {activeQuiz.status === 'DRAFT' && (
                            <Button color="green" onClick={() => publishQuiz(activeQuiz)}>Publish</Button>
                        )}
                    </Group>
                </Group>

                <SimpleGrid cols={{ base: 2, md: 4 }} mb="lg">
                    <Card p="md" withBorder radius="md">
                        <Text size="sm" c="dimmed">Questions</Text>
                        <Text fw={700} size="xl">{activeQuiz.totalQuestions}</Text>
                    </Card>
                    <Card p="md" withBorder radius="md">
                        <Text size="sm" c="dimmed">Total Points</Text>
                        <Text fw={700} size="xl">{activeQuiz.totalPoints}</Text>
                    </Card>
                    <Card p="md" withBorder radius="md">
                        <Text size="sm" c="dimmed">Time Limit</Text>
                        <Text fw={700} size="xl">{activeQuiz.timeLimit} min</Text>
                    </Card>
                    <Card p="md" withBorder radius="md">
                        <Group gap="xs">
                            {activeQuiz.secureMode && <Badge size="xs" color="red" leftSection={<IconLock size={10} />}>Secure</Badge>}
                            {activeQuiz.autoGrade && <Badge size="xs" color="green">Auto-grade</Badge>}
                            {activeQuiz.randomize && <Badge size="xs" color="blue">Randomized</Badge>}
                        </Group>
                    </Card>
                </SimpleGrid>

                <Paper p="lg" radius="md" shadow="sm" withBorder>
                    <Group justify="space-between" mb="md">
                        <Text fw={600}>Questions</Text>
                        <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditingQuestion(null); questionForm.reset(); setQuestionModal(true); }}>Add Question</Button>
                    </Group>

                    {activeQuiz.questions.length === 0 ? (
                        <Stack align="center" py="xl" gap="xs">
                            <IconQuestionMark size={40} color="var(--mantine-color-gray-4)" />
                            <Text c="dimmed">No questions yet. Click "Add Question" to get started.</Text>
                        </Stack>
                    ) : (
                        <Stack gap="sm">
                            {activeQuiz.questions.map((q, i) => (
                                <Paper key={q.id} p="md" withBorder radius="md">
                                    <Group justify="space-between">
                                        <div style={{ flex: 1 }}>
                                            <Group mb="xs">
                                                <Badge size="sm" variant="outline">Q{i + 1}</Badge>
                                                <Badge size="sm" color="blue" variant="light">{q.points} pts</Badge>
                                            </Group>
                                            <Text fw={500} mb="xs">{q.text}</Text>
                                            <SimpleGrid cols={2} spacing="xs">
                                                {q.options.map((opt, oi) => (
                                                    <Group key={oi} gap="xs">
                                                        {oi === q.correctAnswer ? <IconCircleCheck size={14} color="green" /> : <Text size="xs" c="dimmed">{String.fromCharCode(65 + oi)}.</Text>}
                                                        <Text size="sm" fw={oi === q.correctAnswer ? 700 : 400} c={oi === q.correctAnswer ? 'green' : undefined}>{opt}</Text>
                                                    </Group>
                                                ))}
                                            </SimpleGrid>
                                        </div>
                                        <Group gap="xs">
                                            <ActionIcon variant="subtle" color="blue" onClick={() => editQuestion(q)}><IconEdit size={16} /></ActionIcon>
                                            <ActionIcon variant="subtle" color="red" onClick={() => removeQuestion(q.id)}><IconTrash size={16} /></ActionIcon>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Paper>

                {/* Add/Edit Question Modal */}
                <Modal opened={questionModal} onClose={() => { setQuestionModal(false); setEditingQuestion(null); }} title={editingQuestion ? 'Edit Question' : 'Add Question'} size="lg">
                    <form onSubmit={questionForm.onSubmit(handleAddQuestion)}>
                        <Stack>
                            <Textarea label="Question Text" required autosize minRows={2} {...questionForm.getInputProps('text')} />
                            <Grid>
                                <Grid.Col span={6}><TextInput label="Option A" required {...questionForm.getInputProps('optionA')} /></Grid.Col>
                                <Grid.Col span={6}><TextInput label="Option B" required {...questionForm.getInputProps('optionB')} /></Grid.Col>
                                <Grid.Col span={6}><TextInput label="Option C" {...questionForm.getInputProps('optionC')} /></Grid.Col>
                                <Grid.Col span={6}><TextInput label="Option D" {...questionForm.getInputProps('optionD')} /></Grid.Col>
                            </Grid>
                            <Select label="Correct Answer" data={[
                                { value: '0', label: 'A' }, { value: '1', label: 'B' },
                                { value: '2', label: 'C' }, { value: '3', label: 'D' },
                            ]} required value={String(questionForm.values.correctAnswer)} onChange={(v) => questionForm.setFieldValue('correctAnswer', parseInt(v || '0'))} />
                            <Textarea label="Explanation (shown after grading)" autosize minRows={1} {...questionForm.getInputProps('explanation')} />
                            <NumberInput label="Points" min={1} max={100} {...questionForm.getInputProps('points')} />
                            <Group justify="flex-end" mt="md">
                                <Button variant="default" onClick={() => setQuestionModal(false)}>Cancel</Button>
                                <Button type="submit">{editingQuestion ? 'Update' : 'Add Question'}</Button>
                            </Group>
                        </Stack>
                    </form>
                </Modal>
            </div>
        );
    }

    // ─── MAIN QUIZ LIST ───
    return (
        <div>
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>CBT / Quizzes</Title>
                    <Text c="dimmed" size="sm">Create computer-based tests with auto-grading, timed exams, and secure mode</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={openDrawer}>Create Quiz</Button>
            </Group>

            <SimpleGrid cols={{ base: 2, md: 4 }} mb="lg">
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Total Quizzes</Text><ThemeIcon variant="light" color="grape"><IconPencil size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{quizzes.length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Published</Text><ThemeIcon variant="light" color="green"><IconCheck size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{quizzes.filter(q => q.status === 'PUBLISHED').length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Total Questions</Text><ThemeIcon variant="light" color="blue"><IconQuestionMark size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{quizzes.reduce((a, q) => a + q.totalQuestions, 0)}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Drafts</Text><ThemeIcon variant="light" color="gray"><IconFileAnalytics size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{quizzes.filter(q => q.status === 'DRAFT').length}</Text>
                </Card>
            </SimpleGrid>

            <Paper p="lg" radius="md" shadow="sm" withBorder>
                <Tabs value={tab} onChange={setTab} mb="md">
                    <Tabs.List>
                        <Tabs.Tab value="all">All</Tabs.Tab>
                        <Tabs.Tab value="DRAFT">Drafts</Tabs.Tab>
                        <Tabs.Tab value="PUBLISHED">Published</Tabs.Tab>
                        <Tabs.Tab value="CLOSED">Closed</Tabs.Tab>
                    </Tabs.List>
                </Tabs>

                <TextInput placeholder="Search quizzes..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} mb="md" style={{ maxWidth: 300 }} />

                {filtered.length === 0 ? (
                    <Stack align="center" py="xl" gap="xs">
                        <IconPencil size={40} color="var(--mantine-color-gray-4)" />
                        <Text c="dimmed">No quizzes found. Create your first quiz!</Text>
                    </Stack>
                ) : (
                    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
                        {filtered.map(quiz => (
                            <Card key={quiz.id} shadow="sm" radius="md" withBorder>
                                <Group justify="space-between" mb="xs">
                                    <Text fw={600}>{quiz.title}</Text>
                                    <Badge color={statusColor(quiz.status)} size="sm">{quiz.status}</Badge>
                                </Group>
                                <Text size="sm" c="dimmed" mb="sm">{quiz.subject}</Text>
                                <Group gap="md" mb="md">
                                    <Group gap={4}><IconQuestionMark size={14} /><Text size="xs">{quiz.totalQuestions} Q</Text></Group>
                                    <Group gap={4}><IconClock size={14} /><Text size="xs">{quiz.timeLimit} min</Text></Group>
                                    <Group gap={4}><IconTrendingUp size={14} /><Text size="xs">{quiz.totalPoints} pts</Text></Group>
                                </Group>
                                <Group gap="xs">
                                    {quiz.secureMode && <Badge size="xs" color="red" variant="light"><IconLock size={10} /> Secure</Badge>}
                                    {quiz.autoGrade && <Badge size="xs" color="green" variant="light">Auto-grade</Badge>}
                                </Group>
                                <Divider my="sm" />
                                <Group justify="space-between">
                                    <Button variant="light" size="xs" onClick={() => setActiveQuiz(quiz)}>Manage</Button>
                                    <Group gap="xs">
                                        {quiz.questions.length > 0 && (
                                            <ActionIcon variant="subtle" color="blue" title="Preview" onClick={() => startPreview(quiz)}>
                                                <IconPlayerPlay size={16} />
                                            </ActionIcon>
                                        )}
                                        <ActionIcon variant="subtle" color="red" onClick={() => setDeleteModal({ opened: true, id: quiz.id, title: quiz.title })}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Paper>

            {/* Create Quiz Drawer */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title="Create New Quiz" position="right" size="md">
                <form onSubmit={quizForm.onSubmit(handleCreateQuiz)}>
                    <Stack>
                        <TextInput label="Quiz Title" required placeholder="e.g. Algebra Mid-Term Test" {...quizForm.getInputProps('title')} />
                        <TextInput label="Subject" required placeholder="e.g. Mathematics" {...quizForm.getInputProps('subject')} />
                        <TextInput label="Class / Section" placeholder="e.g. Form 2 Blue" {...quizForm.getInputProps('classSection')} />
                        <NumberInput label="Time Limit (minutes)" min={1} max={180} required {...quizForm.getInputProps('timeLimit')} />
                        <Divider label="Settings" />
                        <Switch label="Randomize questions" checked={quizForm.values.randomize} onChange={(e) => quizForm.setFieldValue('randomize', e.target.checked)} />
                        <Switch label="Show correct answers after submission" checked={quizForm.values.showAnswers} onChange={(e) => quizForm.setFieldValue('showAnswers', e.target.checked)} />
                        <Switch label="Auto-grade (MCQ only)" checked={quizForm.values.autoGrade} onChange={(e) => quizForm.setFieldValue('autoGrade', e.target.checked)} />
                        <Switch label="🔒 Secure Mode (fullscreen lock)" description="Prevents students from switching tabs during the exam" checked={quizForm.values.secureMode} onChange={(e) => quizForm.setFieldValue('secureMode', e.target.checked)} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                            <Button type="submit">Create Quiz</Button>
                        </Group>
                    </Stack>
                </form>
            </Drawer>

            {/* Delete Modal */}
            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Delete Quiz">
                <Stack>
                    <Text size="sm">Are you sure you want to delete <b>"{deleteModal.title}"</b>? This cannot be undone.</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" onClick={deleteQuiz}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
