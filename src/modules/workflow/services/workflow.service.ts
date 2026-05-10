"use strict";
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowDefinition } from '../entities/workflow-definition.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../dto';

/**
 * 工作流服务 - 管理工作流定义
 */
@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(WorkflowDefinition)
    private readonly workflowRepo: Repository<WorkflowDefinition>,
  ) {}

  /**
   * 创建工作流
   */
  async create(organizationId: string, dto: CreateWorkflowDto): Promise<WorkflowDefinition> {
    const workflow = this.workflowRepo.create({
      ...dto,
      organizationId,
      isEnabled: dto.isEnabled ?? true,
    });

    await this.workflowRepo.save(workflow);
    this.logger.log(`Created workflow: ${workflow.id}`);
    return workflow;
  }

  /**
   * 更新工作流
   */
  async update(id: string, dto: UpdateWorkflowDto): Promise<WorkflowDefinition> {
    const workflow = await this.workflowRepo.findOne({ where: { id } });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    Object.assign(workflow, dto);
    await this.workflowRepo.save(workflow);
    
    this.logger.log(`Updated workflow: ${id}`);
    return workflow;
  }

  /**
   * 删除工作流
   */
  async delete(id: string): Promise<void> {
    const workflow = await this.workflowRepo.findOne({ where: { id } });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    await this.workflowRepo.remove(workflow);
    this.logger.log(`Deleted workflow: ${id}`);
  }

  /**
   * 获取工作流详情
   */
  async findById(id: string): Promise<WorkflowDefinition> {
    const workflow = await this.workflowRepo.findOne({ where: { id } });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    return workflow;
  }

  /**
   * 获取组织的工作流列表
   */
  async findByOrganization(
    organizationId: string,
    options?: {
      triggerType?: string;
      isEnabled?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ items: WorkflowDefinition[]; total: number }> {
    const where: any = { organizationId };

    if (options?.triggerType) {
      where.triggerType = options.triggerType;
    }
    if (options?.isEnabled !== undefined) {
      where.isEnabled = options.isEnabled;
    }

    const [items, total] = await this.workflowRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });

    return { items, total };
  }

  /**
   * 启用/禁用工作流
   */
  async toggleEnabled(id: string, isEnabled: boolean): Promise<WorkflowDefinition> {
    const workflow = await this.findById(id);
    workflow.isEnabled = isEnabled;
    await this.workflowRepo.save(workflow);
    return workflow;
  }
}
