import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HistoryMessageDto {
  @ApiProperty({ description: '角色', enum: ['user', 'assistant'] })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty({ description: '消息内容' })
  @IsString()
  content: string;
}

export class XiaoZhiChatDto {
  @ApiProperty({ description: '用户消息' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: '历史消息', type: [HistoryMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryMessageDto)
  history?: HistoryMessageDto[];
}
