import { Controller, Get, Post, Body, ForbiddenException } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
    constructor(private readonly systemService: SystemService) { }

    @Get('status')
    async getStatus() {
        return this.systemService.checkStatus();
    }

    @Post('install')
    async install(@Body() installDto: any) {
        const status = await this.systemService.checkStatus();
        if (status.isInstalled) {
            throw new ForbiddenException('System is already installed.');
        }
        return this.systemService.installSystem(installDto);
    }
}
