import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PenalExpediente } from '../../entities/penal.entity';
import { User } from '../../../../shared/users/entities/user.entity';

@Entity('penal_ficha_seguimiento')
@Index('UQ_ficha_expediente_periodo', ['expediente', 'periodo'], {
  unique: true,
})
export class FichaSeguimiento {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => PenalExpediente, { eager: true, nullable: false })
  @JoinColumn({ name: 'expediente_id' })
  expediente: PenalExpediente;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'guia_id' })
  guia: User;

  @Column({ type: 'date', nullable: false })
  fecha: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  periodo: string;

  @Column({
    name: 'datos_personales_jsonb',
    type: 'jsonb',
    nullable: false,
    default: () => "'{}'",
  })
  datosPersonalesJsonb: Record<string, any>;

  @Column({ name: 'cumplimiento_general', type: 'text', nullable: true })
  cumplimientoGeneral: string;

  @Column({ type: 'text', nullable: true })
  comportamiento: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({
    name: 'incidencias_jsonb',
    type: 'jsonb',
    nullable: false,
    default: () => "'{}'",
  })
  incidenciasJsonb: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  recomendaciones: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}
