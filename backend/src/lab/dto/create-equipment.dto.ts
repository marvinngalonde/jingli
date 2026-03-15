import { IsString, IsNumber, IsEnum } from 'class-validator';
import { AssetCondition } from '@prisma/client';

export class CreateEquipmentDto {
  @IsString()
  name: string;

  @IsString()
  categoryName: string;

  @IsNumber()
  quantity: number;

  @IsEnum(['NEW', 'GOOD', 'FAIR', 'POOR', 'BROKEN', 'DISPOSED'])
  condition: AssetCondition;
}
