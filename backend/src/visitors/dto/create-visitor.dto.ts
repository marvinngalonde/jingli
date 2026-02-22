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

    @ApiProperty({ example: 'Mr. Smith', required: false })
    @IsString()
    @IsOptional()
    personToMeet?: string;

    @ApiProperty({ example: 'DL-12345', required: false })
    @IsString()
    @IsOptional()
    idProof?: string;

    @ApiProperty({ example: 'ABC-123', required: false })
    @IsString()
    @IsOptional()
    vehicleNo?: string;
}
