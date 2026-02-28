# 📊 ESTRUCTURA DEL PROYECTO SSP-BACK

## 🗄️ BASE DE DATOS

- **Sistema**: PostgreSQL
- **Nombre BD**: Se define en `.env` con la variable `DB_NAME`
- **Configuración**: Via `TypeOrmModule` con variables de entorno:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `DB_NAME`
- **Synchronize**: `false` (usar migraciones en producción)
- **AutoLoadEntities**: `true` (carga automáticamente las entidades)

---

## 📋 TABLAS/ENTIDADES

### 1. **BENEFICIARIOS**

**Tabla**: `beneficiarios`

| Campo | Tipo | Restricciones |
|-------|------|---|
| `id` | INT | Primary Key, Auto-increment |
| `nombre` | VARCHAR(150) | Required |
| `fecha_ingreso` | DATE | Default: CURRENT_DATE |
| `tiempo_asignado` | INT | Required |
| `unidad_tiempo` | ENUM | Default: MESES |
| `creado_en` | TIMESTAMP | Auto-generated |

**ENUM `UnidadTiempoEnum`**:
- `HORAS`
- `MESES`

**Archivo Entity**: [src/shared/beneficiarios/beneficiario.entity.ts](src/shared/beneficiarios/beneficiario.entity.ts)

---

### 2. **ACTIVIDADES**

**Tabla**: `actividades`

| Campo | Tipo | Restricciones |
|-------|------|---|
| `id` | INT | Primary Key, Auto-increment |
| `nombre` | TEXT | Required, Unique |
| `descripcion` | TEXT | Nullable |
| `objetivo` | TEXT | Nullable |
| `categoria` | ENUM | Nullable |
| `activo` | BOOLEAN | Default: true |

**ENUM `ActividadCategoriaEnum`**:
- `TRABAJO_COMUNITARIO`
- `LIDERAZGO_COMUNITARIO`
- `ATENCION_SUSTANCIAS`
- `EDUCACION_PARA_LA_VIDA`
- `PROMOCION_CULTURAL_DEPORTIVA`

**Archivo Entity**: [src/shared/actividades/actividad.entity.ts](src/shared/actividades/actividad.entity.ts)

---

## 📁 ESTRUCTURA DEL PROYECTO

```
SSP-BACK/
├── src/
│   ├── app.module.ts
│   │   └── Módulo raíz - Configura conexión a BD y importa SharedModule
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.service.ts
│   ├── main.ts
│   │   └── Entry point - Inicia la aplicación con validación global
│   ├── shared/
│   │   ├── shared.module.ts
│   │   │   └── Exporta BeneficiariosModule y ActividadesModule
│   │   ├── beneficiarios/
│   │   │   ├── beneficiario.entity.ts
│   │   │   │   └── Entidad con propiedades de beneficiarios
│   │   │   ├── beneficiarios.service.ts
│   │   │   │   └── Lógica de negocio para beneficiarios
│   │   │   ├── beneficiarios.controller.ts
│   │   │   │   └── Endpoints REST para beneficiarios
│   │   │   ├── beneficiarios.module.ts
│   │   │   │   └── Módulo que agrupa beneficiarios
│   │   │   └── dto/
│   │   │       ├── create-beneficiario.dto.ts
│   │   │       └── update-beneficiario.dto.ts
│   │   └── actividades/
│   │       ├── actividad.entity.ts
│   │       │   └── Entidad con propiedades de actividades
│   │       ├── actividades.service.ts
│   │       │   └── Lógica de negocio para actividades
│   │       ├── actividades.controller.ts
│   │       │   └── Endpoints REST para actividades
│   │       ├── actividades.module.ts
│   │       │   └── Módulo que agrupa actividades
│   │       └── dto/
│   │           └── create-actividad.dto.ts
│   ├── app.controller.spec.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── formatos-civico/
│   ├── guias/
│   ├── psicologicos/
│   └── trabajo-social/
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.build.json
└── ESTRUCTURA_PROYECTO.md (este archivo)
```

---

## 🔧 DEPENDENCIAS PRINCIPALES

### Production
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/config": "^4.0.3",
  "@nestjs/core": "^11.0.1",
  "@nestjs/mapped-types": "^2.1.0",
  "@nestjs/platform-express": "^11.0.1",
  "@nestjs/typeorm": "^11.0.0",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.15.1",
  "pg": "^8.19.0",
  "reflect-metadata": "^0.2.2",
  "rxjs": "^7.8.1",
  "typeorm": "^0.3.28"
}
```

### Development
- ESLint, Prettier, TypeScript
- Jest para testing
- Nest CLI

---

## 🌐 FLUJO DE CONEXIÓN

1. **main.ts** → Inicia la aplicación con `NestFactory.create(AppModule)`
2. **app.module.ts** → 
   - Carga `.env` via `ConfigModule.forRoot()`
   - Configura TypeORM async con `TypeOrmModule.forRootAsync()`
   - Importa `SharedModule`
3. **shared.module.ts** → 
   - Importa `BeneficiariosModule` y `ActividadesModule`
   - Los exporta para que estén disponibles globalmente
4. **Cada módulo** (Beneficiarios/Actividades):
   - Importa `TypeOrmModule.forFeature()` con sus entidades
   - Proporciona su Service y Controller
   - Expone endpoints REST

---

## 🔍 CONFIGURACIÓN IMPORTANTE

### Variables de Entorno (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=usuario
DB_PASSWORD=contraseña
DB_NAME=nombre_de_la_bd
PORT=3000
```

### Validación Global (main.ts)
- `whitelist: true` - Solo acepta campos definidos en DTOs
- `forbidNonWhitelisted: true` - Lanza error si llegan campos no permitidos
- `transform: true` - Convierte tipos automáticamente (ej. "1" → 1)

### TypeORM (app.module.ts)
- `autoLoadEntities: true` - Carga automáticamente las entidades
- `synchronize: false` - En desarrollo puedes cambiar a `true` (en producción usar migraciones)
- Soporta comentarios al respecto en el código

---

## 📚 SCRIPTS DISPONIBLES

```bash
# Desarrollo
npm run start:dev      # Inicia el servidor en modo watch
npm run start:debug    # Inicia con debugger y watch
npm run start          # Inicia el servidor normal
npm run start:prod     # Inicia versión compilada

# Compilación
npm run build          # Compila el proyecto

# Código
npm run format         # Formatea código con Prettier
npm run lint           # Ejecuta ESLint con fix automático

# Testing
npm test               # Ejecuta pruebas unitarias
npm run test:watch     # Pruebas en modo watch
npm run test:cov       # Pruebas con coverage
npm run test:debug     # Pruebas con debugger
npm run test:e2e       # Pruebas end-to-end
```

---

## 🎯 RESUMEN

| Aspecto | Detalles |
|--------|----------|
| **Framework** | NestJS 11.0.1 |
| **BD** | PostgreSQL (TypeORM) |
| **Entidades** | 2 (Beneficiarios, Actividades) |
| **Módulos** | 3 (App, Shared, + 2 submódulos) |
| **Validación** | Class-validator + class-transformer |
| **Testing** | Jest |
| **Linting** | ESLint + Prettier |
| **TypeScript** | Sí |

---

**Última actualización**: 28 de Febrero de 2026
