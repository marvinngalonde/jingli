import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetCategoryDto, CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('assets')
export class AssetsController {
    constructor(private readonly service: AssetsService) { }

    // ═══════ Stats ═══════
    @Get('stats')
    @ApiOperation({ summary: 'Asset Stats' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    getStats(@Req() req: any) {
        return this.service.getStats(req.user.schoolId);
    }

    // ═══════ Categories ═══════
    @Post('categories')
    @ApiOperation({ summary: 'Create Category' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    createCategory(@Req() req: any, @Body() dto: CreateAssetCategoryDto) {
        return this.service.createCategory(dto, req.user.schoolId);
    }

    @Get('categories')
    @ApiOperation({ summary: 'List Categories' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    findAllCategories(@Req() req: any) {
        return this.service.findAllCategories(req.user.schoolId);
    }

    @Delete('categories/:id')
    @ApiOperation({ summary: 'Delete Category' })
    @Roles(UserRole.SUPER_ADMIN)
    removeCategory(@Req() req: any, @Param('id') id: string) {
        return this.service.removeCategory(id, req.user.schoolId);
    }

    // ═══════ Assets ═══════
    @Post()
    @ApiOperation({ summary: 'Create Asset' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    create(@Req() req: any, @Body() dto: CreateAssetDto) {
        return this.service.create(dto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'List Assets' })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'condition', required: false })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    findAll(@Req() req: any, @Query('categoryId') categoryId?: string, @Query('condition') condition?: string) {
        return this.service.findAll(req.user.schoolId, categoryId, condition);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Asset' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.service.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update Asset' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK)
    update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAssetDto) {
        return this.service.update(id, dto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Asset' })
    @Roles(UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.service.remove(id, req.user.schoolId);
    }
}
