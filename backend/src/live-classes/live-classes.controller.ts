import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
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
