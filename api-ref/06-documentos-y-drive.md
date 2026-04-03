# 📂 Documentos y Google Drive

El sistema de generación de documentos PDF está integrado directamente con Google Drive y utiliza un **modelo híbrido** para mayor flexibilidad.

## 1. El Modelo Híbrido (`GET` vs `POST`)

Muchos endpoints de documentos (como `/lista-asistencia` o `/oficio-incorporacion`) soportan dos métodos HTTP con comportamientos distintos:

### ✅ Método `GET` (Previsualización)
**Propósito**: Generar el PDF al vuelo para imprimirlo o revisarlo **sin guardarlo** en el servidor ni en Drive.
- **Uso**: Se usa para plantillas en blanco o consultas rápidas.
- **Drive**: No sube nada a la nube.
- **Parámetros**: Se pasan por la URL (ej: `/lista-asistencia/:expedienteId`).

### ✅ Método `POST` (Registro y Persistencia)
**Propósito**: Generar el PDF, guardarlo en la base de datos como un `OficioGenerado` y **subirlo automáticamente** a Google Drive.
- **Uso**: Se usa para registros oficiales (ej: "Confirmar asistencia", "Finalizar reporte semanal").
- **Drive**: El archivo se guarda en la carpeta del beneficiario con un **nombre incremental** (ej: `REPORTE 1`, `REPORTE 2`).
- **Parámetros**: Se pasan en el cuerpo del JSON.

## 2. Paquete Federal (Consolidado)

Para el trámite federal, el front no tiene que hacer 7 llamadas. Usa este endpoint:

**Ruta:** `GET /civico/documentos/expediente/:id/paquete-forms`

**Respuesta:**
```json
{
  "documentos": {
    "oficioCanalizacion": "https://drive...",
    "oficioIncorporacion": "https://drive...",
    "cedulaInicial": "https://drive...",
    "planTrabajo": "https://drive...",
    "planVida": "https://drive...",
    "reporteDeInstancia": "https://drive..."
  },
  "fotosEvidencia": ["url1", "url2"],
  "estatusCierre": {
    "horasCumplidas": 24,
    "estatusActual": "GRADUADO"
  }
}
```

## 3. Lista de Asistencia

### ✅ `GET /civico/documentos/lista-asistencia/:expedienteId`
Genera una plantilla PDF en blanco para impresión. No guarda nada en BD ni Drive.

**Roles:** Admin, Guia, TrabajoSocial, Psicologo

### ✅ `POST /civico/documentos/lista-asistencia`
Registra la asistencia en la bitácora, actualiza avance de horas, sube el PDF a Drive y lo devuelve.

**Roles:** Admin, Guia

**Cuerpo:**
```json
{
  "expedienteId": "{{EXPEDIENTE_UUID}}",
  "fecha": "2026-04-06",
  "horasCubiertas": 4,
  "asistencia": "PRESENTE",
  "horario": "08:00 - 12:00",
  "sede": "Sede Central",
  "actividadNombre": "Taller de Valores",
  "observaciones": "Asistencia puntual."
}
```

> [!NOTE]
> Si envías `actividadId` (número entero del catálogo), tiene prioridad sobre `actividadNombre`.  
> El campo `sede` se persiste en `civic_bitacora_civica`. Requiere que la columna exista en BD (ver migración `1743638040000-AddSedeToBitacora`).

---

Para subir documentos que el beneficiario entregó ya firmados físicamente:

**Ruta:** `POST /civico/documentos/subir-escaneado`
**Tipo:** `multipart/form-data`

| Campo | Tipo | Valor |
| :--- | :--- | :--- |
| `expedienteId` | UUID | El ID del expediente. |
| `tipo` | String | `CANALIZACION` o `INCORPORACION`. |
| `file` | File | El archivo PDF binario. |

---
> [!TIP]
> **Auto-sanación**: El backend detecta si una carpeta en Drive fue borrada o movida a la papelera. En la siguiente subida, el sistema la recreará automáticamente manteniendo el ID actualizado en la BD.
