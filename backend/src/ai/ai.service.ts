import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined in .env');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * ScholarBot logic for students
     */
    async chatWithScholar(studentId: string, message: string) {
        try {
            // 1. Fetch Context (Mocked for Phase 1)
            // LATER: Hook this up to Prisma: 
            // const student = await this.prisma.student.findUnique({ where: { id: studentId }, include: { classes: true, school: true } });
            const context = this.getStudentContext(studentId);

            // 2. Initialize Model (Gemini 1.5 Flash)
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: `ROLE: You are ScholarBot, an official educational assistant for Jingli School Management System. 
                                    You are speaking with ${context.name}, a ${context.gradeLevel} student. 
                                    TASK: Answer the student's questions based ONLY on the following academic subjects: ${context.subjects.join(', ')}. 
                                    REQUIREMENTS: 
                                    - Act as a Socratic tutor—guide them to the answer, never do the work for them. 
                                    - If they ask about topics outside of school or non-academic topics, politely decline.
                                    - Use formatting (bold, lists) to make answers readable.
                                    - Always stay professional and encouraging.`,
            });

            // 3. Generate Content
            const result = await model.generateContent(message);
            const response = await result.response;
            return {
                message: response.text(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new InternalServerErrorException('AI Assistant is currently unavailable.');
        }
    }

    /**
     * Mock function to simulate database context fetching.
     * In an actual implementation, this would query the User and Student profiles using Prisma.
     */
    private getStudentContext(studentId: string) {
        // This is where you would normally do:
        // return this.prisma.student.findUnique(...)
        return {
            name: 'Alex Johnson',
            gradeLevel: 'Grade 10',
            subjects: ['Mathematics', 'Physics', 'Biology', 'History', 'English Literature'],
        };
    }
}
