export declare enum InvoiceType {
    VAT_SPECIAL = "vat_special",
    VAT_NORMAL = "vat_normal",
    ELECTRONIC = "electronic",
    PLAIN = "plain"
}
export declare enum InvoiceStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    ISSUED = "issued",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    REJECTED = "rejected"
}
export declare class Invoice {
    id: string;
    organizationId: string;
    invoiceNo: string;
    type: InvoiceType;
    status: InvoiceStatus;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    taxRate: string;
    buyerName: string;
    buyerTaxNo: string;
    buyerAddress: string;
    buyerPhone: string;
    buyerBank: string;
    buyerAccount: string;
    sellerName: string;
    sellerTaxNo: string;
    sellerAddress: string;
    sellerPhone: string;
    sellerBank: string;
    sellerAccount: string;
    items: {
        name: string;
        specification: string;
        unit: string;
        quantity: number;
        unitPrice: number;
        amount: number;
        taxRate: string;
        taxAmount: number;
    }[];
    remarks: string;
    email: string;
    issuedAt: Date;
    issuedBy: string;
    downloadUrl: string;
    orderId: string;
    createdAt: Date;
    updatedAt: Date;
}
