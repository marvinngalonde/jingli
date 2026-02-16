import { PartialType } from '@nestjs/swagger';
import { CreateVisitorDto } from './create-visitor.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VisitorStatus } from './create-visitor.dto';

export class UpdateVisitorDto extends PartialType(CreateVisitorDto) {
    @ApiProperty({ enum: VisitorStatus, required: false })
    @IsEnum(VisitorStatus)
    @IsOptional()
    status?: VisitorStatus;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    exitTime?: string;
}
