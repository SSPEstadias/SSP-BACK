# 🔐 Autenticación y Seguridad

Todo el sistema usa **JWT Bearer Token**. Sin token, todas las rutas devuelven `401 Unauthorized`.

---

## 1. Login — `POST /auth/login`

**Roles:** Público (sin token)

```json
{ "nomUsuario": "admin", "contrasena": "Admin1234" }
```

**Respuesta exitosa (`200`):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "rol": "admin",
  "nombre": "Administrador del Sistema"
}
```

> ⚠️ El token dura **8 horas**. Si ves `401` en endpoints que antes funcionaban, vuélvete a loguear.

---

## 2. Credenciales del Seed (`npm run seed:admin`)

Después de ejecutar el seeder, estos usuarios existen por defecto:

| `nomUsuario` | Contraseña | Rol | `id` del usuario |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin1234` | `admin` | 1 |
| `psico_ana` | `Admin1234` | `psicologo` | 2 |
| `social_pedro` | `Admin1234` | `trabajo_social` | 3 |
| `guia_roberto` | `Admin1234` | `guia` | 4 |

> Usa `GET /users` (solo Admin) para ver todos los usuarios e IDs actuales.

---

## 3. Cómo Autorizar en Swagger

1. Ejecuta `POST /auth/login`
2. Copia el valor de `access_token` (sin comillas)
3. Haz clic en el botón 🔒 **Authorize** (arriba a la derecha en Swagger)
4. Escribe: `Bearer <pega_el_token_aquí>`
5. Clic en **Authorize** → **Close**

---

## 4. Tabla de Permisos por Rol

| Endpoint | Admin | Psicólogo | T.Social | Guia |
| :--- | :---: | :---: | :---: | :---: |
| `POST /users` | ✅ | ❌ | ❌ | ❌ |
| `POST /beneficiarios` | ✅ | ✅ | ✅ | ❌ |
| `POST /salud` | ✅ | ✅ | ❌ | ❌ |
| `POST /civico/expedientes` | ✅ | ❌ | ❌ | ❌ |
| `GET /civico/expedientes/**` | ✅ | ✅ | ✅ | ✅ |
| `POST /civico/f1` | ✅ | ✅ | ❌ | ❌ |
| `POST /civico/f2` | ✅ | ❌ | ✅ | ❌ |
| `POST /civico/f3` (candado RF-008) | ✅ | ❌ | ❌ | ❌ |
| `POST /civico/f4` | ✅ | ❌ | ❌ | ❌ |
| `POST /civico/f5` | ✅ | ✅ | ❌ | ❌ |
| `POST /civico/bitacora` | ✅ | ❌ | ❌ | ✅ |
| `POST /civico/incidencias` | ✅ | ❌ | ❌ | ✅ |
| `GET /civico/incidencias/**` | ✅ | ✅ | ✅ | ✅ |
| `POST /civico/documentos/lista-asistencia` | ✅ | ❌ | ❌ | ✅ |
| `POST /civico/documentos/reporte-semanal` | ✅ | ❌ | ❌ | ✅ |
| `GET /civico/documentos/oficio-*` | ✅ | ❌ | ✅ | ❌ |
| `GET /civico/documentos/f3-*` | ✅ | ✅ | ✅ | ❌ |
| `GET /civico/documentos/f4-*` | ✅ | ✅ | ✅ | ❌ |
| `GET /civico/documentos/plan-vida/*` | ✅ | ✅ | ❌ | ❌ |
| `GET /civico/documentos/nota-evolucion/*` | ✅ | ✅ | ❌ | ❌ |
| `GET /civico/documentos/historial/*` | ✅ | ✅ | ✅ | ✅ |
| `POST /civico/documentos/subir-escaneado` | ✅ | ❌ | ✅ | ❌ |
| `GET /civico/documentos/expediente/*/paquete-forms` | ✅ | ✅ | ✅ | ❌ |

---

## 5. Crear Usuarios del Sistema — `POST /users`

**Roles:** Solo Admin

```json
{
  "nomUsuario": "guia_carlos",
  "nombre": "Carlos Torres Guía",
  "rol": "guia",
  "contrasena": "Admin1234"
}
```

**Roles válidos:** `admin` · `psicologo` · `trabajo_social` · `guia`

> El `id` retornado se usa en F1/F5 como `psicologoId`, en F2 como `trabajadorSocialId`, en bitácora e incidencias como `guiaId`.

---

## 6. Errores de Autenticación

| Código HTTP | Causa | Solución |
| :--- | :--- | :--- |
| `401 Unauthorized` | Sin token o expirado | Volver a hacer `POST /auth/login` |
| `403 Forbidden` | Tu rol no tiene permiso | Revisar la tabla de permisos |
| `409 Conflict` (en POST /users) | `nomUsuario` duplicado | Usar un nombre diferente |
