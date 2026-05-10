import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AiService } from '../services/ai.service';
import { DiagnoseBrandDto } from '../dto/diagnose-brand.dto';
import { GenerateContentDto } from '../dto/generate-content.dto';
import { ChatDto } from '../dto/chat.dto';

@ApiTags('AI引擎')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('engines')
  @ApiOperation({ summary: '获取AI引擎列表' })
  @ApiResponse({ status: 200, description: '返回可用AI引擎列表' })
  async getEngineList() {
    return this.aiService.getEngineList();
  }

  @Get('engines/health')
  @ApiOperation({ summary: '获取引擎健康状态' })
  @ApiResponse({ status: 200, description: '返回所有引擎的健康状态' })
  async getEngineHealthStatus() {
    return this.aiService.getEngineHealthStatus();
  }

  @Get('engines/recommend')
  @ApiOperation({ summary: '推荐最佳引擎' })
  @ApiQuery({ name: 'taskType', required: true, description: '任务类型: diagnosis, content, chat' })
  @ApiResponse({ status: 200, description: '返回推荐的引擎名称' })
  async recommendEngine(@Query('taskType') taskType: 'diagnosis' | 'content' | 'chat') {
    return this.aiService.recommendEngine(taskType);
  }

  @Post('diagnose')
  @ApiOperation({ summary: '品牌GEO诊断' })
  @ApiQuery({ name: 'engine', required: false, description: '指定引擎类型' })
  @ApiResponse({ status: 200, description: '返回诊断结果' })
  async diagnose(
    @Body() dto: DiagnoseBrandDto,
    @Query('engine') engine?: string
  ) {
    return this.aiService.diagnose(dto, engine);
  }

  @Post('diagnose/batch')
  @ApiOperation({ summary: '多引擎批量诊断' })
  @ApiResponse({ status: 200, description: '返回多引擎诊断结果' })
  async diagnoseBatch(@Body() dto: DiagnoseBrandDto) {
    return this.aiService.diagnoseWithAllEngines(dto);
  }

  @Post('content/generate')
  @ApiOperation({ summary: '生成SEO内容' })
  @ApiQuery({ name: 'engine', required: false, description: '指定引擎类型' })
  @ApiResponse({ status: 200, description: '返回生成的内容' })
  async generateContent(
    @Body() dto: GenerateContentDto,
    @Query('engine') engine?: string
  ) {
    return this.aiService.generateContent(dto, engine);
  }

  @Post('chat')
  @ApiOperation({ summary: 'AI聊天对话' })
  @ApiQuery({ name: 'engine', required: false, description: '指定引擎类型' })
  @ApiResponse({ status: 200, description: '返回AI回复' })
  async chat(
    @Body() dto: ChatDto,
    @Query('engine') engine?: string
  ) {
    return this.aiService.chat(dto, engine);
  }
}
