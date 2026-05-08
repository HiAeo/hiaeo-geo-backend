import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SemanticService } from '../services/semantic.service';

@ApiTags('语义分析')
@Controller('semantic')
export class SemanticController {
  constructor(private readonly semanticService: SemanticService) {}

  @Get()
  @ApiOperation({ summary: '获取语义库' })
  async getLibrary() {
    return this.semanticService.getLibrary();
  }

  @Post('analyze')
  @ApiOperation({ summary: '分析语义' })
  async analyze(@Body() data: any) {
    return this.semanticService.analyze(data);
  }
}
