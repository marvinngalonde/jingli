import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

export class CreateBookDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    author: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    isbn?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    accessionNo?: string;
}

export class IssueBookDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    bookId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    remarks?: string;
}

export class UpdateBookDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    author?: string;

    @ApiProperty({ required: false })
    @IsEnum(BookStatus)
    @IsOptional()
    status?: BookStatus;
}
