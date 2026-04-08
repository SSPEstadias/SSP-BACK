# 📋 Bitácora e Incidencias

Este módulo controla el avance de horas y el comportamiento del beneficiario en tiempo real.

---

## 1.   Registrar Asistencia + PDF + Drive (Endpoint Oficial)

> [!IMPORTANT]
> **`POST /civico/documentos/lista-asistencia`** es el endpoint oficial para registrar asistencia.  
> Hace todo en un paso: guarda en BD, actualiza `avanceHoras` en el expediente, sube el PDF a Drive y lo devuelve.

**Roles:** Admin, Guia

### Todos los campos:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID |  * | UUID del expediente. **Sin él**: solo genera PDF sin guardar. |
| `fecha` | `YYYY-MM-DD` |   | Fecha de la actividad |
| `horasCubiertas` | number |   | Horas de la sesión (máx 8, mín 0) |
| `asistencia` | Enum |   | `PRESENTE` / `PRESENTE_PARCIAL` / `FALTA_JUSTIFICADA` / `FALTA_INJUSTIFICADA` |
| `horario` | string |   | Rango de tiempo: `"08:00 - 12:00"` |
| `sede` | string | ❌ | Lugar donde se realizó la actividad |
| `actividadId` | number | ❌ | ID del catálogo de actividades (tiene prioridad sobre `actividadNombre`) |
| `actividadNombre` | string | ❌ | Nombre libre si no hay `actividadId` |
| `observaciones` | string | ❌ | Notas del guía |

### Payload de ejemplo:
```json
{
  "expedienteId": "8c478ea9-fbcb-452d-90f6-e689a2590fd6",
  "fecha": "2026-04-07",
  "horasCubiertas": 4,
  "asistencia": "PRESENTE",
  "horario": "08:00 - 12:00",
  "sede": "Sede Central",
  "actividadNombre": "Taller de Valores",
  "observaciones": "Asistencia puntual. Participación activa."
}
```

**Respuesta:** PDF (`application/pdf`). El frontend debe manejarlo como `Blob`.

---

## 2. Registrar Asistencia Directamente en Bitácora — `POST /civico/bitacora`

Para registrar asistencia sin generar PDF (solo BD, más rápido):

**Roles:** Admin, Guia

### Todos los campos:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID |   | UUID del expediente |
| `guiaId` | number |   | ID del guía (usuario con rol `guia`) |
| `fechaActividad` | `YYYY-MM-DD` |   | Fecha de la actividad |
| `horasCubiertas` | decimal |   | Horas (ej. `4.5`, máx `8`) |
| `asistencia` | Enum |   | Ver tabla de estados abajo |
| `actividadId` | number | ❌ | ID del catálogo de actividades |
| `sede` | string | ❌ | Lugar de la actividad |
| `incidencia` | Enum | ❌ | Tipo de incidencia (ver tabla abajo) |
| `detalleIncidencia` | string | ❌* | Obligatorio si hay incidencia |
| `observaciones` | string | ❌ | Notas del guía |
| `evidenciaUrl` | string | ❌ | URL de Drive con foto de evidencia |

### Tabla de estados de asistencia:

| Valor | Suma horas | Genera incidencia |
| :--- | :---: | :---: |
| `PRESENTE` |   Suma | ❌ No |
| `PRESENTE_PARCIAL` |   Suma parcial | ⚠️ Opcional |
| `FALTA_JUSTIFICADA` | ❌ No suma | ❌ No (no es strike) |
| `FALTA_INJUSTIFICADA` | ❌ No suma |   Sí (es strike) |

### Tabla de tipos de incidencia:

| Valor | Acumulativa (strike) | Descripción |
| :--- | :---: | :--- |
| `FALTA_INJUSTIFICADA` |   | No asistió sin justificación |
| `RETARDO` |   | Llegó tarde sin justificación |
| `CONDUCTA_INAPROPIADA` |   | Comportamiento inadecuado |
| `INCUMPLIMIENTO_TAREA` |   | No completó las asignaciones |
| `RETIRO_ANTICIPADO` |   | Se fue antes de terminar |
| `INASISTENCIA_JUSTIFICADA` | ❌ | Falta con justificación válida |
| `VISITA_DOMICILIARIA` | ❌ | Registro informativo |
| `CONVERSATORIO` | ❌ | Registro informativo de seguimiento |

