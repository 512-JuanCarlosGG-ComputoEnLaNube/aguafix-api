import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoUrlToWaterReportTable1710000000003 implements MigrationInterface {
  name = 'AddPhotoUrlToWaterReportTable1710000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "WATER_REPORT" ADD "photoUrl" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "WATER_REPORT" ALTER COLUMN "photoUrl" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "WATER_REPORT" DROP COLUMN "photoUrl"`,
    );
  }
}
