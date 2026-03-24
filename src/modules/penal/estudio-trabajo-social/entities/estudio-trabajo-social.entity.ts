import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PenalExpediente } from '../entities/../../entities/penal.entity';
import { User } from '../../../../shared/users/entities/user.entity';

@Entity('penal_estudio_trabajo_social')
export class EstudioTrabajoSocial {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @OneToOne(() => PenalExpediente, { eager: true, nullable: false })
  @JoinColumn({ name: 'expediente_id' })
  expediente: PenalExpediente;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'trabajador_social_id' })
  trabajadorSocial: User;

  @Column({ name: 'fecha_estudio', type: 'date', nullable: false })
  fechaEstudio: string;

  @Column({
    name: 'secciones_jsonb',
    type: 'jsonb',
    nullable: false,
    default: () => "'{}'",
  })
  seccionesJsonb: Record<string, any>;

  @Column({ name: 'opinion_programa', type: 'text', nullable: true })
  opinionPrograma: string;

  @Column({ name: 'diagnostico_social', type: 'text', nullable: true })
  diagnosticoSocial: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}
