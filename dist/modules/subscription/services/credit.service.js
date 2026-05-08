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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const credit_entity_1 = require("../entities/credit.entity");
let CreditService = class CreditService {
    constructor(creditRepository, transactionRepository, dataSource) {
        this.creditRepository = creditRepository;
        this.transactionRepository = transactionRepository;
        this.dataSource = dataSource;
    }
    async getBalance(userId) {
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
        return credit.balance;
    }
    async getCreditInfo(userId) {
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
    async earnCredits(dto) {
        if (dto.amount <= 0) {
            throw new common_1.BadRequestException('积分数量必须大于0');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let credit = await queryRunner.manager.findOne(credit_entity_1.Credit, { where: { userId: dto.userId } });
            if (!credit) {
                credit = queryRunner.manager.create(credit_entity_1.Credit, {
                    userId: dto.userId,
                    balance: 0,
                    totalEarned: 0,
                    totalConsumed: 0,
                });
                await queryRunner.manager.save(credit);
            }
            const balanceBefore = credit.balance;
            const balanceAfter = balanceBefore + dto.amount;
            credit.balance = balanceAfter;
            credit.totalEarned = credit.totalEarned + dto.amount;
            await queryRunner.manager.save(credit);
            const transaction = queryRunner.manager.create(credit_entity_1.CreditTransaction, {
                userId: dto.userId,
                type: credit_entity_1.TransactionType.EARN,
                sourceType: dto.sourceType,
                amount: dto.amount,
                status: credit_entity_1.TransactionStatus.COMPLETED,
                balanceBefore,
                balanceAfter,
                description: dto.description || `获得${dto.amount}积分`,
                relatedOrderId: dto.relatedOrderId,
            });
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();
            return transaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async consumeCredits(dto) {
        if (dto.amount <= 0) {
            throw new common_1.BadRequestException('积分数量必须大于0');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let credit = await queryRunner.manager.findOne(credit_entity_1.Credit, { where: { userId: dto.userId } });
            if (!credit) {
                throw new common_1.BadRequestException('积分账户不存在');
            }
            if (credit.balance < dto.amount) {
                throw new common_1.BadRequestException(`积分不足，当前余额：${credit.balance}，需要：${dto.amount}`);
            }
            const balanceBefore = credit.balance;
            const balanceAfter = balanceBefore - dto.amount;
            credit.balance = balanceAfter;
            credit.totalConsumed = credit.totalConsumed + dto.amount;
            await queryRunner.manager.save(credit);
            const transaction = queryRunner.manager.create(credit_entity_1.CreditTransaction, {
                userId: dto.userId,
                type: credit_entity_1.TransactionType.CONSUME,
                sourceType: dto.sourceType,
                amount: dto.amount,
                status: credit_entity_1.TransactionStatus.COMPLETED,
                balanceBefore,
                balanceAfter,
                description: dto.description || `消耗${dto.amount}积分`,
            });
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();
            return transaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async refundCredits(userId, amount, description, relatedOrderId) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('积分数量必须大于0');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let credit = await queryRunner.manager.findOne(credit_entity_1.Credit, { where: { userId } });
            if (!credit) {
                credit = queryRunner.manager.create(credit_entity_1.Credit, {
                    userId,
                    balance: 0,
                    totalEarned: 0,
                    totalConsumed: 0,
                });
                await queryRunner.manager.save(credit);
            }
            const balanceBefore = credit.balance;
            const balanceAfter = balanceBefore + amount;
            credit.balance = balanceAfter;
            credit.totalEarned = credit.totalEarned + amount;
            await queryRunner.manager.save(credit);
            const transaction = queryRunner.manager.create(credit_entity_1.CreditTransaction, {
                userId,
                type: credit_entity_1.TransactionType.REFUND,
                sourceType: credit_entity_1.SourceType.REFERRAL,
                amount,
                status: credit_entity_1.TransactionStatus.COMPLETED,
                balanceBefore,
                balanceAfter,
                description: description || `退还${amount}积分`,
                relatedOrderId,
            });
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();
            return transaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTransactions(filter) {
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
    async hasEnoughCredits(userId, amount) {
        const balance = await this.getBalance(userId);
        return balance >= amount;
    }
    async batchEarnCredits(userIds, amount, sourceType, description) {
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
            }
            catch (error) {
                results.push({ userId, success: false, error: error.message });
            }
        }
        return results;
    }
};
exports.CreditService = CreditService;
exports.CreditService = CreditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(credit_entity_1.Credit)),
    __param(1, (0, typeorm_1.InjectRepository)(credit_entity_1.CreditTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], CreditService);
//# sourceMappingURL=credit.service.js.map