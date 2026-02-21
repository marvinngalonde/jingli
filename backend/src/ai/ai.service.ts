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
    async chat(userId: string, sessionId: string | null, message: string) {
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
                        }
                    ]
                }
            ];

            // 4. Initialize Model (Gemini 2.5 Flash)
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                tools: tools as any,
                systemInstruction: `ROLE: You are Jingli 1.0, an advanced artificial intelligence integrated into the Jingli School Management System. 
                                    You are speaking with ${context.name}, a ${context.role.toLowerCase()} at ${context.schoolName}.
                                    ${context.role === 'STUDENT' ? `As a student, you should act as a Socratic tutor—guide them to the answer for academic questions in subjects like: ${context.subjects.join(', ')}. Never do their work for them.` : ''}
                                    ${context.role === 'ADMIN' ? 'You are an administrative assistant. Help with data analysis, scheduling, and staff management.' : ''}
                                    ${context.role === 'TEACHER' ? 'Help with lesson planning, grading suggestions, and student engagement strategies.' : ''}
                                    CAPABILITIES: 
                                    - You can check school notices using the 'getNotices' tool.
                                    REQUIREMENTS: 
                                    - If they ask about topics outside of school or non-academic topics, politely decline unless it relates to school administration or productivity.
                                    - Use formatting (bold, lists) to make answers readable.
                                    - Always stay professional and project the "Jingli" brand.
                                    - Your goal is to make the school more intelligent and efficient.`,
            });

            // 5. Save User Message
            await this.prisma.aiChatMessage.create({
                data: {
                    sessionId: session.id,
                    role: 'user',
                    content: message,
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
            let result = await chat.sendMessage(message);
            let response = result.response;

            // Loop for potential multiple tool calls (max 3 turns)
            let iterations = 0;
            while (response.functionCalls()?.length && iterations < 3) {
                const functionCalls = response.functionCalls();
                const toolResults: Part[] = [];

                for (const call of functionCalls!) {
                    if (call.name === "getNotices") {
                        const notices = await this.handleGetNotices(context.schoolId, (call.args as any).limit || 5);
                        toolResults.push({
                            functionResponse: {
                                name: call.name,
                                response: { content: notices }
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

        if (!user) return { name: 'User', role: 'USER', subjects: [], schoolId: '', schoolName: 'Jingli' };

        const name = user.staffProfile
            ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}`
            : (user.studentProfile ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}` : user.username);

        // Fetch subjects if student
        let subjects: string[] = [];
        if (user.studentProfile) {
            const studentSubjects = await this.prisma.subject.findMany({
                where: { schoolId: user.schoolId },
                take: 5
            });
            subjects = studentSubjects.map(s => s.name);
        }

        return {
            name,
            role: user.role,
            subjects,
            schoolId: user.schoolId,
            schoolName: user.school.name
        };
    }
}
