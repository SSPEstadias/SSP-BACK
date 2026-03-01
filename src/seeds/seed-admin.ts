import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, RolUsuario } from '../modules/users/entities/user.entity';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User],
    synchronize: false, // NO usar sync en seed
  });

  await ds.initialize();

  const repo = ds.getRepository(User);

  const adminUser = await repo.findOne({ where: { nom_usuario: 'admin' } });

  if (adminUser) {
    console.log('✅ Admin ya existe: admin');
    await ds.destroy();
    return;
  }

  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin1234';
  const hashed = await bcrypt.hash(password, 10);

  const user = repo.create({
    nombre: 'Admin Principal',
    rol: RolUsuario.ADMIN,
    nom_usuario: 'admin',
    contrasena: hashed,
    estatus: true,
  });

  await repo.save(user);
  console.log('✅ Admin creado: admin /', password);

  await ds.destroy();
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
