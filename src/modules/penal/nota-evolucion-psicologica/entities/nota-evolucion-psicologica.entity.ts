import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PenalExpediente } from '../../entities/penal.entity';
import { User } from '../../../../shared/users/entities/user.entity';

@Entity('penal_nota_evolucion_psicologica')
export class NotaEvolucionPsicologica {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => PenalExpediente, { eager: true, nullable: false })
  @JoinColumn({ name: 'expediente_id' })
  expediente: PenalExpediente;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo: User;

  @Column({ type: 'date', nullable: false })
  fecha: string;

  @Column({ name: 'numero_sesion', type: 'int', nullable: false })
  numeroSesion: number;

  @Column({ name: 'objetivo_sesion', type: 'text', nullable: true })
  objetivoSesion: string;

  @Column({ name: 'descripcion_sesion', type: 'text', nullable: true })
  descripcionSesion: string;

  @Column({ name: 'tecnicas_aplicadas', type: 'text', nullable: true })
  tecnicasAplicadas: string;

  @Column({ type: 'text', nullable: true })
  avances: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'proxima_sesion', type: 'date', nullable: true })
  proximaSesion: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}
