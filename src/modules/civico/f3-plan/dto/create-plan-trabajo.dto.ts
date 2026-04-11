import {
    IsString,
    IsInt,
    IsOptional,
    IsDateString,
    IsEnum,
    IsObject,
    IsNotEmpty,
    IsUUID,
  } from 'class-validator';
  import { FormStatusEnum } from '../../enums/civico.enums';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class CreatePlanTrabajoDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @ApiProperty({ description: 'UUID del expediente', example: '8c478ea9-fbcb-452d-90f6-e689a2590fd6' })
    @IsUUID()
    expedienteId!: string;
  
    @ApiProperty({ description: 'ID del coordinador/guía', example: 1 })
    @IsInt()
    coordinadorId!: number;
  
    // ── Fechas ─────────────────────────────────────────────────────────
    @ApiProperty({ description: 'Fecha de inicio estimada', example: '2025-04-01' })
    @IsDateString()
    fechaInicioEstimada!: string;
  
    @ApiProperty({ description: 'Fecha de término estimada', example: '2025-06-01' })
    @IsDateString()
    fechaTerminoEstimada!: string;
  
    @ApiProperty({ description: 'Días y horarios asignados', example: 'Lunes, Miércoles y Viernes de 08:00 a 12:00', required: false })
    @IsString()
    @IsOptional()
    diasAsignados?: string;
  
    // ── Contenido ─────────────────────────────────────────────────────
    @ApiProperty({
      description: 'Proyecto de vida resumido',
      example: { personal: '...', familiar: '...', social: '...' },
      required: false,
    })
    @IsObject()
    @IsOptional()
    proyectoVidaF3?: object;
  
    @ApiProperty({ description: 'Metas del programa', example: 'Cumplir 48 horas de servicio...', required: false })
    @IsString()
    @IsOptional()
    metasPrograma?: string;
  
    @ApiProperty({
      description: 'Mapeo de las 8 categorías de actividad. Claves: EDUCATIVA, PSICOSOCIAL, PSICOLOGICA, ADICCIONES, FAMILIAR, LABORAL, DEPORTIVA, CULTURAL.',
      example: {
        LABORAL: {
          estatus: 'EN PROCESO',
          objetivo: 'Curso de habilidades para el empleo',
          vinculacion: 'STPS / ICATEN',
          temporalidad: 'Abril–Junio 2025',
          seguimiento: 'Asistencia regular',
          cumplimiento: '50% avance',
        },
      },
    })
    @IsObject()
    @IsNotEmpty()
    actividadesPlan!: object;
  
    @ApiProperty({ description: 'Observaciones generales del plan', required: false })
    @IsString()
    @IsOptional()
    observacionesPlan?: string;
  
    // ── Control ────────────────────────────────────────────────────────
    @ApiProperty({ enum: FormStatusEnum, default: FormStatusEnum.PENDIENTE, required: false })
    @IsEnum(FormStatusEnum)
    @IsOptional()
    estatusF3?: FormStatusEnum;
  }