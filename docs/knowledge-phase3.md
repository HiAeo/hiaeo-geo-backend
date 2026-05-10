# Phase 3: AI 联动功能

## 概述

Phase 3 在 Phase 1-2 的基础上实现了知识库的 AI 智能联动功能，包括向量数据库集成、增强的 AI 建议、增量诊断触发等能力。

## 实现的功能

### 1. 向量数据库集成

**文件**: `hiaeo-backend/src/modules/knowledge/services/embedding.service.ts`

- **向量生成**: 使用 AI 服务生成文本向量嵌入（1536维）
- **知识库向量化**: 将知识库的各个模块内容转换为向量表示
- **相似度计算**: 实现余弦相似度算法
- **语义搜索**: 支持在向量空间中进行语义搜索
- **降级方案**: 当 AI 服务不可用时，使用模拟向量（基于文本哈希生成）

### 2. 向量存储服务

**文件**: `hiaeo-backend/src/modules/knowledge/services/vector-storage.service.ts`

- **索引管理**: 为组织创建和管理向量索引
- **语义搜索**: 基于向量相似度的语义搜索功能
- **相似知识库发现**: 查找与当前知识库相似的其他知识库
- **批量索引**: 支持批量构建向量索引
- **存储统计**: 监控向量存储的使用情况

### 3. 增量诊断触发

**文件**: `hiaeo-backend/src/modules/knowledge/services/incremental-diagnosis-trigger.service.ts`

- **变更检测**: 分析知识库变更的显著性
- **自动触发**: 当关键字段发生重要变更时自动触发增量诊断
- **手动触发**: 提供手动触发增量诊断的接口
- **诊断建议**: 智能判断是否需要建议用户进行诊断
- **完整度分析**: 计算知识库各模块的填写完整度

### 4. 增强的 AI 智能建议

**文件**: `hiaeo-backend/src/modules/knowledge/services/enhanced-ai-suggestion.service.ts`

- **上下文感知建议**: 基于知识库上下文提供个性化建议
- **URL 信息提取**: 从指定 URL 自动提取相关信息
- **文本信息提取**: 从文本内容中提取关键信息
- **完整度报告**: 生成知识库完整度评估报告
- **关键词建议**: 基于知识库内容推荐 GEO 关键词

### 5. API 端点（12个新端点）

#### AI 建议类
- `POST /api/v1/knowledge/ai-suggest/field` - 增强字段建议
- `POST /api/v1/knowledge/ai-extract/url` - 从 URL 提取信息
- `POST /api/v1/knowledge/ai-extract/text` - 从文本提取信息
- `GET /api/v1/knowledge/completeness` - 知识库完整度报告
- `GET /api/v1/knowledge/keywords` - 关键词建议

#### 诊断触发类
- `GET /api/v1/knowledge/diagnosis-suggest` - 诊断建议查询
- `POST /api/v1/knowledge/diagnosis-trigger` - 手动触发诊断

#### 向量检索类
- `POST /api/v1/knowledge/search` - 语义搜索
- `POST /api/v1/knowledge/index` - 重建向量索引
- `GET /api/v1/knowledge/index` - 获取索引状态
- `GET /api/v1/knowledge/similar` - 查找相似知识库

### 6. 前端 AI 诊断面板

**文件**: `hiaeo-geo-frontend/src/components/pages/AIDiagnosisPanel.vue`

独立组件，提供以下功能：
- 知识库完整度可视化展示
- 关键词标签展示（核心词、次要词）
- 诊断建议提示
- 语义搜索功能
- 向量索引状态显示
- 一键触发增量诊断

## 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    前端 (Vue3)                       │
│  ┌─────────────────┐  ┌────────────────────────────┐│
│  │  KnowledgePage  │  │    AIDiagnosisPanel       ││
│  └────────┬────────┘  └──────────┬───────────────┘│
│           │                       │                 │
└───────────┼───────────────────────┼─────────────────┘
            │                       │
            └───────┬───────────────┘
                    │ /api/v1/knowledge/*
                    ▼
┌─────────────────────────────────────────────────────┐
│                 后端 (NestJS)                       │
│  ┌─────────────────────────────────────────────┐   │
│  │           KnowledgeController               │   │
│  └──────────┬───────────┬───────────┬─────────┘   │
│             │           │           │             │
│  ┌──────────┴───┐ ┌─────┴────┐ ┌────┴─────────┐   │
│  │KnowledgeService│ │EnhancedAI│ │Incremental  │   │
│  │               │ │Suggestion│ │Diagnosis    │   │
│  └───────────────┘ │Service   │ │TriggerSvc   │   │
│                     └───────────┘ └─────────────┘   │
│                            │                       │
│  ┌─────────────┐  ┌───────┴──────┐  ┌────────────┐│
│  │ EmbeddingSvc│  │VectorStorage │  │DiagnosisSvc ││
│  │             │  │Service       │  │(from module)││
│  └──────┬──────┘  └───────┬──────┘  └──────┬─────┘│
│         │                  │                │      │
└─────────┼──────────────────┼────────────────┼──────┘
          │                  │                │
          ▼                  ▼                ▼
┌─────────────────┐  ┌─────────────┐  ┌──────────────┐
│   AI Service   │  │ VectorStore │  │   Database   │
│  (DeepSeek等)   │  │  (Memory)   │  │  (MySQL)     │
└─────────────────┘  └─────────────┘  └──────────────┘
```

## 数据库变更

### BrandKnowledgeBase 实体增强

新增字段：
- `lastDiagnosisRefresh`: Date - 上次增量诊断时间（已有）
- 向量索引字段（计划中）

### 依赖关系

- **KnowledgeModule** → **AiModule**: 使用 AI 服务生成向量和建议
- **KnowledgeModule** → **DiagnosisModule**: 创建增量诊断任务
- **IncrementalDiagnosisTriggerService**: 
  - 监听知识库变更
  - 调用 DiagnosisTaskService 创建任务
  - 调用 EmbeddingService 进行向量化

## 使用场景

### 场景1: 智能预填
用户输入官网 URL → 系统自动提取信息 → 智能填充到表单

### 场景2: 增量诊断
用户修改核心业务描述 → 系统检测到重要变更 → 自动触发增量诊断

### 场景3: 语义搜索
用户搜索"我们的产品优势" → 系统在知识库中查找相关内容 → 返回匹配结果

### 场景4: 相似知识库参考
系统找到相似品牌的知识库 → 提供参考借鉴

## 配置说明

### AI 服务配置
在 `config.yaml` 中配置 AI 引擎：
```yaml
ai:
  default_engine: deepseek
  engines:
    deepseek:
      api_key: xxx
      endpoint: https://api.deepseek.com
```

### 向量维度
- 默认维度: 1536 (text-embedding-3-small 标准)
- 可在 EmbeddingService.EMBEDDING_DIMENSIONS 中调整

### 诊断触发阈值
- 变更显著性阈值: 0.3 (30%)
- 在 IncrementalDiagnosisTriggerService.SIGNIFICANCE_THRESHOLD 中配置

## 后续优化建议

1. **向量数据库**: 当前使用内存存储，生产环境建议使用 Milvus、Pinecone 或 Qdrant
2. **异步处理**: 索引构建和诊断任务建议使用消息队列异步处理
3. **缓存优化**: 热门知识库的向量结果添加 Redis 缓存
4. **监控告警**: 添加向量生成失败、诊断任务超时的监控
5. **API 限流**: 对 AI 相关接口添加限流保护
