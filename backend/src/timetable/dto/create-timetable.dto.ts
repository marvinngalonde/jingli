import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DayOfWeek {
    MON = 'MON',
    TUE = 'TUE',
    WED = 'WED',
    THU = 'THU',
    FRI = 'FRI',
    SAT = 'SAT',
    SUN = 'SUN',
}

export class CreateTimetableDto {
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

    @ApiProperty({ enum: DayOfWeek, example: 'MON' })
    @IsEnum(DayOfWeek)
    @IsNotEmpty()
    day: DayOfWeek;

    @ApiProperty({ example: '2023-01-01T08:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ example: '2023-01-01T09:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    endTime: string;

    @ApiProperty({ example: 'Room 101', required: false })
    @IsString()
    @IsOptional()
    roomNo?: string;
}
