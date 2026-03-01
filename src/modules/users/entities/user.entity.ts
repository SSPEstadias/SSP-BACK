import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum RolUsuario {
  ADMIN = 'admin',
  PSICOLOGO = 'psicologo',
  TRABAJO_SOCIAL = 'trabajo_social',
  GUIA = 'guia',
}

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol: RolUsuario;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  nom_usuario: string;

  @Column({ type: 'text' })
  contrasena: string;

  @Column({ type: 'boolean', default: true })
  estatus: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;
}
