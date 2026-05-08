"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosisModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const diagnosis_controller_1 = require("./controllers/diagnosis.controller");
const diagnosis_task_entity_1 = require("./entities/diagnosis-task.entity");
const diagnosis_report_entity_1 = require("./entities/diagnosis-report.entity");
const diagnosis_task_service_1 = require("./services/diagnosis-task.service");
const diagnosis_executor_service_1 = require("./services/diagnosis-executor.service");
const health_score_calculator_service_1 = require("./services/health-score-calculator.service");
const competitor_analyzer_service_1 = require("./services/competitor-analyzer.service");
const issue_identifier_service_1 = require("./services/issue-identifier.service");
const report_generator_service_1 = require("./services/report-generator.service");
const ai_module_1 = require("../ai/ai.module");
let DiagnosisModule = class DiagnosisModule {
};
exports.DiagnosisModule = DiagnosisModule;
exports.DiagnosisModule = DiagnosisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([diagnosis_task_entity_1.DiagnosisTask, diagnosis_report_entity_1.DiagnosisReport]),
            (0, common_1.forwardRef)(() => ai_module_1.AiModule),
        ],
        controllers: [diagnosis_controller_1.DiagnosisController],
        providers: [
            diagnosis_task_service_1.DiagnosisTaskService,
            diagnosis_executor_service_1.DiagnosisExecutorService,
            health_score_calculator_service_1.HealthScoreCalculatorService,
            competitor_analyzer_service_1.CompetitorAnalyzerService,
            issue_identifier_service_1.IssueIdentifierService,
            report_generator_service_1.ReportGeneratorService,
        ],
        exports: [
            diagnosis_task_service_1.DiagnosisTaskService,
            diagnosis_executor_service_1.DiagnosisExecutorService,
            health_score_calculator_service_1.HealthScoreCalculatorService,
            competitor_analyzer_service_1.CompetitorAnalyzerService,
            issue_identifier_service_1.IssueIdentifierService,
            report_generator_service_1.ReportGeneratorService,
        ],
    })
], DiagnosisModule);
//# sourceMappingURL=diagnosis.module.js.map