# 📝 Entrevistas F1 / F2 (JSONB Mapping)

Las entrevistas F1 (Clínica) y F2 (Socioeconómica) utilizan un enfoque **híbrido**:
1.  **Datos de Identidad**: CURP, Nombre, Teléfono, etc. ya están en el Expediente.
2.  **Tablas y Listas**: Se guardan en bloques `jsonb` flexibles.

## 1. Mapeo de Entrevista Clínica (F1)

**Entidad:** `civic_entrevista_clinica`

| Block JSONB | Contenido Sugerido |
| :--- | :--- |
| `generalesEntrevista` | Nivel académico, Estado civil, Nacionalidad, Lengua indígena, Religión, Ocupación. |
| `situacionJuridicaF1` | Fecha de detención, Falta cívica, Relato de los hechos. |
| `nucleoFamiliarPrimario` | `{"miembros": [{"nombre": "", "parentesco": "", "edad": 25, "ocupacion": ""}], "observaciones": ""}` |
| `sustanciasDetalle` | Detalle de consumos, Terapias previas, Grupos AA, Periodos de rehabilitación. |
| `perfilPersonal` | **Emociones**: `{"miedo": "", "alegria": ""}`, Perfil de destrezas, Deportes, Tiempo libre. |
| `proyectoVida` | `{"personal": "", "familiar": "", "laboral": "", "espiritual": "", "academico": "", "social": ""}` |
| `saludDetalle` | Enfermedades crónicas, Tratamientos actuales. |

## 2. Mapeo de Estudio Socioeconómico (F2)

**Entidad:** `civic_estudio_socioeconomico`

| Block JSONB | Contenido Sugerido |
| :--- | :--- |
| `generales_f2` | Sobrenombre, Dialecto/Idioma, Situación económica primaria. |
| `situacion_juridica_f2` | Juzgado, Expediente penal (Causa), Detalles legales. |
| `nucleo_primario` | Tabla de familiares núcleo origen (Array). |
| `nucleo_secundario` | Tabla de familiares núcleo actual (Esposa/Hijos) + Hijos de uniones anteriores. |
| `datos_indiciado` | Características vivienda, Transporte, Mobiliario, Servicios públicos, Oferta trabajo. |
| `grupos_autoayuda` | Pertenencia a grupos religiosos/culturales. |
| `opinion_observaciones` | Opinión del programa, Diagnóstico social favorable/desfavorable. |

## 🛠️ Recomendación para el Front
- **Modelos en TS**: Crea interfaces que representen estos bloques para tener tipado fuerte en Angular.
- **Validación Atómica**: El botón de "Finalizar entrevista" debe enviar el `estatus_f1` o `estatus_f2` como `COMPLETADO`. Esto habilita automáticamente la fase de Planeación (F3/F4).

---
> [!NOTE]
> No envíes los datos personales (Nombre, CURP) en estos bloques. El backend los toma automáticamente del Expediente vinculado para evitar duplicidad.
