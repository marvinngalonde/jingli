import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CbtService } from './cbt.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('teacher/quizzes')
@UseGuards(SupabaseGuard)
export class CbtController {
  constructor(private readonly cbtService: CbtService) { }

  @Get()
  getAllQuizzes(@Req() req: any) {
    return this.cbtService.getAllQuizzes(req.user);
  }

  @Get(':id')
  getQuizById(@Param('id') id: string, @Req() req: any) {
    return this.cbtService.getQuizById(id, req.user);
  }

  @Post()
  createQuiz(@Body() dto: any, @Req() req: any) {
    return this.cbtService.createQuiz(dto, req.user);
  }

  @Put(':id')
  updateQuiz(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.cbtService.updateQuiz(id, dto, req.user);
  }

  @Delete(':id')
  deleteQuiz(@Param('id') id: string, @Req() req: any) {
    return this.cbtService.deleteQuiz(id, req.user);
  }

  @Post(':id/questions')
  addQuestion(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.cbtService.addQuestion(id, dto, req.user);
  }

  @Put(':id/questions/:questionId')
  updateQuestion(@Param('id') id: string, @Param('questionId') questionId: string, @Body() dto: any, @Req() req: any) {
    return this.cbtService.updateQuestion(id, questionId, dto, req.user);
  }

  @Delete(':id/questions/:questionId')
  removeQuestion(@Param('id') id: string, @Param('questionId') questionId: string, @Req() req: any) {
    return this.cbtService.removeQuestion(id, questionId, req.user);
  }
}
