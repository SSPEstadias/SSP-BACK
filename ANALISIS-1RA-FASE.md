# Análisis Completo — Rama `1ra-fase`

> **Propósito:** Documento de lectura y análisis de todos los archivos de la rama `1ra-fase` del repositorio SSP-BACK, generado como contexto para tesis. Solo lectura — sin modificaciones al código.

---

## 1. Estructura General del Repositorio

```
SSP-BACK/
├── .gitignore
├── .prettierrc
├── README.md
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   └── app.service.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
└── formatos-civico/
    ├── Actividades_.docx                                ← Listado de actividades y archivos del sistema
    ├── " Expedientes Orden civico formato caratula.docx" ← Carátula de expediente
    ├── INFORME DE INCORPORACIÓN AL PROGRAMA..pdf        ← Oficio de informe de incorporación (imagen escaneada)
    ├── MACHOTE DEL OFICIO DE CONCLUSIÓN DEL PROGRAMA.pdf ← Oficio de conclusión
    ├── psicologicos/
    │   ├── F1(SIN DATOS)entrevista-psicologica.pdf      ← F1: Entrevista psicológica inicial
    │   ├── F4(sin datos)FICHATECNICADESEGUIMIENTO(...).docx ← F4: Ficha técnica de seguimiento (cédula inicial)
    │   └── F5SeguiminetoPisoclogica.docx                ← F5: Nota de evolución psicológica
    ├── trabajo-social/
    │   ├── F2 ESTUDIO DE TRABAJO SOCIAL - reconecta por la paz..docx ← F2: Estudio de trabajo social
    │   └── F3(SINDATOS)PLAN DE TRABAJO INDIVIDUAL(...).pdf ← F3: Plan de trabajo individual
    └── guias/
        ├── ControldeHoras.xlsx                          ← Control de horas por beneficiario (Excel)
        ├── FICHA TECNICA DE INCIDENCIAS .pdf            ← Informe de incidencias (3 faltas)
        ├── LISTA DE ASISTENCIA DE RECONECTA.pdf         ← Lista de asistencia a actividades
        └── Reporte semanal FORMATO(FormsGuias).docx     ← Reporte semanal de guías
```

---

## 2. Contexto del Sistema — Programa "Reconecta con la Paz"

**Institución:** Secretaría de Seguridad y Protección Ciudadana (SSyPC), Oaxaca  
**Área:** Subsecretaría de Prevención del Delito y Reinserción Social  
**Dirección:** Dirección General de Prevención del Delito y Participación Ciudadana (DGPDyPC)  
**Sede:** Fernando Montes de Oca N°104, Col. Niños Héroes, Santa María Ixcotel, Santa Lucía del Camino, Oaxaca. Tel: 01 (951) 51 39272 / (951) 51 52917  
**Programa:** "Reconecta con la Paz" — programa de reinserción social para jóvenes con faltas cívicas

**Actores clave del sistema:**
- **UMECA** (Unidad de Medidas Cautelares) — canaliza beneficiarios
- **Juzgado Cívico Municipal** — autoridad judicial (ej. Lcdo. José Alfredo Morales Camera)
- **Coordinador del programa** — Lic. Gandhi Ulises Juárez López
- **Directora General** — Mtra. Lii Yio Pérez Zárate
- **Psicóloga** — Avelina Escarcega Perez (Céd. 6487612)
- **Trabajo Social** — C. Esvel Lagunas Rodríguez
- **Guías** — acompañan a los beneficiarios en actividades semanales

---

## 3. Archivos de Código Fuente (NestJS Backend)

### Tecnología
- **Framework:** NestJS v11 (Node.js / TypeScript)
- **Runtime objetivo:** Node.js, ES2023
- **Puerto:** 3000 (configurable vía `process.env.PORT`)

### `src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### `src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### `src/app.controller.ts`
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

### `src/app.service.ts`
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

