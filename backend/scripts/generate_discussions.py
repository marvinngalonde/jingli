import os
import re

base_dir = r"C:\arvip\jingli\backend\src\discussions"
os.makedirs(base_dir, exist_ok=True)

# 1. discussions.module.ts
mod_content = """import { Module } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService],
})
export class DiscussionsModule {}
"""
with open(os.path.join(base_dir, 'discussions.module.ts'), 'w', encoding='utf-8') as f:
    f.write(mod_content)

# 2. discussions.service.ts
svc_content = """import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class DiscussionsService {
    constructor(private readonly prisma: PrismaService) {}

    private async getUserDetails(userId: string, role: string) {
        if (role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { id: userId }});
            return student ? `${student.firstName} ${student.lastName}` : 'Student';
        } else {
            const staff = await this.prisma.staff.findUnique({ where: { id: userId }});
            return staff ? `${staff.firstName} ${staff.lastName}` : 'Teacher';
        }
    }

    async findAll(schoolId: string, subjectId?: string) {
        const whereClause: any = { schoolId };
        if (subjectId) {
            whereClause.subjectId = subjectId;
        }

        const threads = await this.prisma.discussionThread.findMany({
            where: whereClause,
            include: {
                replies: {
                    orderBy: { createdAt: 'asc' }
                },
                school: false // don't include school
            },
            orderBy: [
                { pinned: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Map to format frontend expects
        return threads.map(t => ({
            id: t.id,
            title: t.title,
            body: t.body,
            subject: t.subjectId || 'General',
            classSection: t.sectionId || '',
            author: t.authorName,
            authorRole: t.authorRole === 'STUDENT' ? 'student' : 'teacher',
            pinned: t.pinned,
            locked: t.locked,
            createdAt: t.createdAt.toISOString(),
            replies: t.replies.map(r => ({
                id: r.id,
                author: r.authorName,
                role: r.authorRole === 'STUDENT' ? 'student' : 'teacher',
                content: r.content,
                createdAt: r.createdAt.toISOString(),
            }))
        }));
    }

    async create(schoolId: string, user: any, dto: any) {
        const authorName = await this.getUserDetails(user.id, user.role);
        
        return this.prisma.discussionThread.create({
            data: {
                schoolId,
                authorId: user.id,
                authorName,
                authorRole: user.role,
                title: dto.title,
                body: dto.body,
                subjectId: dto.subject,
                sectionId: dto.classSection,
            }
        });
    }

    async addReply(threadId: string, user: any, dto: any) {
        const thread = await this.prisma.discussionThread.findUnique({ where: { id: threadId }});
        if (!thread) throw new NotFoundException('Thread not found');
        if (thread.locked) throw new Error('Thread is locked');

        const authorName = await this.getUserDetails(user.id, user.role);

        return this.prisma.discussionReply.create({
            data: {
                threadId,
                authorId: user.id,
                authorName,
                authorRole: user.role,
                content: dto.content
            }
        });
    }

    async togglePin(threadId: string, schoolId: string) {
        const thread = await this.prisma.discussionThread.findUnique({ where: { id: threadId, schoolId }});
        if (!thread) throw new NotFoundException('Thread not found');
        return this.prisma.discussionThread.update({
            where: { id: threadId },
            data: { pinned: !thread.pinned }
        });
    }

    async toggleLock(threadId: string, schoolId: string) {
        const thread = await this.prisma.discussionThread.findUnique({ where: { id: threadId, schoolId }});
        if (!thread) throw new NotFoundException('Thread not found');
        return this.prisma.discussionThread.update({
            where: { id: threadId },
            data: { locked: !thread.locked }
        });
    }
}
"""
with open(os.path.join(base_dir, 'discussions.service.ts'), 'w', encoding='utf-8') as f:
    f.write(svc_content)

# 3. discussions.controller.ts
ctrl_content = """import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, Req } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('discussions')
@UseGuards(SupabaseGuard)
export class DiscussionsController {
    constructor(private readonly discussionsService: DiscussionsService) {}

    @Get()
    findAll(@Req() req: any, @Query('subjectId') subjectId?: string) {
        return this.discussionsService.findAll(req.user.schoolId, subjectId);
    }

    @Post()
    create(@Req() req: any, @Body() dto: any) {
        return this.discussionsService.create(req.user.schoolId, req.user, dto);
    }

    @Post(':id/replies')
    addReply(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
        return this.discussionsService.addReply(id, req.user, dto);
    }

    @Put(':id/pin')
    togglePin(@Req() req: any, @Param('id') id: string) {
        return this.discussionsService.togglePin(id, req.user.schoolId);
    }

    @Put(':id/lock')
    toggleLock(@Req() req: any, @Param('id') id: string) {
        return this.discussionsService.toggleLock(id, req.user.schoolId);
    }
}
"""
with open(os.path.join(base_dir, 'discussions.controller.ts'), 'w', encoding='utf-8') as f:
    f.write(ctrl_content)

# 4. Add to app.module.ts
app_module_path = r"C:\arvip\jingli\backend\src\app.module.ts"
with open(app_module_path, 'r', encoding='utf-8') as f:
    app_module = f.read()

if "DiscussionsModule" not in app_module:
    app_module = app_module.replace("import { Module } from '@nestjs/common';", "import { Module } from '@nestjs/common';\\nimport { DiscussionsModule } from './discussions/discussions.module';")
    # find imports: [
    imports_idx = app_module.find("imports: [")
    if imports_idx != -1:
        insert_pos = imports_idx + len("imports: [")
        app_module = app_module[:insert_pos] + "\\n    DiscussionsModule," + app_module[insert_pos:]
    with open(app_module_path, 'w', encoding='utf-8') as f:
        f.write(app_module)

print("Generated Discussions backend structure.")
