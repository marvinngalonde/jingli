import { Controller, Get, Post, Body, ForbiddenException, UseGuards, Req, Patch } from '@nestjs/common';
import { SystemService } from './system.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('system')
@Controller('system')
export class SystemController {
    constructor(private readonly systemService: SystemService) { }

    @Get('status')
    @ApiOperation({ summary: 'Check if system is installed' })
    async getStatus() {
        return this.systemService.checkStatus();
    }

    @Post('install')
    @ApiOperation({ summary: 'Run installation wizard' })
    async install(@Body() installDto: any) {
        const status = await this.systemService.checkStatus();
        if (status.isInstalled) {
            throw new ForbiddenException('System is already installed.');
        }
        return this.systemService.installSystem(installDto);
    }

    @Get('settings')
    @ApiBearerAuth()
    @UseGuards(SupabaseGuard)
    @ApiOperation({ summary: 'Get school settings' })
    async getSettings(@Req() req: any) {
        return this.systemService.getSchoolSettings(req.user.schoolId);
    }

    @Patch('settings')
    @ApiBearerAuth()
    @UseGuards(SupabaseGuard)
    @ApiOperation({ summary: 'Update school settings' })
    async updateSettings(@Req() req: any, @Body() data: any) {
        return this.systemService.updateSchoolSettings(req.user.schoolId, data);
    }
}
