-- Agrega el campo 'sede' a la tabla de bitácora cívica.
-- Ejecutar manualmente en la base de datos antes de desplegar la nueva versión del servicio.

ALTER TABLE civic_bitacora_civica
  ADD COLUMN sede VARCHAR(150) NULL COMMENT 'Lugar o sede donde se realizó la actividad';
