import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Check,
  } from 'typeorm';
  import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
  import { User } from '../../../shared/users/entities/user.entity';
  import { Actividad } from '../../../shared/actividades/actividad.entity';
  
  @Entity('civic_bitacora_actividades')
  @Check(`"horas_cubiertas" <= 8`) // CHK del DDL: máximo 8h diarias
  export class BitacoraCivica {
    @PrimaryGeneratedColumn('uuid')
    idUUID!: string;
  
    // ── Relación con Expediente Cívico ────────────────────────────────
    @ManyToOne(() => ExpedienteCivico, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'expediente_id' })
    expediente!: ExpedienteCivico;
  
    @Column({ name: 'expediente_id', type: 'uuid' })
    expedienteId!: string;
  
    // ── Relación con Guía (Usuario) ───────────────────────────────────
    @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'guia_id' })
    guia!: User;
  
    @Column({ name: 'guia_id', type: 'int' })
    guiaId!: number;
  
    // ── Relación con Actividad del catálogo (Núcleo Compartido) ───────
    @ManyToOne(() => Actividad, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'actividad_id' })
    actividad!: Actividad;
  
    @Column({ name: 'actividad_id', type: 'int' })
    actividadId!: number;
  
    // ── Datos del registro ────────────────────────────────────────────
    @Column({ name: 'fecha_actividad', type: 'date' })
    fechaActividad!: Date;
  
    @Column({
      name: 'horas_cubiertas',
      type: 'decimal',
      precision: 4,
      scale: 2,
    })
    horasCubiertas!: number; // Máximo 8h — validado por @Check y DTO
  
    @Column({ type: 'boolean', default: true })
    asistencia!: boolean;
  
    @Column({ name: 'motivo_falta', type: 'text', nullable: true })
    motivoFalta!: string | null;
  
    @Column({ name: 'evidencia_url', type: 'text', nullable: true })
    evidenciaUrl!: string | null;
  }