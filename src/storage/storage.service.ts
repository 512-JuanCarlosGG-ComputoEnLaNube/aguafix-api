import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { envs } from '../config/envs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    this.region = envs.AWS_REGION;
    this.bucketName = envs.AWS_S3_BUCKET;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: envs.AWS_ACCESS_KEY_ID,
        secretAccessKey: envs.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const sanitizedFileName = file.originalname.replace(/\s+/g, '-');
    const key = `${cleanFolder}/${randomUUID()}-${sanitizedFileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      this.logger.log(`File uploaded successfully to S3: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to S3 bucket "${this.bucketName}": ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        'Error al subir la fotografía al almacenamiento en la nube (S3)',
      );
    }
  }
}
