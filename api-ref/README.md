# 📚 Guía de Referencia de la API — Módulo Cívico

Bienvenido a la documentación técnica del sistema **Reconecta con la Paz**. Esta guía está diseñada para que el equipo de Frontend (Angular 21) pueda integrar las funcionalidades de manera fluida y estandarizada.

## 🗂️ Estructura de la Documentación

1. [**01. Autenticación y Seguridad**](./01-autenticacion.md)
   - Flujo de JWT, manejo de roles y cabeceras de autorización.
2. [**02. Guía para Frontend (Angular 21)**](./02-guia-frontend-angular.md)
   - Mejores prácticas, uso de Signals, servicios y manejo de interceptores.
3. [**03. Expedientes Cívicos**](./03-expedientes-civicos.md)
   - Gestión de beneficiarios, estatus de proceso y carátulas.
4. [**04. Entrevistas F1 / F2 (JSONB Mapping)**](./04-entrevistas-f1-f2.md)
   - Guía exhaustiva para guardar tablas familiares, proyectos de vida y datos socioeconómicos sin pérdida de información.
5. [**05. Bitácora e Incidencias**](./05-bitacora-e-incidencias.md)
   - Control de asistencia, conteo de horas y disparadores de baja automática.
6. [**06. Documentos y Google Drive**](./06-documentos-y-drive.md)
   - Modelo híbrido (Generación vs Registro), Carga de archivos firmados y el Paquete Federal.

## 🚀 Conceptos Clave

- **Modelo Híbrido**: Muchos endpoints de documentos soportan `GET` para previsualización inmediata y `POST` para persistencia en base de datos y Google Drive.
- **Zero-Trust Drive**: El servidor gestiona automáticamente la creación y saneamiento de carpetas en la nube.
- **Validación Atómica**: El cambio de estatus a `GRADUADO` o `BAJA` es automático basándose en las reglas de negocio (horas cumplidas + formatos cerrados).

---
*Documentación generada para la versión de Angular 21.1.0*
