import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config.service';

/**
 * 数据库配置
 * 支持 SQLite（开发）、MySQL（生产）、PostgreSQL（生产）
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DB_TYPE', 'sqlite') as any;
        
        // 根据数据库类型返回不同的配置
        const baseConfig: any = {
          type: dbType,
          synchronize: true, // 启用自动同步
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
              // MySQL 特定配置
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
              // PostgreSQL 特定配置
              schema: configService.get('DB_SCHEMA', 'public'),
            };

          case 'sqlite':
          default:
            return {
              ...baseConfig,
              database: configService.get('DB_DATABASE', './database/hiaeo.db'),
              // SQLite 特定配置
            };
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

/**
 * 数据库配置示例 (.env)
 * 
 * # SQLite (开发 - 默认)
 * DB_TYPE=sqlite
 * DB_DATABASE=./database/hiaeo.db
 * DB_SYNC=true
 * DB_LOGGING=false
 * 
 * # MySQL (生产)
 * DB_TYPE=mysql
 * DB_HOST=localhost
 * DB_PORT=3306
 * DB_USERNAME=root
 * DB_PASSWORD=your_password
 * DB_DATABASE=hiaeo
 * DB_SYNC=false
 * DB_LOGGING=true
 * 
 * # PostgreSQL (生产)
 * DB_TYPE=postgres
 * DB_HOST=localhost
 * DB_PORT=5432
 * DB_USERNAME=postgres
 * DB_PASSWORD=your_password
 * DB_DATABASE=hiaeo
 * DB_SCHEMA=public
 * DB_SYNC=false
 * DB_LOGGING=true
 */