**Nota:** El código fuente en esta rama es el esqueleto inicial de NestJS (`nest new`). Los módulos funcionales del sistema aún no están implementados en esta fase.

### Dependencias principales (`package.json`)
```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  }
}
```

---

## 4. Formatos del Programa "Reconecta con la Paz"

### 4.1 `Actividades_.docx` — Catálogo de Actividades y Archivos del Sistema

**Tipos de actividades del programa:**
- **Trabajo comunitario:** Tequios por la seguridad, tequios de reforestación, tequios de riego, tequios de deshierbe, actividades en conjunto con vecinos
- **Liderazgo comunitario:** Actividades donde beneficiarios son talleristas/capacitadores
- **Atención al consumo problemático de sustancias:** Sesiones AA
- **Educación para la vida:** Manual Fénix, atenciones psicológicas
- **Promoción cultural/deportiva:** Talleres de lectura, dibujo, cine debates, actividades deportivas

**Mapeo de archivos físicos → digitales (Forms):**

| Archivo Físico | Equivalente en Sistema |
|---|---|
| Reporte de actividades (réplica) | `Reporte de instancia (pdf)` |
| `MACHOTE DEL OFICIO DE CONCLUSIÓN DEL PROGRAMA.pdf` | Oficio de reporte a los UMECAS |
| `Reconecta con la paz (cédula inicial, réplica)` | F4 Ficha técnica de seguimiento |
| Plan de trabajo | `F3(SINDATOS)PLAN DE TRABAJO INDIVIDUAL` |
| Cédula inicial | `F4` (Ficha técnica de seguimiento) |

**Inventario completo de archivos del sistema:**

**CÍVICO / General:**
- `CARÁTULA DE EXPEDIENTE` — Datos generales / vista previa del perfil
- `MACHOTE DEL OFICIO DE CONCLUSIÓN DEL PROGRAMA.pdf` — Oficio de término del programa
- `ACTIVIDADES.DOCX` — Listado de actividades y archivos existentes
- `BASE DE DATOS DEL PROGRAMA RECONECTA POR LA PAZ.OAXACA.DGPDYPC` — BD en Excel usada por comandante
- `INFORME DE INCORPORACIÓN AL PROGRAMA..pdf` — Oficio de informe de incorporación (respuesta a canalización, enviado por Forms)
- `canalizacioncivico.jpg` — Oficio externo de canalización enviado por Forms

**CÍVICO / Psicológico:**
- `F1` — Entrevista psicológica inicial
- `F4` — Ficha técnica de seguimiento / cédula inicial (se sube a Forms "Reconecta con la Paz")
- `F5` — Nota de evolución psicológica (no se usa en Forms, archivo interno)

**CÍVICO / Trabajo Social:**
- `F2` — Estudio de Trabajo Social (entrevista por encargados de trabajo social)
- `F3` — Plan de trabajo individual (se sube a Forms)

**CÍVICO / Guías:**
- `Reporte semanal FORMATO(FormsGuias).docx` — Guías guardan reporte semanal de actividades por beneficiario
- `LISTA DE ASISTENCIA DE RECONECTA.pdf` — Control de asistencia a actividades
- `FICHA TECNICA DE INCIDENCIAS.pdf` — Informe cuando beneficiario acumula 3 faltas
- `ControldeHoras` — Excel/Google Sheets para control de horas de cada beneficiario

---

### 4.2 `Carátula de Expediente` — Formato de Portada

**Encabezado institucional:**
> SECRETARÍA DE SEGURIDAD Y PROTECCION CIUDADANA  
> SUBSECRETARÍA DE PREVENCION DEL DELITO Y REINSERCION SOCIAL  
> DIRECCION GENERAL DE PREVENCION DEL DELITO Y PARTICIPACION CIUDADANA  
> "RECONECTA CON LA PAZ"

