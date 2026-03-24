import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds HOJA_PRESENTACION and PLAN_VIDA to the PostgreSQL enum
 * civic_oficios_generados_tipo_documento_enum.
 *
 * NOTE: In PostgreSQL, ALTER TYPE ... ADD VALUE cannot be run inside a
 * transaction block.  TypeORM migrations wrap everything in a transaction by
 * default, so we disable that here with `transaction = false`.
 */
export class AddHojaPresentacionPlanVidaEnum1743000000000
  implements MigrationInterface
{
  // Must be outside a transaction – ADD VALUE is not transactional in PG.
  public transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    // IF NOT EXISTS is available from PostgreSQL 9.6+ and prevents errors
    // when the migration is accidentally run a second time.
    await queryRunner.query(`
      ALTER TYPE "civic_oficios_generados_tipo_documento_enum"
        ADD VALUE IF NOT EXISTS 'HOJA_PRESENTACION';
    `);
    await queryRunner.query(`
      ALTER TYPE "civic_oficios_generados_tipo_documento_enum"
        ADD VALUE IF NOT EXISTS 'PLAN_VIDA';
    `);
  }

  // PostgreSQL does not support removing enum values, so down() is a no-op.
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Cannot remove enum values from PostgreSQL without recreating the type.
  }
}
