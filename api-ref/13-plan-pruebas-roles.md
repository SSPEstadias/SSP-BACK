# 🧪 Plan de Pruebas por Roles — Guion Completo

> **Truco para no perder tiempo copiando IDs**: Antes de empezar, abre Swagger en `http://localhost:3000/api-docs`. Ejecuta el Paso 0 → copia el `idUUID` del expediente → usa `Ctrl+H` en este archivo para reemplazar todas las ocurrencias de `{{EXP_UUID}}` por ese valor. Así todo el guion queda listo para pegar sin buscar el ID una y otra vez.

---

## 🔑 Credenciales por Rol (ajusta según tu seed)

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| Admin | `admin@ssp.gob` | `Admin1234!` |
| Guia | `guia@ssp.gob` | `Guia1234!` |
| Psicólogo | `psi@ssp.gob` | `Psi1234!` |
| Trabajo Social | `ts@ssp.gob` | `Ts1234!` |

---

## 🛠️ Paso 0 (Admin) — Preparación inicial

> Ejecuta esto UNA VEZ antes de los demás escenarios.

**1. Login**
```
POST /auth/login
{ "email": "admin@ssp.gob", "password": "Admin1234!" }
```
→ Copia el `access_token` y autoriza en Swagger.

**2. Crear Beneficiario**
```
POST /beneficiarios
{
  "nombre": "JUAN CARLOS PEREZ LOPEZ",
  "curp": "PERJ880101HDFRRN01",
  "sexo": "HOMBRE",
  "fechaNacimiento": "1988-01-01",
  "tiempoAsignado": 48,
  "unidadTiempo": "HORAS"
}
```
→ Anota el `id` (número entero, ej. `1`).

**3. Crear Expediente**
```
POST /civico/expedientes
{
  "beneficiarioId": 1,
  "folioExpediente": "CIV-2026-001",
  "causaPenal": "CP-2026-AX-01",
  "juezCivico": "Lic. Roberto Gomez",
  "fechaInicioSentencia": "2026-04-06",
  "horasSentencia": 48
}
```
→ Anota el `idUUID` (UUID, ej. `e92b7bc0-6e59-...`).  
→ **Haz el reemplazo global de `{{EXP_UUID}}` ahora.**

---

## 👨‍⚕️ Escenario A — Rol: Psicólogo

### A1. Login
```
POST /auth/login
{ "email": "psi@ssp.gob", "password": "Psi1234!" }
```

### A2. Registrar F1 (Entrevista Clínica)
```
POST /civico/f1
{
  "expedienteId": "{{EXP_UUID}}",
  "motivoConsulta": "Remitido por el juzgado cívico por alteración del orden.",
  "consistencia": "ORIENTADO",
  "riesgoSuicida": false,
  "consumeSustancias": false
}
```

### A3. Registrar F5 (Nota de Evolución)
```
POST /civico/f5
{
  "expedienteId": "{{EXP_UUID}}",
  "numSesion": 1,
  "temaSesion": "Manejo de ira",
  "descripcionIntervencion": "Se identificaron detonantes emocionales.",
  "avancePercibido": "SATISFACTORIO"
}
```

### A4. Ver PDF Plan de Vida
```
GET /civico/documentos/plan-vida/{{EXP_UUID}}
```
→ Descarga el PDF directamente desde Swagger.

---

## 👩‍💼 Escenario B — Rol: Trabajo Social

### B1. Login
```
POST /auth/login
{ "email": "ts@ssp.gob", "password": "Ts1234!" }
```

### B2. Registrar F2 (Estudio Socioeconómico)
```
POST /civico/f2
{
  "expedienteId": "{{EXP_UUID}}",
  "ingresoMensual": 6500,
  "egresoMensual": 6000,
  "nivelSocioeconomico": "MEDIO_BAJO",
  "condicionesVivienda": "Casa rentada con servicios básicos."
}
```

### B3. Generar Oficio de Incorporación (PDF + Drive)
```
GET /civico/documentos/oficio-incorporacion/{{EXP_UUID}}
```
> [!NOTE]
> Este GET genera el PDF sin guardarlo. Para guardarlo en Drive, usa el POST correspondiente desde el Admin.

### B4. Ver Historial de Documentos
```
GET /civico/documentos/historial/{{EXP_UUID}}
```
→ Muestra todos los documentos generados y sus URLs de Drive.

---

