# 🚀 Centro de Payloads Maestros (Swagger)

Usa este documento para copiar y pegar los JSONs en Swagger durante tu demostración. 

> [!TIP]
> **Ahorra tiempo**: Antes de empezar, usa `Ctrl+H` en este archivo para reemplazar `{{EXPEDIENTE_UUID}}` por el UUID real que generes en el Paso 2.

---

### PASO 1: Creación de Identidad
**Endpoint**: `POST /beneficiarios`
```json
{
  "nombre": "JUAN CARLOS PEREZ LOPEZ",
  "curp": "PERJ880101HDFRRN01",
  "sexo": "HOMBRE",
  "fechaNacimiento": "1988-01-01",
  "tiempoAsignado": 48,
  "unidadTiempo": "HORAS"
}
```

### PASO 2: Apertura de Expediente
**Endpoint**: `POST /civico/expedientes`
*Retén el `beneficiarioId` del paso anterior (ej: 1)*
```json
{
  "beneficiarioId": 1,
  "folioExpediente": "EXP-2025-0001",
  "causaPenal": "CP-2025-AX-99",
  "juezCivico": "Lic. Roberto Gomez",
  "fechaInicioSentencia": "2025-03-28",
  "horasSentencia": 48,
  "contactosFamiliares": {
    "madre": { "nombre": "Maria Lopez", "telefono": "555-0102" }
  }
}
```
*Aquí obtienes el `{{EXPEDIENTE_UUID}}` (ej: `550e8400-e29b-41d4-a716-446655440000`)*

---

### PASO 3: Entrevista Clínica (F1)
**Endpoint**: `POST /civico/f1`
```json
{
  "expedienteId": "{{EXPEDIENTE_UUID}}",
  "psicologoId": 1,
  "motivoConsulta": "Remitido por el juzgado cívico por faltas a la convivencia ciudadana.",
  "consistencia": "ORIENTADO",
  "riesgoSuicida": false,
  "consumeSustancias": true,
  "generalesEntrevista": {
    "escolaridad": "Preparatoria incompleta",
    "ocupacion": "Comerciante informal"
  }
}
```

### PASO 4: Estudio Socioeconómico (F2)
**Endpoint**: `POST /civico/f2`
```json
{
  "expedienteId": "{{EXPEDIENTE_UUID}}",
  "trabajadorSocialId": 1,
  "ingresoMensual": 6500,
  "egresoMensual": 6000,
  "nivelSocioeconomico": "MEDIO_BAJO",
  "condicionesVivienda": "Casa rentada, cuenta con servicios básicos."
}
```

---

### PASO 5: Dictamen Médico (Salud) 🏥
**Endpoint**: `POST /salud`
*Nota: Este campo es vital para el Plan de Trabajo.*
```json
{
  "beneficiarioId": 1,
  "esAptoFisico": true,
  "padecEnfermedad": false,
  "restriccionesCategorias": [],
  "observacionesMedicas": "Sin patologías aparentes. Apto para cualquier actividad comunitaria."
}
```

---

### PASO 6: Plan de Trabajo Individual (F3)
**Endpoint**: `POST /civico/f3`
```json
{
  "expedienteId": "{{EXPEDIENTE_UUID}}",
  "coordinadorId": 1,
  "fechaInicioEstimada": "2025-04-01",
  "fechaTerminoEstimada": "2025-06-01",
  "actividadesPlan": {
    "TRABAJO_COMUNITARIO": { "objetivo": "Participar en 3 tequios de limpieza", "idActividad": 1 },
    "EDUCACION_PARA_LA_VIDA": { "objetivo": "Concluir el Manual Fénix", "idActividad": 5 }
  },
  "metasPrograma": "Lograr la reintegración a través del servicio comunitario y la autoreflexión."
}
```

### PASO 7: Registro de Asistencia (Lista de Asistencia)
**Endpoint**: `POST /civico/documentos/lista-asistencia`  
**Roles**: Admin, Guia  
*Usa `{{EXPEDIENTE_UUID}}` obtenido en el Paso 2*
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
*La respuesta es un PDF. En el front, descárgalo o ábrelo en una pestaña nueva.*

---

### PASO 8: Nota de Evolución (F5)
**Endpoint**: `POST /civico/f5`
```json
{
  "expedienteId": "{{EXPEDIENTE_UUID}}",
  "psicologoId": 1,
  "numSesion": 1,
  "temaSesion": "Manejo de ira y resolución de conflictos",
  "descripcionIntervencion": "Se trabajó en la identificación de detonantes emocionales.",
  "avancePercibido": "SATISFACTORIO"
}
```
