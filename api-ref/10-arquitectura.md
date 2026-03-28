# 🏗️ Arquitectura y Estructura del Proyecto

Esta guía explica cómo está organizado el código del backend de **Reconecta con la Paz** para facilitar el mantenimiento y la escalabilidad del equipo.

## 1. Estructura de Carpetas Global

El proyecto sigue el patrón modular de **NestJS**:

```text
src/
├── main.ts              # Punto de entrada (Configura Swagger y Prefijos)
├── app.module.ts        # Módulo raíz que orquesta todo
├── modules/             # Capa de Negocio (Módulos específicos)
│   ├── civico/          # Módulo Cívico (Expedientes, F1-F5, Drive)
│   ├── penal/           # Módulo Penal (Reservado)
│   └── voluntarios/     # Módulo Voluntarios
├── shared/              # Capa Compartida (Reutilizable por todos)
│   ├── auth/            # Seguridad JWT y Login
│   ├── beneficiarios/   # Maestro de Personas
│   ├── google-drive/    # Servicio Core de Nube
│   └── salud/           # Catálogo Médico
└── seeds/               # Scripts para cargar datos iniciales (Admin)
```

---

## 2. Anatomía de un Módulo (Ej: `civico/expedientes`)

Cada funcionalidad dentro de un módulo se divide en responsabilidades claras:

- **`*.entity.ts`**: Define la tabla en la Base de Datos (TypeORM).
- **`*.controller.ts`**: Define las rutas (endpoints) y valida los roles.
- **`*.service.ts`**: Contiene la **lógica de negocio** avanzada y cálculos.
- **`dto/`**: Define la estructura de los datos que viajan por el red (Campos obligatorios).

---

## 3. Capa de Documentación Híbrida

Ubicada en `src/modules/civico/documentos`:
- **`templates/`**: Archivos `.hbs` (Handlebars) con el diseño de los oficios y formularios.
- **`assets/`**: Logos, sellos y marcas de agua oficiales en PNG/JPG.
- **`partials/`**: Fragmentos reutilizables de HTML (encabezados, pies de página).

---

## 4. Filosofía de Desarrollo

### 🛡️ Seguridad (RBAC)
Los módulos están protegidos por el `RolesGuard`. No intentes crear endpoints sin definir `@Roles(Role.ADMIN, ...)` a menos que sean públicos.

### 👥 Shared vs Modules
- Si una entidad es usada por **varios** departamentos (ej: Beneficiarios), debe estar en `src/shared`.
- Si una entidad es **exclusiva** de un proceso administrativo (ej: F1), debe estar en `src/modules/civico`.

### ☁️ Google Drive
No se suben archivos directamente desde los controladores. Siempre se usa el `CivicoGoogleDriveService` para asegurar que las carpetas se creen con el formato legal correcto.
