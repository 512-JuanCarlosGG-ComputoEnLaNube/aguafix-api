import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Body() createReportDto: CreateReportDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    if (!photo) {
      throw new BadRequestException(
        'La fotografía de la fuga (campo "photo") es obligatoria',
      );
    }
    return this.reportsService.create(createReportDto, photo);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }
}
