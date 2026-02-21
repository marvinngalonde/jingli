import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    @ApiOperation({ summary: 'Chat with Jingli AI' })
    async chat(@Body() body: { userId: string; sessionId?: string; message: string }) {
        return this.aiService.chat(body.userId, body.sessionId || null, body.message);
    }

    @Get('history/:userId')
    @ApiOperation({ summary: 'Get AI chat history for a user' })
    async getHistory(@Param('userId') userId: string) {
        return this.aiService.getHistory(userId);
    }

    @Get('session/:sessionId')
    @ApiOperation({ summary: 'Get messages for a specific session' })
    async getSessionMessages(@Param('sessionId') sessionId: string) {
        return this.aiService.getSessionMessages(sessionId);
    }
}
