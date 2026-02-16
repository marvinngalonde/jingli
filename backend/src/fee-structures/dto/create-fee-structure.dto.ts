import { IsString, IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FeeFrequency {
    MONTHLY = 'MONTHLY',
    TERM = 'TERM',
    ANNUAL = 'ANNUAL',
    ONE_TIME = 'ONE_TIME',
}

export class CreateFeeStructureDto {
    @ApiProperty({ example: 'academic-year-uuid' })
    @IsString()
    @IsNotEmpty()
    academicYearId: string;

    @ApiProperty({ example: 'class-level-uuid' })
    @IsString()
    @IsNotEmpty()
    classLevelId: string;

    @ApiProperty({ example: 'fee-head-uuid' })
    @IsString()
    @IsNotEmpty()
    feeHeadId: string;

    @ApiProperty({ example: 5000 })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ enum: FeeFrequency, example: FeeFrequency.TERM })
    @IsEnum(FeeFrequency)
    @IsNotEmpty()
    frequency: FeeFrequency;
}
