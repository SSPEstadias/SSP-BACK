import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
  import { User } from '../../../shared/users/entities/user.entity';
  
  @Entity('civic_seguimiento_psicologico')
  export class SeguimientoPsicologico {
    @PrimaryGeneratedColumn('uuid')
    idUUID!: string;
  
    // ── Relación N:1 con Expediente (1:N — múltiples sesiones) ────────
    @ManyToOne(() => ExpedienteCivico, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'expediente_id' })
    expediente!: ExpedienteCivico;
  
    @Column({ name: 'expediente_id', type: 'uuid' })
    expedienteId!: string;
  
    // ── Relación con Psicólogo (Usuario) ──────────────────────────────
    @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
    @JoinColumn({ name: 'psicologo_id' })
    psicologo!: User;
  
    @Column({ name: 'psicologo_id', type: 'int' })
    psicologoId!: number;
  
    // ── Datos de la sesión ────────────────────────────────────────────
    @Column({ name: 'num_sesion', type: 'int' })
    numSesion!: number;
  
    @Column({ name: 'fecha_sesion', type: 'date' })
    fechaSesion!: Date;
  
    @Column({ name: 'hora_sesion', type: 'time', nullable: true })
    horaSesion!: string | null;
  
    @Column({ name: 'fecha_proxima_sesion', type: 'date', nullable: true })
    fechaProximaSesion!: Date | null;
  
    // ── Contenido clínico de la nota de evolución ────────────────────
    @Column({ name: 'objetivo_sesion', type: 'text', nullable: true })
    objetivoSesion!: string | null;
  
    @Column({ name: 'conducta_disposicion', type: 'text', nullable: true })
    conductaDisposicion!: string | null;
  
    @Column({ name: 'descripcion_intervencion', type: 'text', nullable: true })
    descripcionIntervencion!: string | null;
  
    @Column({ name: 'tema_sesion', type: 'varchar', length: 150, nullable: true })
    temaSesion!: string | null;
  
    @Column({ name: 'estrategia_aplicada', type: 'text', nullable: true })
    estrategiaAplicada!: string | null;
  
    @Column({ name: 'plan_terapeutico', type: 'text', nullable: true })
    planTerapeutico!: string | null;
  
    @Column({ name: 'actividades_asignadas_usuario', type: 'text', nullable: true })
    actividadesAsignadasUsuario!: string | null;
  
    @Column({ name: 'avance_percibido', type: 'varchar', length: 50, nullable: true })
    avancePercibido!: string | null;
  
    @Column({ type: 'text', nullable: true })
    observaciones!: string | null;
  
    @Column({ name: 'cedula_profesional', type: 'varchar', length: 50, nullable: true })
    cedulaProfesional!: string | null;
  }
