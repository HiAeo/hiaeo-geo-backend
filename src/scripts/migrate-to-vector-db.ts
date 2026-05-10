/**
 * 向量数据库迁移脚本
 * 从内存存储迁移到 Milvus/Pinecone
 */

import { VectorStorageService } from '../modules/knowledge/services/vector-storage.service';
import { VectorDbFactory } from '../services/vector-db-factory.service';
import { vectorDbConfig } from '../config/vector-db.config';

// 模拟依赖注入
async function createVectorStorageService(): Promise<VectorStorageService> {
  // 在实际运行迁移时，需要创建完整的 NestJS 应用上下文
  // 这里提供占位符，实际使用需要通过 NestJS CLI 或自定义 bootstrap 运行

  console.log('='.repeat(50));
  console.log('向量数据库迁移工具');
  console.log('='.repeat(50));
  console.log(`当前提供者: ${VectorDbFactory.getProviderName()}`);
  console.log(`目标提供者: ${vectorDbConfig.provider}`);
  console.log('='.repeat(50));

  return null as any;
}

interface MigrationOptions {
  batchSize: number;
  incremental: boolean;
  dryRun: boolean;
}

interface MigrationResult {
  success: boolean;
  migrated: number;
  failed: string[];
  errors: string[];
  duration: number;
}

/**
 * 执行迁移
 */
async function migrate(options: MigrationOptions): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: false,
    migrated: 0,
    failed: [],
    errors: [],
    duration: 0,
  };

  try {
    console.log('\n[1/4] 初始化向量数据库连接...');
    const provider = VectorDbFactory.createProvider(vectorDbConfig.provider as any);
    await provider.initialize();

    console.log('[2/4] 检查目标集合...');
    const collectionName = vectorDbConfig.milvus.collectionName;
    await provider.getCollection(collectionName);

    console.log('[3/4] 准备迁移数据...');
    const storageService = await createVectorStorageService();

    if (options.dryRun) {
      console.log('[DRY RUN] 跳过实际迁移');
      result.success = true;
      return result;
    }

    console.log('[4/4] 执行迁移...');

    // 获取需要迁移的组织列表
    // 在实际场景中，需要从数据库查询所有已索引的组织
    const organizationIds = await getOrganizationsToMigrate();

    console.log(`找到 ${organizationIds.length} 个组织需要迁移`);

    // 批量迁移
    for (let i = 0; i < organizationIds.length; i += options.batchSize) {
      const batch = organizationIds.slice(i, i + options.batchSize);

      for (const orgId of batch) {
        try {
          if (options.incremental) {
            // 增量迁移：检查是否需要迁移
            const status = await storageService.getIndexStatus(orgId);
            if (status.indexed) {
              console.log(`跳过已迁移的组织: ${orgId}`);
              continue;
            }
          }

          // 执行迁移
          await storageService.indexKnowledgeBase(orgId);
          result.migrated++;
          console.log(`✓ 迁移成功: ${orgId} (${result.migrated}/${organizationIds.length})`);
        } catch (error) {
          result.failed.push(orgId);
          result.errors.push(`${orgId}: ${error.message}`);
          console.error(`✗ 迁移失败: ${orgId} - ${error.message}`);
        }
      }

      console.log(`批次 ${Math.floor(i / options.batchSize) + 1} 完成`);
    }

    result.success = result.failed.length === 0;
  } catch (error) {
    result.errors.push(error.message);
    console.error('迁移过程出错:', error);
  }

  result.duration = Date.now() - startTime;
  return result;
}

/**
 * 获取需要迁移的组织列表
 * 在实际场景中，从数据库查询
 */
async function getOrganizationsToMigrate(): Promise<string[]> {
  // TODO: 从数据库查询所有知识库组织
  // 这里返回空数组，实际使用需要实现
  return [];
}

/**
 * 打印迁移结果
 */
function printMigrationResult(result: MigrationResult): void {
  console.log('\n' + '='.repeat(50));
  console.log('迁移结果');
  console.log('='.repeat(50));
  console.log(`状态: ${result.success ? '✓ 成功' : '✗ 部分失败'}`);
  console.log(`迁移数量: ${result.migrated}`);
  console.log(`失败数量: ${result.failed.length}`);
  console.log(`耗时: ${(result.duration / 1000).toFixed(2)}s`);

  if (result.errors.length > 0) {
    console.log('\n错误详情:');
    result.errors.forEach((err) => console.log(`  - ${err}`));
  }

  if (result.failed.length > 0) {
    console.log('\n失败的组织:');
    result.failed.forEach((orgId) => console.log(`  - ${orgId}`));
  }

  console.log('='.repeat(50));
}

// CLI 入口
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    batchSize: 10,
    incremental: false,
    dryRun: false,
  };

  // 解析参数
  for (const arg of args) {
    if (arg.startsWith('--batch=')) {
      options.batchSize = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--incremental') {
      options.incremental = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  const result = await migrate(options);
  printMigrationResult(result);

  process.exit(result.success ? 0 : 1);
}

// 导出函数供外部调用
export { migrate, MigrationOptions, MigrationResult };

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}
