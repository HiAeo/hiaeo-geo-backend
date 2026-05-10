import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Organization } from '../../user/entities/organization.entity';

export enum BrandIndustry {
  TECHNOLOGY = 'technology',
  ECOMMERCE = 'ecommerce',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  FOOD = 'food',
  TRAVEL = 'travel',
  ENTERTAINMENT = 'entertainment',
  REAL_ESTATE = 'real_estate',
  AUTOMOTIVE = 'automotive',
  FASHION = 'fashion',
  SPORTS = 'sports',
  OTHER = 'other',
}

export enum BrandStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
}

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 100 })
  domain: string;

  @Column({ type: 'simple-enum', enum: BrandIndustry, default: BrandIndustry.OTHER })
  industry: BrandIndustry;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  logo: string;

  @Column({ type: 'simple-enum', enum: BrandStatus, default: BrandStatus.ACTIVE })
  status: BrandStatus;

  @Column({ type: 'json', nullable: true })
  seoData: {
    title?: string;
    description?: string;
    keywords?: string[];
    socialMedia?: {
      weibo?: string;
      wechat?: string;
      zhihu?: string;
      douyin?: string;
    };
  };

  @Column({ type: 'json', nullable: true })
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };

  @Column({ nullable: true })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
