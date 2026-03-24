import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Beneficiario } from '../beneficiarios/beneficiario.entity';

@Entity('salud_perfil_general')
export class Salud {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1:1 relationship with Beneficiario
  @OneToOne(() => Beneficiario, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'beneficiario_id' })
  beneficiario!: Beneficiario;

  @Column({ name: 'beneficiario_id', type: 'int', unique: true })
  beneficiarioId!: number;

  // ── Aptitud y Enfermedades ───────────────────────────────────────╮
  @Column({ type: 'boolean', default: true })
  esAptoFisico!: boolean;

  @Column({ type: 'boolean', default: false })
  padecEnfermedad!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombreEnfermedad!: string | null;
  // ── Restricciones por categoría de actividad ──────────────────────
  // Solo aplica cuando esAptoFisico = true pero con limitaciones físicas
  // Almacena las categorías que NO puede realizar
  // NULL o [] = sin restricciones, puede hacer todas las categorías
  // Ejemplo: ["TRABAJO_COMUNITARIO", "PROMOCION_CULTURAL_DEPORTIVA"]
  // Valores válidos: los del enum ActividadCategoriaEnum en actividad.entity.ts
  @Column({
    name: 'restricciones_categorias',
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  restriccionesCategorias!: string[] | null;

  // ── Consumo de Sustancias ───────────────────────────────────────╮
  @Column({ type: 'boolean', default: false })
  consumeSustancias!: boolean;

  @Column({ type: 'text', nullable: true })
  tipoSustancias!: string | null;

  // ── Servicios de Salud ──────────────────────────────────────────╮
  @Column({ type: 'varchar', length: 100, nullable: true })
  afiliadoServicioSalud!: string | null;

  @Column({ type: 'boolean', default: false })
  necesitaLentes!: boolean;

  // ── Observaciones y Control ────────────────────────────────────╮
  @Column({ type: 'text', nullable: true })
  observacionesMedicas!: string | null;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;
}
