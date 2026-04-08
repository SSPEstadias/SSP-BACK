# 📝 Formatos F1 a F5 — JSONB Detallado

Esta guía documenta todos los campos de cada formato y las reglas de negocio críticas.

---

## ⚠️ Reglas Generales de los Formatos

- **Relación 1:1**: Cada expediente tiene exactamente **un** F1, un F2, un F3 y un F4. El F5 permite múltiples sesiones.
- **Candado RF-008**: No se puede crear el F3 si el F1 y el F2 no están en estado `COMPLETADO`.
- **Estados válidos de todos los formatos:** `PENDIENTE` · `EN_PROCESO` · `COMPLETADO` · `CERRADO`
- **IDs de usuario**: `psicologoId`, `trabajadorSocialId` y `coordinadorId` son los IDs numéricos de la tabla `users` (ver `GET /users`).

---

## F1 — Entrevista Clínica Inicial

**Endpoint:** `POST /civico/f1`  
**Roles:** Admin, Psicólogo

### Campos escalares:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID |   | UUID del expediente |
| `psicologoId` | number |   | ID del psicólogo (de `GET /users`) |
| `fechaEntrevista` | `YYYY-MM-DD` | ❌ | Fecha de la sesión |
| `consentimientoInformado` | boolean | ❌ | El beneficiario firmó consentimiento |
| `riesgoSuicida` | boolean | ❌ | Si hay ideación suicida activa |
| `consumeSustancias` | boolean | ❌ | Si consume alcohol u otras sustancias |
| `padeceEnfermedadCronica` | boolean | ❌ | Si tiene enfermedad crónica |
| `necesitaApoyoPsicologico` | boolean | ❌ | Si requiere seguimiento psicológico |
| `motivoConsulta` | string | ❌ | Motivo de derivación al programa |
| `antecedentesClinicos` | string | ❌ | Historial clínico relevante |
| `examenMental` | string | ❌ | Descripción del examen mental |
| `impresionDiagnostica` | string | ❌ | Diagnóstico clínico (CIE-10 sugerido) |
| `estatusF1` | Enum | ❌ | Estado del formulario (default: `PENDIENTE`) |

### Campos JSONB — Estructura recomendada:

**`generalesEntrevista`** — datos generales del beneficiario en la entrevista:
```json
{
  "escolaridad": "Licenciatura incompleta",
  "ocupacion": "Estudiante",
  "estadoCivil": "Soltero"
}
```

**`situacionJuridicaF1`** — datos legales tal como los reporta el beneficiario:
```json
{
  "causa": "CP-2025-AX-099",
  "juzgado": "JCM-01",
  "horasSentencia": 48,
  "delito": "Alteración al orden público"
}
```

**`nucleoFamiliarPrimario`** — convivencia y relaciones:
```json
{
  "conviveConPadres": true,
  "relacionFamiliar": "Buena",
  "numHijos": 0,
  "conviveConConyuge": false
}
```

**`sustanciasDetalle`** — solo si `consumeSustancias = true`:
```json
{
  "tipo": "Alcohol",
  "frecuencia": "Fines de semana",
  "edadInicio": 18,
  "tratamientoPrevio": false
}
```

**`perfilPersonal`** — intereses y metas del beneficiario:
```json
{
  "hobbies": "Fútbol, música",
  "metas": "Terminar la carrera de Ingeniería"
}
```

**`saludDetalle`** — detalles clínicos adicionales:
```json
{
  "enfermedadesCronicas": "Ninguna",
  "medicamentos": "Ninguno",
  "discapacidad": "Ninguna"
}
```

**`proyectoVida`** — plan de vida del beneficiario (también alimenta el PDF de Plan de Vida):
```json
{
  "personal": "Obtener el título universitario",
  "familiar": "Apoyar a sus padres",
  "social": "Servir a la comunidad"
}
```

