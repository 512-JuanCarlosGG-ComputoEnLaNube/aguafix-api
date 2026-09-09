import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ReportSeverity, {
    message: 'severity debe ser low, medium o high',
  })
  @IsNotEmpty()
  severity: ReportSeverity;

  @IsString()
  @IsNotEmpty()
  reporterPhone: string;
}
