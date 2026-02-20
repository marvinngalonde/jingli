import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('ai')
// @UseGuards(SupabaseGuard) // Uncomment once auth is fully verified for these routes
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    @ApiOperation({ summary: 'Chat with ScholarBot (Academic Assistant)' })
    async chat(@Body() body: { studentId: string; message: string }) {
        return this.aiService.chatWithScholar(body.studentId, body.message);
    }
}
