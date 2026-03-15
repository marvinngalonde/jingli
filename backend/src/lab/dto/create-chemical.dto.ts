import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateChemicalDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  formula?: string;

  @IsNumber()
  volume: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  hazardLevel?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string | Date;
}
