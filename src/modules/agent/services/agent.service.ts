import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowOrchestratorService } from './workflow-orchestrator.service';
import { WorkflowStateService } from '../../workflow-state/workflow-state.service';
import { ModuleState, Brand } from '../../brand/entities/brand.entity';
import {
  AgentExecutionResult,
  AgentSession,
  AgentMessage,
  AgentHealthStatus,
  WorkflowStage,
  WorkflowState,
} from '../interfaces/agent.interface';

/**
 * Agent 服务 - 品牌 GEO AI Agent 核心
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  
  // 内存会话存储（生产环境应使用 Redis）
  private sessions: Map<string, AgentSession> = new Map();

  constructor(
    private workflowOrchestrator: WorkflowOrchestratorService,
    private workflowStateService: WorkflowStateService,
  ) {}

  /**
   * 创建新的 Agent 会话
   */
  async createSession(brandId: string): Promise<AgentSession> {
    const sessionId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: AgentSession = {
      id: sessionId,
      brandId,
      messages: [
        {
          role: 'system',
          content: `你是品牌 GEO AI Agent，专注于帮助品牌提升地理位置搜索排名。
你的职责包括：
1. 诊断品牌当前的 GEO 状态
2. 制定提升策略
3. 生成并执行内容计划
4. 监控效果并持续优化

请以专业、友好的方式与用户交流。`,
          timestamp: new Date().toISOString(),
        },
      ],
      workflowState: {
        stage: WorkflowStage.IDLE,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`创建 Agent 会话: ${sessionId}, 品牌: ${brandId}`);

    return session;
  }

  /**
   * 获取会话
   */
  async getSession(sessionId: string): Promise<AgentSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * 发送消息并获取回复
   */
  async chat(sessionId: string, userMessage: string): Promise<{
    reply: string;
    session: AgentSession;
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    // 添加用户消息
    const userMsg: AgentMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(userMsg);

    // 生成回复（基于当前工作流状态）
    const reply = await this.generateReply(session, userMessage);
    
    // 添加助手回复
    const assistantMsg: AgentMessage = {
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
      metadata: {
        workflowStage: session.workflowState.stage,
      },
    };
    session.messages.push(assistantMsg);

    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);

    return { reply, session };
  }

  /**
   * 生成回复
   */
  private async generateReply(session: AgentSession, userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();
    const state = session.workflowState;

    // 根据用户意图生成回复
    if (lowerMessage.includes('诊断') || lowerMessage.includes('分析')) {
      return this.getDiagnosisPrompt(state);
    }
    
    if (lowerMessage.includes('策略') || lowerMessage.includes('方案')) {
      return this.getStrategyPrompt(state);
    }
    
    if (lowerMessage.includes('执行') || lowerMessage.includes('发布') || lowerMessage.includes('内容')) {
      return this.getExecutionPrompt(state);
    }
    
    if (lowerMessage.includes('状态') || lowerMessage.includes('进度')) {
      return this.getStatusReply(state);
    }
    
    if (lowerMessage.includes('一键') || lowerMessage.includes('串联') || lowerMessage.includes('开始')) {
      return '好的！我将启动一键串联流程，从诊断开始，依次执行策略和内容生成。请稍候...';
    }

    // 默认回复
    return this.getDefaultReply(state);
  }

  /**
   * 获取诊断提示
   */
  private getDiagnosisPrompt(state: WorkflowState): string {
    if (state.stage !== WorkflowStage.IDLE && state.diagnosis?.status === 'completed') {
      return `诊断已完成！
      
报告 ID: ${state.diagnosis.reportId}
下一步建议：输入"制定策略"我将基于诊断结果生成优化策略。`;
    }
    return '请输入"开始诊断"，我将分析品牌的 GEO 状态，包括搜索引擎收录、关键词排名、竞争对手分析等。';
  }

  /**
   * 获取策略提示
   */
  private getStrategyPrompt(state: WorkflowState): string {
    if (state.strategy?.status === 'completed') {
      return `策略已生成！
      
策略 ID: ${state.strategy.strategyId}
下一步建议：输入"执行策略"开始生成内容。`;
    }
    if (!state.diagnosis?.reportId) {
      return '请先完成诊断，我需要基于诊断报告来制定策略。';
    }
    return '请输入"生成策略"，我将基于诊断结果制定详细的 GEO 优化策略。';
  }

  /**
   * 获取执行提示
   */
  private getExecutionPrompt(state: WorkflowState): string {
    if (state.execution?.status === 'completed') {
      return `执行已完成！
      
已生成 ${state.execution.contentIds.length} 条内容。
您可以查看内容管理页面，或输入"监控效果"查看数据。`;
    }
    if (!state.strategy?.strategyId) {
      return '请先生成策略方案。';
    }
    return '请输入"执行策略"，我将基于策略方案生成内容并准备发布。';
  }

  /**
   * 获取状态回复
   */
  private getStatusReply(state: WorkflowState): string {
    const stageNames: Record<WorkflowStage, string> = {
      [WorkflowStage.IDLE]: '空闲',
      [WorkflowStage.DIAGNOSIS]: '诊断中',
      [WorkflowStage.STRATEGY]: '策略生成中',
      [WorkflowStage.EXECUTION]: '执行中',
      [WorkflowStage.MONITORING]: '监控中',
      [WorkflowStage.COMPLETED]: '已完成',
    };

    let status = `当前阶段: ${stageNames[state.stage]}`;
    
    if (state.diagnosis) {
      status += `\n诊断: ${state.diagnosis.status}`;
      if (state.diagnosis.progress) status += ` (${state.diagnosis.progress}%)`;
    }
    
    if (state.strategy) {
      status += `\n策略: ${state.strategy.status}`;
      if (state.strategy.progress) status += ` (${state.strategy.progress}%)`;
    }
    
    if (state.execution) {
      status += `\n执行: ${state.execution.status}`;
      if (state.execution.contentIds.length) status += ` (${state.execution.contentIds.length}条内容)`;
    }

    return status;
  }

  /**
   * 获取默认回复
   */
  private getDefaultReply(state: WorkflowState): string {
    const stageNames: Record<WorkflowStage, string> = {
      [WorkflowStage.IDLE]: '空闲',
      [WorkflowStage.DIAGNOSIS]: '诊断中',
      [WorkflowStage.STRATEGY]: '策略生成中',
      [WorkflowStage.EXECUTION]: '执行中',
      [WorkflowStage.MONITORING]: '监控中',
      [WorkflowStage.COMPLETED]: '已完成',
    };

    return `您好！我是品牌 GEO AI Agent。

当前工作流状态: ${stageNames[state.stage]}

我可以帮您：
• 输入"开始诊断" - 分析品牌 GEO 状态
• 输入"生成策略" - 制定优化方案
• 输入"执行策略" - 生成内容并发布
• 输入"一键串联" - 自动完成全流程
• 输入"查看状态" - 了解当前进度

请问有什么可以帮助您的？`;
  }

  /**
   * 执行一键串联
   */
  async executeChain(brandId: string, sessionId?: string): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const workflowId = `workflow_${Date.now()}`;

    let session = sessionId ? await this.getSession(sessionId) : null;
    if (!session) {
      session = await this.createSession(brandId);
    }

    // 更新状态为诊断阶段
    session.workflowState = {
      ...session.workflowState,
      stage: WorkflowStage.DIAGNOSIS,
      diagnosis: {
        progress: 0,
        status: 'running',
      },
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(session.id, session);

    const result: AgentExecutionResult = {
      success: true,
      workflowId,
      brandId,
      stages: {},
      totalDuration: 0,
    };

    try {
      // 阶段1: 诊断
      this.logger.log(`[${workflowId}] 开始诊断阶段`);
      
      // 更新工作流状态为处理中
      await this.workflowStateService.updateModuleState(brandId, {
        module: 'diagnosis',
        state: ModuleState.PROCESSING,
      });
      
      const diagnosisResult = await this.workflowOrchestrator.executeDiagnosis(brandId);
      
      if (diagnosisResult.success && diagnosisResult.reportId) {
        // 更新工作流状态为完成
        await this.workflowStateService.updateModuleState(brandId, {
          module: 'diagnosis',
          state: ModuleState.COMPLETED,
        });
        await this.workflowStateService.setLastId(brandId, {
          module: 'diagnosis',
          lastId: diagnosisResult.reportId,
        });
        
        session.workflowState.diagnosis = {
          taskId: diagnosisResult.taskId,
          reportId: diagnosisResult.reportId,
          progress: 100,
          status: 'completed',
        };

        // 更新会话消息
        session.messages.push({
          role: 'assistant',
          content: `✅ 诊断完成！报告已生成。开始进入策略阶段...`,
          timestamp: new Date().toISOString(),
        });

        result.stages.diagnosis = {
          success: true,
          taskId: diagnosisResult.taskId,
          reportId: diagnosisResult.reportId,
        };

        // 阶段2: 策略
        session.workflowState.stage = WorkflowStage.STRATEGY;
        session.workflowState.strategy = {
          progress: 0,
          status: 'running',
        };
        this.sessions.set(session.id, session);

        // 更新工作流状态
        await this.workflowStateService.updateModuleState(brandId, {
          module: 'strategy',
          state: ModuleState.PROCESSING,
        });

        this.logger.log(`[${workflowId}] 开始策略阶段`);
        const strategyResult = await this.workflowOrchestrator.executeStrategy(
          brandId,
          diagnosisResult.reportId
        );

        if (strategyResult.success && strategyResult.strategyId) {
          // 更新工作流状态
          await this.workflowStateService.updateModuleState(brandId, {
            module: 'strategy',
            state: ModuleState.COMPLETED,
          });
          await this.workflowStateService.setLastId(brandId, {
            module: 'strategy',
            lastId: strategyResult.strategyId,
          });
          
          session.workflowState.strategy = {
            strategyId: strategyResult.strategyId,
            progress: 100,
            status: 'completed',
          };

          session.messages.push({
            role: 'assistant',
            content: `✅ 策略生成完成！开始执行内容生成...`,
            timestamp: new Date().toISOString(),
          });

          result.stages.strategy = {
            success: true,
            strategyId: strategyResult.strategyId,
          };

          // 阶段3: 执行
          session.workflowState.stage = WorkflowStage.EXECUTION;
          session.workflowState.execution = {
            contentIds: [],
            progress: 0,
            status: 'running',
          };
          this.sessions.set(session.id, session);

          // 更新工作流状态
          await this.workflowStateService.updateModuleState(brandId, {
            module: 'execution',
            state: ModuleState.PROCESSING,
          });

          this.logger.log(`[${workflowId}] 开始执行阶段`);
          const executionResult = await this.workflowOrchestrator.executeContent(
            brandId,
            strategyResult.strategyId
          );

          // 更新工作流状态
          await this.workflowStateService.updateModuleState(brandId, {
            module: 'execution',
            state: executionResult.success ? ModuleState.COMPLETED : ModuleState.ERROR,
          });
          if (executionResult.contentIds && executionResult.contentIds.length > 0) {
            await this.workflowStateService.setLastId(brandId, {
              module: 'execution',
              lastId: executionResult.contentIds[0],
            });
          }

          session.workflowState.execution = {
            contentIds: executionResult.contentIds || [],
            progress: 100,
            status: executionResult.success ? 'completed' : 'failed',
          };
          session.workflowState.stage = WorkflowStage.COMPLETED;
          session.workflowState.updatedAt = new Date().toISOString();

          result.stages.execution = {
            success: executionResult.success,
            contentIds: executionResult.contentIds || [],
            error: executionResult.error,
          };

          session.messages.push({
            role: 'assistant',
            content: `✅ 一键串联完成！已生成 ${executionResult.contentIds?.length || 0} 条内容。`,
            timestamp: new Date().toISOString(),
          });
        } else {
          result.stages.strategy = {
            success: false,
            error: strategyResult.error,
          };
          result.success = false;
          result.error = strategyResult.error;
        }
      } else {
        result.stages.diagnosis = {
          success: false,
          error: diagnosisResult.error,
        };
        result.success = false;
        result.error = diagnosisResult.error;
      }
    } catch (error) {
      this.logger.error(`[${workflowId}] 执行失败`, error);
      result.success = false;
      result.error = error.message;
    }

    result.totalDuration = Date.now() - startTime;
    this.sessions.set(session.id, session);

    return result;
  }

  /**
   * 获取 Agent 健康状态
   */
  async getHealthStatus(): Promise<AgentHealthStatus> {
    return {
      healthy: true,
      services: {
        diagnosis: true,
        strategy: true,
        execution: true,
        vectorDb: true, // Pinecone 集成后更新
      },
      activeWorkflows: this.sessions.size,
      uptime: process.uptime(),
    };
  }

  /**
   * 获取品牌的所有会话
   */
  async getSessionsByBrand(brandId: string): Promise<AgentSession[]> {
    return Array.from(this.sessions.values()).filter(s => s.brandId === brandId);
  }

  /**
   * 删除会话
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }
}
