# 📄 Módulo de Documentos PDF — Reconecta con la Paz

Genera automáticamente todos los documentos institucionales del Programa Cívico en formato PDF usando **Handlebars** (`.hbs`) + **Puppeteer** en un pipeline NestJS.

---

## 🗂 Estructura de archivos

```
src/modules/civico/documentos/
├── assets/                    ← Logos institucionales (PNG/JPG)
│   ├── logoencabezado_con_margen_derecho(...).png  ← Logo principal (header)
│   ├── LOGO_RECONECTACONLAPAZ_MARCA DE AGUA.jpg    ← Marca de agua (fondo)
│   └── ...otros logos
├── docs-word/                 ← Plantillas Word de referencia (solo lectura)
│   ├── ANTERIORES/            ← Versiones previas
│   └── *.docx                 ← Versiones actuales
├── partials/                  ← Fragmentos HBS reutilizables
│   ├── _header.hbs            ← Encabezado institucional (logo + títulos)
│   ├── _footer.hbs            ← Pie de página (contacto + número de página)
│   └── _watermark.hbs         ← Marca de agua (posición fija)
├── templates/                 ← Plantillas HBS completas (1 por documento)
│   ├── oficio_incorporacion.hbs
│   ├── oficio_conclusion.hbs
│   ├── oficio_baja_definitiva.hbs
│   ├── hoja_presentacion.hbs
│   ├── reporte_semanal.hbs
│   ├── ficha_incidencias.hbs
│   ├── plan_vida.hbs
│   ├── f3_plan_trabajo.hbs
│   ├── f4_cedula_inicial.hbs
│   └── lista_asistencia.hbs
├── documentos.service.ts      ← Lógica de generación + contextos desde BD
├── documentos.controller.ts   ← Endpoints GET/POST → PDF
├── documentos.module.ts       ← Módulo NestJS (TypeORM + DI)
└── README.md                  ← Este archivo
```

---

## 🚀 Endpoints disponibles

