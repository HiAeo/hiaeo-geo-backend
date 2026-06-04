import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentService } from '../services/agent.service';
import {
  AgentExecutionResult,
  AgentSession,
  AgentHealthStatus,
} from '../interfaces/agent.interface';

@ApiTags('Agent')
@ApiBearerAuth()
@Controller('v1/agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * 创建新的 Agent 会话
   */
  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建 Agent 会话' })
  @ApiResponse({ status: 201, description: '会话创建成功' })
  async createSession(@Body() body: { brandId: string }): Promise<AgentSession> {
    return this.agentService.createSession(body.brandId);
  }

  /**
   * 获取会话详情
   */
  @Get('sessions/:sessionId')
  @ApiOperation({ summary: '获取会话详情' })
  async getSession(@Param('sessionId') sessionId: string): Promise<AgentSession | null> {
    return this.agentService.getSession(sessionId);
  }

  /**
   * 发送消息
   */
  @Post('sessions/:sessionId/chat')
  @ApiOperation({ summary: '发送消息并获取回复' })
  async chat(
    @Param('sessionId') sessionId: string,
    @Body() body: { message: string },
  ): Promise<{ reply: string; session: AgentSession }> {
    return this.agentService.chat(sessionId, body.message);
  }

  /**
   * 执行一键串联
   */
  @Post('chain')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '执行一键串联（诊断→策略→执行）' })
  async executeChain(@Body() body: { brandId: string; sessionId?: string }): Promise<AgentExecutionResult> {
    return this.agentService.executeChain(body.brandId, body.sessionId);
  }

  /**
   * 获取品牌的所有会话
   */
  @Get('sessions/brand/:brandId')
  @ApiOperation({ summary: '获取品牌的所有会话' })
  async getSessionsByBrand(@Param('brandId') brandId: string): Promise<AgentSession[]> {
    return this.agentService.getSessionsByBrand(brandId);
  }

  /**
   * 删除会话
   */
  @Post('sessions/:sessionId/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除会话' })
  async deleteSession(@Param('sessionId') sessionId: string): Promise<{ success: boolean }> {
    const result = await this.agentService.deleteSession(sessionId);
    return { success: result };
  }

  /**
   * 获取 Agent 健康状态
   */
  @Get('health')
  @ApiOperation({ summary: '获取 Agent 健康状态' })
  async getHealth(): Promise<AgentHealthStatus> {
    return this.agentService.getHealthStatus();
  }
}
