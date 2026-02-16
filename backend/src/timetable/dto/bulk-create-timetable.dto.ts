import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTimetableDto } from './create-timetable.dto';

export class BulkCreateTimetableDto {
    @ApiProperty({ type: [CreateTimetableDto] })
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateTimetableDto)
    entries: CreateTimetableDto[];
}
