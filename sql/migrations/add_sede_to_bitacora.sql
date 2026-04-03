-- Agrega el campo 'sede' a la tabla de bitácora cívica.
-- Este script es solo referencia; la migración oficial se aplica vía TypeORM.
-- Para ejecutar manualmente en PostgreSQL:

ALTER TABLE civic_bitacora_civica
  ADD COLUMN IF NOT EXISTS sede VARCHAR(150) NULL;

COMMENT ON COLUMN civic_bitacora_civica.sede IS 'Lugar o sede donde se realizó la actividad';
