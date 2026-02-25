import { IsString, IsOptional, IsNumber, IsInt, IsDateString, IsEnum } from 'class-validator';

export class CreateAssetCategoryDto {
    @IsString() name: string;
    @IsString() @IsOptional() description?: string;
}

export class CreateAssetDto {
    @IsString() categoryId: string;
    @IsString() name: string;
    @IsString() @IsOptional() serialNo?: string;
    @IsString() @IsOptional() location?: string;
    @IsDateString() @IsOptional() purchaseDate?: string;
    @IsNumber() @IsOptional() purchasePrice?: number;
    @IsString() @IsOptional() condition?: string;
    @IsInt() @IsOptional() quantity?: number;
    @IsString() @IsOptional() notes?: string;
}

export class UpdateAssetDto {
    @IsString() @IsOptional() name?: string;
    @IsString() @IsOptional() categoryId?: string;
    @IsString() @IsOptional() serialNo?: string;
    @IsString() @IsOptional() location?: string;
    @IsString() @IsOptional() condition?: string;
    @IsInt() @IsOptional() quantity?: number;
    @IsString() @IsOptional() notes?: string;
}
