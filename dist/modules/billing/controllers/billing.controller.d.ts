import { BillingService } from '../services/billing.service';
import { InvoiceType, InvoiceStatus } from '../entities/invoice.entity';
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
    findAllInvoices(req: any, status?: InvoiceStatus): Promise<import("../entities/invoice.entity").Invoice[]>;
    findOneInvoice(id: string): Promise<import("../entities/invoice.entity").Invoice>;
    createInvoice(dto: {
        type: InvoiceType;
        amount: number;
        buyerName: string;
        buyerTaxNo: string;
        buyerAddress?: string;
        buyerPhone?: string;
        buyerBank?: string;
        buyerAccount?: string;
        email?: string;
        orderId?: string;
        remarks?: string;
    }, req: any): Promise<import("../entities/invoice.entity").Invoice>;
    issueInvoice(id: string, req: any): Promise<import("../entities/invoice.entity").Invoice>;
    findAllTransfers(req: any): Promise<import("../entities/enterprise-transfer.entity").EnterpriseTransfer[]>;
    createTransfer(dto: {
        amount: number;
        payerName: string;
        payerAccount: string;
        payerBank: string;
        voucherUrl?: string;
        transferTime?: string;
        remarks?: string;
    }, req: any): Promise<import("../entities/enterprise-transfer.entity").EnterpriseTransfer>;
    confirmTransfer(id: string, remarks: string, req: any): Promise<import("../entities/enterprise-transfer.entity").EnterpriseTransfer>;
    rejectTransfer(id: string, remarks: string, req: any): Promise<import("../entities/enterprise-transfer.entity").EnterpriseTransfer>;
    getBillingSummary(req: any): Promise<{
        totalSpent: number;
        totalInvoices: number;
        pendingInvoices: number;
        totalTransfers: number;
        pendingTransfers: number;
    }>;
}
