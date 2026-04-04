import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';
import { VoluntariosGoogleDriveService } from '../../../shared/google-drive/voluntarios-google-drive.service';
import { CreatePersonFolderResponseDto } from './dto/create-person-folder-response.dto';

@Controller('voluntarios/personas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonasController {
  constructor(
    private readonly personasService: PersonasService,
    private readonly voluntariosGoogleDriveService: VoluntariosGoogleDriveService,
  ) {}

  // POST /api/personas
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  // GET /api/personas
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Get()
  findAll() {
    return this.personasService.findAll();
  }

  // GET /api/personas/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  // PUT /api/personas/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Put(':id')
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  // DELETE /api/personas/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }

  // POST /voluntarios/personas/generar-carpeta/:id
  // Genera una carpeta en Google Drive con los datos de la persona y sube un PDF
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Post('generar-carpeta/:id')
  async generatePersonFolder(@Param('id') personaId: string): Promise<CreatePersonFolderResponseDto> {
    // Obtener datos de la persona
    const persona = await this.personasService.findOne(personaId);

    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    // Llamar al servicio de Google Drive
    const result = await this.voluntariosGoogleDriveService.createPersonFolderWithPDF(persona);

    return {
      folioNumber: result.folioNumber,
      folderName: result.folderName,
      folderId: result.folderId,
      driveFileId: result.driveFileId,
      urlArchivo: result.urlArchivo,
      mensaje: `Carpeta y PDF creados exitosamente para ${persona.nombre}`,
    };
  }
}