## 👨‍🏫 Escenario C — Rol: Guia

### C1. Login
```
POST /auth/login
{ "email": "guia@ssp.gob", "password": "Guia1234!" }
```

### C2. Registrar Asistencia #1 (genera PDF + sube a Drive)
```
POST /civico/documentos/lista-asistencia
{
  "expedienteId": "{{EXP_UUID}}",
  "fecha": "2026-04-07",
  "horasCubiertas": 4,
  "asistencia": "PRESENTE",
  "horario": "08:00 - 12:00",
  "sede": "Sede Central",
  "actividadNombre": "Taller de Valores",
  "observaciones": "Asistencia puntual."
}
```
→ La respuesta es un PDF. El `avanceHoras` del expediente ahora muestra 4.

### C3. Registrar Asistencia #2 (falta injustificada)
```
POST /civico/documentos/lista-asistencia
{
  "expedienteId": "{{EXP_UUID}}",
  "fecha": "2026-04-08",
  "horasCubiertas": 0,
  "asistencia": "FALTA_INJUSTIFICADA",
  "horario": "08:00 - 12:00",
  "sede": "Sede Central",
  "actividadNombre": "Tequio de Limpieza",
  "observaciones": "No se presentó sin aviso."
}
```
→ El sistema genera 1 incidencia automáticamente.

### C4. Verificar incidencias
```
GET /civico/incidencias/expediente/{{EXP_UUID}}/strikes
```
→ Debe mostrar `count: 1`.

### C5. Reporte Semanal
```
POST /civico/documentos/reporte-semanal
{
  "expedienteId": "{{EXP_UUID}}",
  "semana": "07 al 11 de abril 2026",
  "actividades": ["Taller de Valores", "Tequio de Limpieza"],
  "observaciones": "Semana con asistencia irregular."
}
```

---

## 🔑 Escenario D — Rol: Admin (avanzado)

### D1. Crear F3 Plan de Trabajo (solo después de tener F1 y F2)
```
POST /civico/f3
{
  "expedienteId": "{{EXP_UUID}}",
  "coordinadorId": 1,
  "fechaInicioEstimada": "2026-04-10",
  "fechaTerminoEstimada": "2026-06-10",
  "metasPrograma": "Reintegración comunitaria."
}
```

### D2. Paquete Federal Completo
```
GET /civico/documentos/expediente/{{EXP_UUID}}/paquete-forms
```
→ Devuelve URLs de Drive de todos los documentos del expediente en un solo JSON.

### D3. Simular Baja por Acumulación
- Repite el Paso C3 dos veces más (3 faltas en total).
- Consulta:
```
GET /civico/expedientes/{{EXP_UUID}}
```
→ `estatusProceso` debe cambiar automáticamente a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`.

---

## ⚡ Atajos para no Re-Pegar IDs

| Situación | Solución |
| :--- | :--- |
| Muchas llamadas con el mismo `expedienteId` | Usar variable en Postman/Insomnia: `{{EXP_UUID}}` |
| Buscar expediente por nombre del beneficiario | `GET /civico/expedientes/caratulas` → filtra por nombre |
| Buscar por CURP | `GET /civico/expedientes/curp/PERJ880101HDFRRN01` |
| Ver todos los documentos del expediente | `GET /civico/documentos/historial/{{EXP_UUID}}` |
| Olvidé el ID del expediente | `GET /civico/expedientes/caratulas` → campo `idUUID` |

> [!TIP]
> **En Postman**: Crea un Environment con variable `EXP_UUID`. Después del Paso 0, escribe un test script:
> ```js
> pm.environment.set("EXP_UUID", pm.response.json().idUUID);
> ```
> Todas las llamadas siguientes usan `{{EXP_UUID}}` automáticamente sin copiar y pegar.

---

## 📊 Checklist de Validación Final

- [ ] Login funciona para los 4 roles
- [ ] F1, F2, F3, F4, F5 se crean sin errores
- [ ] `POST /civico/documentos/lista-asistencia` guarda `sede` en BD
- [ ] `avanceHoras` se actualiza con cada asistencia
- [ ] 3 faltas inyustificadas → `estatusProceso` cambia a BAJA automáticamente
- [ ] PDFs se abren correctamente (no vacíos)
- [ ] URLs de Drive son accesibles (carpetas creadas automáticamente)
- [ ] Oficio de Incorporación se genera con folio que empieza desde `0001` (no desde `0020`)
