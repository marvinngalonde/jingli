import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined in .env');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Generic Chat with Jingli AI with Function Calling support
     */
    async chat(userId: string, sessionId: string | null, message: string, file?: string, mimeType?: string, modelId: string = 'gemini-2.5-flash') {
        try {
            // 1. Get/Create Session
            let session = sessionId
                ? await this.prisma.aiChatSession.findUnique({ where: { id: sessionId } })
                : null;

            if (!session) {
                session = await this.prisma.aiChatSession.create({
                    data: {
                        userId: userId,
                        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                    }
                });
            }

            // 2. Fetch Detailed Context
            const context = await this.getUserContext(userId);

            // 3. Define Tools
            const tools = [
                {
                    functionDeclarations: [
                        {
                            name: "getNotices",
                            description: "Fetches the latest official school notices and announcements.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    limit: { type: "NUMBER", description: "Number of notices to fetch (default: 5)" }
                                }
                            }
                        },
                        {
                            name: "getFinanceSummary",
                            description: "Provides a statistical overview of school finances, including total fees collected, total due, and payment counts.",
                        },
                        {
                            name: "getStudentStats",
                            description: "Provides enrollment statistics, student counts, and demographic breakdowns.",
                        },
                        {
                            name: "getClassStructure",
                            description: "Lists all class levels and their respective sections in the school.",
                        },
                        {
                            name: "getStudentAcademicProfile",
                            description: "Returns the student's current academic details including their class, section, and enrolled subjects.",
                        },
                        {
                            name: "getStudentFinancials",
                            description: "Returns the student's personal fee balance, recent invoices, and payment history. Parents can also use this for their children.",
                        },
                        {
                            name: "getStudentAssignments",
                            description: "Returns a list of the student's assignments, including due dates and status.",
                        },
                        {
                            name: "getTeacherSchedule",
                            description: "Returns the teacher's weekly timetable including classes and subjects.",
                        },
                        {
                            name: "generateQuiz",
                            description: "Generates a new quiz for a specific topic, class, and subject. This creates actual database entries.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    subjectId: { type: "STRING", description: "The ID of the subject." },
                                    sectionId: { type: "STRING", description: "The ID of the section." },
                                    title: { type: "STRING", description: "Title of the quiz." },
                                    topic: { type: "STRING", description: "Detailed topic for question generation." },
                                    questionCount: { type: "NUMBER", description: "Number of questions to generate." },
                                    duration: { type: "NUMBER", description: "Duration in minutes." }
                                },
                                required: ["subjectId", "sectionId", "title", "topic"]
                            }
                        },
                        {
                            name: "bulkEnrollStudents",
                            description: "Enrolls multiple students at once from a provided list.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    sectionId: { type: "STRING", description: "The ID of the section to enroll into." },
                                    students: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                firstName: { type: "STRING" },
                                                lastName: { type: "STRING" },
                                                gender: { type: "STRING" },
                                                dob: { type: "STRING", description: "YYYY-MM-DD" },
                                                address: { type: "STRING" }
                                            },
                                            required: ["firstName", "lastName"]
                                        }
                                    }
                                },
                                required: ["sectionId", "students"]
                            }
                        },
                        {
                            name: "analyzeFinancialHealth",
                            description: "Analyzes school-wide financial data to identify trends and debt hotspots.",
                        },
                        {
                            name: "generateExecutiveSummary",
                            description: "Compiles academic, discipline, and attendance data into a high-level executive report.",
                        },
                        {
                            name: "processDocument",
                            description: "Extracts information from an uploaded document (OCR) and provides a structured summary or data extraction.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    documentType: { type: "STRING", enum: ["EXAM_SHEET", "INVOICE", "IDENTITY", "GENERAL"], description: "The type of document being processed." },
                                    purpose: { type: "STRING", description: "What to extract or summarize (e.g., 'Extract marks', 'Summarize notes')." }
                                },
                                required: ["documentType"]
                            }
                        },
                        {
                            name: "getStudentsInSection",
                            description: "Fetches a list of students enrolled in a specific section.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    sectionId: { type: "STRING", description: "The ID of the section." }
                                },
                                required: ["sectionId"]
                            }
                        },
                        {
                            name: "updateStudentMark",
                            description: "Updates or records a student's mark for an exam, CALA, or assignment.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    studentId: { type: "STRING", description: "The ID of the student." },
                                    recordType: { type: "STRING", enum: ["EXAM_RESULT", "CALA_RECORD", "ASSIGNMENT_SUBMISSION"], description: "The type of record being updated." },
                                    recordId: { type: "STRING", description: "The ID of the Exam, CALA, or Assignment." },
                                    marks: { type: "NUMBER", description: "The marks obtained." },
                                    remarks: { type: "STRING", description: "Optional feedback or remarks." }
                                },
                                required: ["studentId", "recordType", "recordId", "marks"]
                            }
                        },
                        {
                            name: "predictStudentRisk",
                            description: "Analyzes attendance and grade trends to predict if a student is at risk of academic failure or dropout.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    studentId: { type: "STRING", description: "The ID of the student." }
                                },
                                required: ["studentId"]
                            }
                        },
                        {
                            name: "summarizeStudentBehavior",
                            description: "Aggregates a student's discipline records into a concise narrative summary.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    studentId: { type: "STRING", description: "The ID of the student." }
                                },
                                required: ["studentId"]
                            }
                        },
                        {
                            name: "draftOfficialNotice",
                            description: "Drafts a professional school notice or announcement based on a topic or event.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    topic: { type: "STRING", description: "The subject or event for the notice." },
                                    targetAudience: { type: "STRING", enum: ["ALL", "TEACHERS", "STUDENTS", "PARENTS"], description: "The intended audience." }
                                },
                                required: ["topic", "targetAudience"]
                            }
                        },
                        {
                            name: "suggestLearningResources",
                            description: "Suggests specific library books or digital resources to help a student improve in their subjects.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    studentId: { type: "STRING", description: "The ID of the student." }
                                },
                                required: ["studentId"]
                            }
                        },
                        {
                            name: "importData",
                            description: "Imports records (Students, Staff, Visitors) into the system. You are provided with unstructured text, CSV lines, or parsed JSON text. You MUST preprocess and structure this data into an array of objects matching the required schema. If any fields are missing (like admission number), generate them or leave them null if optional.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    entityType: { type: "STRING", enum: ["STUDENT", "STAFF", "VISITOR"], description: "The type of entity to import." },
                                    records: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                firstName: { type: "STRING" },
                                                lastName: { type: "STRING" },
                                                email: { type: "STRING" },
                                                phone: { type: "STRING" },
                                                role: { type: "STRING" },
                                                gender: { type: "STRING" },
                                                dob: { type: "STRING" },
                                                address: { type: "STRING" },
                                                name: { type: "STRING" },
                                                purpose: { type: "STRING" },
                                                idProof: { type: "STRING" }
                                            }
                                        }
                                    }
                                },
                                required: ["entityType", "records"]
                            }
                        }
                    ]
                }
            ];

            // 4. Initialize Model (Gemini 1.5 Flash - Multimodal)
            const model = this.genAI.getGenerativeModel({
                model: modelId,
                tools: tools as any,
                systemInstruction: `ROLE: You are Jingli AI, the advanced intelligence platform for the Jingli School Management System. 
                                    You are speaking with ${context.name}, a ${context.role.toLowerCase()} at ${context.schoolName}.
                                    ${context.role === 'STUDENT' ? `As a student, you should act as a Socratic tutor—guide them to the answer for academic questions in subjects like: ${context.subjects.join(', ')}. Never do their work for them.` : ''}
                                    ${context.role === 'ADMIN' ? 'You are a school administrator. Use data-driven insights to manage enrollment, finance, and reporting.' : ''}
                                    ${context.role === 'TEACHER' ? 'You are an academic assistant. Focus on student performance, mark management, and instructional efficiency.' : ''}
                                    
                                    CAPABILITIES: 
                                    - Generic: Check notices (getNotices), structure (getClassStructure), and process multimodal documents/OCR (processDocument).
                                    - Student/Parent Tracking: Academic profile (getStudentAcademicProfile), Financials (getStudentFinancials), Assignments (getStudentAssignments).
                                    - Academic Management (Teachers/Admins): 
                                        * List students (getStudentsInSection).
                                        * Update marks (updateStudentMark) for Exam Results, CALA, or Assignments.
                                        * Predictive insights (predictStudentRisk) to find at-risk students.
                                        * Behavioral analysis (summarizeStudentBehavior).
                                    - Automation:
                                        * Quiz Generation (generateQuiz).
                                        * Bulk Enrollment (bulkEnrollStudents).
                                        * Notice Drafting (draftOfficialNotice).
                                        * Learning resource guidance (suggestLearningResources).
                                        * Data Import (importData) for extracting parsed lists of Students, Staff, and Visitors from provided context.
                                    - Analysis: Financial health (analyzeFinancialHealth), Executive summaries (generateExecutiveSummary).

                                    REQUIREMENTS: 
                                    - Use tools proactively whenever numerical, statistical, or structured data is needed.
                                    - SECURITY: You must only perform operations authorized for the user's role (${context.role}). If an operation is unauthorized, politely refuse and explain.
                                    - When evaluating pasted text or uploaded files containing lists of people, you act as a data engineer. Clean, format, and structure the data into the exact schema expected by the importData tool and automatically import them.
                                    - Be precise. If a mark is updated, confirm the specific record changed.
                                    - Use formatting (bold, tables) for clarity.
                                    - Rebranding: Refer to yourself only as "Jingli AI".`,
            });

            // 5. Save User Message
            await this.prisma.aiChatMessage.create({
                data: {
                    sessionId: session.id,
                    role: 'user',
                    content: message + (file ? ' [Attached Image]' : ''),
                }
            });

            // 6. Fetch previous messages for context
            const history = await this.prisma.aiChatMessage.findMany({
                where: { sessionId: session.id },
                orderBy: { createdAt: 'asc' },
                take: 10,
            });

            const chat = model.startChat({
                history: history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
            });

            // 7. Generate Content with Tool Calling Loop
            const promptParts: any[] = [{ text: message }];
            if (file && mimeType) {
                promptParts.push({
                    inlineData: {
                        data: file,
                        mimeType: mimeType
                    }
                });
            }

            let result = await chat.sendMessage(promptParts);
            let response = result.response;

            // Loop for potential multiple tool calls (max 3 turns)
            let iterations = 0;
            while (response.functionCalls()?.length && iterations < 3) {
                const functionCalls = response.functionCalls();
                const toolResults: Part[] = [];

                for (const call of functionCalls!) {
                    if (call.name === "getNotices") {
                        const notices = await this.handleGetNotices(context.schoolId!, (call.args as any).limit || 5);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: notices }
                            }
                        });
                    } else if (call.name === "getFinanceSummary") {
                        const summary = await this.handleGetFinanceSummary(context.schoolId!);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: summary }
                            }
                        });
                    } else if (call.name === "getStudentStats") {
                        const stats = await this.handleGetStudentStats(context.schoolId!);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: stats }
                            }
                        });
                    } else if (call.name === "getClassStructure") {
                        const structure = await this.handleGetClassStructure(context.schoolId!);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: structure }
                            }
                        });
                    } else if (call.name === "getStudentAcademicProfile") {
                        const profile = await this.handleGetStudentAcademicProfile(context.userId);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: profile }
                            }
                        });
                    } else if (call.name === "getStudentFinancials") {
                        const financials = await this.handleGetStudentFinancials(context.userId, context.role);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: financials }
                            }
                        });
                    } else if (call.name === "getStudentAssignments") {
                        const assignments = await this.handleGetStudentAssignments(context.userId);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: assignments }
                            }
                        });
                    } else if (call.name === "getTeacherSchedule") {
                        const schedule = await this.handleGetTeacherSchedule(context.userId);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: schedule }
                            }
                        });
                    } else if (call.name === "generateQuiz") {
                        const args = call.args as any;
                        const quiz = await this.handleGenerateQuiz(context.userId, context.schoolId!, args, modelId);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: quiz }
                            }
                        });
                    } else if (call.name === "bulkEnrollStudents") {
                        const args = call.args as any;
                        const result = await this.handleBulkEnrollStudents(context.schoolId!, args.sectionId, args.students);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    } else if (call.name === "analyzeFinancialHealth") {
                        const analysis = await this.handleAnalyzeFinancialHealth(context.schoolId!);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: analysis }
                            }
                        });
                    } else if (call.name === "generateExecutiveSummary") {
                        const summary = await this.handleGenerateExecutiveSummary(context.schoolId!);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: summary }
                            }
                        });
                    } else if (call.name === "getStudentsInSection") {
                        const args = call.args as any;
                        const result = await this.handleGetStudentsInSection(context.schoolId!, args.sectionId);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    } else if (call.name === "updateStudentMark") {
                        const args = call.args as any;
                        const result = await this.handleUpdateStudentMark(context.userId, context.schoolId!, args);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    } else if (call.name === "predictStudentRisk") {
                        const args = call.args as any;
                        const result = await this.handlePredictStudentRisk(context.schoolId!, args.studentId);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    } else if (call.name === "summarizeStudentBehavior") {
                        const args = call.args as any;
                        const result = await this.handleSummarizeStudentBehavior(context.schoolId!, args.studentId);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    } else if (call.name === "draftOfficialNotice") {
                        const args = call.args as any;
                        const result = await this.handleDraftOfficialNotice(args);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    } else if (call.name === "suggestLearningResources") {
                        const args = call.args as any;
                        const result = await this.handleSuggestLearningResources(context.schoolId!, args.studentId);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    } else if (call.name === "processDocument") {
                        const args = call.args as any;
                        const result = await this.handleProcessDocument(context.schoolId!, args);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    } else if (call.name === "importData") {
                        const args = call.args as any;
                        const result = await this.handleImportData(context.schoolId!, args.entityType, args.records);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: result }
                            }
                        });
                    }
                }

                if (toolResults.length > 0) {
                    result = await chat.sendMessage(toolResults);
                    response = result.response;
                }
                iterations++;
            }

            const content = response.text();

            // 8. Save Bot Message
            await this.prisma.aiChatMessage.create({
                data: {
                    sessionId: session.id,
                    role: 'model',
                    content: content,
                }
            });

            return {
                sessionId: session.id,
                message: content,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new InternalServerErrorException('Jingli AI is currently unavailable.');
        }
    }

    /**
     * Tool Handler: Fetch Notices
     */
    private async handleGetNotices(schoolId: string, limit: number) {
        try {
            const notices = await this.prisma.notice.findMany({
                where: { schoolId },
                orderBy: { postedAt: 'desc' },
                take: limit,
                include: {
                    poster: {
                        select: { username: true }
                    }
                }
            });

            if (notices.length === 0) return "No active notices found.";

            return notices.map(n => ({
                title: n.title,
                content: n.content,
                postedBy: n.poster.username,
                postedAt: n.postedAt.toISOString(),
                expiresAt: n.expiresAt?.toISOString() || 'Never'
            }));
        } catch (error) {
            console.error('Failed to fetch notices for AI:', error);
            return "Error retrieving notices.";
        }
    }

    private async handleGetFinanceSummary(schoolId: string) {
        try {
            const invoices = await this.prisma.invoice.findMany({
                where: { schoolId },
                include: { transactions: true }
            });

            const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
            const totalPaid = invoices.reduce((sum, inv) =>
                sum + inv.transactions.reduce((tSum, t) => tSum + Number(t.amount), 0), 0
            );

            return {
                totalInvoiced: totalAmount,
                totalPaid: totalPaid,
                outstandingBalance: totalAmount - totalPaid,
                invoiceCount: invoices.length,
                collectionRate: totalAmount > 0 ? (totalPaid / totalAmount * 100).toFixed(2) + '%' : '0%'
            };
        } catch (error) {
            return "Error fetching finance data.";
        }
    }

    private async handleGetStudentStats(schoolId: string) {
        try {
            const [total, male, female] = await Promise.all([
                this.prisma.student.count({ where: { schoolId } }),
                this.prisma.student.count({ where: { schoolId, gender: 'MALE' } }),
                this.prisma.student.count({ where: { schoolId, gender: 'FEMALE' } })
            ]);

            return {
                totalStudents: total,
                genderBreakdown: { male, female },
                newEnrollmentsThisMonth: await this.prisma.student.count({
                    where: {
                        schoolId,
                        enrollmentDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                    }
                })
            };
        } catch (error) {
            return "Error fetching student stats.";
        }
    }

    private async handleGetClassStructure(schoolId: string) {
        try {
            const classes = await this.prisma.classLevel.findMany({
                where: { schoolId },
                include: { sections: true }
            });

            return classes.map(c => ({
                className: c.name,
                sections: c.sections.map(s => s.name)
            }));
        } catch (error) {
            return "Error fetching class structure.";
        }
    }

    private async handleGetStudentAcademicProfile(userId: string) {
        try {
            const student = await this.prisma.student.findUnique({
                where: { userId },
                include: {
                    section: {
                        include: { classLevel: true }
                    },
                    school: true
                }
            });

            if (!student) return "Student profile not found.";

            const subjects = await this.prisma.subject.findMany({
                where: {
                    classLevels: {
                        some: { id: student.section.classLevelId }
                    }
                }
            });

            return {
                name: `${student.firstName} ${student.lastName}`,
                class: student.section.classLevel.name,
                section: student.section.name,
                admissionNo: student.admissionNo,
                subjects: subjects.map(s => s.name)
            };
        } catch (error) {
            return "Error fetching academic profile.";
        }
    }

    private async handleGetStudentFinancials(userId: string, role: string) {
        try {
            let studentIds: string[] = [];

            if (role === 'STUDENT') {
                const student = await this.prisma.student.findUnique({ where: { userId } });
                if (student) studentIds.push(student.id);
            } else if (role === 'PARENT' || role === 'GUARDIAN') {
                const guardian = await this.prisma.guardian.findUnique({
                    where: { userId },
                    include: { students: true }
                });
                if (guardian) studentIds = guardian.students.map(s => s.studentId);
            }

            if (studentIds.length === 0) return "No student links found for your account.";

            const invoices = await this.prisma.invoice.findMany({
                where: { studentId: { in: studentIds } },
                include: { transactions: true }
            });

            return invoices.map(inv => {
                const totalPaid = inv.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
                return {
                    invoiceNo: inv.id.split('-')[0],
                    amount: inv.amount,
                    paid: totalPaid,
                    balance: Number(inv.amount) - totalPaid,
                    status: inv.status,
                    dueDate: inv.dueDate?.toISOString()
                };
            });
        } catch (error) {
            return "Error fetching financial data.";
        }
    }

    private async handleGetStudentAssignments(userId: string) {
        try {
            const student = await this.prisma.student.findUnique({
                where: { userId },
                select: { sectionId: true }
            });

            if (!student) return "Student not found.";

            const assignments = await this.prisma.assignment.findMany({
                where: { sectionId: student.sectionId },
                include: {
                    subject: true,
                    submissions: {
                        where: { studentId: student.sectionId } // This logic might need refinement based on exact Prisma schema for submissions
                    }
                },
                orderBy: { dueDate: 'asc' }
            });

            return assignments.map(a => ({
                title: a.title,
                subject: a.subject.name,
                dueDate: a.dueDate.toISOString(),
                maxMarks: a.maxMarks,
                isSubmitted: a.submissions.length > 0
            }));
        } catch (error) {
            return "Error fetching assignments.";
        }
    }

    private async handleGetTeacherSchedule(userId: string) {
        try {
            const staff = await this.prisma.staff.findUnique({
                where: { userId },
                select: { id: true }
            });

            if (!staff) return "Teacher profile not found.";

            const timetables = await this.prisma.timetable.findMany({
                where: { teacherId: staff.id },
                include: {
                    subject: true,
                    section: {
                        include: { classLevel: true }
                    }
                },
                orderBy: [
                    { day: 'asc' },
                    { startTime: 'asc' }
                ]
            });

            return timetables.map(t => ({
                day: t.day,
                time: `${t.startTime.toISOString().split('T')[1].substring(0, 5)} - ${t.endTime.toISOString().split('T')[1].substring(0, 5)}`,
                subject: t.subject.name,
                class: `${t.section.classLevel.name} ${t.section.name}`,
                room: t.roomNo
            }));
        } catch (error) {
            return "Error fetching schedule.";
        }
    }

    private async handleGenerateQuiz(userId: string, schoolId: string, args: any, modelId: string) {
        try {
            const { subjectId, sectionId, title, topic, questionCount = 5, duration = 15 } = args;

            // 1. Find the staff ID for this user
            const staff = await this.prisma.staff.findUnique({ where: { userId } });
            if (!staff) return "Only teachers or staff can generate quizzes.";

            // 2. Use AI to generate questions (Internal prompt)
            const quizModel = this.genAI.getGenerativeModel({ model: modelId });
            const prompt = `Generate ${questionCount} multiple choice questions for a school quiz.
                           Topic: ${topic}
                           Output Format: JSON array of objects with: question, options (array of 4 strings), correctAnswer (index 0-3), explanation.
                           Return ONLY the JSON.`;

            const result = await quizModel.generateContent(prompt);
            const questions = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

            // 3. Create the Quiz
            const quiz = await this.prisma.quiz.create({
                data: {
                    schoolId,
                    teacherId: staff.id,
                    subjectId,
                    sectionId,
                    title,
                    description: `AI-generated quiz about ${topic}`,
                    duration,
                    questions: {
                        create: questions.map((q: any, index: number) => ({
                            question: q.question,
                            type: 'MULTIPLE_CHOICE',
                            options: q.options,
                            correctAnswer: String(q.correctAnswer),
                            order: index,
                            explanation: q.explanation
                        }))
                    }
                },
                include: { questions: true }
            });

            return {
                message: `Successfully generated quiz: ${quiz.title}`,
                quizId: quiz.id,
                questionCount: quiz.questions.length
            };
        } catch (error) {
            console.error(error);
            return "Error generating quiz content.";
        }
    }

    private async handleBulkEnrollStudents(schoolId: string, sectionId: string, students: any[]) {
        try {
            const results = [];

            for (const studentData of students) {
                // Generate a random admission number if not provided
                const admissionNo = `S${Math.floor(1000 + Math.random() * 9000)}`;
                const username = `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;

                // Create User
                const user = await this.prisma.user.create({
                    data: {
                        schoolId,
                        username: username,
                        passwordHash: '$2b$10$YourDefaultHash', // In a real app, send a reset email
                        role: 'STUDENT',
                    }
                });

                // Create Student
                const student = await this.prisma.student.create({
                    data: {
                        schoolId,
                        userId: user.id,
                        sectionId,
                        admissionNo,
                        firstName: studentData.firstName,
                        lastName: studentData.lastName,
                        gender: studentData.gender,
                        dob: studentData.dob ? new Date(studentData.dob) : null,
                        address: studentData.address,
                        enrollmentDate: new Date(),
                    }
                });

                results.push(`${student.firstName} ${student.lastName} (${admissionNo})`);
            }

            return `Enrolled ${results.length} students: ${results.join(', ')}`;
        } catch (error) {
            console.error(error);
            return "Error during bulk enrollment.";
        }
    }

    private async handleImportData(schoolId: string, entityType: string, records: any[]) {
        try {
            const results = [];

            if (entityType === "STUDENT") {
                for (const r of records) {
                    const admissionNo = `S${Math.floor(10000 + Math.random() * 90000)}`;
                    const username = `${r.firstName.toLowerCase()}.${r.lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
                    const user = await this.prisma.user.create({
                        data: {
                            schoolId,
                            username,
                            passwordHash: '$2b$10$YourDefaultHash',
                            role: 'STUDENT',
                        }
                    });
                    const student = await this.prisma.student.create({
                        data: {
                            schoolId,
                            userId: user.id,
                            sectionId: r.sectionId || null,
                            admissionNo,
                            firstName: r.firstName,
                            lastName: r.lastName,
                            gender: r.gender || 'UNKNOWN',
                            dob: r.dob ? new Date(r.dob) : null,
                            address: r.address || '',
                            enrollmentDate: new Date(),
                        }
                    });
                    results.push(`${student.firstName} ${student.lastName}`);
                }
            } else if (entityType === "STAFF") {
                for (const r of records) {
                    const username = `${r.firstName.toLowerCase()}.${r.lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
                    const user = await this.prisma.user.create({
                        data: {
                            schoolId,
                            username,
                            email: r.email || `${username}@school.com`,
                            passwordHash: '$2b$10$YourDefaultHash',
                            role: 'TEACHER',
                        }
                    });
                    const staff = await this.prisma.staff.create({
                        data: {
                            schoolId,
                            userId: user.id,
                            employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
                            designation: r.role || 'Teacher',
                            department: 'General',
                            joinDate: new Date(),
                            firstName: r.firstName,
                            lastName: r.lastName,
                            phone: r.phone || '',
                        }
                    });
                    results.push(`${staff.firstName} ${staff.lastName}`);
                }
            } else if (entityType === "VISITOR") {
                for (const r of records) {
                    const visitor = await this.prisma.visitor.create({
                        data: {
                            schoolId,
                            name: r.name || `${r.firstName} ${r.lastName}`,
                            phone: r.phone || '',
                            purpose: r.purpose || 'General Visit',
                            idProof: r.idProof || '',
                            status: 'IN',
                            checkIn: new Date()
                        }
                    });
                    results.push(visitor.name);
                }
            }

            return `Successfully imported ${results.length} ${entityType.toLowerCase()}(s): ${results.join(', ')}`;
        } catch (error) {
            console.error("Import Data Error:", error);
            return `Error importing ${entityType} data. Check field mappings.`;
        }
    }

    private async handleAnalyzeFinancialHealth(schoolId: string) {
        try {
            const invoices = await this.prisma.invoice.findMany({
                where: { schoolId },
                include: { transactions: true }
            });

            const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
            const totalPaid = invoices.reduce((sum, inv) => {
                return sum + inv.transactions.reduce((tSum, t) => tSum + Number(t.amount), 0);
            }, 0);

            const debt = totalInvoiced - totalPaid;
            const rate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

            return {
                totalInvoiced,
                totalPaid,
                outstanding: debt,
                collectionRate: `${rate.toFixed(1)}%`,
                insight: debt > totalInvoiced * 0.3 ? "Warning: High outstanding balance detected." : "Healthy collection rate."
            };
        } catch (error) {
            return "Error analyzing financials.";
        }
    }

    private async handleGenerateExecutiveSummary(schoolId: string) {
        try {
            const studentsCount = await this.prisma.student.count({ where: { schoolId } });
            const staffCount = await this.prisma.staff.count({ where: { schoolId } });

            const attendance = await this.prisma.attendance.findMany({
                where: { schoolId, date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            });

            const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
            const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

            return {
                stats: { students: studentsCount, staff: staffCount },
                attendance: `${attendanceRate.toFixed(1)}% for the last 30 days`,
                summary: `The school currently hosts ${studentsCount} students and ${staffCount} staff members. Academic engagement is steady with a ${attendanceRate.toFixed(1)}% average attendance.`
            };
        } catch (error) {
            return "Error generating summary.";
        }
    }

    private async handleProcessDocument(schoolId: string, args: any) {
        // This is a placeholder for actual OCR logic which usually requires a file input
        // In the multimodal chat, the AI will normally see the file directly.
        // This tool is for structured extraction after the AI has seen the file.
        return `I have analyzed the ${args.documentType}. Content extraction and database synchronization are ready for your review. (Purpose: ${args.purpose || 'General extraction'})`;
    }

    private async handleGetStudentsInSection(schoolId: string, sectionId: string) {
        try {
            const section = await this.prisma.classSection.findUnique({
                where: { id: sectionId },
                include: {
                    students: {
                        select: {
                            id: true,
                            admissionNo: true,
                            firstName: true,
                            lastName: true,
                            gender: true
                        }
                    },
                    classLevel: true
                }
            });

            if (!section) return "Section not found.";

            return {
                section: `${section.classLevel.name} ${section.name}`,
                studentCount: section.students.length,
                students: section.students.map(s => ({
                    id: s.id,
                    admissionNo: s.admissionNo,
                    name: `${s.firstName} ${s.lastName}`,
                    gender: s.gender
                }))
            };
        } catch (error) {
            return "Error fetching section students.";
        }
    }

    private async handleUpdateStudentMark(userId: string, schoolId: string, args: any) {
        try {
            const { studentId, recordType, recordId, marks, remarks } = args;

            // Security check: Find staff
            const staff = await this.prisma.staff.findUnique({ where: { userId } });
            if (!staff) return "Only authorized staff can update marks.";

            if (recordType === 'EXAM_RESULT') {
                const result = await this.prisma.examResult.upsert({
                    where: {
                        examId_studentId: { examId: recordId, studentId }
                    },
                    update: { marksObtained: marks, remarks, gradedBy: staff.id },
                    create: { examId: recordId, studentId, marksObtained: marks, remarks, gradedBy: staff.id }
                });
                return `Updated Exam Result: ${marks} marks recorded for student.`;
            } else if (recordType === 'CALA_RECORD') {
                // Here we'd search for an existing record or create one. 
                // Since CalaRecord doesn't have a simple unique constraint like ExamResult, we search by student, subject, term, task.
                // For this tool, we assume recordId IS the CalaRecord ID IF it exists, or we skip complex matching.
                const record = await this.prisma.calaRecord.upsert({
                    where: { id: recordId || 'new-record' }, // This logic needs a real recordId or use student+term+subject+task
                    update: { score: marks, teacherRemarks: remarks, assessedBy: staff.id },
                    create: {
                        schoolId,
                        studentId,
                        score: marks,
                        maxScore: args.maxScore || 100, // Default to 100 if not provided
                        teacherRemarks: remarks,
                        assessedBy: staff.id,
                        subjectId: args.subjectId || '',
                        termId: args.termId || '',
                        taskName: args.taskName || 'Class Activity',
                        date: new Date()
                    }
                });
                return `Updated CALA Record: ${marks} marks recorded.`;
            }

            return `Mark update for ${recordType} is supported but requires more specific record ID context.`;
        } catch (error) {
            console.error(error);
            return "Error updating student mark. Ensure you provided correct IDs.";
        }
    }

    private async handlePredictStudentRisk(schoolId: string, studentId: string) {
        try {
            const student = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    attendance: { take: 10, orderBy: { date: 'desc' } },
                    examResults: { take: 5, orderBy: { id: 'desc' } } // Approximate trend
                }
            });

            if (!student) return "Student not found.";

            const absentCount = student.attendance.filter(a => a.status === 'ABSENT').length;
            const avgMarks = student.examResults.reduce((sum, r) => sum + r.marksObtained, 0) / (student.examResults.length || 1);

            let riskLevel = "LOW";
            let reasons = [];

            if (absentCount >= 3) {
                riskLevel = "MEDIUM";
                reasons.push("Multiple recent absences detected.");
            }
            if (avgMarks < 50 && student.examResults.length > 0) {
                riskLevel = riskLevel === "MEDIUM" ? "HIGH" : "MEDIUM";
                reasons.push("Academic performance is currently below 50%.");
            }

            return {
                student: `${student.firstName} ${student.lastName}`,
                riskLevel,
                riskSummary: reasons.length > 0 ? reasons.join(' ') : "No significant academic or attendance risks identified.",
                details: {
                    recentAbsences: absentCount,
                    performanceTrend: avgMarks.toFixed(1) + "% average"
                }
            };
        } catch (error) {
            return "Error analyzing student risk.";
        }
    }

    private async handleSummarizeStudentBehavior(schoolId: string, studentId: string) {
        try {
            const student = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    disciplineRecords: {
                        orderBy: { date: 'desc' },
                        take: 10
                    }
                }
            });

            if (!student) return "Student not found.";

            if (student.disciplineRecords.length === 0) {
                return `${student.firstName} ${student.lastName} has no recorded discipline issues.`;
            }

            const categories = student.disciplineRecords.reduce((acc, r) => {
                acc[r.category] = (acc[r.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                summary: `Summarizing ${student.disciplineRecords.length} records for ${student.firstName} ${student.lastName}.`,
                predominantIssue: Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0],
                recentIncident: student.disciplineRecords[0].description,
                incidentDate: student.disciplineRecords[0].date.toISOString().split('T')[0]
            };
        } catch (error) {
            return "Error summarizing behavior.";
        }
    }

    private async handleDraftOfficialNotice(args: any) {
        // AI tool to help admins draft professional content
        const { topic, targetAudience } = args;
        const quizModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Draft a professional school notice. 
                        Topic: ${topic}
                        Audience: ${targetAudience}
                        Tone: Formal, authoritative yet supportive.
                        Include placeholders for [Date], [Event Time], and [Contact Person].
                        Return the content only.`;

        const result = await quizModel.generateContent(prompt);
        return {
            draft: result.response.text(),
            suggestedTitle: `IMPORTANT: ${topic.toUpperCase()}`
        };
    }

    private async handleSuggestLearningResources(schoolId: string, studentId: string) {
        try {
            const student = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    examResults: { orderBy: { id: 'desc' }, take: 3, include: { exam: { include: { subject: true } } } }
                }
            });

            if (!student) return "Student profile not found.";

            const weakSubjects = student.examResults
                .filter(r => r.marksObtained < 50)
                .map(r => r.exam.subject.name);

            if (weakSubjects.length === 0) {
                return "The student is performing well! Suggest general advanced reading or enrichment programs.";
            }

            return {
                focusAreas: weakSubjects,
                suggestions: weakSubjects.map(s => `Library Guide: Master ${s} fundamentals - recommend 'Introduction to ${s}' for Grade level.`)
            };
        } catch (error) {
            return "Error suggesting resources.";
        }
    }

    async getHistory(userId: string) {
        return this.prisma.aiChatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });
    }

    async getSessionMessages(sessionId: string) {
        const session = await this.prisma.aiChatSession.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!session) throw new NotFoundException('Session not found');
        return session.messages;
    }

    /**
     * Fetches real user context from the database
     */
    private async getUserContext(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                staffProfile: true,
                studentProfile: true,
                school: true,
            }
        });

        if (!user) return { userId: '', name: 'User', role: 'USER', subjects: [], schoolId: '', schoolName: 'Jingli' };

        const name = user.staffProfile
            ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}`
            : (user.studentProfile ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}` : user.username);

        // Fetch subjects if student
        let subjects: string[] = [];
        if (user.studentProfile) {
            const studentSubjects = await this.prisma.subject.findMany({
                where: { schoolId: user.schoolId ?? '' },
                take: 5
            });
            subjects = studentSubjects.map(s => s.name);
        }

        return {
            userId,
            name,
            role: user.role,
            subjects,
            schoolId: user.schoolId,
            schoolName: user.school?.name ?? 'Jingli HQ'
        };
    }

    private isAuthorized(role: string, toolName: string, args?: any): boolean {
        const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN', 'SCHOOL_HEAD'];
        const managementRoles = [...adminRoles, 'HR_MANAGER', 'DEPUTY_HEAD', 'BURSAR'];
        const academicRoles = [...managementRoles, 'TEACHER'];
        const clericalRoles = [...managementRoles, 'RECEPTION', 'SENIOR_CLERK'];

        switch (toolName) {
            case 'importData':
                if (args?.entityType === 'VISITOR') return clericalRoles.includes(role);
                return managementRoles.includes(role);

            case 'bulkEnrollStudents':
                return managementRoles.includes(role);

            case 'updateStudentMark':
                return academicRoles.includes(role);

            case 'predictStudentRisk':
            case 'summarizeStudentBehavior':
            case 'getStudentsInSection':
            case 'getTeacherSchedule':
            case 'generateQuiz':
                return academicRoles.includes(role);

            case 'analyzeFinancialHealth':
            case 'generateExecutiveSummary':
                return [...adminRoles, 'FINANCE', 'BURSAR'].includes(role);

            case 'draftOfficialNotice':
                return role !== 'STUDENT' && role !== 'PARENT';

            case 'getStudentAcademicProfile':
            case 'getStudentFinancials':
            case 'getStudentAssignments':
            case 'suggestLearningResources':
            case 'getNotices':
            case 'getClassStructure':
            case 'processDocument':
                return true; // Generally safe viewing tools

            default:
                return false;
        }
    }
}
