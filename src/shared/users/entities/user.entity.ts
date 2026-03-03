import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum RolUsuario {
  Admin         = 'Admin',
  Psicologo     = 'Psicologo',
  TrabajoSocial = 'TrabajoSocial',
  Guia          = 'Guia',
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
  nomUsuario: string;

  @Column({ type: 'text' })
  contrasena: string;

  @Column({ type: 'boolean', default: true })
  estatus: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  creadoEn: Date;
}
