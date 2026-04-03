# 🎓 Guion Maestro de Demostración (Admin — Flujo Completo)

Este guion está diseñado para presentar el sistema como **Admin** desde cero.  
Sigue las fases en orden — cada paso usa el resultado del anterior.

---

## 🛠️ Preparación (5 min)

1. **Arranque limpio:** Borra y recrea la BD (o usa una BD vacía)
2. **Levantar el servidor:** `npm run start:dev`
3. **Seed inicial:** `npm run seed:admin` (crea usuarios y catálogos)
4. **Swagger:** Abre `http://localhost:3000/api-docs`
5. **Login:** `POST /auth/login` con `{ "nomUsuario": "admin", "contrasena": "Admin1234" }` → copia `access_token` → **Authorize** en Swagger

> **Truco:** Después del Paso 3, copia el `idUUID` del expediente y usa `Ctrl+H` para reemplazar `{{EXP_UUID}}` en este archivo. Todas las llamadas quedarán listas.

---

## Fase 0 — Usuarios del Sistema

Ejecuta estos solo si borraste la BD (el seeder ya los crea).

### POST /users — Crear Psicólogo
```json
{ "nomUsuario": "psico_ana", "nombre": "Ana García Psicóloga", "rol": "psicologo", "contrasena": "Admin1234" }
```
→ Guarda `id` como **psicologoId** (probablemente `2`)

### POST /users — Crear Trabajador Social
```json
{ "nomUsuario": "social_pedro", "nombre": "Pedro Ramírez T. Social", "rol": "trabajo_social", "contrasena": "Admin1234" }
```
→ Guarda `id` como **trabajadorSocialId** (probablemente `3`)

### POST /users — Crear Guía
```json
{ "nomUsuario": "guia_roberto", "nombre": "Roberto Sánchez Guía", "rol": "guia", "contrasena": "Admin1234" }
```
→ Guarda `id` como **guiaId** (probablemente `4`)

---

## Fase 1 — Registrar Beneficiario

### POST /beneficiarios
```json
{
  "nombre": "YAHIR LEON REYES",
  "tiempoAsignado": 48,
  "unidadTiempo": "HORAS",
  "urlFoto": "https://drive.google.com/file/d/foto_ejemplo/view"
}
```
→ Guarda `id` → **beneficiarioId** = `1`

---

## Fase 2 — Crear Expediente Cívico

### POST /civico/expedientes
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
  "numJuzgadoCivico": "Juzgado Cívico Municipal Especializado en Faltas Administrativas para la Buena Convivencia del Tercer Turno",
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
→ Guarda `idUUID` → **EXP_UUID** = `{{EXP_UUID}}`

---

## Fase 3 — Perfil de Salud

### POST /salud
```json
{
  "beneficiarioId": 1,
  "esAptoFisico": true,
  "padecEnfermedad": false,
  "restriccionesCategorias": [],
  "consumeSustancias": true,
  "tipoSustancias": "Alcohol (consumo moderado, fines de semana)",
  "afiliadoServicioSalud": "IMSS",
  "necesitaLentes": false,
  "observacionesMedicas": "Apto para cualquier actividad comunitaria. Se recomienda canalización a grupo de autoayuda."
}
```

**Punto de demostración:** Muestra el **Escenario 3 (No Apto)**:
```json
{
  "beneficiarioId": 1,
  "esAptoFisico": false,
  "padecEnfermedad": true,
  "nombreEnfermedad": "Cardiopatía isquémica",
  "restriccionesCategorias": ["TRABAJO_COMUNITARIO", "BRIGADEO_ECOLOGICO"],
  "observacionesMedicas": "Requiere evaluación médica antes de asignar actividad física."
}
```
*"Si el médico lo marca como No Apto, el coordinador ve exactamente qué categorías NO puede hacer".*

---

## Fase 4 — F1 Entrevista Clínica (Admin actúa como Psicólogo)

### POST /civico/f1
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

*"Este JSONB de proyectoVida se convierte automáticamente en el PDF de Plan de Vida Individualizada".*

---

## Fase 5 — F2 Estudio Socioeconómico (Admin actúa como T. Social)

### POST /civico/f2
```json
{
  "expedienteId": "{{EXP_UUID}}",
  "trabajadorSocialId": 3,
  "ingresoMensual": 8500.00,
  "nivelSocioeconomico": "BAJO",
  "grupoFamiliar": "FUNCIONAL",
  "huboViolenciaIntrafamiliar": false,
  "diagnosticoSocial": "Familia nuclear estable, red de apoyo presente en CDMX. El beneficiario cuenta con soporte familiar.",
  "generalesF2": { "escolaridad": "Licenciatura incompleta", "ocupacion": "Estudiante", "estadoCivil": "Soltero" },
  "situacionJuridicaF2": { "causa": "CP-2026-AX-099", "juzgado": "JCM-01", "horasSentencia": 48 },
  "nucleoPrimario": { "integrantesHogar": 3, "relacionPadres": "Buena", "relacionHermanos": "Buena" },
  "datosIndiciado": { "vivienda": "Casa propia", "transporte": "Transporte público", "horario": "Disponible lunes a viernes" },
  "estatusF2": "COMPLETADO"
}
```