### Payload — Falta injustificada (strike):
```json
{
  "expedienteId": "8c478ea9-fbcb-452d-90f6-e689a2590fd6",
  "guiaId": 4,
  "fechaActividad": "2026-04-09",
  "actividadId": 1,
  "horasCubiertas": 0,
  "asistencia": "FALTA_INJUSTIFICADA",
  "incidencia": "FALTA_INJUSTIFICADA",
  "detalleIncidencia": "No se presentó sin aviso previo ni justificación.",
  "observaciones": "1ª falta injustificada."
}
```

---

## 3. Calcular Horas — `GET /civico/bitacora/expediente/:id/horas`

**Roles:** Todos

**Respuesta:**
```json
{
  "horasAcumuladas": 36.5,
  "horasSentencia": 48,
  "porcentajeAvance": 76.04
}
```

---

## 4. Plantilla en Blanco (sin persistencia) — `GET /civico/documentos/lista-asistencia/:expedienteId`

Genera un PDF vacío para imprimir y llenar a mano. No guarda nada en BD ni Drive.

**Roles:** Admin, Guia, TrabajoSocial, Psicologo

---

## 5. Incidencias Manuales — `POST /civico/incidencias`

Para registrar incidencias que ocurren fuera de una actividad programada:

**Roles:** Admin, Guia

### Campos:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID |   | UUID del expediente |
| `guiaId` | number |   | ID del guía |
| `tipo` | Enum |   | Tipo de incidencia (ver tabla arriba) |
| `fechaIncidencia` | `YYYY-MM-DD` |   | Fecha del evento |
| `descripcionHechos` | string | ❌ | Descripción detallada |
| `esAcumulativa` | boolean | ❌ | Si suma al contador de strikes |
| `estatusResolucion` | `PENDIENTE`/`RESUELTA`/`DERIVO_EN_BAJA` | ❌ | Estado inicial |
| `numOficioNotificacion` | string | ❌ | Número de oficio al juzgado |

```json
{
  "expedienteId": "8c478ea9-fbcb-452d-90f6-e689a2590fd6",
  "guiaId": 4,
  "tipo": "CONDUCTA_INAPROPIADA",
  "fechaIncidencia": "2026-04-16",
  "descripcionHechos": "Utilizó lenguaje ofensivo hacia el personal del programa.",
  "esAcumulativa": true,
  "estatusResolucion": "PENDIENTE"
}
```

---

## 6. Sistema de Strikes — `GET /civico/incidencias/expediente/:id/strikes`

**Roles:** Todos

**Respuesta:**
```json
{
  "strikes": 2,
  "limite": 3,
  "enRiesgo": true,
  "bajaActivada": false
}
```

> [!WARNING]
> **RF-013 — Baja Automática**: Al llegar a 3 strikes (`bajaActivada: true`), el expediente cambia automáticamente a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`. No hay forma de revertirlo sin intervención directa en BD.

### Lógica de UI recomendada:
- `strikes = 0` → indicador verde
- `strikes = 1` → amarillo
- `strikes = 2` → naranja + alerta `"¡A 1 falta de la baja!"`
- `bajaActivada = true` → rojo + badge `"BAJA APLICADA"`

---

## 7. Resolver una Incidencia — `PATCH /civico/incidencias/:id/resolver`

**Roles:** Admin, Guia

```json
{ "numOficioNotificacion": "OFC-2026-089" }
```

O sin oficio: `{ "numOficioNotificacion": null }`

---

## 8. Automatizaciones del Sistema

-   Cada asistencia suma a `avanceHoras` del expediente automáticamente.
-   Al llegar a `horasSentencia`, el expediente pasa a `GRADUADO` si los formatos están cerrados.
-   A la 3ª incidencia acumulativa → `BAJA_POR_ACUMULACION_DE_INCIDENCIAS` automáticamente.
-   El campo `sede` se persiste en `civic_bitacora_civica.sede` (columna creada en migración `1743638040000-AddSedeToBitacora`).
