import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export class CreateEventDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    @IsEnum(['HOLIDAY', 'EXAM', 'SPORTS', 'GENERAL'])
    type?: string;

    @IsBoolean()
    @IsOptional()
    allDay?: boolean;
}
