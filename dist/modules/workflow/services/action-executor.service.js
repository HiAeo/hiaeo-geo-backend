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
var ActionExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionExecutorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workflow_definition_entity_1 = require("../entities/workflow-definition.entity");
let ActionExecutorService = ActionExecutorService_1 = class ActionExecutorService {
    constructor(workflowRepo) {
        this.workflowRepo = workflowRepo;
        this.logger = new common_1.Logger(ActionExecutorService_1.name);
    }
    async executeAction(action, context) {
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
        }
        catch (error) {
            this.logger.error(`Action execution failed: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
        finally {
            this.logger.debug(`Action ${action.type} completed in ${Date.now() - startTime}ms`);
        }
    }
    async sendNotification(params, context) {
        const { userId, title, content, channels = ['in_app'] } = params;
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
    async rebuildIndex(params, context) {
        const knowledgeId = params.knowledgeId || context.knowledgeId;
        if (!knowledgeId) {
            return { success: false, error: 'knowledgeId is required for rebuildIndex action' };
        }
        this.logger.log(`Rebuilding index for knowledge: ${knowledgeId}`);
        return {
            success: true,
            result: {
                message: 'Index rebuild triggered',
                knowledgeId,
            },
        };
    }
    async triggerDiagnosis(params, context) {
        const knowledgeId = params.knowledgeId || context.knowledgeId;
        if (!knowledgeId) {
            return { success: false, error: 'knowledgeId is required for triggerDiagnosis action' };
        }
        this.logger.log(`Triggering diagnosis for knowledge: ${knowledgeId}`);
        return {
            success: true,
            result: {
                message: 'Diagnosis triggered',
                knowledgeId,
            },
        };
    }
    async updateKnowledge(params, context) {
        const knowledgeId = params.knowledgeId || context.knowledgeId;
        const updates = params.updates || {};
        if (!knowledgeId) {
            return { success: false, error: 'knowledgeId is required for updateKnowledge action' };
        }
        this.logger.log(`Updating knowledge ${knowledgeId}:`, updates);
        return {
            success: true,
            result: {
                message: 'Knowledge updated',
                knowledgeId,
                updates,
            },
        };
    }
    async callWebhook(params, context) {
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
        }
        catch (error) {
            return { success: false, error: `Webhook error: ${error.message}` };
        }
    }
    interpolateTemplate(template, context) {
        return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
            const value = path.split('.').reduce((obj, key) => obj?.[key], context);
            return value !== undefined ? String(value) : match;
        });
    }
};
exports.ActionExecutorService = ActionExecutorService;
exports.ActionExecutorService = ActionExecutorService = ActionExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workflow_definition_entity_1.WorkflowDefinition)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActionExecutorService);
//# sourceMappingURL=action-executor.service.js.map