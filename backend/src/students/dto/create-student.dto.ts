import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
    @ApiProperty({ example: 'school-uuid', required: false })
    @IsString()
    @IsOptional()
    schoolId?: string;

    @ApiProperty({ example: 'ADM001', required: false })
    @IsString()
    @IsOptional()
    admissionNo?: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'class-section-uuid' })
    @IsString()
    @IsNotEmpty()
    sectionId: string;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    enrollmentDate: string;

    @ApiProperty({ example: 'john.doe.student@school.com', required: false })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    rollNo?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    dob?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    gender?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;
}
