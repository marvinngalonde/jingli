import { IsString, IsOptional, IsInt, IsEnum, IsArray } from 'class-validator';

export class CreateVehicleDto {
    @IsString() regNumber: string;
    @IsString() @IsOptional() make?: string;
    @IsString() @IsOptional() model?: string;
    @IsInt() @IsOptional() year?: number;
    @IsInt() @IsOptional() capacity?: number;
    @IsString() @IsOptional() insuranceExpiry?: string;
    @IsString() @IsOptional() nextServiceDate?: string;
}

export class CreateRouteDto {
    @IsString() name: string;
    @IsString() @IsOptional() description?: string;
    @IsString() @IsOptional() vehicleId?: string;
    @IsString() @IsOptional() driverName?: string;
    @IsString() @IsOptional() startTime?: string;
    @IsString() @IsOptional() endTime?: string;
    @IsArray() @IsOptional() stops?: string[];
}

export class AssignStudentRouteDto {
    @IsString() studentId: string;
    @IsString() routeId: string;
    @IsString() @IsOptional() pickupPoint?: string;
    @IsString() @IsOptional() direction?: string;
}
