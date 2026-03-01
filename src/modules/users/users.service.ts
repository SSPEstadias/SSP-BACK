import { Injectable, ConflictException } from '@nestjs/common';
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
    const exists = await this.repo.findOne({
      where: { nom_usuario: dto.nom_usuario },
    });
    if (exists) throw new ConflictException('nom_usuario ya existe');

    const hashed = await bcrypt.hash(dto.contrasena, 10);

    const user = this.repo.create({
      nombre: dto.nombre,
      rol: dto.rol,
      nom_usuario: dto.nom_usuario,
      contrasena: hashed,
      estatus: true,
    });

    const saved = await this.repo.save(user);

    // nunca regreses la contraseña
    const { contrasena, ...safe } = saved;
    return safe;
  }

  async findAll() {
    return this.repo.find({
      select: ['id', 'nombre', 'rol', 'nom_usuario', 'estatus', 'creado_en'],
    });
  }
  async findByUsername(nom_usuario: string) {
    return this.repo.findOne({ where: { nom_usuario } });
  }
}
