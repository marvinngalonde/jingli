import os

base_dir = r"C:\arvip\jingli\backend\src\live-classes"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

# live-classes.module.ts
with open(os.path.join(base_dir, 'live-classes.module.ts'), 'w', encoding='utf-8') as f:
    f.write('''import { Module } from '@nestjs/common';
import { LiveClassesController } from './live-classes.controller';
import { LiveClassesService } from './live-classes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LiveClassesController],
  providers: [LiveClassesService]
})
export class LiveClassesModule {}
''')

# live-classes.controller.ts
with open(os.path.join(base_dir, 'live-classes.controller.ts'), 'w', encoding='utf-8') as f:
    f.write('''import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { LiveClassesService } from './live-classes.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('teacher/live-classes')
@UseGuards(SupabaseGuard)
export class LiveClassesController {
  constructor(private readonly service: LiveClassesService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.service.getAll(req.user);
  }

  @Post()
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    return this.service.updateStatus(id, status, req.user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.service.delete(id, req.user);
  }
}
''')

# live-classes.service.ts
with open(os.path.join(base_dir, 'live-classes.service.ts'), 'w', encoding='utf-8') as f:
    f.write('''import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LiveClassesService {
  constructor(private prisma: PrismaService) {}

  async getAll(user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    return this.prisma.liveClass.findMany({
      where: { teacherId: staff.id },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } },
      },
      orderBy: { scheduledFor: 'asc' }
    });
  }

  async create(dto: any, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    return this.prisma.liveClass.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        provider: dto.provider,
        meetingUrl: dto.meetingUrl,
        meetingId: dto.meetingId,
        scheduledFor: new Date(dto.scheduledFor),
        duration: dto.duration || 45,
        status: dto.status || 'SCHEDULED',
        subjectId: dto.subjectId || null,
        sectionId: dto.sectionId || null,
        teacherId: staff.id,
      },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } }
      }
    });
  }

  async update(id: string, dto: any, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    const liveClass = await this.prisma.liveClass.findFirst({ where: { id, teacherId: staff.id } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    return this.prisma.liveClass.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        provider: dto.provider,
        meetingUrl: dto.meetingUrl,
        meetingId: dto.meetingId,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        duration: dto.duration,
        status: dto.status,
        subjectId: dto.subjectId || null,
        sectionId: dto.sectionId || null,
      },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } }
      }
    });
  }

  async updateStatus(id: string, status: string, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    const liveClass = await this.prisma.liveClass.findFirst({ where: { id, teacherId: staff.id } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    return this.prisma.liveClass.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: string, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    const liveClass = await this.prisma.liveClass.findFirst({ where: { id, teacherId: staff.id } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    return this.prisma.liveClass.delete({ where: { id } });
  }
}
''')

# inject LiveClassesModule into app.module.ts
app_module_path = r"C:\arvip\jingli\backend\src\app.module.ts"
with open(app_module_path, 'r', encoding='utf-8') as f:
    app_module = f.read()

if "LiveClassesModule" not in app_module:
    import_statement = "import { LiveClassesModule } from './live-classes/live-classes.module';\n"
    app_module = import_statement + app_module
    
    # Insert LiveClassesModule in the imports array
    imports_str = 'imports: [\n'
    if imports_str in app_module:
        app_module = app_module.replace(imports_str, imports_str + '    LiveClassesModule,\n')
    else:
        # Fallback if imports formatting is different
        imports_start = app_module.find('imports: [') + len('imports: [')
        app_module = app_module[:imports_start] + 'LiveClassesModule, ' + app_module[imports_start:]
        
    with open(app_module_path, 'w', encoding='utf-8') as f:
        f.write(app_module)
    print("Injected LiveClassesModule into AppModule")
else:
    print("LiveClassesModule already in AppModule")
