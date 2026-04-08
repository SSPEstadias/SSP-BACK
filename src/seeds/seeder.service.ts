import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, RolUsuario } from '../shared/users/entities/user.entity';
import { Actividad, ActividadCategoriaEnum } from '../shared/actividades/actividad.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  // OnApplicationBootstrap → NestJS llama a onApplicationBootstrap()
  // automáticamente después de que todos los módulos están listos

  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,
  ) {}

  // ── Este método se ejecuta SOLO al arrancar la app ─────────────────
  async onApplicationBootstrap(): Promise<void> {
    await this.seedAdmin();
    await this.seedActividades();
  }

  // ── Crea el admin si no existe (idempotente) ───────────────────────
  private async seedAdmin(): Promise<void> {
    const existe = await this.userRepo.findOne({
      where: { nomUsuario: 'admin' },
    });

    if (existe) {
      this.logger.log('  Admin ya existe — seed omitido');
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
    this.logger.log(`  Admin creado: admin / ${password}`);
  }

  // ── Crea el catálogo de actividades si está vacío ───────────────────
  private async seedActividades(): Promise<void> {
    const count = await this.actividadRepo.count();
    if (count > 0) {
      this.logger.log('  Catálogo de actividades ya poblado — seed omitido');
      return;
    }

    const actividades = [
      // 1. Trabajo comunitario
      {
        nombre: 'Tequio por la seguridad',
        descripcion: 'Limpieza y rescate de espacios públicos en conjunto con vecinos.',
        objetivo: 'Fomentar la cohesión social y el cuidado del entorno.',
        categoria: ActividadCategoriaEnum.TRABAJO_COMUNITARIO,
      },
      {
        nombre: 'Tequio de reforestación',
        descripcion: 'Plantación de árboles en zonas designadas.',
        objetivo: 'Contribuir al mejoramiento ambiental de la comunidad.',
        categoria: ActividadCategoriaEnum.TRABAJO_COMUNITARIO,
      },
      // 2. Liderazgo comunitario
      {
        nombre: 'Tallerista Comunitario',
        descripcion: 'El beneficiario imparte un taller de oficio a sus vecinos.',
        objetivo: 'Potenciar habilidades de liderazgo y retribución social.',
        categoria: ActividadCategoriaEnum.LIDERAZGO_COMUNITARIO,
      },
      // 3. Atención al consumo
      {
        nombre: 'Sesión AA / NA',
        descripcion: 'Asistencia guiada a grupos de autoayuda.',
        objetivo: 'Atención y sensibilización sobre el consumo de sustancias.',
        categoria: ActividadCategoriaEnum.ATENCION_SUSTANCIAS,
      },
      // 4. Educación para la vida
      {
        nombre: 'Manual Fénix',
        descripcion: 'Taller de reeducación cognitiva y control de impulsos.',
        objetivo: 'Desarrollar herramientas para la resolución pacífica de conflictos.',
        categoria: ActividadCategoriaEnum.EDUCACION_PARA_LA_VIDA,
      },
      // 5. Promoción cultural/deportiva
      {
        nombre: 'Taller de Lectura y Cine Debate',
        descripcion: 'Análisis de textos y proyecciones con enfoque social.',
        objetivo: 'Fomentar el pensamiento crítico.',
        categoria: ActividadCategoriaEnum.PROMOCION_CULTURAL_DEPORTIVA,
      },
      {
        nombre: 'Torneo Deportivo Relámpago',
        descripcion: 'Organización y participación en encuentros deportivos.',
        objetivo: 'Fomentar la sana convivencia y disciplina.',
        categoria: ActividadCategoriaEnum.PROMOCION_CULTURAL_DEPORTIVA,
      },
    ];

    await this.actividadRepo.save(this.actividadRepo.create(actividades));
    this.logger.log(`  Catálogo de actividades creado (${actividades.length} items)`);
  }
}
