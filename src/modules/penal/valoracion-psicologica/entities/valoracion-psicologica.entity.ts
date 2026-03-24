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

@Entity('penal_valoracion_psicologica')
export class ValoracionPsicologica {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @OneToOne(() => PenalExpediente, { eager: true, nullable: false })
  @JoinColumn({ name: 'expediente_id' })
  expediente: PenalExpediente;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo: User;

  @Column({ name: 'fecha_estudio', type: 'date', nullable: false })
  fechaEstudio: string;

  @Column({ name: 'motivo_valoracion', type: 'text', nullable: true })
  motivoValoracion: string;

  @Column({
    name: 'secciones_jsonb',
    type: 'jsonb',
    nullable: false,
    default: () => "'{}'",
  })
  seccionesJsonb: Record<string, any>;

  @Column({ name: 'observaciones_generales', type: 'text', nullable: true })
  observacionesGenerales: string;

  @Column({
    name: 'resultados_pruebas',
    type: 'jsonb',
    nullable: false,
    default: () => "'{}'",
  })
  resultadosPruebas: Record<string, any>;

  @Column({
    name: 'accion_derivada',
    type: 'jsonb',
    nullable: false,
    default: () => "'{}'",
  })
  accionDerivada: Record<string, any>;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}
