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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const credit_service_1 = require("../services/credit.service");
const credit_entity_1 = require("../entities/credit.entity");
let CreditController = class CreditController {
    constructor(creditService) {
        this.creditService = creditService;
    }
    async getBalance(userId) {
        const balance = await this.creditService.getBalance(userId);
        return { balance };
    }
    async getCreditInfo(userId) {
        return this.creditService.getCreditInfo(userId);
    }
    async getTransactions(userId, type, page, limit) {
        return this.creditService.getTransactions({
            userId,
            type: type,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
    }
    async earnCredits(userId, body) {
        return this.creditService.earnCredits({
            userId,
            amount: body.amount,
            sourceType: 'bonus',
            description: body.description || '管理员手动增加',
        });
    }
    async consumeCredits(userId, body) {
        return this.creditService.consumeCredits({
            userId,
            amount: body.amount,
            sourceType: 'diagnostic',
            description: body.description || '积分消费',
        });
    }
};
exports.CreditController = CreditController;
__decorate([
    (0, common_1.Get)('balance'),
    (0, swagger_1.ApiOperation)({ summary: '获取积分余额' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回积分余额' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreditController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('info'),
    (0, swagger_1.ApiOperation)({ summary: '获取积分信息' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回积分详细信息' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreditController.prototype, "getCreditInfo", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: '获取交易记录' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: credit_entity_1.TransactionType }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回交易记录' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CreditController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('earn'),
    (0, swagger_1.ApiOperation)({ summary: '增加积分（管理员）' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '积分增加成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CreditController.prototype, "earnCredits", null);
__decorate([
    (0, common_1.Post)('consume'),
    (0, swagger_1.ApiOperation)({ summary: '消费积分' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '积分消费成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CreditController.prototype, "consumeCredits", null);
exports.CreditController = CreditController = __decorate([
    (0, swagger_1.ApiTags)('积分管理'),
    (0, common_1.Controller)('credits'),
    __metadata("design:paramtypes", [credit_service_1.CreditService])
], CreditController);
//# sourceMappingURL=credit.controller.js.map