Todos requieren `Authorization: Bearer <token>` y están bajo el prefijo `/civico/documentos`.

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/oficio-incorporacion/:expedienteId` | Admin, TrabajoSocial | Oficio de incorporación al programa |
| GET | `/oficio-conclusion/:expedienteId` | Admin, TrabajoSocial | Oficio de conclusión satisfactoria |
| GET | `/informe-baja/:expedienteId` | Admin, TrabajoSocial | Informe de baja definitiva |
| GET | `/hoja-presentacion/:expedienteId` | Admin, Psicologo, TrabajoSocial | Hoja de presentación |
| GET | `/ficha-incidencias/:expedienteId` | Admin, Guia, TrabajoSocial, Psicologo | Ficha técnica de incidencias |
| GET | `/f3-plan-trabajo/:expedienteId` | Admin, TrabajoSocial, Psicologo | F3 — Plan de trabajo |
| GET | `/f4-cedula-inicial/:expedienteId` | Admin, TrabajoSocial, Psicologo | F4 — Cédula inicial |
| GET | `/plan-vida/:expedienteId` | Admin, Psicologo | Plan de vida individualizada |
| POST | `/lista-asistencia` | Admin, Guia | Lista de asistencia (datos ad-hoc) |
| POST | `/reporte-semanal` | Admin, Guia | Reporte semanal (datos ad-hoc) |
| POST | `/generar-custom` | Admin | Cualquier template con datos libres |

---

## 📝 Variables de contexto por template

### Variables globales (siempre disponibles)

| Variable | Descripción |
|----------|-------------|
| `{{logoEncabezado}}` | Data URI base64 del logo principal |
| `{{marcaAgua}}` | Data URI base64 de la marca de agua |
| `{{ciudad}}` | Ciudad institucional (`Oaxaca de Juárez, Oaxaca`) |
| `{{firmaNombre}}` | Nombre del titular firmante |
| `{{firmaCargo}}` | Cargo del titular firmante |

### `oficio_incorporacion`

| Variable | Fuente |
|----------|--------|
| `folioOficio` | Generado automáticamente o parámetro |
| `nombreBeneficiario` | `beneficiarios.nombre` |
| `curp` | `civic_expedientes.curp` |
| `causaPenal` | `civic_expedientes.causa_penal` |
| `horasSentencia` | `civic_expedientes.horas_sentencia` |
| `fechaIncorporacion` | `beneficiarios.fecha_ingreso` |
| `juzgadoNombre` | `civic_expedientes.num_juzgado_civico` |
| `juezControl` | `civic_expedientes.juez_control` |
| `oficioCanalizacion` | `civic_expedientes.oficio_canalizacion` |
| `modalidadFalta` | `civic_expedientes.modalidad_falta` |

### `ficha_incidencias`

| Variable | Fuente |
|----------|--------|
| `totalStrikes` | Conteo de `civic_incidencias WHERE es_acumulativa = true` |
| `incidencias[]` | `civic_incidencias` (tipo, fecha, descripción, estatus) |

### `f3_plan_trabajo`

| Variable | Fuente |
|----------|--------|
| `actividadesPlan` | `civic_plan_trabajo.actividades_plan` (JSONB) |
| `proyectoVida` | `civic_plan_trabajo.proyecto_vida_f3` (JSONB) |
| `nombreCoordinador` | `usuarios.nombre` (JOIN por `coordinador_id`) |

---

## 🛠 Cómo editar un template existente

1. Abre el archivo `.hbs` en `src/modules/civico/documentos/templates/`.
2. Los datos dinámicos se inyectan con doble llave: `{{variable}}`.
3. Para iterar listas: `{{#each items}} ... {{/each}}`.
4. Para condiciones: `{{#if campo}} ... {{else}} ... {{/if}}`.
5. Helpers disponibles:
   - `{{formatDate fecha}}` → `dd/mm/yyyy`
   - `{{add @index 1}}` → número de fila en `#each`
   - `{{eq a b}} ... {{/eq}}` → comparación de igualdad
   - `{{times n}} ... {{/times}}` → repite un bloque N veces
6. Los partials se incluyen con `{{> _header}}`, `{{> _footer}}`, `{{> _watermark}}`.
7. Para pasar datos al partial: `{{> _header tituloDocumento="MI TÍTULO"}}`.

---

## ➕ Cómo agregar un nuevo template

### Paso 1: Crear el archivo HBS

```hbs
<!-- src/modules/civico/documentos/templates/mi_nuevo_doc.hbs -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Mi Nuevo Documento</title>
  <style>
    @page { size: Letter; margin: 2cm 2cm 2.5cm 3cm; }
    /* … tus estilos … */
  </style>
</head>
<body>
  {{> _watermark}}
  {{> _header tituloDocumento="MI NUEVO DOCUMENTO"}}

  <div class="content">
    <p>Nombre: {{nombreBeneficiario}}</p>
    {{#if campOpcional}}<p>{{campOpcional}}</p>{{/if}}
  </div>

  {{> _footer}}
</body>
</html>
```

### Paso 2: Agregar método en el servicio (opcional)

Si el documento necesita datos de la BD, agrega un método en `documentos.service.ts`:

```typescript
async generarMiNuevoDoc(expedienteId: string): Promise<Buffer> {
  const exp = await this.getExpediente(expedienteId);
  const ben = await this.getBeneficiario(exp.beneficiarioId);

  const datos = {
    nombreBeneficiario: ben.nombre,
    // … más campos …
  };

  return this.generarPdf('mi_nuevo_doc', datos);
}
```

### Paso 3: Agregar endpoint en el controlador

```typescript
@Get('mi-nuevo-doc/:expedienteId')
@Roles('Admin')
@ApiOperation({ summary: 'Mi nuevo documento en PDF' })
async miNuevoDoc(
  @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
  @Res() res: Response,
): Promise<void> {
  const buffer = await this.documentosService.generarMiNuevoDoc(expedienteId);
  sendPdf(res, buffer, `mi_nuevo_doc_${expedienteId}.pdf`);
}
```

### Paso 4 (opcional): Registrar nuevo partial

Si creas un partial reutilizable, colócalo en `partials/` con prefijo `_`:

```
src/modules/civico/documentos/partials/_mi_partial.hbs
```

Se registra automáticamente al iniciar el módulo. Úsalo como `{{> _mi_partial}}`.

---

## 🎨 Convenciones de estilo (impresión legal)

- **Fuente**: Times New Roman, 11pt (cuerpo), 10pt (tablas y pie)
- **Márgenes**: Izquierdo 3cm, resto 2cm (hoja carta)
- **Color institucional**: `#1a3a6b` (azul marino)
- **Encabezados de tabla**: fondo `#1a3a6b`, texto blanco
- **Marca de agua**: posición `fixed`, opacidad `0.08`
- **Pie de página**: posición `fixed bottom-0`

---

## ⚠ Campos que requieren ajuste futuro

Los siguientes campos están marcados con valor `'—'` o vacíos porque actualmente no existen en los DTOs/tablas correspondientes:

| Campo | Usado en | Tabla sugerida |
|-------|----------|----------------|
| `juezNombre` (nombre completo del juez) | Todos los oficios | `civic_expedientes.juez_control` (actualmente un solo campo) |
| `firmaNombre` / `firmaCargo` | Todos los documentos | Configuración del sistema o tabla de usuarios firmantes |
| `contactoPadre/Madre/Tutor` | `hoja_presentacion` | `civic_expedientes.contactos_familiares` (JSONB ya existe) |
| `actividadesRealizadas[]` en `oficio_conclusion` | `oficio_conclusion` | `civic_bitacora_civica` (puede construirse desde la bitácora) |
| `horario` de actividad | `lista_asistencia` | `civic_expedientes.dias_asignados_juzgado.horario` (JSONB) |

---

## 🔗 Referencias

- **RF-004** — Datos de identidad del expediente
- **RF-008** — Candado F1+F2 → habilita F3
- **RF-011/012/013** — Bitácora, horas acumuladas, incidencias
- Documentos Word de referencia: `docs-word/` (no se eliminan)
