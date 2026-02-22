import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, IssueBookDto, UpdateBookDto, BookStatus, CirculationStatus } from './dto/library.dto';

@Injectable()
export class LibraryService {
    constructor(private readonly prisma: PrismaService) { }

    // --- Books ---
    async createBook(dto: CreateBookDto, schoolId: string) {
        return this.prisma.book.create({
            data: {
                ...dto,
                schoolId,
                status: BookStatus.AVAILABLE,
            },
        });
    }

    async findAllBooks(schoolId: string) {
        return this.prisma.book.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateBook(id: string, dto: UpdateBookDto, schoolId: string) {
        await this.findOneBook(id, schoolId);
        return this.prisma.book.update({
            where: { id },
            data: dto,
        });
    }

    async deleteBook(id: string, schoolId: string) {
        await this.findOneBook(id, schoolId);
        return this.prisma.book.delete({
            where: { id },
        });
    }

    async findOneBook(id: string, schoolId: string) {
        const book = await this.prisma.book.findFirst({
            where: { id, schoolId },
        });
        if (!book) throw new NotFoundException('Book not found');
        return book;
    }

    // --- Circulation ---
    async issueBook(dto: IssueBookDto, schoolId: string) {
        // Check book availability
        const book = await this.findOneBook(dto.bookId, schoolId);
        if (book.status !== BookStatus.AVAILABLE) {
            throw new Error('Book is not available for issue');
        }

        // Create circulation record and update book status
        return this.prisma.$transaction(async (tx) => {
            const circulation = await tx.bookCirculation.create({
                data: {
                    schoolId,
                    bookId: dto.bookId,
                    studentId: dto.studentId,
                    dueDate: new Date(dto.dueDate),
                    status: CirculationStatus.ISSUED,
                    remarks: dto.remarks,
                },
                include: {
                    book: true,
                    student: {
                        select: { firstName: true, lastName: true, admissionNo: true }
                    }
                }
            });

            await tx.book.update({
                where: { id: dto.bookId },
                data: { status: BookStatus.ISSUED },
            });

            return circulation;
        });
    }

    async returnBook(circulationId: string, schoolId: string) {
        const circulation = await this.prisma.bookCirculation.findFirst({
            where: { id: circulationId, schoolId },
        });
        if (!circulation) throw new NotFoundException('Circulation record not found');
        if (circulation.status === CirculationStatus.RETURNED) {
            throw new Error('Book already returned');
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.bookCirculation.update({
                where: { id: circulationId },
                data: {
                    status: CirculationStatus.RETURNED,
                    returnDate: new Date(),
                },
            });

            await tx.book.update({
                where: { id: circulation.bookId },
                data: { status: BookStatus.AVAILABLE },
            });

            return updated;
        });
    }

    async findAllCirculation(schoolId: string) {
        return this.prisma.bookCirculation.findMany({
            where: { schoolId },
            include: {
                book: true,
                student: {
                    select: { firstName: true, lastName: true, admissionNo: true }
                }
            },
            orderBy: { issueDate: 'desc' },
        });
    }
}
