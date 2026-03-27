# 📂 Expedientes Cívicos

El expediente es el elemento central del sistema. Contiene los datos de identidad, legales y es el punto de partida para los formatos F1–F5.

## 1. Listar Expedientes (Carátulas)

Para la vista principal del listado, utiliza el endpoint de carátulas para evitar cargar objetos pesados innecesarios.

**Ruta:** `GET /civico/expedientes/caratulas`

**Respuesta (Array):**
```json
[
  {
    "idUUID": "uuid...",
    "folioExpediente": "CIV-2026-001",
    "estatusProceso": "EN_SEGUIMIENTO",
    "avanceHoras": 12.5,
    "horasSentencia": 24,
    "beneficiario": {
      "nombre": "JUAN PÉREZ LÓPEZ",
      "curp": "..."
    }
  }
]
```

## 2. Crear Expediente

Requiere rol `Admin`.

**Ruta:** `POST /civico/expedientes`

**Cuerpo (Campos obligatorios):**
- `beneficiarioId` (int)
- `curp` (string)
- `fechaNacimiento` (date, YYYY-MM-DD)
- `domicilioCompleto` (string)
- `horasSentencia` (int)
- `causaPenal` (string)

## 3. Estados del Proceso (`CivicStatusEnum`)

El frontend debe reaccionar según el estado del expediente:

- `INDUCCION`: Falta realizar F1 y F2.
- `DIAGNOSTICO`: F1 y F2 en proceso.
- `PLANEACION`: F1 y F2 completos, falta F3/F4.
- `EN_SEGUIMIENTO`: Horas en curso.
- `GRADUADO`: Proceso completado exitosamente.
- `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`: El sistema lo bloqueó por mal comportamiento.

## 4. Búsqueda por CURP

Útil para verificar si un beneficiario ya tiene un expediente previo.

**Ruta:** `GET /civico/expedientes/curp/:curp`

## 📊 Tips para el Front
- **Barra de Progreso**: Calcula el porcentaje usando `(avanceHoras / horasSentencia) * 100`.
- **Filtros**: El backend soporta filtrado por estado. Úsalo para separar "Activos" de "Históricos".