**Campos del formato:**
- Juzgado Cívico (ej. `80/2025`)
- Expediente Técnico (ej. `DGPDYPC-RCP-002`)
- Nombre(s)
- Alias(es)
- Juzgado
- Falta cívica
- Agraviado(s)
- Fecha de ingreso al programa
- Medida alternativa cívica
- Lugar y fecha (ej. `Santa María Ixcotel, Oaxaca, 02 de agosto de 2025`)

---

### 4.3 `F1` — Entrevista Psicológica Inicial

**Secciones:**
1. **Consentimiento informado**
2. **Generales:** Nombre, edad, sobrenombre, fecha nacimiento, CURP, originario, teléfono, escolaridad, estado civil, nacionalidad, lengua indígena, religión, ocupación, domicilio
3. **Situación jurídica:** Fecha de detención, falta cívica, breve relato de los hechos
4. **Datos del núcleo familiar primario:** Tabla con nombre, parentesco, edad, edo. civil, escolaridad, ocupación
5. **Uso de sustancias:** Consumo de alcohol/drogas, terapias recibidas, grupos AA/NA, rehabilitación, grupos culturales/deportivos/religiosos
6. **Emociones:** Miedo, alegría, enojo, tristeza, amor
7. **Destrezas o habilidades**
8. **Deportes**
9. **Tiempo libre**
10. **Salud:** Enfermedades crónico-degenerativas, tratamientos
11. **Proyecto de vida:** Personal, familiar, laboral, espiritual, académica, social
12. **Nombre y firma del entrevistador**

**Institución:** Dirección General de Prevención del Delito y Participación Ciudadana

---

### 4.4 `F2` — Estudio de Trabajo Social ("Reconecta por la Paz")

**Campos principales:**
1. Nombre del imputado
2. Edad
3. Sobrenombre
4. Fecha de nacimiento
5. Originario
6. Teléfono
7. Escolaridad actual
8. Estado civil
9. Nacionalidad / Dialecto o idioma
10. Religión
11. Ocupación
12. Domicilio actual
13. **Situación jurídica:** Fecha de detención, delito(s), juzgado, expediente penal/proceso
14. **Datos del núcleo familiar primario** (tabla familiar)
15. **Situación económica familiar primaria:** Características de zona (urbana/sub-urbana/rural/criminógena), responsable de manutención, ingresos/egresos mensuales, cooperación del beneficiario, grupo familiar (funcional/disfuncional), relaciones interfamiliares (adecuadas/inadecuadas), violencia intrafamiliar, nivel socioeconómico y cultural, antecedentes penales familiares, concepto familiar del indiciado
16. **Núcleo familiar secundario** (si es casado/unión libre): hijos de uniones anteriores, características de vivienda, transporte, mobiliario, zona, relación con medio externo, problemas de conducta, número de parejas estables
17. **Datos del indiciado:** Trabajo desempeñado, tiempo laboral, sueldo, aportaciones económicas, distribución del gasto, alimentación, servicios públicos, oferta de trabajo, apoyo familiar
18. **Grupos de autoayuda:** Consumo de sustancias, terapias psicológicas, grupos AA/Neuróticos Anónimos, rehabilitación, grupos culturales/religiosos/deportivos
19. **Opinión sobre el programa Reconecta con la Paz**
20. **Diagnóstico social** (ej. "FAVORABLE")

**Aviso de privacidad:** Datos protegidos conforme a Ley de Transparencia y Protección de Datos Personales del Estado de Oaxaca

**Firmantes:** Enc. Depto. de Trabajo Social (C. Esvel Lagunas Rodríguez) y Vo. Bo. de Directora (Mtra. Lii Yio Pérez Zárate)

---

### 4.5 `F3` — Plan de Trabajo Individual

**Encabezado:**
> Subsecretaría de Prevención y Reinserción Social  
> Dirección General de Prevención del Delito y Participación Ciudadana  
> Valoración Clínica Psicológica — Plan de Trabajo Individual

**Proceso de seguimiento de actividades del programa "Reconecta con la Paz":**

