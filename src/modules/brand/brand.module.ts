import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandController } from './controllers/brand.controller';
import { BrandService } from './services/brand.service';
import { Brand } from './entities/brand.entity';
import { Organization } from '../user/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Organization])],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
