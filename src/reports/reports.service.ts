import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import { generateReportTemplate } from './templates/report.template';
import { envs } from '../config/envs';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createReportDto: CreateReportDto,
    photo: Express.Multer.File,
  ): Promise<Report> {
    if (!photo) {
      throw new BadRequestException(
        'La fotografía de la fuga (campo "photo") es obligatoria',
      );
    }

    const photoUrl = await this.storageService.uploadFile(photo, 'reports/');

    const report = this.reportRepository.create({
      address: createReportDto.address,
      description: createReportDto.description,
      severity: createReportDto.severity,
      reporterPhone: createReportDto.reporterPhone,
      photoUrl,
    });

    const savedReport = await this.reportRepository.save(report);
    this.logger.log(`Report #${savedReport.id} successfully created`);

    // Enviar notificación a la cuadrilla de mantenimiento
    const htmlContent = generateReportTemplate(createReportDto, photoUrl);
    const subject = `[ALERTA FUGA #${savedReport.id}] Reporte de fuga en vía pública - Severidad: ${savedReport.severity.toUpperCase()}`;

    try {
      await this.emailService.sendEmail(
        envs.MAINTENANCE_EMAIL,
        subject,
        htmlContent,
      );
      this.logger.log(
        `Maintenance notification email sent for Report #${savedReport.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send maintenance email for Report #${savedReport.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return savedReport;
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
