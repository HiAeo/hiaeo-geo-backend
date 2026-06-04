import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand, BrandWorkflowState, ModuleState } from '../brand/entities/brand.entity';
import { UpdateWorkflowStateDto, UpdateModuleStateDto, SetLastIdDto } from './dto/update-workflow-state.dto';

/**
 * 品牌 GEO 工作流状态服务
 * 负责管理品牌的智库→诊断→策略→执行→监控 工作流状态
 */
@Injectable()
export class WorkflowStateService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  /**
   * 初始化品牌的 workflow_state
   */
  async initializeWorkflowState(brandId: string): Promise<BrandWorkflowState> {
    const defaultState: BrandWorkflowState = {
      knowledge: ModuleState.DRAFT,
      diagnosis: ModuleState.DRAFT,
      strategy: ModuleState.DRAFT,
      execution: ModuleState.DRAFT,
      monitor: ModuleState.DRAFT,
      updatedAt: new Date().toISOString(),
    };

    await this.brandRepository.update(brandId, {
      workflowState: defaultState,
    });

    return defaultState;
  }

  /**
   * 获取品牌的 workflow_state
   */
  async getWorkflowState(brandId: string): Promise<BrandWorkflowState | null> {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
      select: ['workflowState'],
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }

    return brand.workflowState || this.getDefaultState();
  }

  /**
   * 批量更新 workflow_state
   */
  async updateWorkflowState(brandId: string, dto: UpdateWorkflowStateDto): Promise<BrandWorkflowState> {
    const currentState = await this.getWorkflowState(brandId);
    const defaultState = this.getDefaultState();

    const updatedState: BrandWorkflowState = {
      ...defaultState,
      ...currentState,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    await this.brandRepository.update(brandId, {
      workflowState: updatedState,
    });

    return updatedState;
  }

  /**
   * 更新单个模块状态
   */
  async updateModuleState(brandId: string, dto: UpdateModuleStateDto): Promise<BrandWorkflowState> {
    const currentState = await this.getWorkflowState(brandId);
    const defaultState = this.getDefaultState();

    const updatedState: BrandWorkflowState = {
      ...defaultState,
      ...currentState,
      [dto.module]: dto.state,
      updatedAt: new Date().toISOString(),
    };

    await this.brandRepository.update(brandId, {
      workflowState: updatedState,
    });

    // 根据状态变更自动触发后续流程
    await this.handleStateTransition(brandId, dto.module, dto.state, updatedState);

    return updatedState;
  }

  /**
   * 设置最近执行的 ID
   */
  async setLastId(brandId: string, dto: SetLastIdDto): Promise<BrandWorkflowState> {
    const currentState = await this.getWorkflowState(brandId);
    const defaultState = this.getDefaultState();

    const key = `last${dto.module.charAt(0).toUpperCase() + dto.module.slice(1)}Id` as keyof BrandWorkflowState;

    const updatedState: BrandWorkflowState = {
      ...defaultState,
      ...currentState,
      [key]: dto.lastId,
      updatedAt: new Date().toISOString(),
    };

    await this.brandRepository.update(brandId, {
      workflowState: updatedState,
    });

    return updatedState;
  }

  /**
   * 获取模块状态（快捷方法）
   */
  async getModuleState(brandId: string, module: string): Promise<ModuleState> {
    const state = await this.getWorkflowState(brandId);
    return (state as any)[module] || ModuleState.DRAFT;
  }

  /**
   * 检查模块是否可以执行
   * 知识库完成后才能开始诊断
   * 诊断完成后才能生成策略
   * 策略完成后才能执行
   */
  async canModuleExecute(brandId: string, module: string): Promise<boolean> {
    const state = await this.getWorkflowState(brandId);
    if (!state) return false;

    switch (module) {
      case 'diagnosis':
        return state.knowledge === ModuleState.COMPLETED;
      case 'strategy':
        return state.diagnosis === ModuleState.COMPLETED;
      case 'execution':
        return state.strategy === ModuleState.COMPLETED;
      case 'monitor':
        return state.execution === ModuleState.COMPLETED;
      case 'knowledge':
        return true; // 知识库随时可编辑
      default:
        return false;
    }
  }

  /**
   * 处理状态变更后的自动流程
   */
  private async handleStateTransition(
    brandId: string,
    module: string,
    newState: ModuleState,
    fullState: BrandWorkflowState,
  ): Promise<void> {
    // 诊断完成后，可以生成策略
    if (module === 'diagnosis' && newState === ModuleState.COMPLETED) {
      if (fullState.strategy === ModuleState.DRAFT) {
        await this.updateModuleState(brandId, {
          module: 'strategy',
          state: ModuleState.READY,
        });
      }
    }

    // 策略完成后，可以执行
    if (module === 'strategy' && newState === ModuleState.COMPLETED) {
      if (fullState.execution === ModuleState.DRAFT) {
        await this.updateModuleState(brandId, {
          module: 'execution',
          state: ModuleState.READY,
        });
      }
    }

    // 执行完成后，可以监控
    if (module === 'execution' && newState === ModuleState.COMPLETED) {
      if (fullState.monitor === ModuleState.DRAFT) {
        await this.updateModuleState(brandId, {
          module: 'monitor',
          state: ModuleState.READY,
        });
      }
    }
  }

  /**
   * 重置工作流状态（从头开始）
   */
  async resetWorkflowState(brandId: string, fromModule?: string): Promise<BrandWorkflowState> {
    const modules = ['knowledge', 'diagnosis', 'strategy', 'execution', 'monitor'] as const;

    const fromIndex = fromModule ? modules.indexOf(fromModule as typeof modules[number]) : 0;

    const newState: BrandWorkflowState = {
      knowledge: fromIndex <= 0 ? ModuleState.DRAFT : ModuleState.COMPLETED,
      diagnosis: fromIndex <= 1 ? ModuleState.DRAFT : ModuleState.COMPLETED,
      strategy: fromIndex <= 2 ? ModuleState.DRAFT : ModuleState.COMPLETED,
      execution: fromIndex <= 3 ? ModuleState.DRAFT : ModuleState.COMPLETED,
      monitor: fromIndex <= 4 ? ModuleState.DRAFT : ModuleState.COMPLETED,
      updatedAt: new Date().toISOString(),
    };

    await this.brandRepository.update(brandId, {
      workflowState: newState,
    });

    return newState;
  }

  /**
   * 获取工作流进度摘要
   */
  async getWorkflowSummary(brandId: string): Promise<{
    overall: number;
    nextAction: string;
    nextModule: string | null;
    canProceed: boolean;
  }> {
    const state = await this.getWorkflowState(brandId);

    const moduleOrder = ['knowledge', 'diagnosis', 'strategy', 'execution', 'monitor'];
    const actionLabels = {
      knowledge: '完善品牌智库信息',
      diagnosis: '开始 AI 诊断',
      strategy: '生成 GEO 策略',
      execution: '执行优化',
      monitor: '查看监控数据',
    };

    let overall = 0;
    let nextModule: string | null = null;

    for (const module of moduleOrder) {
      const moduleState = (state as any)[module];
      if (moduleState === ModuleState.COMPLETED) {
        overall += 20;
      } else if (moduleState === ModuleState.PROCESSING) {
        overall += 10;
        if (!nextModule) nextModule = module;
      } else if (!nextModule) {
        nextModule = module;
      }
    }

    return {
      overall,
      nextAction: nextModule ? actionLabels[nextModule as keyof typeof actionLabels] : '全部完成',
      nextModule,
      canProceed: nextModule !== null,
    };
  }

  private getDefaultState(): BrandWorkflowState {
    return {
      knowledge: ModuleState.DRAFT,
      diagnosis: ModuleState.DRAFT,
      strategy: ModuleState.DRAFT,
      execution: ModuleState.DRAFT,
      monitor: ModuleState.DRAFT,
    };
  }
}
