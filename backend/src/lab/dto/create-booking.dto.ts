import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  sectionId: string;

  @IsString()
  subjectId: string;

  @IsDateString()
  date: string | Date;

  @IsDateString()
  startTime: string | Date;

  @IsDateString()
  endTime: string | Date;

  @IsString()
  @IsOptional()
  experiment?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
