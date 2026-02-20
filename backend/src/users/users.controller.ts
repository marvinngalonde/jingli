import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'Get all users in school' })
    async getAll(@Request() req: any) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me) return [];
        return this.usersService.findAll(me.schoolId);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    async create(@Request() req: any, @Body() body: any) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me || me.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.usersService.create(me.schoolId, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    async remove(@Request() req: any, @Param('id') id: string) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me || me.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.usersService.remove(id);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current logged-in user profile' })
    getMe(@Request() req: any) {
        // req.user is populated by SupabaseGuard
        return this.usersService.findMe(req.user.id);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search users in the same school' })
    async search(@Request() req: any) {
        const me = await this.usersService.findMe(req.user.id);
        if (!me) return [];
        return this.usersService.findAll(me.schoolId);
    }
}
