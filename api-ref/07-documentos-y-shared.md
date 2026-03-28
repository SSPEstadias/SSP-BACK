# 🤝 Módulos Compartidos (Shared)

Estos módulos proporcionan funcionalidades transversales utilizadas tanto por Cívico como por Penal y Voluntarios.

## 1. Beneficiarios

Es el catálogo maestro de personas en el sistema.

- **Listar todos:** `GET /beneficiarios`
- **Buscar por ID:** `GET /beneficiarios/:id`
- **Crear/Actualizar:** `POST /beneficiarios` / `PATCH /beneficiarios/:id`
- **Filtrar por Unidad:** `GET /beneficiarios/filtrar?unidad=HORAS` (filtros: `HORAS`, `VOLUNTARIO`).

---

## 2. Actividades y Salud

Gestionan el catálogo de intervenciones y registros médicos básicos.

- **Actividades:** `GET /actividades` (Talleres, Servicio Comunitario, etc.)
- **Salud:** `GET /salud` (Registros de alergias o condiciones médicas).

---

## 3. Usuarios y Roles

El sistema utiliza RBAC (Role-Based Access Control). Los roles influyen en la visibilidad de los botones en el Frontend.

| Rol | Descripción |
| :--- | :--- |
| `Admin` | Control total, puede cerrar expedientes y firmar de baja. |
| `Psicologo` | Acceso a F1, F5 y Plan de Vida. |
| `TrabajoSocial` | Acceso a F2 y gestión de carátulas socioeconómicas. |
| `Guia` | Registro de asistencias en bitácora e incidencias. |

---

## 4. Manejo de Errores y Estados

### Códigos de Estado Comunes:
- `200 OK`: Éxito en la consulta.
- `201 Created`: Recurso creado con éxito.
- `400 Bad Request`: Error de validación (revisar el mensaje del JSON).
- `401 Unauthorized`: Token JWT expirado o inválido.
- `403 Forbidden`: El usuario no tiene el rol necesario para esta acción.
- `404 Not Found`: El ID solicitado no existe.

### Tipos de Datos (Convenciones):
- **Fechas**: Siempre en formato ISO `YYYY-MM-DD`.
- **Booleano**: `true` / `false`.
- **Decimales**: Usar para horas (`avanceHoras: 12.5`).
