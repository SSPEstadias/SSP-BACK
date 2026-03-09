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
  
  @Entity('civic_cedula_inicial')
  export class CedulaInicial {
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
  
    // ── Datos de la cédula ────────────────────────────────────────────
    @Column({ name: 'horas_a_cubrir', type: 'int' })
    horasACubrir!: number;
  
    @Column({ name: 'modalidad_falta', type: 'varchar', length: 100, nullable: true })
    modalidadFalta!: string | null;
  
    // ── Bloques JSONB por sección del F4 físico ───────────────────────
    // Proceso de ingreso: datos generales del beneficiario al iniciar
    @Column({ name: 'proceso_ingreso', type: 'jsonb', nullable: true })
    procesoIngreso!: object | null;
  
    // 5 categorías: EDUCATIVA, LABORAL, FAMILIAR, DEPORTIVO, CULTURAL
    // [{ "categoria":"EDUCATIVA", "descripcion":"", "responsable":"", "horario":"" }, ...]
    @Column({ name: 'seguimiento_actividades', type: 'jsonb', nullable: true })
    seguimientoActividades!: object | null;
  
    // { "personal":"", "familiar":"", "laboral":"",
    //   "espiritual":"", "academico":"", "social":"" }
    @Column({ name: 'proyecto_vida_f4', type: 'jsonb', nullable: true })
    proyectoVidaF4!: object | null;
  
    // 8 categorías — misma estructura que actividades_plan del F3:
    // {
    //   "EDUCATIVA":   {"estatus":"","objetivo":"","cumplimiento":""},
    //   "PSICOSOCIAL": {"estatus":"","objetivo":"","cumplimiento":""},
    //   "PSICOLOGICA": {"estatus":"","objetivo":"","cumplimiento":""},
    //   "ADICCIONES":  {"estatus":"","objetivo":"","cumplimiento":""},
    //   "FAMILIAR":    {"estatus":"","objetivo":"","cumplimiento":""},
    //   "LABORAL":     {"estatus":"","objetivo":"","cumplimiento":""},
    //   "DEPORTIVA":   {"estatus":"","objetivo":"","cumplimiento":""},
    //   "CULTURAL":    {"estatus":"","objetivo":"","cumplimiento":""}
    // }
    @Column({ name: 'tabla_seguimiento_detallado', type: 'jsonb', nullable: true })
    tablaSeguimientoDetallado!: object | null;
  
    // ── Control ───────────────────────────────────────────────────────
    @Column({
      name: 'estatus_f4',
      type: 'enum',
      enum: FormStatusEnum,
      default: FormStatusEnum.PENDIENTE,
    })
    estatusF4!: FormStatusEnum;
  }