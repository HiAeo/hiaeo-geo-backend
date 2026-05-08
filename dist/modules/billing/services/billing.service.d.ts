import { Repository } from 'typeorm';
import { Invoice, InvoiceType, InvoiceStatus } from '../entities/invoice.entity';
import { EnterpriseTransfer } from '../entities/enterprise-transfer.entity';
export declare class BillingService {
    private invoiceRepository;
    private transferRepository;
    constructor(invoiceRepository: Repository<Invoice>, transferRepository: Repository<EnterpriseTransfer>);
    createInvoice(params: {
        organizationId: string;
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
    }): Promise<Invoice>;
    findAllInvoices(organizationId: string, status?: InvoiceStatus): Promise<Invoice[]>;
    findOneInvoice(id: string): Promise<Invoice>;
    issueInvoice(id: string, issuedBy: string): Promise<Invoice>;
    createTransfer(params: {
        organizationId: string;
        amount: number;
        payerName: string;
        payerAccount: string;
        payerBank: string;
        voucherUrl?: string;
        transferTime?: string;
        remarks?: string;
        createdBy: string;
    }): Promise<EnterpriseTransfer>;
    findAllTransfers(organizationId: string): Promise<EnterpriseTransfer[]>;
    confirmTransfer(id: string, verifiedBy: string, remarks?: string): Promise<EnterpriseTransfer>;
    rejectTransfer(id: string, verifiedBy: string, remarks: string): Promise<EnterpriseTransfer>;
    getBillingSummary(organizationId: string): Promise<{
        totalSpent: number;
        totalInvoices: number;
        pendingInvoices: number;
        totalTransfers: number;
        pendingTransfers: number;
    }>;
}
