import { Controller, Get, Post, Headers, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { CreditService } from '../services/credit.service';
import { TransactionType } from '../entities/credit.entity';

@ApiTags('积分管理')
@Controller('credits')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get('balance')
  @ApiOperation({ summary: '获取积分余额' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回积分余额' })
  async getBalance(@Headers('x-user-id') userId: string) {
    const balance = await this.creditService.getBalance(userId);
    return { balance };
  }

  @Get('info')
  @ApiOperation({ summary: '获取积分信息' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回积分详细信息' })
  async getCreditInfo(@Headers('x-user-id') userId: string) {
    return this.creditService.getCreditInfo(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: '获取交易记录' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: '返回交易记录' })
  async getTransactions(
    @Headers('x-user-id') userId: string,
    @Query('type') type?: TransactionType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.creditService.getTransactions({
      userId,
      type: type as TransactionType,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post('earn')
  @ApiOperation({ summary: '增加积分（管理员）' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 201, description: '积分增加成功' })
  async earnCredits(
    @Headers('x-user-id') userId: string,
    @Body() body: { amount: number; description?: string },
  ) {
    return this.creditService.earnCredits({
      userId,
      amount: body.amount,
      sourceType: 'bonus' as any,
      description: body.description || '管理员手动增加',
    });
  }

  @Post('consume')
  @ApiOperation({ summary: '消费积分' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 201, description: '积分消费成功' })
  async consumeCredits(
    @Headers('x-user-id') userId: string,
    @Body() body: { amount: number; description?: string },
  ) {
    return this.creditService.consumeCredits({
      userId,
      amount: body.amount,
      sourceType: 'diagnostic' as any,
      description: body.description || '积分消费',
    });
  }
}
