import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
  import { User } from '../../../shared/users/entities/user.entity';
  import { IncidenciaTipoEnum, IncidenciaEstatusEnum } from '../enums/civico.enums';
  
  @Entity('civic_incidencias')
  export class Incidencia {
    @PrimaryGeneratedColumn('uuid')
    idUUID!: string;
  
    // ── Relación N:1 con Expediente ───────────────────────────────────
    @ManyToOne(() => ExpedienteCivico, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'expediente_id' })
    expediente!: ExpedienteCivico;
  
    @Column({ name: 'expediente_id', type: 'uuid' })
    expedienteId!: string;
  
    // ── Relación con Guía (Usuario) que registra la incidencia ────────
    @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'guia_id' })
    guia!: User;
  
    @Column({ name: 'guia_id', type: 'int' })
    guiaId!: number;
  
    // ── Datos de la incidencia ────────────────────────────────────────
    @Column({
      type: 'enum',
      enum: IncidenciaTipoEnum,
    })
    tipo!: IncidenciaTipoEnum;
  
    @Column({ name: 'fecha_incidencia', type: 'date' })
    fechaIncidencia!: Date;
  
    @Column({ name: 'descripcion_hechos', type: 'text' })
    descripcionHechos!: string;
  
    // es_acumulativa = TRUE → cuenta para el conteo de strikes (RF-013)
    @Column({ name: 'es_acumulativa', type: 'boolean', default: true })
    esAcumulativa!: boolean;
  
    @Column({
      name: 'estatus_resolucion',
      type: 'enum',
      enum: IncidenciaEstatusEnum,
      default: IncidenciaEstatusEnum.PENDIENTE,
    })
    estatusResolucion!: IncidenciaEstatusEnum;
  
    @Column({
      name: 'num_oficio_notificacion',
      type: 'varchar',
      length: 80,
      nullable: true,
    })
    numOficioNotificacion!: string | null;
  }