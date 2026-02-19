import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum FeeFrequency {
    MONTHLY = 'MONTHLY',
    TERM = 'TERM',
    ANNUAL = 'ANNUAL',
    ONE_TIME = 'ONE_TIME',
}

class FeeStructureItemDto {
    @ApiProperty({ example: 'fee-head-uuid' })
    @IsString()
    @IsNotEmpty()
    feeHeadId: string;

    @ApiProperty({ example: 100 })
    @IsNumber()
    @Min(0)
    amount: number;
}

export class CreateFeeStructureDto {
    @ApiProperty({ example: 'Term 1 Tuition & Fees' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'academic-year-uuid' })
    @IsString()
    @IsNotEmpty()
    academicYearId: string;

    @ApiProperty({ example: 'class-level-uuid' })
    @IsString()
    @IsNotEmpty()
    classLevelId: string;

    @ApiPropertyOptional({ example: 'fee-head-uuid' })
    @IsString()
    @IsOptional()
    feeHeadId?: string;

    @ApiProperty({ example: 5000 })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ enum: FeeFrequency, example: FeeFrequency.TERM })
    @IsEnum(FeeFrequency)
    @IsNotEmpty()
    frequency: FeeFrequency;

    @ApiPropertyOptional({ type: [FeeStructureItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FeeStructureItemDto)
    @IsOptional()
    items?: FeeStructureItemDto[];
}
