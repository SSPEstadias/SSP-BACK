# 🧪 Plan de Pruebas por Roles

Guía para probar el sistema con usuarios de diferentes roles y cómo ahorrar tiempo al pasar IDs entre pruebas.

---

## 🔑 Credenciales de Prueba

| Rol | `nomUsuario` | Contraseña | `userId` |
| :--- | :--- | :--- | :--- |
| Admin | `admin` | `Admin1234` | 1 |
| Psicólogo | `psico_ana` | `Admin1234` | 2 |
| Trabajo Social | `social_pedro` | `Admin1234` | 3 |
| Guia | `guia_roberto` | `Admin1234` | 4 |

---

## ⚡ Cómo No Perder Tiempo Re-Pegando IDs

### Opción A — Variables en Postman (recomendado para pruebas iterativas)
1. Crea un **Environment** llamado `SSP-LOCAL`
2. Variables iniciales: `BASE_URL = http://localhost:3000`, `TOKEN = `, `BENEF_ID = `, `EXP_UUID = `
3. En la pestaña **Tests** de cada petición, agrega:

```javascript
// Después de POST /beneficiarios:
pm.environment.set("BENEF_ID", pm.response.json().id);

// Después de POST /civico/expedientes:
pm.environment.set("EXP_UUID", pm.response.json().idUUID);

// Después de POST /auth/login:
pm.environment.set("TOKEN", pm.response.json().access_token);
```

4. En todas las peticiones usa `{{BASE_URL}}/civico/expedientes/{{EXP_UUID}}` y `Bearer {{TOKEN}}`

### Opción B — Ctrl+H en Swagger
1. Copia los payloads de `12-payloads-swagger.md`
2. Abre un editor de texto y reemplaza `{{EXP_UUID}}` con el UUID real
3. Pega en el campo de Swagger

### Opción C — GET de consulta rápida
Si perdiste el UUID, búscalo por CURP:
```
GET /civico/expedientes/curp/LEOY880101HDFRRN01
```
O lista todos:
```
GET /civico/expedientes/caratulas
```

---

## 🟦 Prueba: ROL ADMIN — Flujo Completo

El Admin puede hacer **todo**. Sigue el guion de `11-plan-pruebas-asesor.md`.

**Verificaciones clave:**
- [ ] `POST /auth/login` → obtiene token
- [ ] `POST /users` → crea psicólogo, TS, guía
- [ ] `POST /beneficiarios` → crea beneficiario
- [ ] `POST /salud` → perfil de salud
- [ ] `POST /civico/expedientes` → expediente con UUID
- [ ] `GET /civico/expedientes/caratulas` → lista carátulas
- [ ] `POST /civico/f1` → F1 COMPLETADO
- [ ] `POST /civico/f2` → F2 COMPLETADO
- [ ] `GET /civico/f2/expediente/{{EXP_UUID}}/candado-f3` → `canCrearF3: true`
- [ ] `POST /civico/f3` → Plan de Trabajo con 8 claves JSONB
- [ ] `POST /civico/f4` → Cédula con 5 claves JSONB
- [ ] `POST /civico/documentos/lista-asistencia` → devuelve PDF + sube a Drive
- [ ] `GET /civico/bitacora/expediente/{{EXP_UUID}}/horas` → muestra avance
- [ ] `POST /civico/f5` → primera sesión psicológica
- [ ] `GET /civico/documentos/oficio-incorporacion/{{EXP_UUID}}` → PDF
- [ ] `POST /civico/incidencias` x3 → tercer strike → baja automática

---

## 🟣 Prueba: ROL PSICÓLOGO

**Login:** `{ "nomUsuario": "psico_ana", "contrasena": "Admin1234" }`

**Puede:**
- [ ] `GET /civico/expedientes/caratulas` ✅
- [ ] `GET /civico/expedientes/{{EXP_UUID}}` ✅
- [ ] `POST /beneficiarios` ✅
- [ ] `GET /salud/beneficiario/1` ✅
- [ ] `POST /civico/f1` ✅
- [ ] `PATCH /civico/f1/:id` ✅
- [ ] `POST /civico/f5` ✅
- [ ] `GET /civico/f2/expediente/{{EXP_UUID}}` ✅ (solo lectura)
- [ ] `GET /civico/documentos/plan-vida/{{EXP_UUID}}` ✅
- [ ] `GET /civico/documentos/nota-evolucion/{{EXP_UUID}}` ✅
- [ ] `GET /civico/documentos/f3-plan-trabajo/{{EXP_UUID}}` ✅

