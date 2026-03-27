import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  // El ENUM de unidad_tiempo definido en el DDL
  export enum UnidadTiempoEnum {
    HORAS = 'HORAS',
    MESES = 'MESES',
  }
  
  @Entity('beneficiarios') // nombre exacto de la tabla en PostgreSQL
  export class Beneficiario {
  
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: 'varchar', length: 150 })
    nombre!: string;
  
    @Column({
      name: 'fecha_ingreso',
      type: 'date',
      default: () => 'CURRENT_DATE',
    })
    fechaIngreso!: Date;
  
    @Column({ name: 'tiempo_asignado', type: 'int' })
    tiempoAsignado!: number;
  
    @Column({
      name: 'unidad_tiempo',
      type: 'enum',
      enum: UnidadTiempoEnum,
      default: UnidadTiempoEnum.MESES,
    })
    unidadTiempo!: UnidadTiempoEnum;

    @Column({ name: 'url_foto', type: 'text', nullable: true })
    urlFoto!: string | null;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn!: Date;
  }