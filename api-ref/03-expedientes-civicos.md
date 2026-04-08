# 📁 Expedientes Cívicos — Flujo Completo

El expediente cívico es el núcleo del sistema. Cada beneficiario tiene exactamente un expediente activo que vincula todas las fases (F1–F5, bitácora, incidencias, documentos).

---

## 1. Beneficiarios — `POST /beneficiarios`

**Roles:** Admin, Psicólogo, TrabajoSocial  
**Primer paso obligatorio** — el `id` retornado se usa en expedientes y salud.

### Campos del cuerpo:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `nombre` | string |   | Nombre completo en **MAYÚSCULAS** |
| `tiempoAsignado` | number |   | Número de horas o meses de la sentencia |
| `unidadTiempo` | `HORAS` / `MESES` |   | Unidad de la sentencia |
| `urlFoto` | string | ❌ | URL de la foto. ⚠️ Usa `/` no `\` en rutas locales |

```json
{
  "nombre": "YAHIR LEON REYES",
  "tiempoAsignado": 48,
  "unidadTiempo": "HORAS",
  "urlFoto": "https://drive.google.com/file/d/foto_001/view"
}
```

**Respuesta:** `{ "id": 1, "nombre": "YAHIR LEON REYES", ... }`  
→ Guarda el `id` como `beneficiarioId`.

---

## 2. Crear Expediente — `POST /civico/expedientes`

**Roles:** Solo Admin

### Todos los campos disponibles:

| Campo | Tipo | Req | Descripción |
| :--- | :--- | :---: | :--- |
| `beneficiarioId` | number |   | ID del beneficiario (de Fase 1) |
| `folioExpediente` | string |   | Ej: `EXP-CIV-2026-0001` |
| `causaPenal` | string |   | Ej: `CP-2026-AX-099` |
| `horasSentencia` | number |   | Total de horas a cumplir |
| `fechaNacimiento` | `YYYY-MM-DD` |   | Fecha de nacimiento |
| `domicilioCompleto` | string |   | Domicilio completo del beneficiario |
| `curp` | string | ❌ | CURP (18 caracteres) |
| `genero` | `M` / `F` | ❌ | Género |
| `aliasSobrenombre` | string | ❌ | Apodo si aplica |
| `originario` | string | ❌ | Ciudad/Estado de origen |
| `municipio` | string | ❌ | Municipio de residencia |
| `codigoPostal` | string | ❌ | CP de 5 dígitos |
| `telefonoContacto` | string | ❌ | Teléfono de contacto |
| `escolaridadActual` | string | ❌ | Nivel de estudios |
| `estadoCivil` | string | ❌ | Soltero / Casado / etc. |
| `ocupacionActual` | string | ❌ | Trabajo u ocupación |
| `nacionalidad` | string | ❌ | Por defecto `Mexicana` |
| `lenguaIndigena` | string | ❌ | Si habla lengua indígena |
| `religion` | string | ❌ | Religión si aplica |
| `contactosFamiliares` | JSONB | ❌ | Ver estructura abajo |
| `numJuzgadoCivico` | string | ❌ | Nombre completo del juzgado |
| `juezControl` | string | ❌ | Nombre del juez |
| `generoJuez` | `M` / `F` | ❌ | Género del juez (para documentos) |
| `oficioCanalizacion` | string | ❌ | Ej: `00/2026` |
| `delitoImputado` | string | ❌ | Descripción del delito |
| `agraviado` | string | ❌ | Ej: `Ciudadanía en general` |
| `fechaDetencion` | `YYYY-MM-DD` | ❌ | Fecha de la detención |
| `modalidadFalta` | string | ❌ | Descripción legal de la falta |
| `diasAsignadosJuzgado` | `string[]` | ❌ | Arreglo de fechas `YYYY-MM-DD` |
| `horasPorDia` | number | ❌ | Horas por sesión |
| `fechaInicioBeneficio` | `YYYY-MM-DD` | ❌ | Inicio del programa |
| `fechaTerminoBeneficio` | `YYYY-MM-DD` | ❌ | Fin estimado del programa |
| `fechaOficioCanalizacion` | `YYYY-MM-DD` | ❌ | Fecha del oficio de canalización |

### Estructura de `contactosFamiliares` (JSONB libre):
```json
{
  "madre": { "nombre": "María López García", "telefono": "5559876543" },
  "padre": { "nombre": "José León Reyes", "telefono": "5551112233" },
  "conyuge": { "nombre": "Ana Ramírez", "telefono": "5550001111" }
}
```

### Payload completo de ejemplo:
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
  "numJuzgadoCivico": "Juzgado Cívico Municipal Especializado en Faltas Administrativas",
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

**Respuesta:** Incluye `idUUID` → **¡Este es el `expedienteId` para todo lo demás!**

---

## 3. Consultas de Expedientes

| Endpoint | Descripción |
| :--- | :--- |
| `GET /civico/expedientes` | Lista completa (Admin) |
| `GET /civico/expedientes/caratulas` | Vista ligera para pantalla principal |
| `GET /civico/expedientes/:id` | Expediente completo por UUID |
| `GET /civico/expedientes/:id/caratula` | Header del perfil del beneficiario |
| `GET /civico/expedientes/curp/:curp` | Buscar por CURP (evitar duplicados) |

---

## 4. Actualizar Expediente — `PATCH /civico/expedientes/:id`

**Roles:** Solo Admin  
Solo envía los campos que cambien:

```json
{ "telefonoContacto": "5557654321" }
```

```json
{ "diasAsignadosJuzgado": ["2026-05-05", "2026-05-07"], "horasPorDia": 4 }
```

```json
{ "estatusProceso": "GRADUADO" }
```

```json
{ "estatusF5Cerrado": true }
```

---

## 5. Estados del Expediente (`estatusProceso`)

| Valor | Descripción |
| :--- | :--- |
| `INDUCCION` | Estado inicial al crear el expediente |
| `DIAGNOSTICO` | F1 y/o F2 en proceso |
| `PLANEACION` | F3 y/o F4 en proceso |
| `EN_SEGUIMIENTO` | Bitácora activa, horas en curso |
| `GRADUADO` | Horas cumplidas + todos los formatos cerrados |
| `BAJA_POR_ACUMULACION_DE_INCIDENCIAS` | Baja automática por 3 strikes (RF-013) |
| `BAJA_VOLUNTARIA` | Baja manual aplicada por Admin |

---

## 6. Tabla `expediente_civico` — Campos Clave para el Frontend

| Campo | Tipo | Uso en UI |
| :--- | :--- | :--- |
| `idUUID` | UUID | Identificador para todas las rutas |
| `folioExpediente` | string | Mostrar en la carátula |
| `estatusProceso` | Enum | Badge de estado con color |
| `avanceHoras` | decimal | Barra de progreso vs `horasSentencia` |
| `horasSentencia` | integer | Meta de horas |
| `oficioCanalizacionUrl` | string | Link a Drive del oficio firmado |
| `oficioIncorporacionUrl` | string | Link a Drive del oficio firmado |
| `driveFolderId` | string | ID de la carpeta Drive del beneficiario |
| `estatusF5Cerrado` | boolean | Para validar graduación |
| `esActivo` | boolean | Si `false`, expediente desactivado |

---

## 7. Bitácora y Asistencia

> [!IMPORTANT]
> El endpoint principal para registrar asistencia es **`POST /civico/documentos/lista-asistencia`**, no `/civico/bitacora`. Ese endpoint hace todo en un paso: guarda en BD, actualiza horas, sube a Drive y devuelve el PDF.

- **Registrar asistencia (oficial):** `POST /civico/documentos/lista-asistencia`
- **Plantilla en blanco para imprimir:** `GET /civico/documentos/lista-asistencia/:expedienteId`
- **Ver historial de bitácora:** `GET /civico/bitacora/expediente/:id`
- **Calcular horas:** `GET /civico/bitacora/expediente/:id/horas`

### Estados de asistencia:
- `PRESENTE` → suma las horas cubiertas
- `PRESENTE_PARCIAL` → suma horas, permite registrar incidencia (ej. retardo)
- `FALTA_JUSTIFICADA` → 0 horas, no genera strike
- `FALTA_INJUSTIFICADA` → 0 horas, genera incidencia acumulativa (strike)

---

## 8. Incidencias y Sistema de Strikes (RF-013)

- **Crear incidencia manual:** `POST /civico/incidencias`
- **Ver incidencias:** `GET /civico/incidencias/expediente/:id`
- **Ver strikes:** `GET /civico/incidencias/expediente/:id/strikes`

> [!WARNING]
> **Baja automática**: Al acumular **3 incidencias acumulativas**, el expediente cambia automáticamente a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`.