| Actividad | Estatus | Objetivo | Cumplimiento |
|---|---|---|---|
| EDUCATIVA | | | |
| PSICOSOCIAL / RED DE APOYO | | | |
| PSICOLÓGICA | | | |
| ADICCIONES | | | |
| FAMILIAR | | | |
| LABORAL | | | |
| DEPORTIVA | | | |
| CULTURAL | | | |
| OBSERVACIONES | | | |

---

### 4.6 `F4` — Ficha Técnica de Seguimiento (Cédula Inicial en Forms)

**Sección: Datos Personales**
- Nombre, Edad, CURP, Estado civil, Domicilio, Código postal, Municipio, Ocupación, Fecha de ingreso, Teléfono

**Proceso de ingreso a Prevención:**
> El H. Ayuntamiento de Oaxaca de Juárez canaliza al joven por una falta al Reglamento de Justicia Cívica.
- Número de horas a cubrir en el programa
- Falta administrativa / Modalidad: En agravio a la sociedad

**Proceso de seguimiento:**

| Actividad | Observaciones |
|---|---|
| EDUCATIVA | |
| LABORAL | |
| FAMILIAR | |
| DEPORTIVO | |
| CULTURAL | |

**Proyecto de vida:**
- Personal / Familiar / Social
- Metas por cumplir con el programa (ej.: *"El joven espera poder manejar y gestionar sus emociones para así evitar conflictos con la sociedad"*)

**Tabla de seguimiento de actividades:**

| Actividad | Estatus | Objetivo | Cumplimiento |
|---|---|---|---|
| EDUCATIVA | PREPARATORIA | Terminar carrera (Arquitectura) | Esfuerzo, dedicación y disciplina |
| PSICOSOCIAL / RED DE APOYO | Sus hermanos | Mejorar relación familiar | Comunicación asertiva |
| PSICOLÓGICA | Sin asistencia | Sesiones psicoterapéuticas | Cita abierta |
| ADICCIONES | Alcoholismo leve | Dejar el consumo | Grupos de autoayuda |
| FAMILIAR | Vive con su esposa | Comprar un terreno | Dedicación, esfuerzo y disciplina |
| LABORAL | Trabaja en agencia de turismo | Desempeñarse en arquitectura | Estudiar |
| DEPORTIVA | No practica | Caminar, correr | Disciplina |
| CULTURAL | Guía de turista | Ser consciente de cada lugar del estado | Aprendizaje |

---

### 4.7 `F5` — Nota de Evolución Psicológica

**Encabezado:** NOTA DE EVOLUCIÓN PSICOLÓGICA

**Campos (por sesión):**
- Número de expediente
- Nombre del usuario, Edad, Sexo
- Fecha, Hora, Número de sesión
- Objetivo de la sesión
- Conducta y disposición
- Resumen de la sesión (actividades y estrategias aplicadas): Tema, Estrategia
- Plan terapéutico para la siguiente sesión
- Actividades asignadas al usuario
- Observaciones
- Fecha de la próxima sesión
- **Firma:** Psicóloga Avelina Escarcega Perez, Céd. Profesional: 6487612

*(El formato contempla múltiples sesiones consecutivas en el mismo documento)*

---

### 4.8 `MACHOTE DEL OFICIO DE CONCLUSIÓN DEL PROGRAMA.pdf`

**Tipo:** Oficio institucional de conclusión exitosa  
**Destinatario:** Lcdo. José Alfredo Morales Camera, Juez Cívico Municipal  
**Emisor:** Mtra. Lii Yio Pérez Zárate, Directora General de Prevención del Delito y Participación Ciudadana  
**No. de oficio:** `SSyPC/SPRS/DGPDyPC/0479/2025`  
**Asunto:** Informe de conclusión de participación en el programa