**NO puede:**
- [ ] `POST /civico/expedientes` → 403 ❌
- [ ] `POST /civico/f3` → 403 ❌
- [ ] `POST /civico/bitacora` → 403 ❌
- [ ] `GET /civico/documentos/oficio-incorporacion/{{EXP_UUID}}` → 403 ❌

---

## 🟢 Prueba: ROL TRABAJO SOCIAL

**Login:** `{ "nomUsuario": "social_pedro", "contrasena": "Admin1234" }`

**Puede:**
- [ ] `GET /civico/expedientes/caratulas` ✅
- [ ] `POST /beneficiarios` ✅
- [ ] `POST /civico/f2` ✅
- [ ] `PATCH /civico/f2/:id` ✅
- [ ] `GET /civico/f1/expediente/{{EXP_UUID}}` ✅ (solo lectura)
- [ ] `GET /civico/documentos/oficio-incorporacion/{{EXP_UUID}}` ✅
- [ ] `GET /civico/documentos/oficio-conclusion/{{EXP_UUID}}` ✅
- [ ] `POST /civico/documentos/subir-escaneado` ✅

**NO puede:**
- [ ] `POST /civico/expedientes` → 403 ❌
- [ ] `POST /civico/f1` → 403 ❌
- [ ] `POST /civico/f3` → 403 ❌
- [ ] `POST /civico/bitacora` → 403 ❌
- [ ] `GET /civico/documentos/plan-vida/{{EXP_UUID}}` → 403 ❌

---

## 🟡 Prueba: ROL GUÍA

**Login:** `{ "nomUsuario": "guia_roberto", "contrasena": "Admin1234" }`

**Puede:**
- [ ] `GET /civico/expedientes/caratulas` ✅
- [ ] `POST /civico/bitacora` ✅ (requiere `guiaId: 4`)
- [ ] `GET /civico/bitacora/expediente/{{EXP_UUID}}` ✅
- [ ] `GET /civico/bitacora/expediente/{{EXP_UUID}}/horas` ✅
- [ ] `POST /civico/documentos/lista-asistencia` ✅
- [ ] `POST /civico/documentos/reporte-semanal` ✅
- [ ] `GET /civico/documentos/lista-asistencia/{{EXP_UUID}}` ✅ (plantilla)
- [ ] `POST /civico/incidencias` ✅
- [ ] `PATCH /civico/incidencias/:id/resolver` ✅
- [ ] `GET /civico/incidencias/expediente/{{EXP_UUID}}/strikes` ✅

**NO puede:**
- [ ] `POST /civico/expedientes` → 403 ❌
- [ ] `POST /civico/f1` → 403 ❌
- [ ] `POST /civico/f2` → 403 ❌
- [ ] `POST /civico/f3` → 403 ❌
- [ ] `GET /civico/documentos/oficio-incorporacion/{{EXP_UUID}}` → 403 ❌
- [ ] `POST /users` → 403 ❌

---

## ⚠️ Casos Borde para Probar

| Escenario | Endpoint | Resultado esperado |
| :--- | :--- | :--- |
| Crear F3 sin F1/F2 COMPLETADO | `POST /civico/f3` | `403 Forbidden — RF-008` |
| Crear segundo F1 en mismo expediente | `POST /civico/f1` | `409 Conflict` |
| Registrar >8 horas en bitácora | `POST /civico/bitacora` | `400 Bad Request` |
| 3ª incidencia acumulativa | `POST /civico/incidencias` | expediente → `BAJA_POR_ACUMULACION_DE_INCIDENCIAS` |
| CURP duplicada en expediente | `POST /civico/expedientes` | `409 Conflict` |
| `guiaId` con rol que no es guia | `POST /civico/bitacora` | `400 Bad Request` |
| Foto con barras invertidas | `POST /beneficiarios` | `400 / JSON parse error` |

---

## 💡 Consejos para la Demo con el Asesor

1. **Pantalla dividida**: Swagger en la izquierda, Drive en la derecha. Cuando generes un PDF, aparece en Drive en segundos.
2. **Muestra los logs**: Deja visible la consola de `npm run start:dev`. Se ven los logs de subida a Drive en tiempo real.
3. **Demuestra el candado**: Intenta crear el F3 sin el F1/F2 COMPLETADO y muestra el `403`.
4. **Demuestra la baja automática**: Registra 3 incidencias acumulativas y verifica el `estatusProceso`.
5. **Muestra el paquete Federal**: `GET /civico/documentos/expediente/{{EXP_UUID}}/paquete-forms` — todas las URLs de Drive consolidadas.
