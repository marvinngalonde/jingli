import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoticeDto {
    @ApiProperty({ example: 'Holiday Announcement' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'School will be closed on Friday.' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ example: 'ALL' })
    @IsString()
    @IsNotEmpty()
    targetAudience: string;

    @ApiProperty({ example: 'user-uuid-poster' })
    @IsString()
    @IsNotEmpty()
    postedBy: string;

    @ApiProperty({ example: 'school-uuid' })
    @IsString()
    @IsNotEmpty()
    schoolId: string;

    @ApiProperty({ required: false, example: '2023-12-31T23:59:59.000Z' })
    @IsDateString()
    @IsOptional()
    expiresAt?: string;
}
