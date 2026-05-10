"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
const vector_db_factory_service_1 = require("../services/vector-db-factory.service");
const vector_db_config_1 = require("../config/vector-db.config");
async function createVectorStorageService() {
    console.log('='.repeat(50));
    console.log('向量数据库迁移工具');
    console.log('='.repeat(50));
    console.log(`当前提供者: ${vector_db_factory_service_1.VectorDbFactory.getProviderName()}`);
    console.log(`目标提供者: ${vector_db_config_1.vectorDbConfig.provider}`);
    console.log('='.repeat(50));
    return null;
}
async function migrate(options) {
    const startTime = Date.now();
    const result = {
        success: false,
        migrated: 0,
        failed: [],
        errors: [],
        duration: 0,
    };
    try {
        console.log('\n[1/4] 初始化向量数据库连接...');
        const provider = vector_db_factory_service_1.VectorDbFactory.createProvider(vector_db_config_1.vectorDbConfig.provider);
        await provider.initialize();
        console.log('[2/4] 检查目标集合...');
        const collectionName = vector_db_config_1.vectorDbConfig.milvus.collectionName;
        await provider.getCollection(collectionName);
        console.log('[3/4] 准备迁移数据...');
        const storageService = await createVectorStorageService();
        if (options.dryRun) {
            console.log('[DRY RUN] 跳过实际迁移');
            result.success = true;
            return result;
        }
        console.log('[4/4] 执行迁移...');
        const organizationIds = await getOrganizationsToMigrate();
        console.log(`找到 ${organizationIds.length} 个组织需要迁移`);
        for (let i = 0; i < organizationIds.length; i += options.batchSize) {
            const batch = organizationIds.slice(i, i + options.batchSize);
            for (const orgId of batch) {
                try {
                    if (options.incremental) {
                        const status = await storageService.getIndexStatus(orgId);
                        if (status.indexed) {
                            console.log(`跳过已迁移的组织: ${orgId}`);
                            continue;
                        }
                    }
                    await storageService.indexKnowledgeBase(orgId);
                    result.migrated++;
                    console.log(`✓ 迁移成功: ${orgId} (${result.migrated}/${organizationIds.length})`);
                }
                catch (error) {
                    result.failed.push(orgId);
                    result.errors.push(`${orgId}: ${error.message}`);
                    console.error(`✗ 迁移失败: ${orgId} - ${error.message}`);
                }
            }
            console.log(`批次 ${Math.floor(i / options.batchSize) + 1} 完成`);
        }
        result.success = result.failed.length === 0;
    }
    catch (error) {
        result.errors.push(error.message);
        console.error('迁移过程出错:', error);
    }
    result.duration = Date.now() - startTime;
    return result;
}
async function getOrganizationsToMigrate() {
    return [];
}
function printMigrationResult(result) {
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
async function main() {
    const args = process.argv.slice(2);
    const options = {
        batchSize: 10,
        incremental: false,
        dryRun: false,
    };
    for (const arg of args) {
        if (arg.startsWith('--batch=')) {
            options.batchSize = parseInt(arg.split('=')[1], 10);
        }
        else if (arg === '--incremental') {
            options.incremental = true;
        }
        else if (arg === '--dry-run') {
            options.dryRun = true;
        }
    }
    const result = await migrate(options);
    printMigrationResult(result);
    process.exit(result.success ? 0 : 1);
}
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=migrate-to-vector-db.js.map