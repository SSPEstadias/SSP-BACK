import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiario } from './beneficiario.entity';
import { CreateBeneficiarioDto } from './dto/create-beneficiario.dto';
import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';

@Injectable()
export class BeneficiariosService {

  constructor(
    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepository: Repository<Beneficiario>,
  ) {}

  // RF-001: Crear nuevo beneficiario
  async create(dto: CreateBeneficiarioDto): Promise<Beneficiario> {
    const nuevo = this.beneficiarioRepository.create(dto);
    return await this.beneficiarioRepository.save(nuevo);
  }

  // Obtener todos los beneficiarios
  async findAll(): Promise<Beneficiario[]> {
    return await this.beneficiarioRepository.find();
  }

  // Obtener un beneficiario por ID
  async findOne(id: number): Promise<Beneficiario> {
    const beneficiario = await this.beneficiarioRepository.findOne({
      where: { id },
    });

    if (!beneficiario) {
      throw new NotFoundException(`Beneficiario con ID ${id} no encontrado`);
    }

    return beneficiario;
  }

  // Actualizar beneficiario
  async update(id: number, dto: UpdateBeneficiarioDto): Promise<Beneficiario> {
    const beneficiario = await this.findOne(id); // lanza 404 si no existe
    Object.assign(beneficiario, dto);
    return await this.beneficiarioRepository.save(beneficiario);
  }

  // Eliminar beneficiario (soft — solo para casos necesarios)
  async remove(id: number): Promise<{ message: string }> {
    const beneficiario = await this.findOne(id);
    await this.beneficiarioRepository.remove(beneficiario);
    return { message: `Beneficiario ${id} eliminado correctamente` };
  }
}