import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWaterReportTable1710000000002 implements MigrationInterface {
  name = 'CreateWaterReportTable1710000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "WATER_REPORT" (
        "id" SERIAL NOT NULL,
        "address" character varying NOT NULL,
        "description" text NOT NULL,
        "severity" character varying NOT NULL,
        "reporterPhone" character varying NOT NULL,
        "isResolved" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_water_report_id" PRIMARY KEY ("id")
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "WATER_REPORT"`);
  }
}
