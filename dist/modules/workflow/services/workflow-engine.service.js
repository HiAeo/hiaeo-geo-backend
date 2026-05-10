"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorkflowEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workflow_definition_entity_1 = require("../entities/workflow-definition.entity");
const workflow_execution_entity_1 = require("../entities/workflow-execution.entity");
const action_executor_service_1 = require("./action-executor.service");
let WorkflowEngine = WorkflowEngine_1 = class WorkflowEngine {
    constructor(workflowRepo, executionRepo, actionExecutor) {
        this.workflowRepo = workflowRepo;
        this.executionRepo = executionRepo;
        this.actionExecutor = actionExecutor;
        this.logger = new common_1.Logger(WorkflowEngine_1.name);
    }
    evaluateConditions(workflow, context) {
        const conditions = workflow.conditions || [];
        if (conditions.length === 0) {
            return true;
        }
        return conditions.every((condition) => {
            const value = this.getContextValue(context, condition.field);
            return this.evaluateCondition(value, condition.operator, condition.value);
        });
    }
    getContextValue(context, field) {
        return context[field];
    }
    evaluateCondition(value, operator, expected) {
        switch (operator) {
            case 'eq':
                return value === expected;
            case 'ne':
                return value !== expected;
            case 'gt':
                return value > expected;
            case 'gte':
                return value >= expected;
            case 'lt':
                return value < expected;
            case 'lte':
                return value <= expected;
            case 'contains':
                return String(value).includes(String(expected));
            case 'in':
                return Array.isArray(expected) && expected.includes(value);
            case 'notIn':
                return Array.isArray(expected) && !expected.includes(value);
            default:
                this.logger.warn(`Unknown operator: ${operator}`);
                return false;
        }
    }
    async execute(workflowId, context) {
        const startTime = Date.now();
        const workflow = await this.workflowRepo.findOne({
            where: { id: workflowId },
        });
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        if (!workflow.isEnabled) {
            throw new Error(`Workflow is disabled: ${workflowId}`);
        }
        const execution = this.executionRepo.create({
            organizationId: context.organizationId,
            workflowId,
            status: workflow_execution_entity_1.WorkflowExecutionStatus.PENDING,
            triggerType: workflow.triggerType,
            triggeredBy: context.triggeredBy || 'system',
            context,
            startedAt: new Date(),
        });
        await this.executionRepo.save(execution);
        execution.status = workflow_execution_entity_1.WorkflowExecutionStatus.RUNNING;
        await this.executionRepo.save(execution);
        const actionResults = [];
        let hasError = false;
        let lastError;
        try {
            for (let i = 0; i < workflow.actions.length; i++) {
                const action = workflow.actions[i];
                const actionStartTime = Date.now();
                const result = await this.actionExecutor.executeAction(action, context);
                const actionResult = {
                    actionIndex: i,
                    actionType: action.type,
                    success: result.success,
                    result: result.result,
                    error: result.error,
                    duration: Date.now() - actionStartTime,
                };
                actionResults.push(actionResult);
                if (!result.success) {
                    hasError = true;
                    lastError = result.error;
                    if (!action.continueOnError) {
                        break;
                    }
                }
            }
            workflow.executionCount += 1;
            workflow.lastExecutedAt = new Date();
            await this.workflowRepo.save(workflow);
            execution.status = hasError ? workflow_execution_entity_1.WorkflowExecutionStatus.FAILED : workflow_execution_entity_1.WorkflowExecutionStatus.SUCCESS;
            execution.result = { completedActions: actionResults.length };
            execution.error = lastError || null;
            execution.actionResults = actionResults;
            execution.completedAt = new Date();
            execution.duration = Date.now() - startTime;
            await this.executionRepo.save(execution);
            return {
                success: !hasError,
                executionId: execution.id,
                actionResults,
                error: lastError,
                duration: execution.duration,
            };
        }
        catch (error) {
            this.logger.error(`Workflow execution failed: ${error.message}`, error.stack);
            execution.status = workflow_execution_entity_1.WorkflowExecutionStatus.FAILED;
            execution.error = error.message;
            execution.completedAt = new Date();
            execution.duration = Date.now() - startTime;
            await this.executionRepo.save(execution);
            return {
                success: false,
                executionId: execution.id,
                actionResults,
                error: error.message,
                duration: Date.now() - startTime,
            };
        }
    }
    async handleTrigger(triggerType, context) {
        this.logger.log(`Handling trigger: ${triggerType}`);
        const workflows = await this.workflowRepo.find({
            where: {
                triggerType,
                isEnabled: true,
                organizationId: context.organizationId,
            },
        });
        this.logger.log(`Found ${workflows.length} workflows for trigger ${triggerType}`);
        for (const workflow of workflows) {
            try {
                if (this.evaluateConditions(workflow, context)) {
                    this.logger.log(`Executing workflow ${workflow.id}: ${workflow.name}`);
                    await this.execute(workflow.id, context);
                }
                else {
                    this.logger.log(`Workflow ${workflow.id} conditions not met, skipping`);
                }
            }
            catch (error) {
                this.logger.error(`Failed to execute workflow ${workflow.id}: ${error.message}`);
            }
        }
    }
    async chainExecute(workflowId, context, chainWorkflowId) {
        const result = await this.execute(workflowId, context);
        if (result.success && chainWorkflowId) {
            const chainContext = {
                ...context,
                previousExecutionId: result.executionId,
                previousResult: result,
            };
            return await this.execute(chainWorkflowId, chainContext);
        }
        return result;
    }
    async getExecutionHistory(organizationId, options) {
        const where = { organizationId };
        if (options?.workflowId) {
            where.workflowId = options.workflowId;
        }
        if (options?.status) {
            where.status = options.status;
        }
        const [items, total] = await this.executionRepo.findAndCount({
            where,
            order: { startedAt: 'DESC' },
            take: options?.limit || 20,
            skip: options?.offset || 0,
        });
        return { items, total };
    }
};
exports.WorkflowEngine = WorkflowEngine;
exports.WorkflowEngine = WorkflowEngine = WorkflowEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workflow_definition_entity_1.WorkflowDefinition)),
    __param(1, (0, typeorm_1.InjectRepository)(workflow_execution_entity_1.WorkflowExecution)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        action_executor_service_1.ActionExecutorService])
], WorkflowEngine);
//# sourceMappingURL=workflow-engine.service.js.map