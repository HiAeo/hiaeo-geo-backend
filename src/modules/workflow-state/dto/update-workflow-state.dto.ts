import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ModuleState } from '../../brand/entities/brand.entity';

export class UpdateWorkflowStateDto {
  @IsEnum(ModuleState)
  @IsOptional()
  knowledge?: ModuleState;

  @IsEnum(ModuleState)
  @IsOptional()
  diagnosis?: ModuleState;

  @IsEnum(ModuleState)
  @IsOptional()
  strategy?: ModuleState;

  @IsEnum(ModuleState)
  @IsOptional()
  execution?: ModuleState;

  @IsEnum(ModuleState)
  @IsOptional()
  monitor?: ModuleState;
}

export class UpdateModuleStateDto {
  @IsString()
  module: 'knowledge' | 'diagnosis' | 'strategy' | 'execution' | 'monitor';

  @IsEnum(ModuleState)
  state: ModuleState;
}

export class SetLastIdDto {
  @IsString()
  module: 'diagnosis' | 'strategy' | 'execution';

  @IsString()
  lastId: string;
}