---

## Fase 5.5 — Verificar Candado RF-008

### GET /civico/f2/expediente/{{EXP_UUID}}/candado-f3

Respuesta esperada:
```json
{ "canCrearF3": true, "f1Completado": true, "f2Completado": true }
```

---

## Fase 6 — F3 Plan de Trabajo

### POST /civico/f3
```json
{
  "expedienteId": "{{EXP_UUID}}",
  "coordinadorId": 1,
  "fechaInicioEstimada": "2026-04-10",
  "fechaTerminoEstimada": "2026-06-10",
  "diasAsignados": "Lunes, Miércoles y Viernes de 08:00 a 12:00",
  "metasPrograma": "Cumplir 48 horas de servicio comunitario y concluir el Taller de Valores.",
  "proyectoVidaF3": {
    "personal": "Retomar estudios universitarios",
    "familiar": "Fortalecer la relación con familia",
    "social": "Participar en actividades comunitarias"
  },
  "actividadesPlan": {
    "EDUCATIVA":   { "estatus": "PENDIENTE", "objetivo": "Acreditar el Manual Fénix (8 sesiones)", "cumplimiento": "", "vinculacion": "CEPRESO / SSP", "temporalidad": "Abril–Mayo 2026", "seguimiento": "" },
    "PSICOSOCIAL": { "estatus": "PENDIENTE", "objetivo": "Fortalecer red de apoyo familiar", "cumplimiento": "", "vinculacion": "DIF Municipal", "temporalidad": "Mensual", "seguimiento": "" },
    "PSICOLOGICA": { "estatus": "PENDIENTE", "objetivo": "Asistir a 4 sesiones de orientación psicológica", "cumplimiento": "", "vinculacion": "Área de Psicología", "temporalidad": "Mensual", "seguimiento": "" },
    "ADICCIONES":  { "estatus": "PENDIENTE", "objetivo": "Participar en taller de prevención de adicciones", "cumplimiento": "", "vinculacion": "CIJ / CAPA", "temporalidad": "Mayo 2026", "seguimiento": "" },
    "FAMILIAR":    { "estatus": "PENDIENTE", "objetivo": "Asistir a talleres de dinámica familiar", "cumplimiento": "", "vinculacion": "DIF / Familia", "temporalidad": "Mensual", "seguimiento": "" },
    "LABORAL":     { "estatus": "PENDIENTE", "objetivo": "Participar en curso de habilidades para el empleo", "cumplimiento": "", "vinculacion": "STYO / INAEBA", "temporalidad": "Mayo 2026", "seguimiento": "" },
    "DEPORTIVA":   { "estatus": "PENDIENTE", "objetivo": "Participar en 3 tequios de rescate de espacios públicos", "cumplimiento": "", "vinculacion": "Ayuntamiento", "temporalidad": "Semanal", "seguimiento": "" },
    "CULTURAL":    { "estatus": "PENDIENTE", "objetivo": "Participar en 2 jornadas de reforestación", "cumplimiento": "", "vinculacion": "SEMARNAT", "temporalidad": "Bimestral", "seguimiento": "" }
  },
  "observacionesPlan": "Beneficiario comprometido con el programa. Actividades variadas para cubrir las 48 horas.",
  "estatusF3": "COMPLETADO"
}
```

*"Las 8 claves son exactamente las columnas de la tabla del PDF. Si usas otra clave, esa fila queda vacía en el documento."*

---

## Fase 7 — F4 Cédula Inicial

### POST /civico/f4
```json
{
  "expedienteId": "{{EXP_UUID}}",
  "coordinadorId": 1,
  "procesoIngreso": "El beneficiario se presenta en tiempo y forma. Se le explica el programa y firma carta de compromiso. Ingresa en condiciones adecuadas para el servicio.",
  "seguimientoActividades": {
    "EDUCATIVA":  "Manual Fénix — 0/8 sesiones completadas. Pendiente inicio.",
    "LABORAL":    "Pendiente asignación de actividad laboral.",
    "FAMILIAR":   "Red de apoyo identificada — madre y padre presentes.",
    "DEPORTIVO":  "Sin restricciones médicas para actividades físicas.",
    "CULTURAL":   "Taller de pintura programado para la siguiente semana."
  },
  "estatusF4": "COMPLETADO"
}
```

