import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PackageType {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  TRIAL = 'trial',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum PackageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  features: string;

  @Column({ type: 'simple-enum', enum: PackageType, default: PackageType.BASIC })
  type: PackageType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ name: 'billing_cycle', type: 'simple-enum', enum: BillingCycle, default: BillingCycle.MONTHLY })
  billingCycle: BillingCycle;

  @Column({ name: 'billing_cycles', type: 'json', default: '[]' })
  billingCycles: Array<{
    cycle: BillingCycle;
    price: number;
    discount?: number;
  }>;

  @Column({ name: 'diagnosis_limit', default: 10 })
  diagnosisLimit: number;

  @Column({ name: 'report_limit', default: 5 })
  reportLimit: number;

  @Column({ name: 'ai_engine_limit', default: 1 })
  aiEngineLimit: number;

  @Column({ name: 'content_limit', default: 100 })
  contentLimit: number;

  @Column({ name: 'brand_limit', default: 1 })
  brandLimit: number;

  @Column({ name: 'team_member_limit', default: 1 })
  teamMemberLimit: number;

  @Column({ name: 'api_access', type: 'boolean', default: false })
  apiAccess: boolean;

  @Column({ name: 'priority_support', type: 'boolean', default: false })
  prioritySupport: boolean;

  @Column({ name: 'custom_branding', type: 'boolean', default: false })
  customBranding: boolean;

  @Column({ type: 'simple-enum', enum: PackageStatus, default: PackageStatus.ACTIVE })
  status: PackageStatus;

  @Column({ name: 'is_trial', type: 'boolean', default: false })
  isTrial: boolean;

  @Column({ name: 'trial_days', default: 0 })
  trialDays: number;

  @Column({ name: 'is_recommended', type: 'boolean', default: false })
  isRecommended: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * 解析features JSON
   */
  getFeaturesList(): string[] {
    try {
      return JSON.parse(this.features || '[]');
    } catch {
      return [];
    }
  }

  /**
   * 获取计费周期价格
   */
  getPriceForCycle(cycle: BillingCycle): number {
    if (this.billingCycle === cycle) {
      return Number(this.price);
    }
    const cycles = typeof this.billingCycles === 'string' 
      ? JSON.parse(this.billingCycles) 
      : this.billingCycles;
    const cycleConfig = cycles?.find((c: any) => c.cycle === cycle);
    return cycleConfig?.price || Number(this.price);
  }
}
