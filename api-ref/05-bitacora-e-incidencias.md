# 📋 Bitácora e Incidencias

Este módulo trackea el comportamiento y progreso del beneficiario en tiempo real.

## 1. Registrar Asistencia + Generar PDF (Endpoint Principal)

> [!IMPORTANT]
> El endpoint oficial para registrar asistencia **no es** `/civico/bitacora`. Usa el endpoint de documentos que guarda en BD, sube a Drive y genera el PDF en un solo paso.

**Ruta:** `POST /civico/documentos/lista-asistencia`  
**Roles:** `Admin`, `Guia`

**Cuerpo:**
```json
{
  "expedienteId": "e92b7bc0-6e59-4978-b443-2a538f1d0204",
  "fecha": "2026-04-06",
  "horasCubiertas": 4,
  "asistencia": "PRESENTE",
  "horario": "08:00 - 12:00",
  "sede": "Sede Central",
  "actividadNombre": "Taller de Valores",
  "observaciones": "Asistencia puntual."
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `expedienteId` | UUID | ✅ | Activa persistencia en BD y Drive. Sin él, solo genera PDF genérico. |
| `fecha` | `YYYY-MM-DD` | ✅ | Fecha de la actividad. |
| `horasCubiertas` | number | ✅ | Horas de la sesión (máx. recomendado: 8). |
| `asistencia` | Enum | ✅ | `PRESENTE` / `PRESENTE_PARCIAL` / `FALTA_INJUSTIFICADA` |
| `horario` | string | ✅ | Rango de tiempo, ej. `"08:00 - 12:00"`. |
| `sede` | string | ⚠️ opcional | Lugar donde se realizó la actividad, ej. `"Sede Central"`. |
| `actividadId` | number | ⚠️ opcional | ID del catálogo de actividades (tiene prioridad sobre `actividadNombre`). |
| `actividadNombre` | string | ⚠️ opcional | Nombre libre si no hay `actividadId`. |
| `observaciones` | string | ⚠️ opcional | Notas del guía. |

**Respuesta:** Devuelve el PDF de lista de asistencia como `application/pdf`.

### 🤖 Automatización de Estatus
- **Horas**: Cada asistencia suma a `avanceHoras` en el expediente automáticamente.
- **Graduación**: Al llegar al total de `horasSentencia`, el expediente cambia a `GRADUADO` **si y solo si** los formatos F1–F5 están cerrados.
- **Baja**: Si acumula **3 incidencias totales** (de cualquier tipo), el sistema cambia automáticamente el estatus a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`.

---

## 2. Plantilla en Blanco (Sin Persistencia)

Para imprimir una plantilla vacía sin guardar nada:

**Ruta:** `GET /civico/documentos/lista-asistencia/:expedienteId`  
**Roles:** `Admin`, `Guia`, `TrabajoSocial`, `Psicologo`

---

## 3. Consulta de Incidencias

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
- **Sede**: Carga la lista de sedes desde un catálogo o permite texto libre; el campo se persiste en `civic_bitacora_civica.sede`.
- **Evidencia**: Muestra las fotos de bitácora como previsualización en el listado de asistencias.
