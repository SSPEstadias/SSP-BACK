import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PenalExpediente } from '../../entities/penal.entity';

@Entity('penal_expediente_caratula')
export class ExpedienteCaratula {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @OneToOne(() => PenalExpediente, { eager: true, nullable: false })
  @JoinColumn({ name: 'expediente_id' })
  expediente: PenalExpediente;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alias: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  juzgado: string;

  @Column({ type: 'text', nullable: true })
  delito: string;

  @Column({ type: 'text', nullable: true })
  agraviado: string;

  @Column({ name: 'fecha_ingreso_programa', type: 'date', nullable: true })
  fechaIngresoPrograma: string;

  @Column({ name: 'fecha_suspension_proceso', type: 'date', nullable: true })
  fechaSuspensionProceso: string;

  @Column({ name: 'fecha_fin_supervision', type: 'date', nullable: true })
  fechaFinSupervision: string;

  @Column({
    name: 'medida_cautelar',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  medidaCautelar: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}
