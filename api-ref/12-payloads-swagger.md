# 📋 Referencia de Payloads Completos

Copia y pega directamente en Swagger. Reemplaza `{{EXP_UUID}}` con el UUID real del expediente.

---

## Paso 0 — Login

`POST /auth/login`
```json
{ "nomUsuario": "admin", "contrasena": "Admin1234" }
```
→ Copia `access_token` → botón **Authorize** → `Bearer <token>`

---

## Paso 1 — Beneficiario

`POST /beneficiarios`
```json
{
  "nombre": "YAHIR LEON REYES",
  "tiempoAsignado": 48,
  "unidadTiempo": "HORAS",
  "urlFoto": "https://drive.google.com/file/d/ejemplo123/view"
}
```
→ Guarda `id` → usa como `beneficiarioId`

> ⚠️ Si la foto está en una ruta local de Windows, usa `/` no `\`:  
>   `"C:/Users/yahir/Downloads/foto.jpeg"`  
> ❌ `"C:\Users\yahir\Downloads\foto.jpeg"` ← esto rompe el JSON

---

## Paso 2 — Salud

`POST /salud`
```json
{
  "beneficiarioId": 1,
  "esAptoFisico": true,
  "padecEnfermedad": false,
  "restriccionesCategorias": [],
  "consumeSustancias": false,
  "afiliadoServicioSalud": "IMSS",
  "necesitaLentes": false,
  "observacionesMedicas": "Sin patologías. Apto para cualquier actividad."
}
```

---

## Paso 3 — Expediente Cívico

`POST /civico/expedientes`
```json
{
  "beneficiarioId": 1,
  "curp": "LEOY880101HDFRRN01",
  "fechaNacimiento": "1988-01-01",
  "genero": "M",
  "domicilioCompleto": "Calle Reforma 123, Col. Centro, CDMX",
  "municipio": "Cuauhtémoc",
  "codigoPostal": "06600",
  "telefonoContacto": "5551234567",
  "escolaridadActual": "Licenciatura incompleta",
  "estadoCivil": "Soltero",
  "ocupacionActual": "Estudiante",
  "nacionalidad": "Mexicana",
  "contactosFamiliares": {
    "madre": { "nombre": "María López García", "telefono": "5559876543" }
  },
  "folioExpediente": "EXP-CIV-2026-0001",
  "numJuzgadoCivico": "Juzgado Cívico Municipal del Tercer Turno",
  "juezControl": "Lic. Roberto Gómez Martínez",
  "generoJuez": "M",
  "causaPenal": "CP-2026-AX-099",
  "delitoImputado": "Alteración al orden público (Art. 23 LJCA)",
  "agraviado": "Ciudadanía en general",
  "fechaDetencion": "2026-03-20",
  "modalidadFalta": "Falta administrativa por alteración al orden público",
  "horasSentencia": 48,
  "diasAsignadosJuzgado": ["2026-04-07", "2026-04-09", "2026-04-11"],
  "horasPorDia": 4,
  "fechaInicioBeneficio": "2026-04-01",
  "fechaTerminoBeneficio": "2026-06-30",
  "fechaOficioCanalizacion": "2026-03-28",
  "oficioCanalizacion": "00/2026"
}
```
→ Guarda `idUUID` → es el `expedienteId` = `{{EXP_UUID}}`

---

## Paso 4 — F1 Entrevista Clínica

`POST /civico/f1`
```json
{
  "expedienteId": "{{EXP_UUID}}",
  "psicologoId": 2,
  "fechaEntrevista": "2026-04-06",
  "consentimientoInformado": true,
  "riesgoSuicida": false,
  "consumeSustancias": true,
  "padeceEnfermedadCronica": false,
  "necesitaApoyoPsicologico": true,
  "motivoConsulta": "Remitido por el juzgado por alteración al orden público bajo influencia del alcohol.",
  "antecedentesClinicos": "Sin antecedentes psiquiátricos.",
  "examenMental": "Orientado en las tres esferas, lenguaje coherente.",
  "impresionDiagnostica": "Consumo problemático de alcohol (F10.1 CIE-10).",
  "generalesEntrevista": { "escolaridad": "Licenciatura incompleta", "ocupacion": "Estudiante", "estadoCivil": "Soltero" },
  "situacionJuridicaF1": { "causa": "CP-2026-AX-099", "juzgado": "JCM-01", "horasSentencia": 48 },
  "nucleoFamiliarPrimario": { "conviveConPadres": true, "relacionFamiliar": "Buena", "numHijos": 0 },
  "sustanciasDetalle": { "tipo": "Alcohol", "frecuencia": "Fines de semana", "edadInicio": 18, "tratamientoPrevio": false },
  "proyectoVida": {
    "personal": "Terminar la carrera de Ingeniería",
    "familiar": "Apoyar a mis padres",
    "social": "Servir a la comunidad"
  },
  "estatusF1": "COMPLETADO"
}
```

---

## Paso 5 — F2 Estudio Socioeconómico

`POST /civico/f2`
```json
{
  "expedienteId": "{{EXP_UUID}}",
  "trabajadorSocialId": 3,
  "ingresoMensual": 8500.00,
  "nivelSocioeconomico": "BAJO",
  "grupoFamiliar": "FUNCIONAL",
  "huboViolenciaIntrafamiliar": false,
  "diagnosticoSocial": "Familia nuclear estable, red de apoyo presente. El beneficiario cuenta con soporte familiar.",
  "nucleoPrimario": { "integrantesHogar": 3, "relacionPadres": "Buena", "numHijos": 0 },
  "datosIndiciado": { "vivienda": "Casa propia", "transporte": "Transporte público", "horario": "Disponible L-V" },
  "estatusF2": "COMPLETADO"
}
```

### Verificar candado antes de F3:
`GET /civico/f2/expediente/{{EXP_UUID}}/candado-f3`

---

## Paso 6 — F3 Plan de Trabajo

`POST /civico/f3`

> ⚠️ Las 8 claves de `actividadesPlan` son exactamente las del PDF. Si usas otro nombre de clave, ese renglón queda vacío en el documento.

```json
{
  "expedienteId": "{{EXP_UUID}}",
  "coordinadorId": 1,
  "fechaInicioEstimada": "2026-04-10",
  "fechaTerminoEstimada": "2026-06-10",
  "diasAsignados": "Lunes, Miércoles y Viernes de 08:00 a 12:00",
  "metasPrograma": "Cumplir 48 horas de servicio comunitario y el Taller de Valores.",
  "proyectoVidaF3": {
    "personal": "Retomar estudios universitarios",
    "familiar": "Fortalecer relación con familia",
    "social": "Participar en actividades comunitarias"
  },
  "actividadesPlan": {
    "EDUCATIVA":   { "estatus": "PENDIENTE", "objetivo": "Acreditar el Manual Fénix (8 sesiones)", "cumplimiento": "", "vinculacion": "CEPRESO / SSP", "temporalidad": "Abril–Mayo 2026", "seguimiento": "" },
    "PSICOSOCIAL": { "estatus": "PENDIENTE", "objetivo": "Fortalecer red de apoyo familiar", "cumplimiento": "", "vinculacion": "DIF Municipal", "temporalidad": "Mensual", "seguimiento": "" },
    "PSICOLOGICA": { "estatus": "PENDIENTE", "objetivo": "4 sesiones de orientación psicológica", "cumplimiento": "", "vinculacion": "Psicología SSP", "temporalidad": "Mensual", "seguimiento": "" },
    "ADICCIONES":  { "estatus": "PENDIENTE", "objetivo": "Taller de prevención de adicciones", "cumplimiento": "", "vinculacion": "CIJ / CAPA", "temporalidad": "Mayo 2026", "seguimiento": "" },
    "FAMILIAR":    { "estatus": "PENDIENTE", "objetivo": "Talleres de dinámica familiar", "cumplimiento": "", "vinculacion": "DIF / Familia", "temporalidad": "Mensual", "seguimiento": "" },
    "LABORAL":     { "estatus": "PENDIENTE", "objetivo": "Curso de habilidades para el empleo", "cumplimiento": "", "vinculacion": "STYO / INAEBA", "temporalidad": "Mayo 2026", "seguimiento": "" },
    "DEPORTIVA":   { "estatus": "PENDIENTE", "objetivo": "3 tequios de rescate de espacios públicos", "cumplimiento": "", "vinculacion": "Ayuntamiento", "temporalidad": "Semanal", "seguimiento": "" },
    "CULTURAL":    { "estatus": "PENDIENTE", "objetivo": "2 jornadas de reforestación ecológica", "cumplimiento": "", "vinculacion": "SEMARNAT", "temporalidad": "Bimestral", "seguimiento": "" }
  },
  "observacionesPlan": "Beneficiario comprometido. Actividades variadas para cubrir las 48 horas.",
  "estatusF3": "COMPLETADO"
}
```

---

## Paso 7 — F4 Cédula Inicial

`POST /civico/f4`

> ⚠️ Solo 5 claves válidas en `seguimientoActividades`: `EDUCATIVA` / `LABORAL` / `FAMILIAR` / `DEPORTIVO` / `CULTURAL`

```json
{
  "expedienteId": "{{EXP_UUID}}",
  "coordinadorId": 1,
  "procesoIngreso": "El beneficiario se presenta en tiempo y forma. Firma carta de compromiso.",
  "seguimientoActividades": {
    "EDUCATIVA":  "Manual Fénix — 0/8 sesiones completadas.",
    "LABORAL":    "Pendiente asignación de actividad laboral.",
    "FAMILIAR":   "Red de apoyo identificada. Dinámica familiar estable.",
    "DEPORTIVO":  "Sin restricciones médicas para actividades físicas.",
    "CULTURAL":   "Taller de pintura programado para la siguiente semana."
  },
  "estatusF4": "COMPLETADO"
}
```

---

## Paso 8 — Registrar Asistencia

`POST /civico/documentos/lista-asistencia`
```json
{
  "expedienteId": "{{EXP_UUID}}",
  "fecha": "2026-04-10",
  "horasCubiertas": 4,
  "asistencia": "PRESENTE",
  "horario": "08:00 - 12:00",
  "sede": "Sede Central",
  "actividadNombre": "Tequio de Reforestación",
  "observaciones": "Participó activamente."
}
```

---

## Paso 9 — F5 Sesión Psicológica

`POST /civico/f5`
```json
{
  "expedienteId": "{{EXP_UUID}}",
  "psicologoId": 2,
  "numSesion": 1,
  "fechaSesion": "2026-04-10",
  "horaSesion": "10:00",
  "fechaProximaSesion": "2026-04-17",
  "objetivoSesion": "Encuadre terapéutico y evaluación del estado emocional inicial.",
  "conductaDisposicion": "Colaborador, con disposición al cambio.",
  "descripcionIntervencion": "Encuadre terapéutico. Técnica de respiración diafragmática.",
  "temaSesion": "Autoconocimiento e inicio de proyecto de vida.",
  "estrategiaAplicada": "TCC — Psicoeducación sobre control de impulsos.",
  "planTerapeutico": "Continuar con regulación emocional.",
  "actividadesAsignadasUsuario": "Completar sección 1 del Manual Fénix.",
  "avancePercibido": "INICIAL",
  "observaciones": "Buen pronóstico. No se detectó ideación suicida."
}
```

---

## Paso 10 — Generar PDFs

```
GET /civico/documentos/oficio-incorporacion/{{EXP_UUID}}
GET /civico/documentos/f3-plan-trabajo/{{EXP_UUID}}
GET /civico/documentos/plan-vida/{{EXP_UUID}}
GET /civico/documentos/nota-evolucion/{{EXP_UUID}}
GET /civico/documentos/f4-cedula-inicial/{{EXP_UUID}}
GET /civico/documentos/ficha-incidencias/{{EXP_UUID}}
```

---

## Tabla de Enumeraciones del Sistema

| Enum | Valores |
| :--- | :--- |
| `unidadTiempo` | `HORAS` / `MESES` |
| `genero` | `M` / `F` |
| `nivelSocioeconomico` | `ALTO` / `MEDIO` / `BAJO` |
| `grupoFamiliar` | `FUNCIONAL` / `DISFUNCIONAL` |
| `avancePercibido` (F5) | `INICIAL` / `MODERADO` / `SATISFACTORIO` / `EXCELENTE` |
| `asistencia` | `PRESENTE` / `PRESENTE_PARCIAL` / `FALTA_JUSTIFICADA` / `FALTA_INJUSTIFICADA` |
| `incidencia` | `FALTA_INJUSTIFICADA` / `RETARDO` / `CONDUCTA_INAPROPIADA` / `INCUMPLIMIENTO_TAREA` / `INASISTENCIA_JUSTIFICADA` / `VISITA_DOMICILIARIA` / `RETIRO_ANTICIPADO` / `CONVERSATORIO` |
| `estatusProceso` | `INDUCCION` / `DIAGNOSTICO` / `PLANEACION` / `EN_SEGUIMIENTO` / `GRADUADO` / `BAJA_POR_ACUMULACION_DE_INCIDENCIAS` / `BAJA_VOLUNTARIA` |
| `estatusFormulario` | `PENDIENTE` / `EN_PROCESO` / `COMPLETADO` / `CERRADO` |
| `estatusResolucion` | `PENDIENTE` / `RESUELTA` / `DERIVO_EN_BAJA` |
| `tipoDocumento` | `CANALIZACION` / `INCORPORACION` |
| `rol` | `admin` / `psicologo` / `trabajo_social` / `guia` |