**Contenido del oficio:**
- Hace referencia a oficio previo de canalización del Juzgado
- Informa conclusión exitosa del beneficiario (datos anonimizados: "C. XXXXXXXXXXXXXXXXXXXXXX", expediente "XXXXXXXXXXXXX")
- Describe actividades realizadas con fechas (ejemplo):
  1. Tequio Agencia de Policía de Dolores (10 agosto)
  2. Exposición militar "La gran fuerza de México" en Parque Primavera (16 agosto)
  3. Tequio Agencia Municipal de Pueblo Nuevo (17 agosto)
- Indica cumplimiento de objetivos del plan de intervención individual
- Contacto: Lic. Gandhi Ulises Juárez López, tel. 951 2241899, correo: dgp.dypc@sspo.gob.mx

---

### 4.9 `FICHA TÉCNICA DE INCIDENCIAS.pdf` (para Guías)

**Tipo:** Informe de incidencias al Director de UMECA  
**Destinatario:** Lic. Jose Javier Mendoza Balderas, Director de la Unidad de Medidas Cautelares (UMECA)  
**No. de oficio:** `SSyPC/SPRS/DGPDyPC/0415/2025`  
**Asunto:** Informe de incidencias

**Descripción del caso (beneficiaria con múltiples inasistencias):**

| Fecha | Tipo de incidencia | Descripción |
|---|---|---|
| Sábado 22 junio | Inasistencia | "Taller sobre el manejo de las emociones" — sin respuesta a WhatsApp/llamadas |
| Sábado 28 junio | Inasistencia | Círculo de lectura en Biblioteca Infantil de Oaxaca — sin respuesta |
| Domingo 29 junio | Inasistencia | Convivencia deportiva (torneo de fútbol y basquetbol) — sin respuesta |
| Domingo 29 junio | Visita domiciliaria | Contacto positivo en domicilio — beneficiaria accedió a seguir participando |
| Sábado 05 julio | Inasistencia | Cine-debate "En Busca de la Felicidad" — sin respuesta |
| Sábado 19 julio | Inasistencia justificada | Taller de elaboración de minipizzas — beneficiaria en examen de admisión |
| Domingo 20 julio | Se retiró antes de tiempo | Sesión AA — beneficiaria abandonó actividad sin previo aviso |
| Domingo 20 julio | Red de apoyo | Conversatorio con padre sobre situación de la beneficiaria |
| Sábado 26 julio | Conversatorio | Entrevista de seguimiento académico + charla sobre inasistencias |

**Conclusión:** La beneficiaria manifestó nunca haber tenido interés en el programa; indicó que UMECA le informó que podía solicitar cambio de medida a través de su abogado. El informe queda integrado al expediente técnico.

---

### 4.10 `LISTA DE ASISTENCIA DE RECONECTA.pdf`

**Encabezado:** Dirección General de Prevención del Delito y Participación Ciudadana  
**Tipo:** Lista de asistencia individual por actividad

**Campos:**
- Plan de trabajo: Presentaciones Sociales
- Fecha
- Nombre del beneficiario

**Tabla:**
| Horario | Actividad | Sede | Firma |
|---|---|---|---|

**Observaciones** (campo libre)

**Firmantes:** Guía responsable (C. Esvel Lagunas Rodríguez) y Vo. Bo. (Mtra. Lii Yio Pérez Zárate)

---

### 4.11 `Reporte Semanal FORMATO(FormsGuias).docx` — Guías

**Encabezado:**

| Reporte semanal de actividades | Origen: Unidad de Medidas Cautelares |
|---|---|
| Área: Reconecta con la Paz | Periodo del reporte |
| Guía: | |

**Campos por beneficiario:**
- Nombre del beneficiario
- Asistencia (columna de número de actividad + "Asistió"/"No asistió")
- Fecha de la actividad
- Descripción de la actividad
- Observaciones

---

## 5. Configuración del Proyecto

### `nest-cli.json`
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

---

## 6. Resumen para Tesis — Entidades y Campos del Sistema

