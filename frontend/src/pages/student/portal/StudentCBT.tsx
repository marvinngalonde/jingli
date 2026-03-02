import { useState, useEffect, useCallback } from 'react';
import {
    Title, Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center,
    Button, Progress, Radio, Divider, Alert, Box, ActionIcon, Tooltip,
    RingProgress, SimpleGrid, Modal
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconBrain, IconCheck, IconX, IconClock, IconTrophy,
    IconCircleCheck, IconCircleX, IconQuestionMark, IconMaximize, IconLock,
    IconPlayerPlay, IconChevronRight, IconChevronLeft
} from '@tabler/icons-react';
import { api } from '../../../services/api';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../components/common/PageHeader';

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
    duration: number;
    isPublished: boolean;
    randomize: boolean;
    showAnswers: boolean;
    secureMode: boolean;
    questions: number;
    attempts: number;
    subject?: { name: string; code: string };
    section?: { name: string; classLevel: { name: string } };
    _count?: { attempts: number };
}

interface AttemptResult {
    quizId: string;
    answers: number[];
    timeTaken: number;
    score: number;
    total: number;
    questions: Question[];
}

export default function StudentCBT() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizActive, setQuizActive] = useState(false);
    const [result, setResult] = useState<AttemptResult | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [startTime, setStartTime] = useState(0);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    // Timer
    useEffect(() => {
        if (!quizActive || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [quizActive, timeLeft]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/cbt/quizzes');
            const published = (Array.isArray(data) ? data : []).filter((q: Quiz) => q.isPublished);
            setQuizzes(published);
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to load quizzes', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = async (quiz: Quiz) => {
        try {
            const { data } = await api.get(`/cbt/quizzes/${quiz.id}/questions`);
            const qs: Question[] = Array.isArray(data) ? data : (data.questions || []);
            if (qs.length === 0) {
                notifications.show({ title: 'No Questions', message: 'This quiz has no questions yet.', color: 'orange' });
                return;
            }
            const shuffled = quiz.randomize ? [...qs].sort(() => Math.random() - 0.5) : qs;
            setActiveQuiz(quiz);
            setQuestions(shuffled);
            setAnswers(new Array(shuffled.length).fill(null));
            setCurrentQ(0);
            setTimeLeft(quiz.duration * 60);
            setQuizActive(true);
            setResult(null);
            setShowResult(false);
            setStartTime(Date.now());
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to load quiz questions', color: 'red' });
        }
    };

    const handleAnswer = (optIdx: number) => {
        if (!quizActive) return;
        setAnswers(prev => {
            const copy = [...prev];
            copy[currentQ] = optIdx;
            return copy;
        });
    };

    const handleSubmit = useCallback(() => {
        if (!activeQuiz) return;
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        let score = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) score += q.points || 1;
        });
        const total = questions.reduce((s, q) => s + (q.points || 1), 0);
        setResult({ quizId: activeQuiz.id, answers: answers as number[], timeTaken, score, total, questions });
        setQuizActive(false);
        setShowResult(true);

        // Submit to backend
        api.post(`/cbt/quizzes/${activeQuiz.id}/submit`, {
            answers: answers.map((a, i) => ({ questionId: questions[i].id, answer: a })),
            timeTaken,
        }).catch(() => { });
    }, [activeQuiz, answers, questions, startTime]);

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const getScore = () => {
        if (!result) return 0;
        return Math.round((result.score / result.total) * 100);
    };

    if (loading) return <Center h={400}><Loader /></Center>;

    // Results Screen
    if (showResult && result) {
        const pct = getScore();
        const passed = pct >= 50;
        return (
            <div>
                <PageHeader title="Quiz Results" subtitle={activeQuiz?.title || ''} />
                <Paper withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)" mb="lg">
                    <RingProgress
                        size={160}
                        thickness={16}
                        sections={[{ value: pct, color: pct >= 70 ? 'green' : pct >= 50 ? 'yellow' : 'red' }]}
                        label={
                            <Center>
                                <div>
                                    <Text fw={700} size="xl">{pct}%</Text>
                                    <Text size="xs" c="dimmed">Score</Text>
                                </div>
                            </Center>
                        }
                        mx="auto"
                        mb="md"
                    />
                    <Text size="xl" fw={700} c={passed ? 'green' : 'red'} mb="xs">
                        {passed ? '🎉 Passed!' : '❌ Not Passed'}
                    </Text>
                    <Text>{result.score} / {result.total} points • {formatTime(result.timeTaken)} taken</Text>
                    <Group justify="center" mt="xl">
                        <Button variant="light" onClick={() => { setShowResult(false); setActiveQuiz(null); }}>
                            Back to Quizzes
                        </Button>
                    </Group>
                </Paper>

                {activeQuiz?.showAnswers && (
                    <Stack gap="md">
                        {result.questions.map((q, i) => {
                            const chosen = result.answers[i];
                            const correct = q.correctAnswer;
                            const isRight = chosen === correct;
                            return (
                                <Paper key={q.id} withBorder radius="md" p="md" bg="var(--app-surface)"
                                    style={{ borderLeft: `4px solid var(--mantine-color-${isRight ? 'green' : 'red'}-5)` }}>
                                    <Group mb="xs">
                                        <ThemeIcon variant="light" color={isRight ? 'green' : 'red'} size="sm" radius="md">
                                            {isRight ? <IconCircleCheck size={14} /> : <IconCircleX size={14} />}
                                        </ThemeIcon>
                                        <Text fw={500} size="sm">{i + 1}. {q.text}</Text>
                                    </Group>
                                    {q.options.map((opt, oi) => (
                                        <Box
                                            key={oi}
                                            px="sm" py={4} mb={4}
                                            style={{
                                                borderRadius: 6,
                                                background: oi === correct
                                                    ? 'var(--mantine-color-green-light)'
                                                    : (oi === chosen && !isRight ? 'var(--mantine-color-red-light)' : 'transparent'),
                                            }}
                                        >
                                            <Text size="sm">{String.fromCharCode(65 + oi)}. {opt}</Text>
                                        </Box>
                                    ))}
                                    {q.explanation && (
                                        <Text size="xs" c="dimmed" mt="xs" fs="italic">💡 {q.explanation}</Text>
                                    )}
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </div>
        );
    }

    // Active Quiz Screen
    if (quizActive && activeQuiz && questions.length > 0) {
        const q = questions[currentQ];
        const isLast = currentQ === questions.length - 1;
        const answered = answers.filter(a => a !== null).length;

        return (
            <div>
                <Paper withBorder radius="md" p="md" mb="md" bg="var(--app-surface)">
                    <Group justify="space-between">
                        <Text fw={600}>{activeQuiz.title}</Text>
                        <Group>
                            <Badge variant="light" color={timeLeft < 60 ? 'red' : 'blue'} leftSection={<IconClock size={12} />}>
                                {formatTime(timeLeft)}
                            </Badge>
                            <Badge variant="light" color="gray">
                                {answered} / {questions.length} answered
                            </Badge>
                        </Group>
                    </Group>
                    <Progress value={((currentQ + 1) / questions.length) * 100} size="sm" mt="sm" />
                </Paper>

                <Paper withBorder radius="md" p="xl" bg="var(--app-surface)">
                    <Text size="xs" c="dimmed" mb="xs">Question {currentQ + 1} of {questions.length}</Text>
                    <Text fw={600} size="lg" mb="xl">{q.text}</Text>
                    <Stack gap="sm">
                        {q.options.map((opt, oi) => (
                            <Paper
                                key={oi}
                                withBorder
                                radius="md"
                                p="md"
                                onClick={() => handleAnswer(oi)}
                                style={{
                                    cursor: 'pointer',
                                    borderColor: answers[currentQ] === oi ? 'var(--mantine-color-blue-5)' : undefined,
                                    background: answers[currentQ] === oi ? 'var(--mantine-color-blue-light)' : undefined,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Group>
                                    <ThemeIcon variant="light" color={answers[currentQ] === oi ? 'blue' : 'gray'} size="sm" radius="xl">
                                        <Text size="xs" fw={700}>{String.fromCharCode(65 + oi)}</Text>
                                    </ThemeIcon>
                                    <Text size="sm">{opt}</Text>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Button variant="subtle" disabled={currentQ === 0} leftSection={<IconChevronLeft size={16} />}
                            onClick={() => setCurrentQ(q => q - 1)}>
                            Previous
                        </Button>
                        {isLast ? (
                            <Button color="green" rightSection={<IconCheck size={16} />} onClick={handleSubmit}>
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button rightSection={<IconChevronRight size={16} />}
                                onClick={() => setCurrentQ(q => q + 1)}>
                                Next
                            </Button>
                        )}
                    </Group>
                </Paper>
            </div>
        );
    }

    // Quiz List
    return (
        <div>
            <PageHeader title="CBT Quizzes" subtitle="Take online quizzes and assessments assigned by your teachers" />

            {quizzes.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconBrain size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Quizzes Available</Text>
                    <Text c="dimmed" mt="xs">Your teachers haven't published any quizzes yet.</Text>
                </Card>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} withBorder radius="md" padding="lg" shadow="sm" bg="var(--app-surface)">
                            <Group justify="space-between" mb="sm">
                                <ThemeIcon variant="light" color="violet" size="xl" radius="md">
                                    <IconBrain size={22} />
                                </ThemeIcon>
                                <Badge variant="light" color="grape" size="sm">
                                    {quiz.subject?.code || 'Quiz'}
                                </Badge>
                            </Group>
                            <Text fw={600} size="md" mb="xs">{quiz.title}</Text>
                            <Text size="sm" c="dimmed" mb="xs">{quiz.subject?.name}</Text>
                            <Group gap="xs" mb="lg">
                                <Badge variant="outline" size="sm" leftSection={<IconQuestionMark size={10} />}>
                                    {quiz.questions} Qs
                                </Badge>
                                <Badge variant="outline" size="sm" leftSection={<IconClock size={10} />}>
                                    {quiz.duration} min
                                </Badge>
                            </Group>
                            <Button
                                fullWidth
                                leftSection={<IconPlayerPlay size={16} />}
                                color="violet"
                                onClick={() => startQuiz(quiz)}
                            >
                                Start Quiz
                            </Button>
                        </Card>
                    ))}
                </SimpleGrid>
            )}
        </div>
    );
}
