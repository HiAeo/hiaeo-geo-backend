import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: './database/hiaeo.db',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  logging: true,
});

async function seed() {
  console.log('🌱 开始初始化数据...');

  await AppDataSource.initialize();
  console.log('✅ 数据库连接成功');

  const organizationRepo = AppDataSource.getRepository('Organization');
  const roleRepo = AppDataSource.getRepository('Role');
  const userRepo = AppDataSource.getRepository('User');

  // 1. 创建组织
  console.log('📦 创建组织...');
  let org = await organizationRepo.findOne({ where: { name: '海EO平台' } });
  if (!org) {
    org = organizationRepo.create({
      name: '海EO平台',
      type: 'enterprise',
    });
    org = await organizationRepo.save(org);
    console.log('✅ 组织创建成功:', org.name);
  } else {
    console.log('ℹ️ 组织已存在:', org.name);
  }

  // 2. 创建角色
  console.log('👥 创建角色...');
  const roles = [
    { code: 'super_admin', name: '超级管理员', description: '系统超级管理员', level: 100, permissions: ['*'], isSystem: true },
    { code: 'org_admin', name: '组织管理员', description: '组织管理员', level: 80, permissions: ['user:*', 'brand:*', 'content:*', 'strategy:*', 'publish:*'], isSystem: true },
    { code: 'brand_admin', name: '品牌管理员', description: '品牌管理员', level: 60, permissions: ['brand:*', 'content:*', 'strategy:*', 'publish:*'], isSystem: true },
    { code: 'editor', name: '内容编辑', description: '内容编辑', level: 40, permissions: ['brand:read', 'content:*', 'strategy:*', 'publish:execute'], isSystem: true },
    { code: 'viewer', name: '查看者', description: '只读权限', level: 20, permissions: ['brand:read', 'content:read', 'strategy:read', 'publish:read'], isSystem: true },
  ];

  const createdRoles: any[] = [];
  for (const roleData of roles) {
    let role = await roleRepo.findOne({ where: { code: roleData.code } });
    if (!role) {
      role = roleRepo.create(roleData);
      role = await roleRepo.save(role);
      console.log(`✅ 角色创建成功: ${role.name}`);
    } else {
      console.log(`ℹ️ 角色已存在: ${role.name}`);
    }
    createdRoles.push(role);
  }

  // 3. 创建测试用户
  console.log('👤 创建测试用户...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const testUsers = [
    { email: 'admin@hiaeo.com', name: '管理员', role: 'super_admin', password: 'admin123' },
    { email: 'user@test.com', name: '测试用户', role: 'viewer', password: 'user123' },
  ];

  for (const userData of testUsers) {
    const role = createdRoles.find(r => r.code === userData.role);
    let user = await userRepo.findOne({ where: { email: userData.email } });
    
    if (!user) {
      user = userRepo.create({
        email: userData.email,
        password: userData.role === 'super_admin' ? hashedPassword : await bcrypt.hash(userData.password, 10),
        name: userData.name,
        organizationId: org.id,
        roleId: role.id,
        status: 'active',
        emailVerified: true,
      });
      user = await userRepo.save(user);
      console.log(`✅ 用户创建成功: ${user.email} (密码: ${userData.password})`);
    } else {
      console.log(`ℹ️ 用户已存在: ${user.email}`);
    }
  }

  console.log('\n🎉 数据初始化完成!');
  console.log('\n测试账号:');
  console.log('  管理员: admin@hiaeo.com / admin123');
  console.log('  普通用户: user@test.com / user123');

  await AppDataSource.destroy();
}

seed().catch(console.error);
