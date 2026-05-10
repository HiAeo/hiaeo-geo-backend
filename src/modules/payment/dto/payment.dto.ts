import { IsString, IsNumber, IsOptional, IsEnum, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  BALANCE = 'balance',       // 余额支付
  ENTERPRISE = 'enterprise', // 企业转账
}

export enum PaymentChannel {
  WEB = 'web',               // 电脑网站
  APP = 'app',               // APP支付
  QR = 'qr',                 // 扫码支付
  H5 = 'h5',                 // H5支付
}

export class CreatePaymentDto {
  @ApiProperty({ description: '订单ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '支付方式', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: '支付渠道', enum: PaymentChannel, default: PaymentChannel.QR })
  @IsOptional()
  @IsEnum(PaymentChannel)
  channel?: PaymentChannel;

  @ApiPropertyOptional({ description: '客户端IP' })
  @IsOptional()
  @IsString()
  clientIp?: string;

  @ApiPropertyOptional({ description: '设备ID' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class PaymentResultDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiPropertyOptional({ description: '支付URL（网页支付）' })
  @IsOptional()
  paymentUrl?: string;

  @ApiPropertyOptional({ description: '二维码内容（扫码支付）' })
  @IsOptional()
  qrCode?: string;

  @ApiPropertyOptional({ description: 'APP唤起参数' })
  @IsOptional()
  appParams?: {
    appId: string;
    partnerId: string;
    prepayId: string;
    package: string;
    nonceStr: string;
    timestamp: string;
    sign: string;
  };

  @ApiPropertyOptional({ description: '商户订单号' })
  @IsOptional()
  outTradeNo?: string;

  @ApiPropertyOptional({ description: '微信支付订单号' })
  @IsOptional()
  tradeNo?: string;

  @ApiPropertyOptional({ description: '错误信息' })
  @IsOptional()
  errorMessage?: string;
}

export class PaymentQueryDto {
  @ApiProperty({ description: '商户订单号' })
  @IsString()
  outTradeNo: string;
}

export class PaymentCallbackDto {
  @ApiPropertyOptional({ description: '交易状态' })
  @IsOptional()
  @IsString()
  tradeStatus?: string;

  @ApiPropertyOptional({ description: '商户订单号' })
  @IsOptional()
  @IsString()
  outTradeNo?: string;

  @ApiPropertyOptional({ description: '支付订单号' })
  @IsOptional()
  @IsString()
  tradeNo?: string;

  @ApiPropertyOptional({ description: '订单金额' })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({ description: '买家付款金额' })
  @IsOptional()
  @IsNumber()
  buyerPayAmount?: number;
}

export class RefundApplyDto {
  @ApiProperty({ description: '订单ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '退款金额' })
  @IsNumber()
  @Min(0.01)
  refundAmount: number;

  @ApiPropertyOptional({ description: '退款原因' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  refundReason?: string;
}

export class RefundResultDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiPropertyOptional({ description: '退款单号' })
  @IsOptional()
  refundNo?: string;

  @ApiPropertyOptional({ description: '退款金额' })
  @IsOptional()
  refundAmount?: number;

  @ApiPropertyOptional({ description: '错误信息' })
  @IsOptional()
  errorMessage?: string;
}
