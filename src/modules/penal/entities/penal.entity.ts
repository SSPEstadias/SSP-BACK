import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Beneficiario } from '../../../shared/beneficiarios/beneficiario.entity';

export enum PenalEstatusExpediente {
  REGISTRADO = 'REGISTRADO',
  F1_COMPLETO = 'F1_COMPLETO',
  F2_COMPLETO = 'F2_COMPLETO',
  PLAN_COMPLETO = 'PLAN_COMPLETO',
  CARATULA_HABILITADA = 'CARATULA_HABILITADA',
  EN_SUPERVISION = 'EN_SUPERVISION',
  CERRADO = 'CERRADO',
}

@Entity('penal_expedientes')
export class PenalExpediente {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @OneToOne(() => Beneficiario, { eager: true, nullable: false })
  @JoinColumn({ name: 'beneficiario_id' })
  beneficiario: Beneficiario;

  @Column({ name: 'c_penal', type: 'varchar', length: 80, nullable: true })
  cPenal: string;

  @Column({ name: 'expediente_tecnico', type: 'varchar', length: 80, nullable: true })
  expedienteTecnico: string;

  @Column({ name: 'folio_incorporacion', type: 'varchar', length: 80, nullable: true })
  folioIncorporacion: string;

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

  @Column({ name: 'medida_cautelar', type: 'varchar', length: 255, nullable: true })
  medidaCautelar: string;

  @Column({
    type: 'enum',
    enum: PenalEstatusExpediente,
    default: PenalEstatusExpediente.REGISTRADO,
  })
  estatus: PenalEstatusExpediente;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;
}