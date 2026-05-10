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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundResultDto = exports.RefundApplyDto = exports.PaymentCallbackDto = exports.PaymentQueryDto = exports.PaymentResultDto = exports.CreatePaymentDto = exports.PaymentChannel = exports.PaymentMethod = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["ALIPAY"] = "alipay";
    PaymentMethod["WECHAT"] = "wechat";
    PaymentMethod["BALANCE"] = "balance";
    PaymentMethod["ENTERPRISE"] = "enterprise";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentChannel;
(function (PaymentChannel) {
    PaymentChannel["WEB"] = "web";
    PaymentChannel["APP"] = "app";
    PaymentChannel["QR"] = "qr";
    PaymentChannel["H5"] = "h5";
})(PaymentChannel || (exports.PaymentChannel = PaymentChannel = {}));
class CreatePaymentDto {
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '订单ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '支付方式', enum: PaymentMethod }),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '支付渠道', enum: PaymentChannel, default: PaymentChannel.QR }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PaymentChannel),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '客户端IP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "clientIp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '设备ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "deviceId", void 0);
class PaymentResultDto {
}
exports.PaymentResultDto = PaymentResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否成功' }),
    __metadata("design:type", Boolean)
], PaymentResultDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '支付URL（网页支付）' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentResultDto.prototype, "paymentUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '二维码内容（扫码支付）' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentResultDto.prototype, "qrCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'APP唤起参数' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PaymentResultDto.prototype, "appParams", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '商户订单号' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentResultDto.prototype, "outTradeNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '微信支付订单号' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentResultDto.prototype, "tradeNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '错误信息' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentResultDto.prototype, "errorMessage", void 0);
class PaymentQueryDto {
}
exports.PaymentQueryDto = PaymentQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '商户订单号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentQueryDto.prototype, "outTradeNo", void 0);
class PaymentCallbackDto {
}
exports.PaymentCallbackDto = PaymentCallbackDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '交易状态' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentCallbackDto.prototype, "tradeStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '商户订单号' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentCallbackDto.prototype, "outTradeNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '支付订单号' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentCallbackDto.prototype, "tradeNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '订单金额' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentCallbackDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '买家付款金额' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentCallbackDto.prototype, "buyerPayAmount", void 0);
class RefundApplyDto {
}
exports.RefundApplyDto = RefundApplyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '订单ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundApplyDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '退款金额' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], RefundApplyDto.prototype, "refundAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '退款原因' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(256),
    __metadata("design:type", String)
], RefundApplyDto.prototype, "refundReason", void 0);
class RefundResultDto {
}
exports.RefundResultDto = RefundResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否成功' }),
    __metadata("design:type", Boolean)
], RefundResultDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '退款单号' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RefundResultDto.prototype, "refundNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '退款金额' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RefundResultDto.prototype, "refundAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '错误信息' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RefundResultDto.prototype, "errorMessage", void 0);
//# sourceMappingURL=payment.dto.js.map