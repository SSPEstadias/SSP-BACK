import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('voluntario_personas')
export class Persona {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  folio: string;

  // ─── I. Generales ────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sobrenombre: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  edad: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_nacimiento' })
  fechaNacimiento: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  curp: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'lugar_origen' })
  lugarOrigen: string;

  @Column({ type: 'text', nullable: true, name: 'motivo_ingreso' })
  motivoIngreso: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_inicio_tratamiento' })
  fechaInicioTratamiento: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_termino_tratamiento' })
  fechaTerminoTratamiento: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  religion: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'practica_deporte' })
  practicaDeporte: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'cual_deporte' })
  cualDeporte: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pasatiempo: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'tiene_acta_nacimiento' })
  tieneActaNacimiento: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'lugar_nacimiento_registro' })
  lugarNacimientoRegistro: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'personas_registraron' })
  personasRegistraron: string;

  // ─── II. Escolaridad ─────────────────────────────────────────
  @Column({ type: 'varchar', length: 10, nullable: true, name: 'sabe_leer_escribir' })
  sabeLeerEscribir: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'grado_maximo_estudios' })
  gradoMaximoEstudios: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'le_gustaria_estudiar' })
  leGustariaEstudiar: string;

  @Column({ type: 'boolean', default: false, name: 'certificado_primaria' })
  certificadoPrimaria: boolean;

  @Column({ type: 'boolean', default: false, name: 'certificado_secundaria' })
  certificadoSecundaria: boolean;

  @Column({ type: 'boolean', default: false, name: 'certificado_bachillerato' })
  certificadoBachillerato: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'nombre_plantel' })
  nombrePlantel: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'direccion_plantel' })
  direccionPlantel: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_termino_plantel' })
  fechaTerminoPlantel: string;

  // ─── III. Laboral ────────────────────────────────────────────
  @Column({ type: 'varchar', length: 10, nullable: true, name: 'trabaja_formal' })
  trabajaFormal: string;

  @Column({ type: 'text', nullable: true, name: 'funciones_trabajo' })
  funcionesTrabajo: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'le_gustaria_cambiar_trabajo' })
  leGustariaCambiarTrabajo: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'sabe_oficio' })
  sabeOficio: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'le_gustaria_aprender_oficio' })
  leGustariaAprenderOficio: string;

  // ─── IV. Salud ───────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'padecimiento_enfermedad' })
  padecimientoEnfermedad: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'servicio_salud' })
  servicioSalud: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'cuenta_tratamiento' })
  cuentaTratamiento: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'enfermedad_transmision_sexual' })
  enfermedadTransmisionSexual: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'necesita_lentes' })
  necesitaLentes: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'atencion_psicologica' })
  atencionPsicologica: string;

  // ─── Contactos ───────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'contacto1_nombre' })
  contacto1Nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contacto1_relacion' })
  contacto1Relacion: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contacto1_telefono' })
  contacto1Telefono: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'contacto2_nombre' })
  contacto2Nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contacto2_relacion' })
  contacto2Relacion: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contacto2_telefono' })
  contacto2Telefono: string;

  // ─── Estado ──────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 20, default: 'Activo' })
  estado: 'Activo' | 'Inactivo';

  // ─── Timestamps ──────────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}