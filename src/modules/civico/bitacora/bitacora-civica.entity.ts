import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
import { User } from '../../../shared/users/entities/user.entity';
import { AsistenciaEnum, IncidenciaTipoEnum } from '../enums/civico.enums';

@Entity('civic_bitacora_civica')
export class BitacoraCivica {
  @PrimaryGeneratedColumn('uuid')
  idUUID!: string;

  // ── Relaciones ────────────────────────────────────────────────────
  @ManyToOne(() => ExpedienteCivico, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'expediente_id' })
  expediente!: ExpedienteCivico;

  @Column({ name: 'expediente_id', type: 'uuid' })
  expedienteId!: string;

  // ── Guía responsable ───────────────────────────────────────────────
  @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'guia_id' })
  guia!: User;

  @Column({ name: 'guia_id', type: 'int' })
  guiaId!: number;

  // ── Datos del registro ────────────────────────────────────���───────
  @Column({ name: 'fecha_actividad', type: 'date' })
  fechaActividad!: Date;

  @Column({ name: 'actividad_id', type: 'int', nullable: true })
  actividadId?: number;

  @Column({
    name: 'horas_cubiertas',
    type: 'decimal',
    precision: 3,
    scale: 1,
  })
  horasCubiertas!: number;

  // ✅ CORREGIDO: Ahora es ENUM, no BOOLEAN
  @Column({
    name: 'asistencia',
    type: 'enum',
    enum: AsistenciaEnum,
  })
  asistencia!: AsistenciaEnum;

  // ── Incidencias ───────────────────────────────────────────────────
  @Column({
    name: 'incidencia',
    type: 'enum',
    enum: IncidenciaTipoEnum,
    nullable: true,
  })
  incidencia?: IncidenciaTipoEnum;

  @Column({ name: 'detalle_incidencia', type: 'text', nullable: true })
  detalleIncidencia?: string;

  // ── Observaciones ──────────────────────────────────────────────────
  @Column({ name: 'sede', type: 'varchar', length: 150, nullable: true })
  sede?: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string;

  @Column({ name: 'evidencia_url', type: 'varchar', length: 500, nullable: true })
  evidenciaUrl?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}