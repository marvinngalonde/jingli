import { api } from './api';

export enum BookStatus {
    AVAILABLE = 'AVAILABLE',
    ISSUED = 'ISSUED',
    LOST = 'LOST',
    DAMAGED = 'DAMAGED'
}

export enum CirculationStatus {
    ISSUED = 'ISSUED',
    RETURNED = 'RETURNED',
    OVERDUE = 'OVERDUE'
}

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    category?: string;
    accessionNo?: string;
    status: BookStatus;
    createdAt: string;
}

export interface CirculationRecord {
    id: string;
    bookId: string;
    studentId: string;
    issueDate: string;
    dueDate: string;
    returnDate?: string;
    status: CirculationStatus;
    remarks?: string;
    book: Book;
    student: {
        firstName: string;
        lastName: string;
        admissionNo: string;
    };
}

export interface CreateBookDto {
    title: string;
    author: string;
    isbn?: string;
    category?: string;
    accessionNo?: string;
}

export interface IssueBookDto {
    bookId: string;
    studentId: string;
    dueDate: Date;
    remarks?: string;
}

export const libraryService = {
    // --- Books ---
    getAllBooks: async (): Promise<Book[]> => {
        const response = await api.get('/library/books');
        return response.data;
    },

    createBook: async (dto: CreateBookDto): Promise<Book> => {
        const response = await api.post('/library/books', dto);
        return response.data;
    },

    updateBook: async (id: string, dto: Partial<CreateBookDto> & { status?: BookStatus }): Promise<Book> => {
        const response = await api.patch(`/library/books/${id}`, dto);
        return response.data;
    },

    deleteBook: async (id: string): Promise<void> => {
        await api.delete(`/library/books/${id}`);
    },

    // --- Circulation ---
    getCirculation: async (): Promise<CirculationRecord[]> => {
        const response = await api.get('/library/circulation');
        return response.data;
    },

    issueBook: async (dto: IssueBookDto): Promise<CirculationRecord> => {
        const response = await api.post('/library/issue', dto);
        return response.data;
    },

    returnBook: async (circulationId: string): Promise<CirculationRecord> => {
        const response = await api.post(`/library/return/${circulationId}`);
        return response.data;
    }
};
