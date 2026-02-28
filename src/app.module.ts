import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from './shared/shared.module';
import { PersonasModule } from './voluntarios/personas/personas.module';

@Module({
  imports: [
    // cargamos las variables de entorno globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    //  aqui hacemos la conexion a PostgreSQL usando las variables del .env
 TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: parseInt(config.get<string>('DB_PORT') || '5432'),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD') || '123123',
    database: config.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: true,
  }),
}),

    SharedModule,

    PersonasModule,
    
  ],
})
export class AppModule {}