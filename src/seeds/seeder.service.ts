import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, RolUsuario } from '../shared/users/entities/user.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  // OnApplicationBootstrap → NestJS llama a onApplicationBootstrap()
  // automáticamente después de que todos los módulos están listos

  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ── Este método se ejecuta SOLO al arrancar la app ─────────────────
  async onApplicationBootstrap(): Promise<void> {
    await this.seedAdmin();
  }

  // ── Crea el admin si no existe (idempotente) ───────────────────────
  private async seedAdmin(): Promise<void> {
    const existe = await this.userRepo.findOne({
      where: { nomUsuario: 'admin' },
    });

    if (existe) {
      this.logger.log('✅ Admin ya existe — seed omitido');
      return;
    }

    const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234';
    const hashed = await bcrypt.hash(password, 10);

    const admin = this.userRepo.create({
      nombre: 'Admin Principal',
      rol: RolUsuario.ADMIN,
      nomUsuario: 'admin',
      contrasena: hashed,
      estatus: true,
    });

    await this.userRepo.save(admin);
    this.logger.log(`✅ Admin creado: admin / ${password}`);
  }
}
