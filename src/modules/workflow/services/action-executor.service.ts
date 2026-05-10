"use strict";
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowDefinition, WorkflowAction } from '../entities/workflow-definition.entity';

/**
 * 动作执行器服务 - 负责执行各种工作流动作
 */
@Injectable()
export class ActionExecutorService {
  private readonly logger = new Logger(ActionExecutorService.name);

  constructor(
    @InjectRepository(WorkflowDefinition)
    private readonly workflowRepo: Repository<WorkflowDefinition>,
  ) {}

  /**
   * 执行单个动作
   */
  async executeAction(
    action: WorkflowAction,
    context: Record<string, any>,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Executing action: ${action.type}`);
      
      switch (action.type) {
        case 'sendNotification':
          return await this.sendNotification(action.params, context);
        case 'rebuildIndex':
          return await this.rebuildIndex(action.params, context);
        case 'triggerDiagnosis':
          return await this.triggerDiagnosis(action.params, context);
        case 'updateKnowledge':
          return await this.updateKnowledge(action.params, context);
        case 'callWebhook':
          return await this.callWebhook(action.params, context);
        default:
          return { success: false, error: `Unknown action type: ${action.type}` };
      }
    } catch (error) {
      this.logger.error(`Action execution failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    } finally {
      this.logger.debug(`Action ${action.type} completed in ${Date.now() - startTime}ms`);
    }
  }

  /**
   * 发送通知
   */
  private async sendNotification(
    params: Record<string, any>,
    context: Record<string, any>,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const { userId, title, content, channels = ['in_app'] } = params;
    
    // 这里应该调用通知服务
    this.logger.log(`Sending notification to user ${userId}: ${title}`);
    
    return {
      success: true,
      result: {
        message: 'Notification sent successfully',
        userId,
        title,
        channels,
      },
    };
  }

  /**
   * 重建向量索引
   */
  private async rebuildIndex(
    params: Record<string, any>,
    context: Record<string, any>,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const knowledgeId = params.knowledgeId || context.knowledgeId;
    
    if (!knowledgeId) {
      return { success: false, error: 'knowledgeId is required for rebuildIndex action' };
    }
    
    this.logger.log(`Rebuilding index for knowledge: ${knowledgeId}`);
    
    // 这里应该调用向量存储服务
    return {
      success: true,
      result: {
        message: 'Index rebuild triggered',
        knowledgeId,
      },
    };
  }

  /**
   * 触发诊断
   */
  private async triggerDiagnosis(
    params: Record<string, any>,
    context: Record<string, any>,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const knowledgeId = params.knowledgeId || context.knowledgeId;
    
    if (!knowledgeId) {
      return { success: false, error: 'knowledgeId is required for triggerDiagnosis action' };
    }
    
    this.logger.log(`Triggering diagnosis for knowledge: ${knowledgeId}`);
    
    // 这里应该调用诊断服务
    return {
      success: true,
      result: {
        message: 'Diagnosis triggered',
        knowledgeId,
      },
    };
  }

  /**
   * 更新知识库字段
   */
  private async updateKnowledge(
    params: Record<string, any>,
    context: Record<string, any>,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const knowledgeId = params.knowledgeId || context.knowledgeId;
    const updates = params.updates || {};
    
    if (!knowledgeId) {
      return { success: false, error: 'knowledgeId is required for updateKnowledge action' };
    }
    
    this.logger.log(`Updating knowledge ${knowledgeId}:`, updates);
    
    // 这里应该调用知识库服务
    return {
      success: true,
      result: {
        message: 'Knowledge updated',
        knowledgeId,
        updates,
      },
    };
  }

  /**
   * 调用外部Webhook
   */
  private async callWebhook(
    params: Record<string, any>,
    context: Record<string, any>,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const { url, method = 'POST', headers = {}, bodyTemplate } = params;
    
    if (!url) {
      return { success: false, error: 'url is required for callWebhook action' };
    }
    
    this.logger.log(`Calling webhook: ${url}`);
    
    try {
      const body = bodyTemplate ? this.interpolateTemplate(bodyTemplate, context) : context;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `Webhook failed with status ${response.status}: ${responseText}`,
        };
      }
      
      return {
        success: true,
        result: {
          message: 'Webhook called successfully',
          url,
          statusCode: response.status,
          response: responseText,
        },
      };
    } catch (error) {
      return { success: false, error: `Webhook error: ${error.message}` };
    }
  }

  /**
   * 模板插值
   */
  private interpolateTemplate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], context);
      return value !== undefined ? String(value) : match;
    });
  }
}