### Payload de ejemplo completo (F1):
```json
{
  "expedienteId": "8c478ea9-fbcb-452d-90f6-e689a2590fd6",
  "psicologoId": 2,
  "fechaEntrevista": "2026-04-06",
  "consentimientoInformado": true,
  "riesgoSuicida": false,
  "consumeSustancias": true,
  "padeceEnfermedadCronica": false,
  "necesitaApoyoPsicologico": true,
  "motivoConsulta": "Remitido por el juzgado cívico por alteración al orden público bajo influencia del alcohol.",
  "antecedentesClinicos": "Sin antecedentes psiquiátricos. Historial de consumo moderado de alcohol.",
  "examenMental": "Orientado en las tres esferas, lenguaje coherente, afecto levemente ansioso.",
  "impresionDiagnostica": "Consumo problemático de alcohol (F10.1 CIE-10). Tratamiento reeducativo.",
  "generalesEntrevista": { "escolaridad": "Licenciatura incompleta", "ocupacion": "Estudiante", "estadoCivil": "Soltero" },
  "situacionJuridicaF1": { "causa": "CP-2026-AX-099", "juzgado": "JCM-01", "horasSentencia": 48 },
  "nucleoFamiliarPrimario": { "conviveConPadres": true, "relacionFamiliar": "Buena", "numHijos": 0 },
  "sustanciasDetalle": { "tipo": "Alcohol", "frecuencia": "Fines de semana", "edadInicio": 18, "tratamientoPrevio": false },
  "proyectoVida": { "personal": "Terminar la carrera", "familiar": "Apoyar a mis padres", "social": "Servir a la comunidad" },
  "estatusF1": "COMPLETADO"
}
```

### Endpoints adicionales F1:

| Endpoint | Descripción |
| :--- | :--- |
| `GET /civico/f1/expediente/:expedienteId` | Obtener F1 por expediente |
| `GET /civico/f1/:id` | Obtener F1 por UUID del registro |
| `PATCH /civico/f1/:id` | Actualizar datos del F1 |
| `PATCH /civico/f1/:id/estatus` | Cambiar solo el estatus (`{ "estatus": "COMPLETADO" }`) |

---

## F2 — Estudio Socioeconómico

**Endpoint:** `POST /civico/f2`  
**Roles:** Admin, TrabajoSocial

### Campos escalares:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID |   | UUID del expediente |
| `trabajadorSocialId` | number |   | ID del trabajador social |
| `ingresoMensual` | decimal | ❌ | Ingreso mensual del hogar |
| `egresoMensual` | decimal | ❌ | Egresos mensuales del hogar |
| `nivelSocioeconomico` | `ALTO`/`MEDIO`/`BAJO` | ❌ | Nivel socioeconómico |
| `grupoFamiliar` | `FUNCIONAL`/`DISFUNCIONAL` | ❌ | Tipo de dinámica familiar |
| `huboViolenciaIntrafamiliar` | boolean | ❌ | Si hay antecedentes de violencia |
| `diagnosticoSocial` | string | ❌ | Diagnóstico del trabajo social |
| `estatusF2` | Enum | ❌ | Estado del formulario |

### Campos JSONB:

**`generalesF2`** — datos del beneficiario en el estudio:
```json
{
  "escolaridad": "Licenciatura incompleta",
  "ocupacion": "Estudiante",
  "estadoCivil": "Soltero"
}
```

**`situacionJuridicaF2`** — desde la perspectiva del trabajo social:
```json
{
  "causa": "CP-2026-AX-099",
  "juzgado": "JCM-01",
  "horasSentencia": 48,
  "delito": "Alteración al orden público"
}
```

**`nucleoPrimario`** — núcleo familiar primario:
```json
{
  "integrantesHogar": 3,
  "relacionConyuge": "N/A",
  "relacionPadres": "Buena",
  "relacionHermanos": "Buena",
  "consumoAlcohol": false
}
```

**`datosIndiciado`** — condiciones de vida:
```json
{
  "vivienda": "Casa propia",
  "transporte": "Transporte público",
  "horario": "Disponible lunes a viernes"
}
```

**`opinionObservaciones`** — recomendaciones del TS:
```json
{
  "recomendacion": "Canalizar a grupos de apoyo familiares",
  "prioridad": "ALTA",
  "conclusion": "Beneficiario con condiciones adecuadas para el programa."
}
```

### Candado F3 — SIEMPRE VERIFICAR ANTES DE CREAR F3:
```
GET /civico/f2/expediente/{expedienteId}/candado-f3
```
Respuesta: `{ "canCrearF3": true/false, "f1Completado": ..., "f2Completado": ... }`

### Endpoints adicionales F2:

| Endpoint | Descripción |
| :--- | :--- |
| `GET /civico/f2/expediente/:expedienteId` | Obtener F2 por expediente |
| `GET /civico/f2/expediente/:expedienteId/candado-f3` | Verificar si se puede crear F3 |
| `PATCH /civico/f2/:id` | Actualizar datos del F2 |
| `PATCH /civico/f2/:id/estatus` | Cambiar estatus (`{ "estatusF2": "COMPLETADO" }`) |

---

## F3 — Plan de Trabajo Individual

**Endpoint:** `POST /civico/f3`  
**Roles:** Solo Admin  
> ⚠️ **Candado RF-008**: Falla con `403` si F1 o F2 no están `COMPLETADO`.

### Campos escalares:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID |   | UUID del expediente |
| `coordinadorId` | number |   | ID del coordinador (usuario Admin) |
| `fechaInicioEstimada` | `YYYY-MM-DD` | ❌ | Inicio del plan |
| `fechaTerminoEstimada` | `YYYY-MM-DD` | ❌ | Fin estimado del plan |
| `diasAsignados` | string | ❌ | Ej: `"Lunes, Miércoles y Viernes de 08:00 a 12:00"` |
| `metasPrograma` | string | ❌ | Objetivos generales del programa |
| `observacionesPlan` | string | ❌ | Notas adicionales |
| `estatusF3` | Enum | ❌ | Estado del formulario |

### ⚠️ Campo `actividadesPlan` — CLAVES OBLIGATORIAS

Este JSONB **DEBE usar exactamente estas 8 claves** para que el PDF se genere correctamente:

`EDUCATIVA` · `PSICOSOCIAL` · `PSICOLOGICA` · `ADICCIONES` · `FAMILIAR` · `LABORAL` · `DEPORTIVA` · `CULTURAL`

Estructura de cada categoría:
```json
{
  "estatus": "PENDIENTE",
  "objetivo": "Descripción del objetivo",
  "cumplimiento": "",
  "vinculacion": "Instancia responsable (DIF, CEPRESO, etc.)",
  "temporalidad": "Mensual / Abril–Mayo 2026",
  "seguimiento": ""
}
```

### Payload completo F3:
```json
{
  "expedienteId": "8c478ea9-fbcb-452d-90f6-e689a2590fd6",
  "coordinadorId": 1,
  "fechaInicioEstimada": "2026-04-10",
  "fechaTerminoEstimada": "2026-06-10",
  "diasAsignados": "Lunes, Miércoles y Viernes de 08:00 a 12:00",
  "metasPrograma": "Cumplir 48 horas de servicio comunitario y concluir el Taller de Valores.",
  "proyectoVidaF3": {
    "personal": "Retomar estudios universitarios",
    "familiar": "Fortalecer relación con familia de origen",
    "social": "Participar en actividades comunitarias"
  },
  "actividadesPlan": {
    "EDUCATIVA":   { "estatus": "PENDIENTE", "objetivo": "Acreditar el Manual Fénix (8 sesiones)", "cumplimiento": "", "vinculacion": "CEPRESO / SSP", "temporalidad": "Abril–Mayo 2026", "seguimiento": "" },
    "PSICOSOCIAL": { "estatus": "PENDIENTE", "objetivo": "Fortalecer red de apoyo familiar y comunitario", "cumplimiento": "", "vinculacion": "DIF Municipal", "temporalidad": "Mensual", "seguimiento": "" },
    "PSICOLOGICA": { "estatus": "PENDIENTE", "objetivo": "Asistir a 4 sesiones de orientación psicológica", "cumplimiento": "", "vinculacion": "Área de Psicología", "temporalidad": "Mensual", "seguimiento": "" },
    "ADICCIONES":  { "estatus": "PENDIENTE", "objetivo": "Participar en taller de prevención de adicciones", "cumplimiento": "", "vinculacion": "CIJ / CAPA", "temporalidad": "Mayo 2026", "seguimiento": "" },
    "FAMILIAR":    { "estatus": "PENDIENTE", "objetivo": "Asistir a talleres de dinámica familiar", "cumplimiento": "", "vinculacion": "DIF / Familia", "temporalidad": "Mensual", "seguimiento": "" },
    "LABORAL":     { "estatus": "PENDIENTE", "objetivo": "Participar en curso de habilidades para el empleo", "cumplimiento": "", "vinculacion": "STYO / INAEBA", "temporalidad": "Mayo 2026", "seguimiento": "" },
    "DEPORTIVA":   { "estatus": "PENDIENTE", "objetivo": "Participar en 3 tequios de rescate de espacios públicos", "cumplimiento": "", "vinculacion": "Ayuntamiento", "temporalidad": "Semanal", "seguimiento": "" },
    "CULTURAL":    { "estatus": "PENDIENTE", "objetivo": "Participar en 2 jornadas de reforestación ecológica", "cumplimiento": "", "vinculacion": "SEMARNAT", "temporalidad": "Bimestral", "seguimiento": "" }
  },
  "observacionesPlan": "Beneficiario comprometido. Actividades variadas para cubrir las 48 horas.",
  "estatusF3": "COMPLETADO"
}
```

