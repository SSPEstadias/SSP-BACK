# 📄 Documentos, PDFs y Google Drive

Todos los PDFs se generan con Handlebars y se suben automáticamente a Google Drive en la carpeta del beneficiario.

---

## 1. Resumen de Endpoints de Documentos

| Endpoint | Método | Roles | Descripción |
| :--- | :---: | :--- | :--- |
| `/civico/documentos/oficio-incorporacion/:expedienteId` | GET | Admin, T.Social | Oficio de Incorporación |
| `/civico/documentos/oficio-conclusion/:expedienteId` | GET | Admin, T.Social | Oficio de Conclusión |
| `/civico/documentos/informe-baja/:expedienteId` | GET | Admin, T.Social | Informe de Baja Definitiva |
| `/civico/documentos/ficha-incidencias/:expedienteId` | GET | Admin, Guia, T.Social, Psicólogo | Ficha Técnica de Incidencias |
| `/civico/documentos/f3-plan-trabajo/:expedienteId` | GET | Admin, T.Social, Psicólogo | F3 — Plan de Trabajo |
| `/civico/documentos/f4-cedula-inicial/:expedienteId` | GET | Admin, T.Social, Psicólogo | F4 — Cédula Inicial |
| `/civico/documentos/plan-vida/:expedienteId` | GET | Admin, Psicólogo | Plan de Vida (desde F1) |
| `/civico/documentos/nota-evolucion/:expedienteId` | GET | Admin, Psicólogo | Nota de Evolución Psicológica |
| `/civico/documentos/lista-asistencia/:expedienteId` | GET | Admin, Guia, T.Social, Psicólogo | Plantilla vacía para imprimir |
| `/civico/documentos/lista-asistencia` | POST | Admin, Guia | ✅ Registrar asistencia + PDF |
| `/civico/documentos/reporte-semanal/:expedienteId` | GET | Admin, Guia, T.Social, Psicólogo | Plantilla reporte semanal |
| `/civico/documentos/reporte-semanal` | POST | Admin, Guia | Registrar reporte semanal + PDF |
| `/civico/documentos/historial/:expedienteId` | GET | Todos | Historial de documentos generados |
| `/civico/documentos/expediente/:id/paquete-forms` | GET | Admin, T.Social, Psicólogo | URLs de Drive para Google Form Federal |
| `/civico/documentos/subir-escaneado` | POST | Admin, T.Social | Subir documento firmado a Drive |
| `/civico/documentos/generar-custom` | POST | Admin | PDF de prueba con cualquier template |

---

## 2. Todos los GET generan PDF directamente

Los endpoints GET devuelven `application/pdf` directamente. **No guardas nada, solo descargas el PDF.**  
Si necesitas que quede en Drive, usa el POST correspondiente (lista-asistencia, reporte-semanal) o el endpoint de subida de escaneados.

```typescript
// Angular — cómo consumir un GET que devuelve PDF
this.http.get(`/civico/documentos/plan-vida/${uuid}`, {
  responseType: 'blob',
  headers: { Authorization: `Bearer ${token}` }
}).subscribe(blob => {
  const url = URL.createObjectURL(blob);
  window.open(url); // abre el PDF en nueva pestaña
});
```

---

## 3. Lista de Asistencia — POST

### ✅ `POST /civico/documentos/lista-asistencia`
Registra asistencia + actualiza horas + sube a Drive + devuelve PDF.

**Roles:** Admin, Guia

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID | ✅* | Sin él: PDF genérico sin guardar |
| `fecha` | `YYYY-MM-DD` | ✅ | Fecha de la actividad |
| `horasCubiertas` | number | ✅ | Horas (0–8) |
| `asistencia` | Enum | ✅ | `PRESENTE` / `PRESENTE_PARCIAL` / `FALTA_JUSTIFICADA` / `FALTA_INJUSTIFICADA` |
| `horario` | string | ✅ | Rango: `"08:00 - 12:00"` |
| `sede` | string | ❌ | Lugar de la actividad |
| `actividadId` | number | ❌ | ID del catálogo (prioridad sobre `actividadNombre`) |
| `actividadNombre` | string | ❌ | Nombre libre |
| `observaciones` | string | ❌ | Notas del guía |

