import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current logged-in user profile' })
    getMe(@Request() req: any) {
        // req.user is populated by SupabaseGuard
        return this.usersService.findMe(req.user.id);
    }
}
