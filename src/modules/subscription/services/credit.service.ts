import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Credit, CreditTransaction, TransactionType, TransactionStatus, SourceType } from '../entities/credit.entity';

export interface EarnCreditsDto {
  userId: string;
  amount: number;
  sourceType: SourceType;
  description?: string;
  relatedOrderId?: string;
}

export interface ConsumeCreditsDto {
  userId: string;
  amount: number;
  sourceType: SourceType;
  description?: string;
}

export interface TransactionFilter {
  userId: string;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,
    @InjectRepository(CreditTransaction)
    private transactionRepository: Repository<CreditTransaction>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取用户积分余额
   */
  async getBalance(userId: string): Promise<number> {
    let credit = await this.creditRepository.findOne({ where: { userId } });
    if (!credit) {
      // 创建默认积分记录
      credit = this.creditRepository.create({
        userId,
        balance: 0,
        totalEarned: 0,
        totalConsumed: 0,
      });
      await this.creditRepository.save(credit);
    }
    return credit.balance;
  }

  /**
   * 获取用户积分信息
   */
  async getCreditInfo(userId: string) {
    let credit = await this.creditRepository.findOne({ where: { userId } });
    if (!credit) {
      credit = this.creditRepository.create({
        userId,
        balance: 0,
        totalEarned: 0,
        totalConsumed: 0,
      });
      await this.creditRepository.save(credit);
    }
    return credit;
  }

  /**
   * 获得积分（使用事务）
   */
  async earnCredits(dto: EarnCreditsDto): Promise<CreditTransaction> {
    if (dto.amount <= 0) {
      throw new BadRequestException('积分数量必须大于0');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取或创建积分账户
      let credit = await queryRunner.manager.findOne(Credit, { where: { userId: dto.userId } });
      if (!credit) {
        credit = queryRunner.manager.create(Credit, {
          userId: dto.userId,
          balance: 0,
          totalEarned: 0,
          totalConsumed: 0,
        });
        await queryRunner.manager.save(credit);
      }

      const balanceBefore = credit.balance;
      const balanceAfter = balanceBefore + dto.amount;

      // 更新积分余额
      credit.balance = balanceAfter;
      credit.totalEarned = credit.totalEarned + dto.amount;
      await queryRunner.manager.save(credit);

      // 创建交易记录
      const transaction = queryRunner.manager.create(CreditTransaction, {
        userId: dto.userId,
        type: TransactionType.EARN,
        sourceType: dto.sourceType,
        amount: dto.amount,
        status: TransactionStatus.COMPLETED,
        balanceBefore,
        balanceAfter,
        description: dto.description || `获得${dto.amount}积分`,
        relatedOrderId: dto.relatedOrderId,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 消费积分（使用事务）
   */
  async consumeCredits(dto: ConsumeCreditsDto): Promise<CreditTransaction> {
    if (dto.amount <= 0) {
      throw new BadRequestException('积分数量必须大于0');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取积分账户
      let credit = await queryRunner.manager.findOne(Credit, { where: { userId: dto.userId } });
      if (!credit) {
        throw new BadRequestException('积分账户不存在');
      }

      if (credit.balance < dto.amount) {
        throw new BadRequestException(`积分不足，当前余额：${credit.balance}，需要：${dto.amount}`);
      }

      const balanceBefore = credit.balance;
      const balanceAfter = balanceBefore - dto.amount;

      // 更新积分余额
      credit.balance = balanceAfter;
      credit.totalConsumed = credit.totalConsumed + dto.amount;
      await queryRunner.manager.save(credit);

      // 创建交易记录
      const transaction = queryRunner.manager.create(CreditTransaction, {
        userId: dto.userId,
        type: TransactionType.CONSUME,
        sourceType: dto.sourceType,
        amount: dto.amount,
        status: TransactionStatus.COMPLETED,
        balanceBefore,
        balanceAfter,
        description: dto.description || `消耗${dto.amount}积分`,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 退还积分
   */
  async refundCredits(userId: string, amount: number, description: string, relatedOrderId?: string): Promise<CreditTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('积分数量必须大于0');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取积分账户
      let credit = await queryRunner.manager.findOne(Credit, { where: { userId } });
      if (!credit) {
        credit = queryRunner.manager.create(Credit, {
          userId,
          balance: 0,
          totalEarned: 0,
          totalConsumed: 0,
        });
        await queryRunner.manager.save(credit);
      }

      const balanceBefore = credit.balance;
      const balanceAfter = balanceBefore + amount;

      // 更新积分余额
      credit.balance = balanceAfter;
      credit.totalEarned = credit.totalEarned + amount; // 退款视为重新获得
      await queryRunner.manager.save(credit);

      // 创建退款交易记录
      const transaction = queryRunner.manager.create(CreditTransaction, {
        userId,
        type: TransactionType.REFUND,
        sourceType: SourceType.REFERRAL,
        amount,
        status: TransactionStatus.COMPLETED,
        balanceBefore,
        balanceAfter,
        description: description || `退还${amount}积分`,
        relatedOrderId,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取交易记录
   */
  async getTransactions(filter: TransactionFilter) {
    const { userId, type, startDate, endDate, page = 1, limit = 20 } = filter;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    const total = await queryBuilder.getCount();

    const transactions = await queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 检查积分是否足够
   */
  async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }

  /**
   * 批量发放积分（用于活动等）
   */
  async batchEarnCredits(userIds: string[], amount: number, sourceType: SourceType, description: string) {
    const results = [];
    for (const userId of userIds) {
      try {
        const transaction = await this.earnCredits({
          userId,
          amount,
          sourceType,
          description,
        });
        results.push({ userId, success: true, transaction });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }
    return results;
  }
}
