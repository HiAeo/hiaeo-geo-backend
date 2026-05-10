import { IsOptional, IsObject, IsString, ValidateNested, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 获取知识库响应DTO
 */
export class GetKnowledgeBaseDto {
  id: string;
  organizationId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  basicInfo?: any;
  bizPositioning?: any;
  productService?: any;
  competitorMarket?: any;
  geoGoals?: any;
  fileIndex?: any;
  supplement?: any;
  lastDiagnosisRefresh?: Date;
}

/**
 * 更新知识库请求DTO
 */
export class UpdateKnowledgeBaseDto {
  @IsOptional()
  @IsObject()
  basicInfo?: any;

  @IsOptional()
  @IsObject()
  bizPositioning?: any;

  @IsOptional()
  @IsObject()
  productService?: any;

  @IsOptional()
  @IsObject()
  competitorMarket?: any;

  @IsOptional()
  @IsObject()
  geoGoals?: any;

  @IsOptional()
  @IsObject()
  supplement?: any;
}

/**
 * 创建知识库请求DTO
 */
export class CreateKnowledgeBaseDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsObject()
  basicInfo?: any;

  @IsOptional()
  @IsObject()
  bizPositioning?: any;

  @IsOptional()
  @IsObject()
  productService?: any;

  @IsOptional()
  @IsObject()
  geoGoals?: any;
}

/**
 * 文件上传响应DTO
 */
export class FileUploadResponseDto {
  fileId: string;
  url: string;
  status: 'uploaded' | 'processing' | 'error';
  fileName: string;
  fileSize: number;
}

/**
 * 版本历史DTO
 */
export class KnowledgeVersionDto {
  version: number;
  updatedAt: Date;
  changedFields: string[];
  versionRemark?: string;
}

/**
 * AI智能建议请求DTO
 */
export class AiSuggestDto {
  @IsString()
  field: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  sourceText?: string;
}

/**
 * AI智能建议响应DTO
 */
export class AiSuggestResponseDto {
  suggestion: string;
  confidence: number;
  matchedFields: string[];
}

// ========== Phase 3: AI 联动 DTO ==========

/**
 * 增强的字段建议请求DTO
 */
export class EnhancedFieldSuggestionDto {
  @IsString()
  field: string;

  @IsOptional()
  @IsString()
  context?: string;
}

/**
 * 增强的字段建议响应DTO
 */
export class EnhancedSuggestionResponseDto {
  suggestion: string;
  confidence: number;
  tips: string[];
  examples: string[];
}

/**
 * URL信息提取请求DTO
 */
export class ExtractFromUrlDto {
  @IsString()
  url: string;

  @IsString()
  targetField: string;
}

/**
 * URL信息提取响应DTO
 */
export class ExtractFromUrlResponseDto {
  extracted: string;
  confidence: number;
  source: string;
  suggestion: string;
}

/**
 * 文本信息提取请求DTO
 */
export class ExtractFromTextDto {
  @IsString()
  text: string;

  @IsString({ each: true })
  targetFields: string[];
}

/**
 * 文本信息提取响应DTO
 */
export class ExtractFromTextResponseDto {
  results: Record<string, {
    extracted: string;
    confidence: number;
  }>;
  summary: string;
}

/**
 * 知识库完整度报告响应DTO
 */
export class CompletenessReportDto {
  overall: number;
  critical: number;
  sections: {
    name: string;
    score: number;
    status: 'good' | 'warning' | 'critical';
    suggestions: string[];
  }[];
  recommendations: string[];
}

/**
 * 关键词建议响应DTO
 */
export class KeywordSuggestionDto {
  primary: string[];
  secondary: string[];
  longTail: string[];
  competition: 'high' | 'medium' | 'low';
}

/**
 * 增量诊断触发请求DTO
 */
export class IncrementalDiagnosisTriggerDto {
  @IsOptional()
  @IsString({ each: true })
  changedFields?: string[];
}

/**
 * 增量诊断触发响应DTO
 */
export class IncrementalDiagnosisResponseDto {
  shouldTrigger: boolean;
  reason: string;
  taskId?: string;
}

/**
 * 手动触发诊断请求DTO
 */
export class ManualTriggerDiagnosisDto {
  @IsOptional()
  @IsString({ each: true })
  dimensions?: string[];
}

/**
 * 诊断建议查询DTO
 */
export class DiagnosisSuggestionDto {
  shouldSuggest: boolean;
  reason?: string;
  lastDiagnosisAge?: number;
}

/**
 * 语义搜索请求DTO
 */
export class SemanticSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsInt()
  topK?: number;
}

/**
 * 语义搜索响应DTO
 */
export class SemanticSearchResponseDto {
  results: {
    section: string;
    similarity: number;
    text: string;
  }[];
}

/**
 * 向量索引状态DTO
 */
export class VectorIndexStatusDto {
  indexed: boolean;
  sections: string[];
  updatedAt?: Date;
}

/**
 * 相似知识库DTO
 */
export class SimilarKnowledgeBaseDto {
  organizationId: string;
  similarity: number;
}
