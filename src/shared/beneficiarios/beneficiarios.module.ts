import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiario } from './beneficiario.entity';
import { BeneficiariosService } from './beneficiarios.service';
import { BeneficiariosController } from './beneficiarios.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Beneficiario]),
    // Le dice a TypeORM que esta entidad pertenece a este módulo
  ],
  controllers: [BeneficiariosController],
  providers: [BeneficiariosService],
  exports: [BeneficiariosService, TypeOrmModule],
  // exports: permite que otros módulos (Cívico, Penal) usen este servicio
})
export class BeneficiariosModule {}