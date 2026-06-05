import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config.service';

/**
 * 数据库配置
 * 支持 PostgreSQL（Supabase/生产）、MySQL、SQLite（本地开发）
 * 优先使用 DATABASE_URL 连接字符串，兼容 Supabase Pooler
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL', '');
        
        // 优先使用 DATABASE_URL（Supabase / 生产环境）
        if (databaseUrl) {
          // 将 postgres:// 转为 postgresql:// 以兼容 TypeORM
          const url = databaseUrl.replace(/^postgres:\/\//, 'postgresql://');
          return {
            type: 'postgres' as any,
            url,
            synchronize: true,
            logging: configService.getBoolean('DB_LOGGING', false),
            autoLoadEntities: true,
            ssl: { rejectUnauthorized: false }, // Supabase 需要 SSL
          };
        }

        const dbType = configService.get('DB_TYPE', 'postgres') as any;
        
        const baseConfig: any = {
          type: dbType,
          synchronize: true,
          logging: configService.getBoolean('DB_LOGGING', false),
          autoLoadEntities: true,
        };

        switch (dbType) {
          case 'mysql':
          case 'mariadb':
            return {
              ...baseConfig,
              host: configService.get('DB_HOST', 'localhost'),
              port: configService.getNumber('DB_PORT', 3306),
              username: configService.get('DB_USERNAME', 'root'),
              password: configService.get('DB_PASSWORD', ''),
              database: configService.get('DB_DATABASE', 'hiaeo'),
              extra: {
                connectionLimit: 10,
              },
            };

          case 'postgres':
          case 'postgresql':
            return {
              ...baseConfig,
              host: configService.get('DB_HOST', 'localhost'),
              port: configService.getNumber('DB_PORT', 5432),
              username: configService.get('DB_USERNAME', 'postgres'),
              password: configService.get('DB_PASSWORD', ''),
              database: configService.get('DB_DATABASE', 'hiaeo'),
              schema: configService.get('DB_SCHEMA', 'public'),
              ssl: configService.get('DB_SSL') === 'true' 
                ? { rejectUnauthorized: false } 
                : false,
            };

          case 'sqlite':
            return {
              ...baseConfig,
              database: configService.get('DB_DATABASE', './database/hiaeo.db'),
            };

          default:
            return {
              ...baseConfig,
              database: configService.get('DB_DATABASE', './database/hiaeo.db'),
            };
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
