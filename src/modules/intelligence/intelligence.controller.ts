import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';
import { QichachaService } from './qichacha.service';
import { AIModelService } from './ai-model.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString } from 'class-validator';

class SearchCompanyDto {
  @IsString()
  companyName: string;
}

@ApiTags('智能抓取')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/intelligence')
export class IntelligenceController {
  private readonly logger = new Logger(IntelligenceController.name);

  constructor(
    private readonly intelligenceService: IntelligenceService,
    private readonly qichachaService: QichachaService,
    private readonly aiModelService: AIModelService,
  ) {}

  /**
   * AI 智能填写 - 统一接口
   * 1. 通过企查查获取企业基础信息
   * 2. 通过大模型获取其他6个模块的信息
   */
  @Post('ai-fill')
  @ApiOperation({ summary: 'AI智能填写 - 整合企查查和大模型' })
  async aiFill(@Body() dto: SearchCompanyDto) {
    try {
      this.logger.log(`开始AI智能填写: ${dto.companyName}`);
      
      // 1. 获取企查查企业基础信息
      const qccData = await this.qichachaService.searchCompany(dto.companyName);
      
      // 2. 通过大模型获取其他模块信息
      const aiData = await this.aiModelService.fillBrandInfo(dto.companyName, qccData);
      
      // 3. 合并数据
      const result = {
        basicInfo: qccData.basicInfo,
        bizPositioning: aiData.bizPositioning,
        productService: aiData.productService,
        competitorMarket: aiData.competitorMarket,
        geoGoals: aiData.geoGoals,
        contact: qccData.contact,
      };
      
      this.logger.log(`AI智能填写完成: ${dto.companyName}`);
      return {
        code: 0,
        data: result,
        message: 'success',
      };
    } catch (error: any) {
      this.logger.error(`ai-fill error: ${error.message}`);
      return {
        code: 50001,
        message: error.message || 'AI填写失败',
        data: null,
      };
    }
  }

  /**
   * 兼容旧接口 - 通过公司名称查询企查查获取企业信息
   */
  @Post('search-company')
  @ApiOperation({ summary: '通过公司名称查询企查查获取企业信息' })
  async searchCompany(@Body() dto: SearchCompanyDto) {
    try {
      // 调用统一的 AI 填写接口
      const result = await this.aiFill(dto);
      return result;
    } catch (error: any) {
      this.logger.error(`searchCompany error: ${error.message}`);
      return {
        code: 50001,
        message: error.message || '查询失败',
        data: null,
      };
    }
  }
}
