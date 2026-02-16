import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
    @ApiProperty({ example: 'school-uuid' })
    @IsString()
    @IsNotEmpty()
    schoolId: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'EMP001' })
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @ApiProperty({ example: 'john.doe@school.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Teacher' })
    @IsString()
    @IsNotEmpty()
    designation: string;

    @ApiProperty({ example: 'Science' })
    @IsString()
    @IsNotEmpty()
    department: string;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    joinDate: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phone?: string;
}