### Entidad: `Beneficiario` (datos personales)
Extraídos de F1, F2, F4:

| Campo | Tipo | Fuente |
|---|---|---|
| nombre | string | F1, F2, F4 |
| edad | number | F1, F2, F4 |
| sobrenombre / alias | string | F1, F2, carátula |
| fecha_nacimiento | date | F1, F2 |
| curp | string | F1, F4 |
| originario | string | F1, F2 |
| telefono | string | F1, F2, F4 |
| escolaridad_actual | string | F1, F2, F4 |
| estado_civil | string | F1, F2, F4 |
| nacionalidad | string | F1, F2 |
| lengua_indigena | string | F1 |
| religion | string | F1, F2 |
| ocupacion | string | F1, F2, F4 |
| domicilio_actual | string | F1, F2, F4 |
| codigo_postal | string | F4 |
| municipio | string | F4 |
| fecha_ingreso_programa | date | F4, carátula |

### Entidad: `Expediente` (situación jurídica)

| Campo | Tipo | Fuente |
|---|---|---|
| numero_expediente | string | carátula (ej. DGPDYPC-RCP-002) |
| juzgado_civico | string | carátula |
| falta_civica | string | F1, F4, carátula |
| fecha_detencion | date | F1, F2 |
| breve_relato_hechos | text | F1 |
| modalidad | string | F4 (ej. "En agravio a la sociedad") |
| horas_a_cubrir | number | F4 |

### Entidad: `FamiliarimarioPrimario` (núcleo familiar)

| Campo | Tipo | Fuente |
|---|---|---|
| miembros (tabla: nombre, parentesco, edad, estado_civil, escolaridad, ocupación) | array | F1, F2 |
| zona_vivienda | enum(urbana, sub-urbana, rural, criminógena) | F2 |
| responsable_manutención | string | F2 |
| ingreso_mensual | number | F2 |
| egreso_mensual | number | F2 |
| grupo_familiar | enum(funcional, disfuncional) | F2 |
| relaciones_interfamiliares | enum(adecuadas, inadecuadas) | F2 |
| violencia_intrafamiliar | boolean | F2 |
| nivel_socioeconomico | enum(alto, medio, bajo) | F2 |
| antecedentes_penales_familia | boolean + detalle | F2 |

### Entidad: `SeguimientoActividades` (plan de trabajo / F3 / F4)

| Campo | Tipo | Fuente |
|---|---|---|
| actividad | enum(EDUCATIVA, PSICOSOCIAL, PSICOLÓGICA, ADICCIONES, FAMILIAR, LABORAL, DEPORTIVA, CULTURAL) | F3, F4 |
| estatus | string | F3, F4 |
| objetivo | string | F3, F4 |
| cumplimiento | string | F3, F4 |
| observaciones | text | F3, F4 |

### Entidad: `NotaEvolucionPsicologica` (F5)

| Campo | Tipo | Fuente |
|---|---|---|
| numero_expediente | string | F5 |
| nombre_usuario | string | F5 |
| edad | number | F5 |
| sexo | string | F5 |
| fecha_sesion | date | F5 |
| hora | time | F5 |
| numero_sesion | number | F5 |
| objetivo_sesion | text | F5 |
| conducta_disposicion | text | F5 |
| resumen_sesion | text | F5 |
| tema | string | F5 |
| estrategia | string | F5 |
| plan_terapeutico | text | F5 |
| actividades_asignadas | text | F5 |
| observaciones | text | F5 |
| fecha_proxima_sesion | date | F5 |
| psicologa_firma | string | F5 (Avelina Escarcega Perez, Céd. 6487612) |

### Entidad: `ReporteSemanalGuia`

| Campo | Tipo | Fuente |
|---|---|---|
| guia | string | Reporte |
| beneficiario | string | Reporte |
| periodo | string | Reporte |
| origen | string | Reporte (UMECA) |
| actividades[] | array{num, asistio, fecha, descripcion} | Reporte |
| observaciones | text | Reporte |

