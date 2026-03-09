import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Beneficiario } from '../../../shared/beneficiarios/beneficiario.entity';
  import { CivicStatusEnum } from '../enums/civico.enums';
  
  @Entity('civic_expedientes')
  export class ExpedienteCivico {
    // UUID como PK — no expone secuencias (seguridad RF)
    @PrimaryGeneratedColumn('uuid')
    idUUID!: string;
  
    // ── Relación con Beneficiario (Núcleo Compartido) ─────────────────
    @ManyToOne(() => Beneficiario, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'beneficiario_id' })
    beneficiario!: Beneficiario;
  
    @Column({ name: 'beneficiario_id', type: 'int' })
    beneficiarioId!: number;
  
    @Column({ name: 'es_activo', type: 'boolean', default: true })
    esActivo!: boolean;
  
    @Column({ name: 'num_reincidencia', type: 'int', default: 0 })
    numReincidencia!: number;
  
    // ── Identidad heredable en F1, F2, F3, F4 (RF-004) ──────────────
    @Column({ type: 'varchar', length: 18 })
    curp!: string;
  
    @Column({ name: 'fecha_nacimiento', type: 'date' })
    fechaNacimiento!: Date;
  
    @Column({ type: 'varchar', length: 20, nullable: true })
    genero!: string | null;
  
    @Column({ name: 'alias_sobrenombre', type: 'varchar', length: 100, nullable: true })
    aliasSobrenombre!: string | null;
  
    @Column({ type: 'varchar', length: 150, nullable: true })
    originario!: string | null;
  
    @Column({ name: 'domicilio_completo', type: 'text' })
    domicilioCompleto!: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    municipio!: string | null;
  
    @Column({ name: 'codigo_postal', type: 'varchar', length: 10, nullable: true })
    codigoPostal!: string | null;
  
    @Column({ name: 'telefono_contacto', type: 'varchar', length: 15, nullable: true })
    telefonoContacto!: string | null;
  
    @Column({ name: 'escolaridad_actual', type: 'varchar', length: 100, nullable: true })
    escolaridadActual!: string | null;
  
    @Column({ name: 'estado_civil', type: 'varchar', length: 50, nullable: true })
    estadoCivil!: string | null;
  
    @Column({ name: 'ocupacion_actual', type: 'varchar', length: 100, nullable: true })
    ocupacionActual!: string | null;
  
    @Column({ type: 'varchar', length: 50, nullable: true })
    nacionalidad!: string | null;
  
    @Column({ name: 'lengua_indigena', type: 'varchar', length: 100, nullable: true })
    lenguaIndigena!: string | null;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    religion!: string | null;
  
    // ── Contactos familiares (JSONB) ─────────────────────────────────
    // { "padre": {"nombre":"", "telefono":""}, "madre": {...}, "tutor": {...} }
    @Column({ name: 'contactos_familiares', type: 'jsonb', nullable: true })
    contactosFamiliares!: object | null;
  
    // ── Datos Legales ────────────────────────────────────────────────
    @Column({ name: 'folio_incorporacion', type: 'varchar', length: 50, unique: true })
    folioIncorporacion!: string;
  
    @Column({ name: 'num_juzgado_civico', type: 'varchar', length: 50, nullable: true })
    numJuzgadoCivico!: string | null;
  
    @Column({ name: 'juez_control', type: 'varchar', length: 150, nullable: true })
    juezControl!: string | null;
  
    @Column({ name: 'oficio_canalizacion', type: 'varchar', length: 50, nullable: true })
    oficioCanalizacion!: string | null;
  
    @Column({ name: 'causa_penal', type: 'varchar', length: 50 })
    causaPenal!: string;
  
    @Column({ name: 'delito_imputado', type: 'varchar', length: 150, nullable: true })
    delitoImputado!: string | null;
  
    @Column({ type: 'varchar', length: 150, nullable: true })
    agraviado!: string | null;
  
    @Column({ name: 'fecha_detencion', type: 'date', nullable: true })
    fechaDetencion!: Date | null;
  
    @Column({ name: 'modalidad_falta', type: 'varchar', length: 100, nullable: true })
    modalidadFalta!: string | null;
  
    @Column({ name: 'horas_sentencia', type: 'int' })
    horasSentencia!: number;
  
    // ── Días y horario dictados por el Juez (JSONB) ──────────────────
    // { "dias":["2025-08-02",...], "horas_por_dia":4, "horario":"mañana" }
    @Column({ name: 'dias_asignados_juzgado', type: 'jsonb', nullable: true })
    diasAsignadosJuzgado!: object | null;
  
    @Column({ name: 'horas_por_dia', type: 'int', nullable: true })
    horasPorDia!: number | null;
  
    // ── Control ──────────────────────────────────────────────────────
    @Column({
      name: 'estatus_proceso',
      type: 'enum',
      enum: CivicStatusEnum,
      default: CivicStatusEnum.INDUCCION,
    })
    estatusProceso!: CivicStatusEnum;
  
    @Column({
      name: 'avance_horas',
      type: 'decimal',
      precision: 5,
      scale: 2,
      default: 0.0,
    })
    avanceHoras!: number;
  
    @CreateDateColumn({ name: 'creado_en' })
    creadoEn!: Date;
  }