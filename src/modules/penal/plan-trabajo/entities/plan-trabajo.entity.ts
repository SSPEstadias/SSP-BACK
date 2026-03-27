import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PenalExpediente } from '../entities/../../entities/penal.entity';
import { User } from '../../../../shared/users/entities/user.entity';

@Entity('penal_plan_trabajo')
export class PlanTrabajo {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => PenalExpediente, { eager: true, nullable: false })
  @JoinColumn({ name: 'expediente_id' })
  expediente: PenalExpediente;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'guia_id' })
  guia: User;

  @Column({ type: 'varchar', length: 50, nullable: true })
  periodo: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: string;

  @Column({
    name: 'datos_jsonb',
    type: 'jsonb',
    nullable: false,
    default: () => "'{}'",
  })
  datosJsonb: Record<string, any>;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}
