import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PenalExpediente } from '../../entities/penal.entity';
import { User } from '../../../../shared/users/entities/user.entity';

export enum TipoIncidenciaPenal {
  INASISTENCIA = 'INASISTENCIA',
  INCUMPLIMIENTO = 'INCUMPLIMIENTO',
  CONDUCTA_INADECUADA = 'CONDUCTA_INADECUADA',
  DESACATO = 'DESACATO',
  OBSERVACION = 'OBSERVACION',
  OTRA = 'OTRA',
}

export enum GravedadIncidenciaPenal {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export enum EstatusIncidenciaPenal {
  ACTIVA = 'ACTIVA',
  ATENDIDA = 'ATENDIDA',
  CERRADA = 'CERRADA',
}

@Entity('incidencias_penal')
export class IncidenciaPenal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PenalExpediente, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expediente_id' })
  expediente: PenalExpediente;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'registrado_por_id' })
  registradoPor: User;

  @Column({ type: 'date' })
  fecha: string;

  @Column({
    type: 'enum',
    enum: TipoIncidenciaPenal,
  })
  tipo: TipoIncidenciaPenal;

  @Column({
    type: 'enum',
    enum: GravedadIncidenciaPenal,
    default: GravedadIncidenciaPenal.MEDIA,
  })
  gravedad: GravedadIncidenciaPenal;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  accionesTomadas?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'boolean', default: false })
  reincidencia: boolean;

  @Column({
    type: 'enum',
    enum: EstatusIncidenciaPenal,
    default: EstatusIncidenciaPenal.ACTIVA,
  })
  estatus: EstatusIncidenciaPenal;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
