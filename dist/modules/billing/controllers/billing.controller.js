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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../user/guards/permission.guard");
const require_permission_decorator_1 = require("../../user/decorators/require-permission.decorator");
const billing_service_1 = require("../services/billing.service");
const invoice_entity_1 = require("../entities/invoice.entity");
let BillingController = class BillingController {
    constructor(billingService) {
        this.billingService = billingService;
    }
    async findAllInvoices(req, status) {
        return this.billingService.findAllInvoices(req.user.organizationId, status);
    }
    async findOneInvoice(id) {
        return this.billingService.findOneInvoice(id);
    }
    async createInvoice(dto, req) {
        return this.billingService.createInvoice({
            ...dto,
            organizationId: req.user.organizationId,
        });
    }
    async issueInvoice(id, req) {
        return this.billingService.issueInvoice(id, req.user.userId);
    }
    async findAllTransfers(req) {
        return this.billingService.findAllTransfers(req.user.organizationId);
    }
    async createTransfer(dto, req) {
        return this.billingService.createTransfer({
            ...dto,
            organizationId: req.user.organizationId,
            createdBy: req.user.userId,
        });
    }
    async confirmTransfer(id, remarks, req) {
        return this.billingService.confirmTransfer(id, req.user.userId, remarks);
    }
    async rejectTransfer(id, remarks, req) {
        return this.billingService.rejectTransfer(id, req.user.userId, remarks);
    }
    async getBillingSummary(req) {
        return this.billingService.getBillingSummary(req.user.organizationId);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('invoices'),
    (0, require_permission_decorator_1.RequirePermission)('user:read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "findAllInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    (0, require_permission_decorator_1.RequirePermission)('user:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "findOneInvoice", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, require_permission_decorator_1.RequirePermission)('content:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Put)('invoices/:id/issue'),
    (0, require_permission_decorator_1.RequirePermission)('content:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "issueInvoice", null);
__decorate([
    (0, common_1.Get)('transfers'),
    (0, require_permission_decorator_1.RequirePermission)('user:read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "findAllTransfers", null);
__decorate([
    (0, common_1.Post)('transfers'),
    (0, require_permission_decorator_1.RequirePermission)('content:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createTransfer", null);
__decorate([
    (0, common_1.Put)('transfers/:id/confirm'),
    (0, require_permission_decorator_1.RequirePermission)('content:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('remarks')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "confirmTransfer", null);
__decorate([
    (0, common_1.Put)('transfers/:id/reject'),
    (0, require_permission_decorator_1.RequirePermission)('content:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('remarks')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "rejectTransfer", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, require_permission_decorator_1.RequirePermission)('user:read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getBillingSummary", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('billing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map