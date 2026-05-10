export declare class CreateOrderDto {
    packageId: string;
    packageName: string;
    amount: number;
    originalAmount?: number;
    discount?: number;
    remark?: string;
    couponCode?: string;
}
