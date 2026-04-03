-- ────────────────────────────────────────────────────────────────────────────
-- Script para reiniciar la numeración de folios a 0001/AÑO
-- Ejecutar con cuidado: elimina todos los registros de oficios_generados del
-- tipo indicado para que el sistema recalcule desde 1.
-- ────────────────────────────────────────────────────────────────────────────

-- ① Reiniciar oficios oficiales SSyPC (canalización, incorporación, etc.)
-- NOTA: El sistema arranca por defecto en 0020 para el prefijo SSyPC.
-- Para empezar desde 0001, también es necesario quitar la línea de código:
--   `if (prefix.includes('SSyPC')) nextNum = 20;`
DELETE FROM civic_oficios_generados
WHERE folio_oficio LIKE 'SSyPC/SPRS/DGPDyPC/%/2026';

-- ② Reiniciar Listas de Asistencia de un expediente específico
-- (reemplazar <EXPEDIENTE_UUID> por el UUID real)
-- DELETE FROM civic_oficios_generados
-- WHERE expediente_id = '<EXPEDIENTE_UUID>'
--   AND tipo_documento = 'LISTA_ASISTENCIA';

-- ③ Reiniciar Reportes Semanales de un expediente específico
-- DELETE FROM civic_oficios_generados
-- WHERE expediente_id = '<EXPEDIENTE_UUID>'
--   AND tipo_documento = 'REPORTE_SEMANAL_GUIA';
