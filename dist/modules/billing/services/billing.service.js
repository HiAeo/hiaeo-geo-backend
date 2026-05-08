"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const invoice_entity_1 = require("../entities/invoice.entity");
const enterprise_transfer_entity_1 = require("../entities/enterprise-transfer.entity");
let BillingService = class BillingService {
    constructor(invoiceRepository, transferRepository) {
        this.invoiceRepository = invoiceRepository;
        this.transferRepository = transferRepository;
    }
    async createInvoice(params) {
        const taxRate = '6%';
        const taxAmount = Math.round(params.amount * 0.06 * 100) / 100;
        const totalAmount = params.amount + taxAmount;
        const invoice = this.invoiceRepository.create({
            ...params,
            invoiceNo: `INV${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
            taxRate,
            taxAmount,
            totalAmount,
            sellerTaxNo: '91330100MA2HXXXXXR',
            sellerAddress: '浙江省杭州市西湖区xxx路xxx号',
            sellerPhone: '0571-xxxxxxx',
            sellerBank: '中国工商银行杭州xxx支行',
            sellerAccount: '120202xxxxxxxxx',
            items: [{
                    name: '技术服务费',
                    specification: '-',
                    unit: '次',
                    quantity: 1,
                    unitPrice: params.amount,
                    amount: params.amount,
                    taxRate,
                    taxAmount,
                }],
        });
        return this.invoiceRepository.save(invoice);
    }
    async findAllInvoices(organizationId, status) {
        const where = { organizationId };
        if (status)
            where.status = status;
        return this.invoiceRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async findOneInvoice(id) {
        const invoice = await this.invoiceRepository.findOne({ where: { id } });
        if (!invoice) {
            throw new common_1.NotFoundException('发票不存在');
        }
        return invoice;
    }
    async issueInvoice(id, issuedBy) {
        const invoice = await this.findOneInvoice(id);
        if (invoice.status !== invoice_entity_1.InvoiceStatus.PENDING) {
            throw new common_1.BadRequestException('当前状态不可开票');
        }
        invoice.status = invoice_entity_1.InvoiceStatus.PROCESSING;
        await this.invoiceRepository.save(invoice);
        invoice.status = invoice_entity_1.InvoiceStatus.ISSUED;
        invoice.issuedAt = new Date();
        invoice.issuedBy = issuedBy;
        invoice.downloadUrl = `/api/billing/invoices/${id}/download`;
        return this.invoiceRepository.save(invoice);
    }
    async createTransfer(params) {
        const transfer = this.transferRepository.create({
            ...params,
            transferNo: `TRF${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
            payeeBank: '中国工商银行杭州科技支行',
            payeeAccount: '120202xxxxxxxxx',
            verifiedStatus: enterprise_transfer_entity_1.TransferStatus.PENDING,
        });
        return this.transferRepository.save(transfer);
    }
    async findAllTransfers(organizationId) {
        return this.transferRepository.find({
            where: { organizationId },
            order: { createdAt: 'DESC' },
        });
    }
    async confirmTransfer(id, verifiedBy, remarks) {
        const transfer = await this.transferRepository.findOne({ where: { id } });
        if (!transfer) {
            throw new common_1.NotFoundException('汇款记录不存在');
        }
        if (transfer.status !== enterprise_transfer_entity_1.TransferStatus.VERIFYING) {
            throw new common_1.BadRequestException('当前状态不可确认');
        }
        transfer.status = enterprise_transfer_entity_1.TransferStatus.CONFIRMED;
        transfer.verifiedStatus = enterprise_transfer_entity_1.TransferStatus.CONFIRMED;
        transfer.verifiedBy = verifiedBy;
        transfer.verifiedAt = new Date();
        transfer.verifyRemarks = remarks || '';
        return this.transferRepository.save(transfer);
    }
    async rejectTransfer(id, verifiedBy, remarks) {
        const transfer = await this.transferRepository.findOne({ where: { id } });
        if (!transfer) {
            throw new common_1.NotFoundException('汇款记录不存在');
        }
        transfer.status = enterprise_transfer_entity_1.TransferStatus.REJECTED;
        transfer.verifiedStatus = enterprise_transfer_entity_1.TransferStatus.REJECTED;
        transfer.verifiedBy = verifiedBy;
        transfer.verifiedAt = new Date();
        transfer.verifyRemarks = remarks;
        return this.transferRepository.save(transfer);
    }
    async getBillingSummary(organizationId) {
        const invoices = await this.findAllInvoices(organizationId);
        const transfers = await this.findAllTransfers(organizationId);
        return {
            totalSpent: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
            totalInvoices: invoices.length,
            pendingInvoices: invoices.filter(i => i.status === invoice_entity_1.InvoiceStatus.PENDING).length,
            totalTransfers: transfers.length,
            pendingTransfers: transfers.filter(t => t.status === enterprise_transfer_entity_1.TransferStatus.PENDING || t.status === enterprise_transfer_entity_1.TransferStatus.VERIFYING).length,
        };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(enterprise_transfer_entity_1.EnterpriseTransfer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BillingService);
//# sourceMappingURL=billing.service.js.map