---

## Fase 8 — Primer Registro de Asistencia (PDF + Drive)

### POST /civico/documentos/lista-asistencia
```json
{
  "expedienteId": "{{EXP_UUID}}",
  "fecha": "2026-04-10",
  "horasCubiertas": 4,
  "asistencia": "PRESENTE",
  "horario": "08:00 - 12:00",
  "sede": "Sede Central",
  "actividadNombre": "Tequio de Reforestación",
  "observaciones": "Participó activamente. Actitud positiva."
}
```

**Punto de demostración:**
1. El servidor responde con el PDF descargado
2. Abre `GET /civico/bitacora/expediente/{{EXP_UUID}}/horas` → muestra `{ "horasAcumuladas": 4, "porcentajeAvance": 8.33 }`
3. Abre Google Drive y muestra la carpeta recién creada con el PDF

---

## Fase 9 — F5 Sesión Psicológica

### POST /civico/f5
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
  "descripcionIntervencion": "Se realizó encuadre terapéutico. Técnica de respiración diafragmática.",
  "temaSesion": "Autoconocimiento e inicio de proyecto de vida.",
  "estrategiaAplicada": "TCC — Psicoeducación sobre control de impulsos.",
  "planTerapeutico": "Continuar con técnicas de regulación emocional.",
  "actividadesAsignadasUsuario": "Completar sección 1 del Manual Fénix.",
  "avancePercibido": "INICIAL",
  "observaciones": "Buen pronóstico. No se detectó ideación suicida."
}
```

---

## Fase 10 — Generar PDFs Oficiales

```
GET /civico/documentos/oficio-incorporacion/{{EXP_UUID}}   ← Oficio para el juzgado
GET /civico/documentos/plan-vida/{{EXP_UUID}}              ← Plan de Vida (desde F1)
GET /civico/documentos/f3-plan-trabajo/{{EXP_UUID}}        ← Plan de Trabajo
GET /civico/documentos/nota-evolucion/{{EXP_UUID}}         ← Nota de Evolución Psicológica
```

**Punto de demostración:**  
Muestra en vivo el PDF de Plan de Vida generado con los datos de `proyectoVida` que se ingresaron en el F1.

---

## Fase 11 — Demostrar Baja Automática (RF-013)

### Incidencia 1 — `POST /civico/incidencias`
```json
{ "expedienteId": "{{EXP_UUID}}", "guiaId": 4, "tipo": "FALTA_INJUSTIFICADA", "fechaIncidencia": "2026-04-14", "descripcionHechos": "No se presentó sin aviso.", "esAcumulativa": true, "estatusResolucion": "PENDIENTE" }
```

### Incidencia 2
```json
{ "expedienteId": "{{EXP_UUID}}", "guiaId": 4, "tipo": "RETARDO", "fechaIncidencia": "2026-04-16", "descripcionHechos": "Llegó 2 horas tarde.", "esAcumulativa": true, "estatusResolucion": "PENDIENTE" }
```

### Verificar riesgo: `GET /civico/incidencias/expediente/{{EXP_UUID}}/strikes`
```json
{ "strikes": 2, "limite": 3, "enRiesgo": true, "bajaActivada": false }
```

### Incidencia 3 — ¡Baja automática!
```json
{ "expedienteId": "{{EXP_UUID}}", "guiaId": 4, "tipo": "FALTA_INJUSTIFICADA", "fechaIncidencia": "2026-04-21", "descripcionHechos": "Tercera falta injustificada.", "esAcumulativa": true, "estatusResolucion": "PENDIENTE" }
```

**Verificar:** `GET /civico/expedientes/{{EXP_UUID}}`  
→ `estatusProceso` = `BAJA_POR_ACUMULACION_DE_INCIDENCIAS` ✅

---

## 💬 Glosario de Defensa Técnica

| Pregunta del asesor | Tu respuesta |
| :--- | :--- |
| ¿Por qué UUID y no ID secuencial en expedientes? | Previene ataques de enumeración — nadie puede adivinar el ID del siguiente beneficiario. |
| ¿Por qué JSONB en F1/F2? | Los formularios médicos y sociales evolucionan. Con JSONB puedes agregar campos sin cambiar la estructura de la tabla. |
| ¿Qué pasa si Drive no tiene internet? | El sistema está desacoplado — guarda primero en BD, después sincroniza. Los PDFs se generan siempre localmente. |
| ¿Por qué los folios empiezan desde 0001? | Eliminamos el offset hardcodeado. Ahora la secuencia se reinicia desde 1 cada vez que la BD está vacía. |
| ¿Puede escalar a más módulos? | Sí — el servicio de Drive es inyectable. Penal, UNEME-CAPA y Bienestar comparten la misma lógica sin duplicar código. |
