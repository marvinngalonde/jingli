import { IsString, IsNotEmpty, IsDateString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AssignmentType {
    HOMEWORK = 'HOMEWORK',
    PROJECT = 'PROJECT',
    QUIZ = 'QUIZ',
}

export class CreateAssignmentDto {
    @ApiProperty({ example: 'section-uuid-123' })
    @IsString()
    @IsNotEmpty()
    sectionId: string;

    @ApiProperty({ example: 'subject-uuid-123' })
    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @ApiProperty({ example: 'teacher-uuid-123' })
    @IsString()
    @IsNotEmpty()
    teacherId: string;

    @ApiProperty({ example: 'Math Homework Chapter 5' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Complete exercises 1-10', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '2023-10-30T23:59:59.000Z' })
    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @ApiProperty({ example: 100 })
    @IsInt()
    @IsNotEmpty()
    maxMarks: number;

    @ApiProperty({ enum: AssignmentType, example: 'HOMEWORK' })
    @IsEnum(AssignmentType)
    @IsNotEmpty()
    type: string;
}

export class UpdateAssignmentDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    maxMarks?: number;
}
