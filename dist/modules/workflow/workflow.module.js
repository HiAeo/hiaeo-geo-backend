"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("./entities");
const services_1 = require("./services");
const controllers_1 = require("./controllers");
let WorkflowModule = class WorkflowModule {
};
exports.WorkflowModule = WorkflowModule;
exports.WorkflowModule = WorkflowModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([entities_1.WorkflowDefinition, entities_1.WorkflowExecution])],
        controllers: [controllers_1.WorkflowController],
        providers: [
            services_1.WorkflowService,
            services_1.WorkflowEngine,
            services_1.TriggerService,
            services_1.ActionExecutorService,
        ],
        exports: [
            services_1.WorkflowService,
            services_1.WorkflowEngine,
            services_1.TriggerService,
            services_1.ActionExecutorService,
        ],
    })
], WorkflowModule);
//# sourceMappingURL=workflow.module.js.map