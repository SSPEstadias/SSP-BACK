import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from './shared/shared.module';
import { SeederModule } from './seeds/seeder.module';
import { CivicoModule } from './modules/civico/civico.module';
import { VoluntarioModule } from './modules/voluntarios/voluntario.module';
 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize:     false,
        
        // dropSchema:        false,
        migrationsRun: true,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),


    SharedModule,
    SeederModule,
    CivicoModule,
    VoluntarioModule
    // PenalModule,     ← compañero
  ],
})
export class AppModule {}
