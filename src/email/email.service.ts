import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { envs } from '../config/envs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly transporter = nodemailer.createTransport({
    service: envs.MAILER_SERVICE,
    auth: {
      user: envs.MAILER_USER,
      pass: envs.MAILER_PASSWORD,
    },
  });

  async sendEmail(to: string, subject: string, template: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: envs.MAILER_USER,
        to,
        subject,
        html: template,
      });
      this.logger.log(`Email successfully sent to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${to}: ${error.message}`);
      throw error;
    }
  }
}
