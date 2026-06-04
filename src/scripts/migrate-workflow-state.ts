/**
 * 数据库迁移脚本 - 添加 workflow_state 字段
 * 运行: npx ts-node src/scripts/migrate-workflow-state.ts
 */

import { DataSource } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { Brand, BrandWorkflowState, ModuleState } from '../modules/brand/entities/brand.entity';

async function migrateWorkflowState() {
  console.log('🚀 开始迁移: 添加 workflow_state 字段\n');

  const configService = new ConfigService();
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: configService.get('DATABASE_PATH') || './data/hiaeo.db',
    entities: [Brand],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    const brandRepository = dataSource.getRepository(Brand);

    // 检查表结构
    const tableInfo = await dataSource.query("PRAGMA table_info(brands)");
    console.log('📋 当前 brands 表结构:');
    tableInfo.forEach((col: any) => {
      console.log(`  - ${col.name}: ${col.type}`);
    });

    // 检查是否已有 workflow_state 列
    const hasWorkflowState = tableInfo.some((col: any) => col.name === 'workflowState');

    if (hasWorkflowState) {
      console.log('\n⚠️  workflow_state 列已存在，跳过创建\n');
    } else {
      // 添加 workflow_state 列 (SQLite 使用 ALTER TABLE)
      console.log('\n📝 添加 workflow_state 列...');
      await dataSource.query(`
        ALTER TABLE brands 
        ADD COLUMN workflowState TEXT
      `);
      console.log('✅ workflow_state 列创建成功\n');
    }

    // 初始化所有品牌的默认工作流状态
    console.log('🔧 初始化品牌工作流状态...\n');

    const brands = await brandRepository.find();

    for (const brand of brands) {
      if (!brand.workflowState) {
        const defaultState: BrandWorkflowState = {
          knowledge: ModuleState.DRAFT,
          diagnosis: ModuleState.DRAFT,
          strategy: ModuleState.DRAFT,
          execution: ModuleState.DRAFT,
          monitor: ModuleState.DRAFT,
          updatedAt: new Date().toISOString(),
        };

        await brandRepository.update(brand.id, {
          workflowState: defaultState as any,
        });

        console.log(`  ✅ 品牌 "${brand.name}" 工作流状态已初始化`);
      } else {
        console.log(`  ⏭️  品牌 "${brand.name}" 已有工作流状态，跳过`);
      }
    }

    console.log('\n✅ 迁移完成!\n');

    // 打印迁移后的表结构
    console.log('📋 迁移后 brands 表结构:');
    const newTableInfo = await dataSource.query("PRAGMA table_info(brands)");
    newTableInfo.forEach((col: any) => {
      console.log(`  - ${col.name}: ${col.type}`);
    });

    // 显示工作流状态示例
    console.log('\n📊 工作流状态示例:');
    const sampleBrand = await brandRepository.findOne({ where: {} });
    if (sampleBrand && sampleBrand.workflowState) {
      const state = typeof sampleBrand.workflowState === 'string'
        ? JSON.parse(sampleBrand.workflowState)
        : sampleBrand.workflowState;
      console.log(`  品牌: ${sampleBrand.name}`);
      console.log(`  智库: ${state.knowledge}`);
      console.log(`  诊断: ${state.diagnosis}`);
      console.log(`  策略: ${state.strategy}`);
      console.log(`  执行: ${state.execution}`);
      console.log(`  监控: ${state.monitor}`);
    }

  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// 运行迁移
migrateWorkflowState()
  .then(() => {
    console.log('\n========================================');
    console.log('🎉 数据库迁移成功完成!');
    console.log('========================================\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 迁移过程中发生错误:', error);
    process.exit(1);
  });
