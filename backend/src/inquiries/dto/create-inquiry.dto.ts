import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInquiryDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    applicantName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    parentName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    targetClass: string;

    @ApiProperty({ default: 'APPLIED' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    notes?: string;

    schoolId?: string;
}
