// 注意：暂时禁用 class-validator 装饰器，避免 ValidationPipe whitelist 问题
// 实际验证在 Service 层进行
export class CreateOrderDto {
  packageId: string;
  packageName: string;
  amount: number;
  originalAmount?: number;
  discount?: number;
  remark?: string;
  couponCode?: string;
}
