import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    EXCUSED = 'EXCUSED',
}

export class CreateAttendanceDto {
    @ApiProperty({ example: 'student-uuid-123' })
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @ApiProperty({ example: '2023-10-27T00:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ enum: AttendanceStatus, example: 'PRESENT' })
    @IsEnum(AttendanceStatus)
    @IsNotEmpty()
    status: AttendanceStatus;

    @ApiProperty({ example: 'Late due to traffic', required: false })
    @IsString()
    @IsOptional()
    remarks?: string;

    @ApiProperty({ example: 'user-uuid-recorder', description: 'ID of the user recording this entry' })
    @IsString()
    @IsNotEmpty()
    recordedBy: string;
}
