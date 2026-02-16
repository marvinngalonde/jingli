import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FeeType {
    RECURRING = 'RECURRING',
    ONE_TIME = 'ONE_TIME',
}

export class CreateFeeHeadDto {
    @ApiProperty({ example: 'Tuition Fee' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: FeeType, example: FeeType.RECURRING })
    @IsEnum(FeeType)
    @IsNotEmpty()
    type: string;
}
