export declare enum TransferStatus {
    PENDING = "pending",
    VERIFYING = "verifying",
    CONFIRMED = "confirmed",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare class EnterpriseTransfer {
    id: string;
    organizationId: string;
    transferNo: string;
    status: TransferStatus;
    amount: number;
    payerName: string;
    payerAccount: string;
    payerBank: string;
    payeeName: string;
    payeeTaxNo: string;
    payeeBank: string;
    payeeAccount: string;
    voucherUrl: string;
    transferTime: string;
    serialNo: string;
    verifiedStatus: TransferStatus;
    verifiedBy: string;
    verifiedAt: Date;
    verifyRemarks: string;
    rechargeId: string;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
