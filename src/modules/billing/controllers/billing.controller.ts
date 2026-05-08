"use strict";
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../user/guards/permission.guard';
import { RequirePermission } from '../../user/decorators/require-permission.decorator';
import { BillingService } from '../services/billing.service';
import { InvoiceType, InvoiceStatus } from '../entities/invoice.entity';
import { TransferStatus } from '../entities/enterprise-transfer.entity';

@Controller('billing')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  // ========== 发票管理 ==========

  @Get('invoices')
  @RequirePermission('user:read')
  async findAllInvoices(
    @Request() req: any,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.billingService.findAllInvoices(req.user.organizationId, status);
  }

  @Get('invoices/:id')
  @RequirePermission('user:read')
  async findOneInvoice(@Param('id') id: string) {
    return this.billingService.findOneInvoice(id);
  }

  @Post('invoices')
  @RequirePermission('content:create')
  async createInvoice(
    @Body() dto: {
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
    },
    @Request() req: any,
  ) {
    return this.billingService.createInvoice({
      ...dto,
      organizationId: req.user.organizationId,
    });
  }

  @Put('invoices/:id/issue')
  @RequirePermission('content:update')
  async issueInvoice(@Param('id') id: string, @Request() req: any) {
    return this.billingService.issueInvoice(id, req.user.userId);
  }

  // ========== 企业汇款 ==========

  @Get('transfers')
  @RequirePermission('user:read')
  async findAllTransfers(@Request() req: any) {
    return this.billingService.findAllTransfers(req.user.organizationId);
  }

  @Post('transfers')
  @RequirePermission('content:create')
  async createTransfer(
    @Body() dto: {
      amount: number;
      payerName: string;
      payerAccount: string;
      payerBank: string;
      voucherUrl?: string;
      transferTime?: string;
      remarks?: string;
    },
    @Request() req: any,
  ) {
    return this.billingService.createTransfer({
      ...dto,
      organizationId: req.user.organizationId,
      createdBy: req.user.userId,
    });
  }

  @Put('transfers/:id/confirm')
  @RequirePermission('content:update')
  async confirmTransfer(
    @Param('id') id: string,
    @Body('remarks') remarks: string,
    @Request() req: any,
  ) {
    return this.billingService.confirmTransfer(id, req.user.userId, remarks);
  }

  @Put('transfers/:id/reject')
  @RequirePermission('content:update')
  async rejectTransfer(
    @Param('id') id: string,
    @Body('remarks') remarks: string,
    @Request() req: any,
  ) {
    return this.billingService.rejectTransfer(id, req.user.userId, remarks);
  }

  // ========== 账单统计 ==========

  @Get('summary')
  @RequirePermission('user:read')
  async getBillingSummary(@Request() req: any) {
    return this.billingService.getBillingSummary(req.user.organizationId);
  }
}
