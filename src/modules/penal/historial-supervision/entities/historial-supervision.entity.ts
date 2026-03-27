import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PenalExpediente } from '../../entities/penal.entity';

export enum EstatusSupervision {
  CUMPLIDO = 'CUMPLIDO',
  PARCIAL = 'PARCIAL',
  INCUMPLIDO = 'INCUMPLIDO',
}

@Entity('penal_historial_supervision')
export class HistorialSupervision {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => PenalExpediente, { eager: true, nullable: false })
  @JoinColumn({ name: 'expediente_id' })
  expediente: PenalExpediente;

  @Column({ type: 'int', nullable: false })
  mes: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  periodo: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: string;

  @Column({
    type: 'enum',
    enum: EstatusSupervision,
    default: EstatusSupervision.PARCIAL,
  })
  estatus: EstatusSupervision;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}
