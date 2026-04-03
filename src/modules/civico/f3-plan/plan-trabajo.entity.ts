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
  
  @Entity('civic_plan_trabajo')
  export class PlanTrabajo {
    @PrimaryGeneratedColumn('uuid')
    idUUID!: string;
  
    // ── Relación 1:1 con Expediente ───────────────────────────────────
    @OneToOne(() => ExpedienteCivico, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'expediente_id' })
    expediente!: ExpedienteCivico;
  
    @Column({ name: 'expediente_id', type: 'uuid', unique: true })
    expedienteId!: string;
  
    // ── Relación con Coordinador (Usuario) ────────────────────────────
    @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'coordinador_id' })
    coordinador!: User;
  
    @Column({ name: 'coordinador_id', type: 'int' })
    coordinadorId!: number;
  
    // ── Fechas del plan ───────────────────────────────────────────────
    @Column({ name: 'fecha_inicio_estimada', type: 'date' })
    fechaInicioEstimada!: Date;
  
    @Column({ name: 'fecha_termino_estimada', type: 'date' })
    fechaTerminoEstimada!: Date;
  
    @Column({ name: 'dias_asignados', type: 'text', nullable: true })
    diasAsignados!: string | null;
  
    // ── Proyecto de vida resumido del F3 (JSONB) ─────────────────────
    // { "personal":"", "familiar":"", "social":"" }
    @Column({ name: 'proyecto_vida_f3', type: 'jsonb', nullable: true })
    proyectoVidaF3!: object | null;
  
    @Column({ name: 'metas_programa', type: 'text', nullable: true })
    metasPrograma!: string | null;
  
    // ── 8 categorías fijas del F3 físico (JSONB) ─────────────────────
    // {
    //   "EDUCATIVA":    {"estatus":"","objetivo":"","cumplimiento":"","vinculacion":"","temporalidad":"","seguimiento":""},
    //   "PSICOSOCIAL":  {"estatus":"","objetivo":"","cumplimiento":"","vinculacion":"","temporalidad":"","seguimiento":""},
    //   "PSICOLOGICA":  {"estatus":"","objetivo":"","cumplimiento":"","vinculacion":"","temporalidad":"","seguimiento":""},
    //   "ADICCIONES":   {"estatus":"","objetivo":"","cumplimiento":"","vinculacion":"","temporalidad":"","seguimiento":""},
    //   "FAMILIAR":     {"estatus":"","objetivo":"","cumplimiento":"","vinculacion":"","temporalidad":"","seguimiento":""},
    //   "LABORAL":      {"estatus":"","objetivo":"","cumplimiento":"","vinculacion":"","temporalidad":"","seguimiento":""},
    //   "DEPORTIVA":    {"estatus":"","objetivo":"","cumplimiento":"","vinculacion":"","temporalidad":"","seguimiento":""},
    //   "CULTURAL":     {"estatus":"","objetivo":"","cumplimiento":"","vinculacion":"","temporalidad":"","seguimiento":""}
    // }
    @Column({ name: 'actividades_plan', type: 'jsonb' })
    actividadesPlan!: object;
  
    @Column({ name: 'observaciones_plan', type: 'text', nullable: true })
    observacionesPlan!: string | null;
  
    // ── Control — solo se crea si F1 y F2 están COMPLETADOS (RF-008) ──
    @Column({
      name: 'estatus_f3',
      type: 'enum',
      enum: FormStatusEnum,
      default: FormStatusEnum.PENDIENTE,
    })
    estatusF3!: FormStatusEnum;
  }