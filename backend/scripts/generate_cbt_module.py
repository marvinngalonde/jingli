import os

base_dir = r"C:\arvip\jingli\backend\src\cbt"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

# cbt.module.ts
with open(os.path.join(base_dir, 'cbt.module.ts'), 'w', encoding='utf-8') as f:
    f.write('''import { Module } from '@nestjs/common';
import { CbtController } from './cbt.controller';
import { CbtService } from './cbt.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CbtController],
  providers: [CbtService]
})
export class CbtModule {}
''')

# cbt.controller.ts
with open(os.path.join(base_dir, 'cbt.controller.ts'), 'w', encoding='utf-8') as f:
    f.write('''import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CbtService } from './cbt.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('teacher/quizzes')
@UseGuards(SupabaseGuard)
export class CbtController {
  constructor(private readonly cbtService: CbtService) {}

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
}
''')

# cbt.service.ts
with open(os.path.join(base_dir, 'cbt.service.ts'), 'w', encoding='utf-8') as f:
    f.write('''import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CbtService {
  constructor(private prisma: PrismaService) {}

  async getAllQuizzes(user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    return this.prisma.quiz.findMany({
      where: { teacherId: staff.id },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } },
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getQuizById(id: string, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    const quiz = await this.prisma.quiz.findFirst({
      where: { id, teacherId: staff.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } },
        _count: { select: { attempts: true } }
      }
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async createQuiz(dto: any, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    return this.prisma.quiz.create({
      data: {
        title: dto.title,
        duration: dto.duration,
        isPublished: dto.isPublished || false,
        randomize: dto.randomize ?? true,
        showAnswers: dto.showAnswers ?? true,
        autoGrade: dto.autoGrade ?? true,
        secureMode: dto.secureMode || false,
        subjectId: dto.subjectId,
        sectionId: dto.sectionId,
        teacherId: staff.id,
      }
    });
  }

  async updateQuiz(id: string, dto: any, user: any) {
    const quiz = await this.getQuizById(id, user);

    return this.prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        title: dto.title,
        duration: dto.duration,
        isPublished: dto.isPublished,
        randomize: dto.randomize,
        showAnswers: dto.showAnswers,
        autoGrade: dto.autoGrade,
        secureMode: dto.secureMode,
      }
    });
  }

  async deleteQuiz(id: string, user: any) {
    const quiz = await this.getQuizById(id, user);
    return this.prisma.quiz.delete({ where: { id: quiz.id } });
  }

  async addQuestion(quizId: string, dto: any, user: any) {
    const quiz = await this.getQuizById(quizId, user);
    
    // Get last order
    const lastQ = await this.prisma.quizQuestion.findFirst({
      where: { quizId: quiz.id },
      orderBy: { order: 'desc' }
    });
    
    const nextOrder = lastQ ? lastQ.order + 1 : 0;

    return this.prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        text: dto.text,
        options: dto.options,
        correctAnswer: dto.correctAnswer,
        explanation: dto.explanation,
        points: dto.points || 1,
        order: nextOrder
      }
    });
  }
}
''')

# Now inject CbtModule into app.module.ts
app_module_path = r"C:\arvip\jingli\backend\src\app.module.ts"
with open(app_module_path, 'r', encoding='utf-8') as f:
    app_module = f.read()

if "CbtModule" not in app_module:
    import_statement = "import { CbtModule } from './cbt/cbt.module';\n"
    app_module = import_statement + app_module
    
    # Insert CbtModule in the imports array
    imports_str = 'imports: [\n'
    if imports_str in app_module:
        app_module = app_module.replace(imports_str, imports_str + '    CbtModule,\n')
    else:
        # Fallback if imports formatting is different
        imports_start = app_module.find('imports: [') + len('imports: [')
        app_module = app_module[:imports_start] + 'CbtModule, ' + app_module[imports_start:]
        
    with open(app_module_path, 'w', encoding='utf-8') as f:
        f.write(app_module)
    print("Injected CbtModule into AppModule")
else:
    print("CbtModule already in AppModule")
