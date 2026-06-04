import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('knowledge_versions')
@Index(['organizationId', 'version'], { unique: true })
export class KnowledgeVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'json' })
  basicInfo: any;

  @Column({ type: 'json' })
  bizPositioning: any;

  @Column({ type: 'json' })
  productService: any;

  @Column({ type: 'json' })
  competitorMarket: any;

  @Column({ type: 'json' })
  geoGoals: any;

  @Column({ type: 'json' })
  supplement: any;

  @Column({ type: 'json', nullable: true })
  fileIndex: any;

  @Column({ type: 'text', nullable: true })
  versionRemark: string;

  @Column({ type: 'text', nullable: true })
  changedFields: string;

  @Column({ type: 'float', nullable: true })
  diagnosisScore: number;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
