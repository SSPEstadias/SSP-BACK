import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
  import { User } from '../../../shared/users/entities/user.entity';
  import { FormStatusEnum } from '../enums/civico.enums';
  
  // Enums específicos del F2
  export enum NivelSocioeconomicoEnum {
    ALTO  = 'ALTO',
    MEDIO = 'MEDIO',
    BAJO  = 'BAJO',
  }
  
  export enum GrupoFamiliarEnum {
    FUNCIONAL    = 'FUNCIONAL',
    DISFUNCIONAL = 'DISFUNCIONAL',
  }
  
  @Entity('civic_estudio_socioeconomico')
  export class EstudioSocioeconomico {
    @PrimaryGeneratedColumn('uuid')
    idUUID!: string;
  
    // ── Relación 1:1 con Expediente ───────────────────────────────────
    @OneToOne(() => ExpedienteCivico, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'expediente_id' })
    expediente!: ExpedienteCivico;
  
    @Column({ name: 'expediente_id', type: 'uuid', unique: true })
    expedienteId!: string;
  
    // ── Relación con Trabajador Social (Usuario) ──────────────────────
    @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'trabajador_social_id' })
    trabajadorSocial!: User;
  
    @Column({ name: 'trabajador_social_id', type: 'int' })
    trabajadorSocialId!: number;
  
    // ── Columnas críticas consultables ────────────────────────────────
    @Column({
      name: 'ingreso_mensual',
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true,
    })
    ingresoMensual!: number | null;
  
    @Column({
      name: 'nivel_socioeconomico',
      type: 'enum',
      enum: NivelSocioeconomicoEnum,
      nullable: true,
    })
    nivelSocioeconomico!: NivelSocioeconomicoEnum | null;
  
    @Column({
      name: 'grupo_familiar',
      type: 'enum',
      enum: GrupoFamiliarEnum,
      nullable: true,
    })
    grupoFamiliar!: GrupoFamiliarEnum | null;
  
    @Column({ name: 'hubo_violencia_intrafamiliar', type: 'boolean', default: false })
    huboViolenciaIntrafamiliar!: boolean;
  
    @Column({ name: 'diagnostico_social', type: 'text', nullable: true })
    diagnosticoSocial!: string | null;
    // ── Bloques JSONB por sección del F2 físico ───────────────────────
    @Column({ name: 'generales_f2', type: 'jsonb', nullable: true })
    generalesF2!: object | null;
  
    @Column({ name: 'situacion_juridica_f2', type: 'jsonb', nullable: true })
    situacionJuridicaF2!: object | null;
  
    @Column({ name: 'nucleo_primario', type: 'jsonb', nullable: true })
    nucleoPrimario!: object | null;
  
    @Column({ name: 'nucleo_secundario', type: 'jsonb', nullable: true })
    nucleoSecundario!: object | null;
  
    @Column({ name: 'datos_indiciado', type: 'jsonb', nullable: true })
    datosIndiciado!: object | null;
  
    @Column({ name: 'grupos_autoayuda', type: 'jsonb', nullable: true })
    gruposAutoayuda!: object | null;
  
    @Column({ name: 'opinion_observaciones', type: 'jsonb', nullable: true })
    opinionObservaciones!: object | null;
  
    // ── CRÍTICO RF-008: COMPLETADO + F1 COMPLETADO → habilita F3 ──────
    @Column({
      name: 'estatus_f2',
      type: 'enum',
      enum: FormStatusEnum,
      default: FormStatusEnum.PENDIENTE,
    })
    estatusF2!: FormStatusEnum;
  }