### Entidad: `Incidencia`

| Campo | Tipo | Fuente |
|---|---|---|
| beneficiario | string | Ficha incidencias |
| fecha | date | Ficha incidencias |
| tipo | enum(inasistencia, inasistencia_justificada, visita_domicilio, retiro_anticipado, red_apoyo, conversatorio) | Ficha |
| descripcion | text | Ficha |
| numero_oficio | string | Ficha |

### Entidad: `OficioConclusion` / `OficioIncorporacion`

| Campo | Tipo | Fuente |
|---|---|---|
| numero_oficio | string | Machote |
| destinatario | string | Machote |
| beneficiario | string | Machote |
| numero_expediente | string | Machote |
| actividades_realizadas[] | array{descripcion, fecha} | Machote |
| fecha_emision | date | Machote |
| firmante | string | Machote |

---

## 7. Flujo del Proceso en el Programa

```
1. CANALIZACIÓN
   └── UMECA / Juzgado Cívico → envía oficio de canalización al programa
       └── Genera: Oficio de incorporación (INFORME DE INCORPORACIÓN AL PROGRAMA.pdf)

2. INGRESO AL PROGRAMA
   └── Entrevista psicológica inicial → F1
   └── Estudio de trabajo social → F2
   └── Ficha técnica de seguimiento (cédula inicial) → F4 (subida a Forms "Reconecta con la Paz")
   └── Plan de trabajo individual → F3 (subido a Forms)
   └── Carátula del expediente

3. SEGUIMIENTO SEMANAL
   └── Guías registran asistencia → Lista de Asistencia
   └── Guías generan reporte semanal → Reporte semanal FORMATO(FormsGuias).docx
   └── Control de horas acumuladas → ControldeHoras.xlsx
   └── Psicóloga registra evolución → F5 (Nota de evolución psicológica)

4. INCIDENCIAS (3 faltas)
   └── Guías elaboran ficha de incidencias → FICHA TECNICA DE INCIDENCIAS.pdf
   └── Se notifica a UMECA

5. CONCLUSIÓN EXITOSA
   └── Directora emite oficio de conclusión → MACHOTE DEL OFICIO DE CONCLUSIÓN.pdf
   └── Se notifica al Juzgado Cívico
```

---

## 8. Observaciones Técnicas para el Sistema Backend

1. **Estado actual (rama `1ra-fase`):** Es únicamente el scaffolding inicial de NestJS — sin módulos de negocio implementados.

2. **Módulos a desarrollar** (basado en los formatos físicos):
   - `beneficiarios` — CRUD de datos personales y situación jurídica
   - `expedientes` — gestión de expedientes técnicos
   - `seguimiento-actividades` — registro de F3/F4
   - `notas-psicologicas` — registro de F5
   - `reportes-guias` — registro semanal de actividades
   - `incidencias` — registro de faltas y seguimiento
   - `oficios` — generación de documentos (incorporación, conclusión)
   - `forms-integration` — integración con Google Forms (reconecta con la paz)

3. **Archivos que se suben a Google Forms:**
   - F4 (cédula inicial / ficha técnica de seguimiento)
   - F3 (plan de trabajo individual)
   - Reporte semanal de guías

4. **Archivos que solo son internos** (no van a Forms):
   - F1 (entrevista psicológica)
   - F2 (estudio de trabajo social)
   - F5 (nota de evolución psicológica)
   - Lista de asistencia
   - Ficha de incidencias
   - Oficio de conclusión / incorporación

5. **Integración con sistemas externos:**
   - UMECA (canalización)
   - Juzgado Cívico (oficio de conclusión)
   - Google Forms (cédulas y reportes)

---

*Documento generado automáticamente el 2026-02-25 para uso exclusivo como contexto de tesis — SSP-BACK rama `1ra-fase`.*
