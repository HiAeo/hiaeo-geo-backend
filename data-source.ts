import { DataSource } from 'typeorm';
import { User } from './src/modules/user/entities/user.entity';
import { Role } from './src/modules/user/entities/role.entity';
import { Organization } from './src/modules/user/entities/organization.entity';
import { AuditLog } from './src/modules/user/entities/audit-log.entity';

export default new DataSource({
  type: 'sqlite',
  database: './database/hiaeo.db',
  synchronize: true,
  entities: [User, Role, Organization, AuditLog],
});
