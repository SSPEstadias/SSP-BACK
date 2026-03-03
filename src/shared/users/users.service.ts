import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
   
    const existe = await this.repo.findOne({
      where: { nomUsuario: dto.nomUsuario },
    });
    if (existe) throw new ConflictException('El nombre de usuario ya existe');

    const hashed = await bcrypt.hash(dto.contrasena, 10);
    const user = this.repo.create({
      nombre:     dto.nombre,
      rol:        dto.rol,
      nomUsuario: dto.nomUsuario,
      contrasena: hashed,
      estatus:    true,
    });

    const guardado = await this.repo.save(user);
    const { contrasena, ...safe } = guardado;
    return safe;
  }

  async findAll() {
    return this.repo.find({
      select: ['id', 'nombre', 'rol', 'nomUsuario', 'estatus', 'creadoEn'],
    });
  }

  // Usado por AuthService para el login
  async findByUsername(nomUsuario: string) {
    return this.repo.findOne({ where: { nomUsuario } });
  }
}