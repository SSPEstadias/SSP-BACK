import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSedeToBitacora1743638040000 implements MigrationInterface {
  name = 'AddSedeToBitacora1743638040000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "civic_bitacora_civica"
      ADD COLUMN IF NOT EXISTS "sede" character varying(150)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "civic_bitacora_civica"
      DROP COLUMN IF EXISTS "sede"
    `);
  }
}
