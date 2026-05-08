import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '套餐ID' })
  @IsString()
  packageId: string;

  @ApiProperty({ description: '套餐名称' })
  @IsString()
  packageName: string;

  @ApiProperty({ description: '订单金额' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: '原价' })
  @IsOptional()
  @IsNumber()
  originalAmount?: number;

  @ApiPropertyOptional({ description: '折扣' })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
