import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { CreateBookDto, IssueBookDto, UpdateBookDto } from './dto/library.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('library')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) { }

    @Post('books')
    @ApiOperation({ summary: 'Add a new book to the library' })
    @Roles(UserRole.LIBRARIAN, UserRole.SUPER_ADMIN)
    createBook(@Req() req: any, @Body() dto: CreateBookDto) {
        return this.libraryService.createBook(dto, req.user.schoolId);
    }

    @Get('books')
    @ApiOperation({ summary: 'Get all books in the library' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(UserRole.LIBRARIAN, UserRole.SUPER_ADMIN, UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER, UserRole.STUDENT)
    findAllBooks(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.libraryService.findAllBooks(req.user.schoolId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }

    @Patch('books/:id')
    @ApiOperation({ summary: 'Update book details' })
    @Roles(UserRole.LIBRARIAN, UserRole.SUPER_ADMIN)
    updateBook(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateBookDto) {
        return this.libraryService.updateBook(id, dto, req.user.schoolId);
    }

    @Delete('books/:id')
    @ApiOperation({ summary: 'Remove a book from the library' })
    @Roles(UserRole.LIBRARIAN, UserRole.SUPER_ADMIN)
    removeBook(@Req() req: any, @Param('id') id: string) {
        return this.libraryService.deleteBook(id, req.user.schoolId);
    }

    @Post('issue')
    @ApiOperation({ summary: 'Issue a book to a student' })
    @Roles(UserRole.LIBRARIAN, UserRole.SUPER_ADMIN)
    issueBook(@Req() req: any, @Body() dto: IssueBookDto) {
        return this.libraryService.issueBook(dto, req.user.schoolId);
    }

    @Post('return/:id')
    @ApiOperation({ summary: 'Return an issued book' })
    @Roles(UserRole.LIBRARIAN, UserRole.SUPER_ADMIN)
    returnBook(@Req() req: any, @Param('id') circulationId: string) {
        return this.libraryService.returnBook(circulationId, req.user.schoolId);
    }

    @Get('circulation')
    @ApiOperation({ summary: 'Get all circulation records' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(UserRole.LIBRARIAN, UserRole.SUPER_ADMIN)
    findAllCirculation(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.libraryService.findAllCirculation(req.user.schoolId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
}
