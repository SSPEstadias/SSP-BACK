import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlanTrabajo } from '../../plan-trabajo/entities/plan-trabajo.entity';
import { Actividad } from '../../../../shared/actividades/actividad.entity';

export enum EstatusPlanTrabajoDetalle {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  CUMPLIDA = 'CUMPLIDA',
}

@Entity('penal_plan_trabajo_detalle')
export class PlanTrabajoDetalle {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => PlanTrabajo, { eager: true, nullable: false })
  @JoinColumn({ name: 'plan_trabajo_id' })
  planTrabajo: PlanTrabajo;

  @ManyToOne(() => Actividad, { eager: true, nullable: false })
  @JoinColumn({ name: 'actividad_id' })
  actividad: Actividad;

  @Column({
    type: 'enum',
    enum: EstatusPlanTrabajoDetalle,
    default: EstatusPlanTrabajoDetalle.PENDIENTE,
  })
  estatus: EstatusPlanTrabajoDetalle;

  @Column({ type: 'text', nullable: true })
  objetivo: string;

  @Column({ type: 'text', nullable: true })
  cumplimiento: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'fecha_asignacion', type: 'date', nullable: true })
  fechaAsignacion: string;

  @Column({ name: 'fecha_cumplimiento', type: 'date', nullable: true })
  fechaCumplimiento: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}
