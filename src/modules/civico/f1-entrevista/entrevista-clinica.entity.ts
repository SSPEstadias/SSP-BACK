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
  
    // { "falta_civica":"", "relato_hechos":"" }
    @Column({ name: 'situacion_juridica_f1', type: 'jsonb', nullable: true })
    situacionJuridicaF1!: object | null;
  
    // { "miembros":[{"nombre":"","parentesco":"","edad":0,
    //   "estado_civil":"","escolaridad":"","ocupacion":""}],
    //   "observacion_relacion":"" }
    @Column({ name: 'nucleo_familiar_primario', type: 'jsonb', nullable: true })
    nucleoFamiliarPrimario!: object | null;
  
    // { "especifique":"", "ha_recibido_terapias":false, "donde_terapias":"",
    //   "asiste_grupos_aa":false, "donde_grupos_aa":"",
    //   "ha_estado_rehabilitacion":false, "donde_rehabilitacion":"",
    //   "periodo_rehabilitacion":"", "pertenece_grupo_cultural":false, "cual_grupo":"" }
    @Column({ name: 'sustancias_detalle', type: 'jsonb', nullable: true })
    sustanciasDetalle!: object | null;
  
    // { "emociones":{"miedo":"","alegria":"","enojo":"","tristeza":"","amor":""},
    //   "destrezas":"", "deportes":"", "tiempo_libre":"" }
    @Column({ name: 'perfil_personal', type: 'jsonb', nullable: true })
    perfilPersonal!: object | null;
  
    // { "descripcion_enfermedad":"", "lleva_tratamiento":false, "indique_tratamiento":"" }
    @Column({ name: 'salud_detalle', type: 'jsonb', nullable: true })
    saludDetalle!: object | null;
  
    // { "personal":"", "familiar":"", "laboral":"",
    //   "espiritual":"", "academico":"", "social":"" }
    @Column({ name: 'proyecto_vida', type: 'jsonb', nullable: true })
    proyectoVida!: object | null;
  
    // ── Control RF-008: COMPLETADO + F2 COMPLETADO → habilita F3 ─────
    @Column({
      name: 'estatus_f1',
      type: 'enum',
      enum: FormStatusEnum,
      default: FormStatusEnum.PENDIENTE,
    })
    estatusF1!: FormStatusEnum;
  }