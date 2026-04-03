# 📂 Expedientes Cívicos

El expediente es el elemento central del sistema. Contiene los datos de identidad, legales y es el punto de partida para los formatos F1–F5.

## 1. Gestión de Expedientes

### 📋 Listado de Carátulas
Ideal para la vista principal del CRM. Devuelve datos ligeros y el avance de horas.
- **Ruta:** `GET /civico/expedientes/caratulas`
- **Roles:** Admin, Psicologo, TrabajoSocial, Guia

### 🔍 Búsqueda por CURP
Útil para evitar duplicados en el registro inicial.
- **Ruta:** `GET /civico/expedientes/curp/:curp`

### 🆕 Crear Expediente
- **Ruta:** `POST /civico/expedientes`
- **Roles:** Admin
- **Body:** `beneficiarioId`, `curp`, `fechaNacimiento`, `domicilioCompleto`, `horasSentencia`, `causaPenal`.

---

## 2. Flujo de Formatos (F1 - F5)

El sistema sigue un orden lógico de diagnóstico y seguimiento:

| Formato | Propósito | Endpoint Base | Permiso |
| :--- | :--- | :--- | :--- |
| **F1** | Entrevista Clínica | `/civico/f1` | Psicólogo |
| **F2** | Estudio Socioeconómico | `/civico/f2` | Trabajo Social |
| **F3** | Plan de Trabajo | `/civico/f3` | Admin |
| **F4** | Cédula Inicial | `/civico/f4` | Admin |
| **F5** | Seg. Psicológico | `/civico/f5` | Psicólogo |

> [!IMPORTANT]
> **Candado RF-008**: No se puede crear un **F3 (Plan)** si el **F1** y **F2** no están marcados como `COMPLETADO`.

---

## 3. Bitácora y Asistencia

La bitácora controla el avance de horas del beneficiario.

> [!IMPORTANT]
> El endpoint principal para registrar asistencia es **`POST /civico/documentos/lista-asistencia`**, no `/civico/bitacora`. Ese endpoint hace todo en un paso: guarda en BD, actualiza horas, sube a Drive y devuelve el PDF.

- **Registrar Asistencia:** `POST /civico/documentos/lista-asistencia`
- **Plantilla en blanco:** `GET /civico/documentos/lista-asistencia/:expedienteId`
- **Ver historial de bitácora:** `GET /civico/bitacora/expediente/:id`
- **Calcular Horas:** `GET /civico/bitacora/expediente/:id/horas`

### Estados de Asistencia:
- `PRESENTE`: Suma el total de horas cubiertas.
- `PRESENTE_PARCIAL`: Suma horas y permite registrar una incidencia (ej. Retardo).
- `FALTA_INJUSTIFICADA`: 0 horas, genera incidencia automática.

---

## 4. Incidencias y Sistema de "Strikes"

El sistema monitorea el comportamiento. Las incidencias pueden ser manuales o automáticas desde la bitácora.

- **Crear Incidencia Manual:** `POST /civico/incidencias`
- **Ver "Strikes":** `GET /civico/incidencias/expediente/:id/strikes`

> [!WARNING]
> **Baja Automática**: Al acumular **3 incidencias**, el expediente cambia automáticamente su estatus a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`.

---

## 5. Diccionario: Tabla `expediente_civico`

Campos clave que el Frontend debe manejar:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `idUUID` | UUID | Identificador único para rutas. |
| `folioExpediente` | String | Formato: `CIV-YYYY-XXX`. |
| `estatusProceso` | Enum | `INDUCCION`, `DIAGNOSTICO`, `PLANEACION`, `EN_SEGUIMIENTO`, `GRADUADO`, `BAJA`. |
| `avanceHoras` | Decimal | Total de horas acumuladas en bitácora. |
| `horasSentencia` | Integer | Meta de horas a cumplir. |
| `oficioCanalizacionUrl` | String | Link a Drive del documento firmado. |
| `oficioIncorporacionUrl` | String | Link a Drive del documento firmado. |
