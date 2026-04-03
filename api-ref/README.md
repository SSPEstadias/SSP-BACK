# 📚 Guía de Referencia de la API — Sistema Reconecta con la Paz

Documentación técnica completa para el equipo de **Frontend (Angular)**.  
Todos los endpoints, payloads y reglas de negocio están documentados aquí.

---

## 🗂️ Estructura de la Documentación

| Archivo | Contenido |
| :--- | :--- |
| [`01-autenticacion.md`](./01-autenticacion.md) | Login, JWT, credenciales del seed, tabla de permisos por rol |
| [`02-guia-frontend-angular.md`](./02-guia-frontend-angular.md) | Errores comunes (fotos con `\`), manejo de PDFs como Blob, Postman variables |
| [`03-expedientes-civicos.md`](./03-expedientes-civicos.md) | Todos los campos del expediente, estados, flujo por fases |
| [`04-entrevistas-f1-f2.md`](./04-entrevistas-f1-f2.md) | JSONB completos de F1, F2, F3, F4 y F5 con claves obligatorias |
| [`05-bitacora-e-incidencias.md`](./05-bitacora-e-incidencias.md) | Registrar asistencia, tipos de incidencia, sistema de strikes (RF-013) |
| [`06-documentos-y-drive.md`](./06-documentos-y-drive.md) | Todos los PDFs, subida de escaneados, historial, paquete federal |
| [`07-documentos-y-shared.md`](./07-documentos-y-shared.md) | Beneficiarios, actividades, salud compartida |
| [`09-configuracion.md`](./09-configuracion.md) | Instalación, variables de entorno, comandos de inicio |
| [`10-arquitectura.md`](./10-arquitectura.md) | Estructura de carpetas, módulos, organización del código |
| [`11-plan-pruebas-asesor.md`](./11-plan-pruebas-asesor.md) | Guion Admin completo con todos los payloads (para presentar el sistema) |
| [`12-payloads-swagger.md`](./12-payloads-swagger.md) | Centro de payloads — copia y pega directo en Swagger |
| [`13-plan-pruebas-roles.md`](./13-plan-pruebas-roles.md) | Pruebas por rol + checklist + atajos para no re-pegar IDs |

---

## 🚀 Inicio Rápido (5 minutos)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (ver 09-configuracion.md)
cp .env.example .env

# 3. Iniciar servidor
npm run start:dev

# 4. Crear usuarios y catálogos
npm run seed:admin

# 5. Abrir Swagger
open http://localhost:3000/api-docs
```

---

## ⚡ Flujo Mínimo (Order de Pasos Obligatorio)

```
POST /auth/login              → token JWT
POST /users                   → crear psicólogo, TS, guía
POST /beneficiarios           → id (beneficiarioId)
POST /salud                   → perfil médico
POST /civico/expedientes      → idUUID (expedienteId — guárdalo!)
POST /civico/f1               → F1 COMPLETADO
POST /civico/f2               → F2 COMPLETADO
GET  /civico/f2/.../candado-f3 → { canCrearF3: true }
POST /civico/f3               → Plan de Trabajo
POST /civico/f4               → Cédula Inicial
POST /civico/documentos/lista-asistencia → PDF + Drive
POST /civico/f5               → Sesiones psicológicas
GET  /civico/documentos/oficio-incorporacion/:id → PDF oficial
```

---

## ⚠️ Reglas de Negocio Críticas

| Regla | Descripción |
| :--- | :--- |
| **RF-008** | El F3 no se puede crear si F1 o F2 no están `COMPLETADO`. Devuelve `403`. |
| **RF-013** | La 3ª incidencia acumulativa cambia el expediente a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS` automáticamente. |
| **1:1** | Cada expediente tiene exactamente 1 F1, 1 F2, 1 F3, 1 F4. El F5 permite múltiples sesiones. |
| **Foto barras** | En rutas locales de Windows usar `/` no `\` en `urlFoto`. |
| **JSONB F3** | Las 8 claves de `actividadesPlan` son exactas: `EDUCATIVA`, `PSICOSOCIAL`, `PSICOLOGICA`, `ADICCIONES`, `FAMILIAR`, `LABORAL`, `DEPORTIVA`, `CULTURAL`. |
| **JSONB F4** | Las 5 claves de `seguimientoActividades` son exactas: `EDUCATIVA`, `LABORAL`, `FAMILIAR`, `DEPORTIVO`, `CULTURAL`. |
| **guiaId** | El campo `guiaId` en bitácora/incidencias debe ser el ID de un usuario con rol `guia`. |
| **Folios** | Los folios de expedientes y oficios se generan automáticamente desde la BD (sin offset fijo). |

---

## 💡 Consejos para la Demo

- **Postman:** Configura variables de entorno para `TOKEN`, `BENEF_ID`, `EXP_UUID`. Ver `13-plan-pruebas-roles.md`.
- **Swagger:** Usa los payloads de `12-payloads-swagger.md` y reemplaza `{{EXP_UUID}}` con `Ctrl+H`.
- **Drive en vivo:** Deja Google Drive abierto al lado — el PDF aparece en segundos tras el POST.
- **Logs del servidor:** `npm run start:dev` muestra en consola las subidas a Drive en tiempo real.
