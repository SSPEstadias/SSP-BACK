# 🔐 Autenticación y Seguridad

El sistema utiliza **JSON Web Tokens (JWT)** para la seguridad. Cada petición a un endpoint protegido (la mayoría en `/civico/*`) debe incluir un token válido.

## 1. Obtener Token (Login)

**Ruta:** `POST /auth/login`

**Cuerpo:**
```json
{
  "nomUsuario": "nombre_de_usuario",
  "contrasena": "tu_password"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

## 2. Uso del Token

Debes incluir el token en el encabezado `Authorization` usando el esquema `Bearer`:

```http
Authorization: Bearer <access_token>
```

> [!WARNING]
> Si omites este encabezado o el token ha expirado, el servidor responderá con `401 Unauthorized`.

## 3. Roles del Sistema

El acceso a las funcionalidades está restringido por el rol asignado al usuario en el sistema.

| Rol | Descripción | Acceso Principal |
| :--- | :--- | :--- |
| **Admin** | Acceso Total | Gestión de usuarios, configuración y baja definitiva. |
| **Psicólogo** | Clínico | F1 (Entrevista), F5 (Notas de Evolución), Perfil de Salud. |
| **TrabajoSocial** | Socioeconómico | F2 (Estudio Socioeconómico), Entrevistas de Inducción. |
| **Guía** | Operatividad | Bitácora de asistencia, Registro de incidencias. |

## 4. Expiración y Sesión

- **Duración**: Por defecto el token dura **8 horas**.
- **Comportamiento**: Al expirar, recibirás un error `401`. Se recomienda capturar este error en un **Interceptor de Angular** para redirigir al usuario al login automáticamente.
- **Configuración**: El tiempo de vida se define en el `.env` del servidor mediante `JWT_EXPIRES_IN`.
