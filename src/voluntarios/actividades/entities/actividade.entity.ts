import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('voluntario_actividades')
export class Actividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'nombre_actividad' })
  nombreActividad: string;

  @Column({ type: 'varchar', length: 255 })
  impartidor: string;

  @Column({ type: 'varchar', length: 255 })
  responsable: string;

  @Column({ type: 'varchar', length: 255 })
  lugar: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'int', default: 1, name: 'num_participantes' })
  numParticipantes: number;

  @Column({ type: 'varchar', length: 50, default: 'Se llevó a cabo' })
  estado: 'Se llevó a cabo' | 'No se llevó a cabo';

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}