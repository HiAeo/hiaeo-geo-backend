"use strict";
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Invoice, InvoiceType, InvoiceStatus } from '../entities/invoice.entity';
import { EnterpriseTransfer, TransferStatus } from '../entities/enterprise-transfer.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(EnterpriseTransfer)
    private transferRepository: Repository<EnterpriseTransfer>,
  ) {}

  // ========== 发票管理 - T130 ==========

  /**
   * 创建发票申请
   */
  async createInvoice(params: {
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
  }): Promise<Invoice> {
    // 计算税额 (6%税率)
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

  /**
   * 获取发票列表
   */
  async findAllInvoices(organizationId: string, status?: InvoiceStatus): Promise<Invoice[]> {
    const where: any = { organizationId };
    if (status) where.status = status;
    
    return this.invoiceRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取发票详情
   */
  async findOneInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('发票不存在');
    }
    return invoice;
  }

  /**
   * 开具发票
   */
  async issueInvoice(id: string, issuedBy: string): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);
    
    if (invoice.status !== InvoiceStatus.PENDING) {
      throw new BadRequestException('当前状态不可开票');
    }

    invoice.status = InvoiceStatus.PROCESSING;
    await this.invoiceRepository.save(invoice);

    // 实际应该调用税控系统开票
    // 这里简化处理
    invoice.status = InvoiceStatus.ISSUED;
    invoice.issuedAt = new Date();
    invoice.issuedBy = issuedBy;
    invoice.downloadUrl = `/api/billing/invoices/${id}/download`;

    return this.invoiceRepository.save(invoice);
  }

  // ========== 企业汇款 - T133 ==========

  /**
   * 创建汇款记录
   */
  async createTransfer(params: {
    organizationId: string;
    amount: number;
    payerName: string;
    payerAccount: string;
    payerBank: string;
    voucherUrl?: string;
    transferTime?: string;
    remarks?: string;
    createdBy: string;
  }): Promise<EnterpriseTransfer> {
    const transfer = this.transferRepository.create({
      ...params,
      transferNo: `TRF${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      payeeBank: '中国工商银行杭州科技支行',
      payeeAccount: '120202xxxxxxxxx',
      verifiedStatus: TransferStatus.PENDING,
    });

    return this.transferRepository.save(transfer);
  }

  /**
   * 获取汇款记录列表
   */
  async findAllTransfers(organizationId: string): Promise<EnterpriseTransfer[]> {
    return this.transferRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 确认汇款（管理员操作）
   */
  async confirmTransfer(id: string, verifiedBy: string, remarks?: string): Promise<EnterpriseTransfer> {
    const transfer = await this.transferRepository.findOne({ where: { id } });
    if (!transfer) {
      throw new NotFoundException('汇款记录不存在');
    }

    if (transfer.status !== TransferStatus.VERIFYING) {
      throw new BadRequestException('当前状态不可确认');
    }

    transfer.status = TransferStatus.CONFIRMED;
    transfer.verifiedStatus = TransferStatus.CONFIRMED;
    transfer.verifiedBy = verifiedBy;
    transfer.verifiedAt = new Date();
    transfer.verifyRemarks = remarks || '';

    return this.transferRepository.save(transfer);
  }

  /**
   * 拒绝汇款
   */
  async rejectTransfer(id: string, verifiedBy: string, remarks: string): Promise<EnterpriseTransfer> {
    const transfer = await this.transferRepository.findOne({ where: { id } });
    if (!transfer) {
      throw new NotFoundException('汇款记录不存在');
    }

    transfer.status = TransferStatus.REJECTED;
    transfer.verifiedStatus = TransferStatus.REJECTED;
    transfer.verifiedBy = verifiedBy;
    transfer.verifiedAt = new Date();
    transfer.verifyRemarks = remarks;

    return this.transferRepository.save(transfer);
  }

  // ========== 账单统计 ==========

  /**
   * 获取账单统计
   */
  async getBillingSummary(organizationId: string): Promise<{
    totalSpent: number;
    totalInvoices: number;
    pendingInvoices: number;
    totalTransfers: number;
    pendingTransfers: number;
  }> {
    const invoices = await this.findAllInvoices(organizationId);
    const transfers = await this.findAllTransfers(organizationId);

    return {
      totalSpent: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalInvoices: invoices.length,
      pendingInvoices: invoices.filter(i => i.status === InvoiceStatus.PENDING).length,
      totalTransfers: transfers.length,
      pendingTransfers: transfers.filter(t => t.status === TransferStatus.PENDING || t.status === TransferStatus.VERIFYING).length,
    };
  }
}
