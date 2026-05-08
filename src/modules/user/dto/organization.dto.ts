"use strict";
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { OrganizationType, OrganizationTier } from '../entities/organization.entity';

/**
 * 创建组织DTO
 */
export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortName?: string;

  @IsEnum(OrganizationType)
  type: OrganizationType;
}

/**
 * 更新组织DTO
 */
export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(OrganizationTier)
  tier?: OrganizationTier;

  @IsOptional()
  settings?: Record<string, any>;
}