```json
{
  "expedienteId": "8c478ea9-fbcb-452d-90f6-e689a2590fd6",
  "fecha": "2026-04-07",
  "horasCubiertas": 4,
  "asistencia": "PRESENTE",
  "horario": "08:00 - 12:00",
  "sede": "Sede Central",
  "actividadNombre": "Taller de Valores",
  "observaciones": "Asistencia puntual."
}
```

---

## 4. Reporte Semanal — POST

### ✅ `POST /civico/documentos/reporte-semanal`
Registra reporte en Drive + devuelve PDF.

**Roles:** Admin, Guia

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID | ✅* | Sin él: PDF genérico |
| `semanaNumero` | number | ❌ | Número de semana |
| `fechaInicio` | `YYYY-MM-DD` | ❌ | Inicio de la semana |
| `fechaFin` | `YYYY-MM-DD` | ❌ | Fin de la semana |
| `observaciones` | string | ❌ | Observaciones generales |
| `renglones` | array | ❌ | Registros por día (ver abajo) |

### Estructura de `renglones`:
```json
[
  { "fecha": "2026-04-06", "asistencia": "P", "descripcion": "Taller de Mediación" },
  { "fecha": "2026-04-07", "asistencia": "P", "descripcion": "Servicio Comunitario" },
  { "fecha": "2026-04-08", "asistencia": "F", "descripcion": "Falta injustificada" }
]
```

Payload completo:
```json
{
  "expedienteId": "8c478ea9-fbcb-452d-90f6-e689a2590fd6",
  "semanaNumero": 1,
  "fechaInicio": "2026-04-06",
  "fechaFin": "2026-04-10",
  "observaciones": "Semana productiva, completó todas sus actividades.",
  "renglones": [
    { "fecha": "2026-04-06", "asistencia": "P", "descripcion": "Taller de Mediación" },
    { "fecha": "2026-04-07", "asistencia": "P", "descripcion": "Servicio Comunitario" },
    { "fecha": "2026-04-08", "asistencia": "P", "descripcion": "Sesión Psicológica" }
  ]
}
```

---

## 5. Subir Documento Escaneado — `POST /civico/documentos/subir-escaneado`

Para subir la versión firmada del Oficio de Canalización o de Incorporación.

**Roles:** Admin, TrabajoSocial  
**Content-Type:** `multipart/form-data`

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID | ✅ | UUID del expediente |
| `tipo` | `CANALIZACION` / `INCORPORACION` | ✅ | Tipo de documento |
| `file` | binary | ✅ | Archivo PDF o imagen |

> ⚠️ En Angular, **no pongas `Content-Type` manualmente** — el `HttpClient` lo agrega con el `boundary` correcto al detectar `FormData`.

---

## 6. Paquete Federal — `GET /civico/documentos/expediente/:id/paquete-forms`

Consolida las URLs de Drive de todos los documentos para el Google Form Federal.

**Roles:** Admin, T.Social, Psicólogo

**Respuesta:**
```json
{
  "f3PlanTrabajoUrl": "https://drive.google.com/...",
  "f4CedulaInicialUrl": "https://drive.google.com/...",
  "planVidaUrl": "https://drive.google.com/...",
  "reporteSemanalUrl": "https://drive.google.com/...",
  "oficioCanalizacionFirmadoUrl": "https://drive.google.com/...",
  "oficioIncorporacionFirmadoUrl": "https://drive.google.com/..."
}
```

---

## 7. Historial de Documentos — `GET /civico/documentos/historial/:expedienteId`

Lista todos los documentos generados para un expediente.

**Roles:** Todos

**Respuesta:**
```json
[
  {
    "id": 1,
    "expedienteId": "8c478ea9-...",
    "tipoOficio": "INCORPORACION",
    "folioOficio": "INC-2026-0001",
    "driveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "driveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view",
    "creadoEn": "2026-04-07T10:00:00.000Z"
  }
]
```

---

## 8. PDF de Prueba — `POST /civico/documentos/generar-custom`

**Roles:** Solo Admin  
Para probar templates sin un expediente real.

```json
{
  "template": "oficio_incorporacion",
  "datos": {
    "folioOficio": "OFC-TEST-001",
    "nombreBeneficiario": "JUAN PÉREZ LÓPEZ",
    "curp": "PELJ000101HOFRNN01"
  }
}
```