---

## F4 — Cédula Inicial de Seguimiento

**Endpoint:** `POST /civico/f4`  
**Roles:** Solo Admin

### ⚠️ Campo `seguimientoActividades` — CLAVES OBLIGATORIAS

A diferencia del F3, aquí **solo son 5 claves válidas** y el valor de cada una es **texto libre** (observaciones):

`EDUCATIVA` · `LABORAL` · `FAMILIAR` · `DEPORTIVO` · `CULTURAL`

```json
{
  "expedienteId": "8c478ea9-fbcb-452d-90f6-e689a2590fd6",
  "coordinadorId": 1,
  "procesoIngreso": "El beneficiario se presenta en tiempo y forma. Se le explica el programa y firma carta de compromiso.",
  "seguimientoActividades": {
    "EDUCATIVA":  "Manual Fénix — 0/8 sesiones completadas. Pendiente inicio de actividades educativas.",
    "LABORAL":    "Pendiente asignación de actividad laboral. Se explorará taller de habilidades.",
    "FAMILIAR":   "Red de apoyo familiar identificada — madre y padre presentes. Dinámica estable.",
    "DEPORTIVO":  "Participación en actividades físicas — sin restricciones médicas.",
    "CULTURAL":   "Asistencia a taller de pintura comunitaria programada para la siguiente semana."
  },
  "estatusF4": "COMPLETADO"
}
```

---

## F5 — Seguimiento Psicológico (múltiples sesiones)

**Endpoint:** `POST /civico/f5`  
**Roles:** Admin, Psicólogo  
> A diferencia de F1–F4, el F5 permite **múltiples registros** (una por sesión).

### Campos:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `expedienteId` | UUID |   | UUID del expediente |
| `psicologoId` | number |   | ID del psicólogo |
| `numSesion` | number |   | Número incremental: 1, 2, 3... |
| `fechaSesion` | `YYYY-MM-DD` | ❌ | Fecha de la sesión |
| `horaSesion` | string | ❌ | Hora de inicio, ej: `"10:00"` |
| `fechaProximaSesion` | `YYYY-MM-DD` | ❌ | Fecha de la siguiente cita |
| `objetivoSesion` | string | ❌ | Objetivo clínico de la sesión |
| `conductaDisposicion` | string | ❌ | Actitud del beneficiario |
| `descripcionIntervencion` | string | ❌ | Técnicas utilizadas |
| `temaSesion` | string | ❌ | Tema abordado |
| `estrategiaAplicada` | string | ❌ | Enfoque terapéutico (ej. TCC) |
| `planTerapeutico` | string | ❌ | Plan para las próximas sesiones |
| `actividadesAsignadasUsuario` | string | ❌ | Tareas para el beneficiario |
| `avancePercibido` | Enum | ❌ | `INICIAL`/`MODERADO`/`SATISFACTORIO`/`EXCELENTE` |
| `observaciones` | string | ❌ | Notas clínicas adicionales |

### Endpoints adicionales F5:

| Endpoint | Descripción |
| :--- | :--- |
| `GET /civico/f5/expediente/:expedienteId` | Lista todas las sesiones |
| `GET /civico/f5/expediente/:expedienteId/total` | Total de sesiones registradas |
| `GET /civico/f5/expediente/:expedienteId/sesion/:num` | Sesión específica por número |
| `PATCH /civico/f5/:id` | Actualizar sesión por UUID |
