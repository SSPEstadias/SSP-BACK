# 📚 Guía de Referencia de la API — Módulo Cívico

Bienvenido a la documentación técnica del sistema **Reconecta con la Paz**. Esta guía está diseñada para que el equipo de Frontend (Angular 21) pueda integrar las funcionalidades de manera fluida y estandarizada.

## 🗂️ Estructura de la Documentación

1. [**01. Autenticación y Seguridad**](./01-autenticacion.md)
   - Flujo de JWT, manejo de roles y cabeceras de autorización.
2. [**02. Guía para Frontend (Angular 21)**](./02-guia-frontend-angular.md)
   - Mejores prácticas, uso de Signals, servicios y manejo de interceptores.
3. [**03. Expedientes Cívicos**](./03-expedientes-civicos.md)
   - Gestión completa, **F1-F5**, bitácora de horas e incidencias (strikes).
4. [**04. Entrevistas F1 / F2 (JSONB Mapping)**](./04-entrevistas-f1-f2.md)
   - Guía exhaustiva para guardar tablas familiares y datos socioeconómicos.
5. [**05. Bitácora e Incidencias**](./05-bitacora-e-incidencias.md)
   - Control de asistencia y disparadores de baja automática.
6. [**06. Documentos y Google Drive**](./06-documentos-y-drive.md)
   - Modelo híbrido (Generación vs Registro) y Paquete Federal.
7. [**07. Beneficiarios y Catálogos**](./07-documentos-y-shared.md)
   - Maestro de personas, actividades, salud y manejo de errores.
8. [**08. Guía Drive para Penal/Voluntarios**](./08-guia-subida-drive.md)
   - Manual técnico para integrar nuevos servicios de carga de archivos.
9. [**09. Instalación y Configuración (.env)**](./09-configuracion.md)
   - Requisitos, comandos de inicio y secretos del servidor.
10. [**10. Arquitectura y Estructura**](./10-arquitectura.md)
   - Guía de carpetas, módulos y organización del código.
11. [**11. Plan de Pruebas y Demostración (Asesor)**](./11-plan-pruebas-asesor.md)
   - Guion detallado con flujos de Salud, Actividades y Drive.
12. [**12. Centro de Payloads Maestros**](./12-payloads-swagger.md)
   - Todos los JSONs realistas listos para copiar y pegar en Swagger.
13. [**13. Plan de Pruebas por Roles**](./13-plan-pruebas-roles.md)
   - Guion completo por rol (Admin, Guia, Psicólogo, Trabajo Social) con atajos para no re-pegar IDs.

## 🚀 Conceptos Clave

- **Modelo Híbrido**: Muchos endpoints de documentos soportan `GET` para previsualización inmediata y `POST` para persistencia en base de datos y Google Drive.
- **Zero-Trust Drive**: El servidor gestiona automáticamente la creación y saneamiento de carpetas; no elimines carpetas manualmente de la nube.
- **Arquitectura Basada en Roles**: Los botones del front dependen estrictamente del rol (`Admin`, `Psicologo`, `TrabajoSocial`, `Guia`).
- **Validación Atómica**: El cambio de estatus a `GRADUADO` o `BAJA` es automático basado en reglas críticas.

---
*Documentación generada para la versión de Angular 21.1.0*
