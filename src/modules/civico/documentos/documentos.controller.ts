import {
    Controller, Get, Param,
    ParseIntPipe, Res, UseGuards,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { DocumentosService } from './documentos.service';
  
  @UseGuards(JwtAuthGuard) // todas las rutas requieren token
  @Controller('civico/documentos')
  export class DocumentosController {
  
    constructor(private readonly documentosService: DocumentosService) {}
  
    // ── Cada endpoint llama al servicio con los datos del expediente ──
    // Los implementaremos uno por uno conforme hagamos cada template
  
    // Ejemplo del flujo — cada documento tendrá su propio endpoint:
    // GET /civico/documentos/oficio-incorporacion/:expedienteId
    // GET /civico/documentos/f3-plan-trabajo/:expedienteId
    // GET /civico/documentos/lista-asistencia/:expedienteId
    // ...etc
  }