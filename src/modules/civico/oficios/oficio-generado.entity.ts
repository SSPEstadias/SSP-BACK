import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
  } from 'typeorm';
  import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
  import { User } from '../../../shared/users/entities/user.entity';
  import { TipoDocumentoEnum } from '../enums/civico.enums';
  
  @Entity('civic_oficios_generados')
  export class OficioGenerado {
    @PrimaryGeneratedColumn('uuid')
    idUUID!: string;
  
    // ── Relación N:1 con Expediente ───────────────────────────────────
    @ManyToOne(() => ExpedienteCivico, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'expediente_id' })
    expediente!: ExpedienteCivico;
  
    @Column({ name: 'expediente_id', type: 'uuid' })
    expedienteId!: string;
  
    // ── Relación con el Usuario que genera el documento ───────────────
    @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'generado_por_id' })
    generadoPor!: User;
  
    @Column({ name: 'generado_por_id', type: 'int' })
    generadoPorId!: number;
  
    // ── Datos del documento ───────────────────────────────────────────
    @Column({
      name: 'tipo_documento',
      type: 'enum',
      enum: TipoDocumentoEnum,
    })
    tipoDocumento!: TipoDocumentoEnum;
  
    @Column({ name: 'folio_oficio', type: 'varchar', length: 80, unique: true })
    folioOficio!: string;
  
    // Nomenclatura HU-05: CURP_TipoDocumento.pdf
    @Column({
      name: 'nombre_archivo_federal',
      type: 'varchar',
      length: 150,
      nullable: true,
    })
    nombreArchivoFederal!: string | null;
  
    @Column({ name: 'url_archivo', type: 'text' })
    urlArchivo!: string;
  
    @Column({ name: 'drive_file_id', type: 'varchar', length: 150, nullable: true })
    driveFileId!: string | null;
  
    // ── Control de modificaciones ─────────────────────────────────────
    @Column({ name: 'es_modificacion', type: 'boolean', default: false })
    esModificacion!: boolean;
  
    @Column({ name: 'motivo_modificacion', type: 'text', nullable: true })
    motivoModificacion!: string | null;
  
    // ── Auditoría RNF-003 ─────────────────────────────────────────────
    // TRUE solo para OFICIO_CANALIZACION (viene del juzgado, no lo genera el sistema)
    @Column({ name: 'es_externo', type: 'boolean', default: false })
    esExterno!: boolean;
  
    @CreateDateColumn({ name: 'fecha_generacion' })
    fechaGeneracion!: Date;
  }