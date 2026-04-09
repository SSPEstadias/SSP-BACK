import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CivicoGoogleDriveService } from 'src/shared/google-drive/civico-google-drive.service';
import { Persona } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    private readonly driveService: CivicoGoogleDriveService,
  ) {}

  // ─── CREAR ───────────────────────────────────────────────────
  async create(createPersonaDto: CreatePersonaDto): Promise<Persona> {
    // Validar folio duplicado
    if (createPersonaDto.folio) {
      const existente = await this.personaRepository.findOne({
        where: { folio: createPersonaDto.folio },
      });

      if (existente) {
        throw new BadRequestException(
          `Ya existe una persona registrada con el folio "${createPersonaDto.folio}"`,
        );
      }
    }

    const persona = this.personaRepository.create(createPersonaDto);
    return await this.personaRepository.save(persona);
  }

  // ─── LISTAR TODOS ────────────────────────────────────────────
  async findAll(): Promise<Persona[]> {
    return await this.personaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // ─── BUSCAR UNO ──────────────────────────────────────────────
  async findOne(id: string): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException(`Persona con id ${id} no encontrada`);
    }
    return persona;
  }

  // ─── ACTUALIZAR ──────────────────────────────────────────────
  async update(id: string, updatePersonaDto: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.findOne(id);

    // Validar folio duplicado si se está cambiando
    if (updatePersonaDto.folio && updatePersonaDto.folio !== persona.folio) {
      const existente = await this.personaRepository.findOne({
        where: { folio: updatePersonaDto.folio },
      });

      if (existente) {
        throw new BadRequestException(
          `Ya existe una persona registrada con el folio "${updatePersonaDto.folio}"`,
        );
      }
    }

    const updated = this.personaRepository.merge(persona, updatePersonaDto);
    return await this.personaRepository.save(updated);
  }

  // ─── ELIMINAR ────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const persona = await this.findOne(id);
    await this.personaRepository.remove(persona);
    return { message: `Persona con id ${id} eliminada correctamente` };
  }

  // ─── SUBIR ARCHIVO A GOOGLE DRIVE ───────────────────────────
  async uploadFileToVoluntario(personaId: string, pdfBuffer: Buffer, fileName: string) {
    const parentFolderId = process.env.VOLUNTARIADO_DRIVE_FOLDER_ID;

    const folderId = await this.driveService.getOrCreateFolder(
      `VOLUNTARIO-${personaId}`,
      parentFolderId,
    );

    const { driveFileId, urlArchivo } = await this.driveService.uploadFile(
      pdfBuffer,
      fileName,
      folderId,
    );

    return { driveFileId, urlArchivo, folderId };
  }
}