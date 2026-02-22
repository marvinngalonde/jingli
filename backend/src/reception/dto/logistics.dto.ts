import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGatePassDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    guardianName: string;
}

export class CreateLateArrivalDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    reportedBy: string; // Parent/Self
}
