# 📋 Bitácora e Incidencias

Este módulo trackea el comportamiento y progreso del beneficiario en tiempo real.

## 1. Registrar Asistencia (`Bitácora`)

**Ruta:** `POST /civico/bitacora`

**Cuerpo:**
```json
{
  "expedienteId": "uuid...",
  "guiaId": 3,
  "actividadId": 12,
  "asistencia": "PRESENTE",
  "horasCubiertas": 4,
  "fechaActividad": "2026-04-06",
  "incidencia": "CONDUCTA_INAPROPIADA", // Opcional
  "detalleIncidencia": "Gritos durante el taller", // Obligatorio si hay incidencia
  "evidenciaUrl": "link_foto_drive..."
}
```

### 🤖 Automatización de Estatus
- **Horas**: Cada asistencia suma a `avanceHoras` en el expediente.
- **Graduación**: Al llegar al total de `horasSentencia`, el expediente cambia a `GRADUADO` **si y solo si** los formatos F1–F5 están cerrados.
- **Baja**: Si acumula **3 incidencias totales** (de cualquier tipo), el sistema cambia automáticamente el estatus a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`.

## 2. Consulta de Incidencias

Para mostrar el historial de mal comportamiento:

**Ruta:** `GET /civico/incidencias/expediente/:id`

**Respuesta:**
```json
[
  {
    "tipo": "FALTA_INJUSTIFICADA",
    "descripcionHechos": "No asistió al taller de mediación.",
    "fechaIncidencia": "2026-03-20",
    "esAcumulativa": true
  }
]
```

## 📊 Tips para el Front
- **Alertas**: Si el contador de incidencias llega a 2, muestra una advertencia visual al operador ("A 1 falta de la baja").
- **Evidencia**: Muestra las fotos de bitácora como previsualización en el listado de asistencias.
