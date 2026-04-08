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
    @Column({ name: 'proceso_ingreso', type: 'text', nullable: true })
    procesoIngreso!: string | null;
  
    // 5 categorías: EDUCATIVA, LABORAL, FAMILIAR, DEPORTIVO, CULTURAL
    @Column({ name: 'seguimiento_actividades', type: 'jsonb', nullable: true })
    seguimientoActividades!: Record<string, string> | null;
  
    // ── Control ───────────────────────────────────────────────────────
    @Column({
      name: 'estatus_f4',
      type: 'enum',
      enum: FormStatusEnum,
      default: FormStatusEnum.PENDIENTE,
    })
    estatusF4!: FormStatusEnum;
  }
