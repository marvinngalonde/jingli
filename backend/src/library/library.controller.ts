import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { CreateBookDto, IssueBookDto, UpdateBookDto } from './dto/library.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('library')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) { }

    @Post('books')
    @ApiOperation({ summary: 'Add a new book to the library' })
    createBook(@Req() req: any, @Body() dto: CreateBookDto) {
        return this.libraryService.createBook(dto, req.user.schoolId);
    }

    @Get('books')
    @ApiOperation({ summary: 'Get all books in the library' })
    findAllBooks(@Req() req: any) {
        return this.libraryService.findAllBooks(req.user.schoolId);
    }

    @Patch('books/:id')
    @ApiOperation({ summary: 'Update book details' })
    updateBook(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateBookDto) {
        return this.libraryService.updateBook(id, dto, req.user.schoolId);
    }

    @Delete('books/:id')
    @ApiOperation({ summary: 'Remove a book from the library' })
    removeBook(@Req() req: any, @Param('id') id: string) {
        return this.libraryService.deleteBook(id, req.user.schoolId);
    }

    @Post('issue')
    @ApiOperation({ summary: 'Issue a book to a student' })
    issueBook(@Req() req: any, @Body() dto: IssueBookDto) {
        return this.libraryService.issueBook(dto, req.user.schoolId);
    }

    @Post('return/:id')
    @ApiOperation({ summary: 'Return an issued book' })
    returnBook(@Req() req: any, @Param('id') circulationId: string) {
        return this.libraryService.returnBook(circulationId, req.user.schoolId);
    }

    @Get('circulation')
    @ApiOperation({ summary: 'Get all circulation records' })
    findAllCirculation(@Req() req: any) {
        return this.libraryService.findAllCirculation(req.user.schoolId);
    }
}
