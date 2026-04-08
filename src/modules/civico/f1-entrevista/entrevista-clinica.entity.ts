import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
  import { User } from '../../../shared/users/entities/user.entity';
  import { FormStatusEnum } from '../enums/civico.enums';
  
  @Entity('civic_entrevista_clinica')
  export class EntrevistaClinica {
    @PrimaryGeneratedColumn('uuid')
    idUUID!: string;
  
    // ── Relación 1:1 con Expediente ──────────────────────────��────────
    @OneToOne(() => ExpedienteCivico, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'expediente_id' })
    expediente!: ExpedienteCivico;
  
    @Column({ name: 'expediente_id', type: 'uuid', unique: true })
    expedienteId!: string;
  
    // ── Relación con Psicólogo (Usuario) ──────────────────────────────
    @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'psicologo_id' })
    psicologo!: User;
  
    @Column({ name: 'psicologo_id', type: 'int' })
    psicologoId!: number;
  
    // ── Columnas críticas con lógica de negocio ───────────────────────
    @Column({ name: 'fecha_entrevista', type: 'date' })
    fechaEntrevista!: Date;
  
    @Column({ name: 'consentimiento_informado', type: 'boolean', default: false })
    consentimientoInformado!: boolean;
  
    @Column({ name: 'riesgo_suicida', type: 'boolean', default: false })
    riesgoSuicida!: boolean;
  
    @Column({ name: 'consume_sustancias', type: 'boolean', default: false })
    consumeSustancias!: boolean;
  
    @Column({ name: 'padece_enfermedad_cronica', type: 'boolean', default: false })
    padeceEnfermedadCronica!: boolean;
  
    @Column({ name: 'necesita_apoyo_psicologico', type: 'boolean', default: false })
    necesitaApoyoPsicologico!: boolean;
  
    // ── Campos clínicos directos ──────────────────────────────────────
    @Column({ name: 'motivo_consulta', type: 'text', nullable: true })
    motivoConsulta!: string | null;
  
    @Column({ name: 'antecedentes_clinicos', type: 'text', nullable: true })
    antecedentesClinicos!: string | null;
  
    @Column({ name: 'examen_mental', type: 'text', nullable: true })
    examenMental!: string | null;
  
    @Column({ name: 'impresion_diagnostica', type: 'text', nullable: true })
    impresionDiagnostica!: string | null;
  
    // ── Bloques JSONB por sección del F1 físico ───────────────────────
    // { "institucion_canaliza":"", "sobrenombre":"", "originario":"",
    //   "escolaridad":"", "estado_civil":"", "nacionalidad":"",
    //   "lengua_indigena":"", "religion":"", "ocupacion":"" }
    @Column({ name: 'generales_entrevista', type: 'jsonb', nullable: true })
    generalesEntrevista!: object | null;
  
  // Sección III del formulario: falta_civica y relato_hechos
  @Column({ name: 'situacion_juridica_f1', type: 'jsonb', nullable: true })
  situacionJuridicaF1!: object | null;
  
  // Sección IV: array de miembros con nombre, parentesco, edad, estado_civil, escolaridad, ocupacion
  @Column({ name: 'nucleo_familiar_primario', type: 'jsonb', nullable: true })
  nucleoFamiliarPrimario!: object | null;
  
  // Sección V: 6 preguntas del formulario (especifique, ha_recibido_terapias, asiste_grupos_aa, etc.)
  @Column({ name: 'sustancias_detalle', type: 'jsonb', nullable: true })
  sustanciasDetalle!: object | null;
  
  // Secciones VI-IX: emociones (miedo/alegria/enojo/tristeza/amor), destrezas, deportes, tiempo_libre
  @Column({ name: 'perfil_personal', type: 'jsonb', nullable: true })
  perfilPersonal!: object | null;
  
  // Sección X: descripcion_enfermedad, lleva_tratamiento, indique_tratamiento
  @Column({ name: 'salud_detalle', type: 'jsonb', nullable: true })
  saludDetalle!: object | null;
  
  // Sección XI: personal, familiar, laboral, espiritual, academico, social
  @Column({ name: 'proyecto_vida', type: 'jsonb', nullable: true })
  proyectoVida!: object | null;
  
  // Control RF-008: requiere COMPLETADO para habilitar el F3
  @Column({
    name: 'estatus_f1',
    type: 'enum',
    enum: FormStatusEnum,
    default: FormStatusEnum.PENDIENTE,
  })
  estatusF1!: FormStatusEnum;
}