import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@ApiTags('notices')
@Controller('notices')
export class NoticesController {
    constructor(private readonly noticesService: NoticesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a notice' })
    create(@Body() createDto: CreateNoticeDto) {
        return this.noticesService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all notices' })
    @ApiQuery({ name: 'audience', required: false, description: 'Target Audience filter' })
    findAll(@Query('audience') audience?: string) {
        return this.noticesService.findAll(audience);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific notice' })
    findOne(@Param('id') id: string) {
        return this.noticesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateNoticeDto) {
        return this.noticesService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.noticesService.remove(id);
    }
}
