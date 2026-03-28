# 📋 Guion Maestro de Demostración (Para Asesor)

Este plan detalla el flujo **punta a punta** del sistema, demostrando las reglas de negocio críticas y la integración con la nube.

---

## 🛠️ Fase 0: Preparación del "Showroom"

1.  **Limpieza Total**: Borra las tablas o la BD entera.
2.  **Arranque Limpio**: `npm run start:dev`.
3.  **Carga de Catálogos**: `npm run seed:admin`. (El seeder ahora ya incluye actividades de Tequio, Liderazgo, etc.)
4.  **Acceso**: Abre `http://localhost:3000/api-docs` y haz Login en el Paso 1 de `12-payloads-swagger.md`.

---

## 🚀 Fase 1: El Camino del Beneficiario

### 1. Registro y Apertura (0-10 min)
- **Concepto**: "La puerta de entrada al sistema".
- **Acción**: Crea el **Beneficiario** y luego el **Expediente**.
- **Punto Clave**: Explica que el `idUUID` es la llave de seguridad para evitar ataques de enumeración.

### 2. Los Diagnósticos (F1 y F2)
- **Concepto**: "Evaluación Multidimensional".
- **Punto Clave**: Muestra cómo el F1 (Psicológico) y F2 (Socioeconómico) capturan datos complejos en JSONB. El sistema no permite avanzar si estos están incompletos.

---

## 🏥 Fase 2: El Filtro de Salud (Crítico)

Este paso es vital para impresionar a tu asesor. Demuestra que el sistema es **"Inteligente"**.

1.  **Dictamen Médico**: Ejecuta `POST /salud`.
2.  **Escenario A (Apto)**: Registra que es apto y sin restricciones.
3.  **Escenario B (No Apto)**: Registra "No Apto" o añade restricciones como `TRABAJO_COMUNITARIO`.
4.  **Lo que debes decir**: *"Si el médico marca que no es apto para trabajo pesado, el sistema alertará al coordinador para que no asigne actividades de riesgo en el Plan de Trabajo"*.

---

## 📅 Fase 3: Planeación y Operación (F3 y Bitácora)

1.  **Plan de Trabajo (F3)**:
    - Selecciona actividades del catálogo que acabamos de "seedear".
    - Muestra cómo se eligen metas realistas (ej: "Manual Fénix" para control de impulsos).
2.  **Bitácora (Asistencia)**:
    - Registra 4 horas de un Tequio.
    - **Demuestra el Límite**: Intenta registrar 10 horas y muestra cómo el servidor lo rechaza (Regla RF-011).
3.  **Seguimiento (F5)**:
    - Registra una nota de evolución. *"Aquí el psicólogo anota el progreso real de la persona"*.

---

## 📄 Fase 4: La Prueba de Fuego (PDF y Drive)

Este es el clímax de la presentación.

1.  **Generación de Oficio**: Ejecuta el endpoint de **Oficio de Incorporación**.
2.  **Sincronización en Vivo**: 
    - Muestra la consola de NestJS (verás los logs de subida a Drive).
    - **Abre Google Drive** en el navegador y muestra la carpeta del beneficiario recién creada con el PDF adentro.
3.  **Concepto**: *"Zero-Trust Drive: El backend gestiona la nube, el usuario no necesita tocar Drive manualmente"*.

---

## 🗣️ Glosario de Defensa Técnica

Responde a las preguntas de tu asesor con estos conceptos:

- **Escalabilidad Horizontal**: "Diseñé el servicio de Drive para ser inyectable; pronto podremos añadir módulos de UNEME-CAPA o Bienestar sin tocar el core".
- **Persistencia de Esquema Flexible**: "Usamos JSONB para los diagnósticos (F1/F2) permitiendo que los formularios evolucionen sin alterar la estructura fija de la base de datos".
- **Validación Atómica**: "Cada endpoint usa DTOs estrictos que rechazan datos mal formados antes de tocar la capa de servicios".
