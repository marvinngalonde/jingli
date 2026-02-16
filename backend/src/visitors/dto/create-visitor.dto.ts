import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VisitorStatus {
    IN = 'IN',
    OUT = 'OUT',
}

export class CreateVisitorDto {
    @ApiProperty({ example: 'school-uuid' })
    @IsString()
    @IsNotEmpty()
    schoolId: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: 'Meeting with Principal' })
    @IsString()
    @IsNotEmpty()
    purpose: string;

    @ApiProperty({ example: 'Parent of Student X', required: false })
    @IsString()
    @IsOptional()
    relationship?: string;
}
