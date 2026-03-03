import {
    Entity, PrimaryGeneratedColumn, Column,
  } from 'typeorm';
  //se crea los anums para las actividades 
  export enum ActividadCategoriaEnum {
    TRABAJO_COMUNITARIO         = 'TRABAJO_COMUNITARIO',
    LIDERAZGO_COMUNITARIO       = 'LIDERAZGO_COMUNITARIO',
    ATENCION_SUSTANCIAS         = 'ATENCION_SUSTANCIAS',
    EDUCACION_PARA_LA_VIDA      = 'EDUCACION_PARA_LA_VIDA',
    PROMOCION_CULTURAL_DEPORTIVA = 'PROMOCION_CULTURAL_DEPORTIVA',
  }
  
  @Entity('actividades')
  export class Actividad {
  
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: 'text' ,unique: true})
    nombre!: string;
  
    @Column({ type: 'text', nullable: true })
    descripcion!: string;
  
    @Column({ type: 'text', nullable: true })
    objetivo!: string;
  
    @Column({
      type: 'enum',
      enum: ActividadCategoriaEnum,
      nullable: true,
    })
    categoria!: ActividadCategoriaEnum;
  
    @Column({ type: 'boolean', default: true })
    activo!: boolean;
  }