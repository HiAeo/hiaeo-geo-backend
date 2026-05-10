# HIAEO Backend

智能品牌健康度分析平台后端服务

## 🚀 Features

- 🤖 **AI 驱动的品牌诊断** - 支持 DeepSeek、Kimi、Qwen、豆包、智谱、文心等6大AI引擎
- 📊 **品牌健康度分析** - 多维度评估品牌健康状态
- 📝 **智能策略生成** - AI 生成品牌策略建议
- ✍️ **内容自动生成** - 模豆、FAQ、产品文案等
- 📤 **一键发布** - 支持复制、下载、CMS推送、Webhook
- 👥 **多用户管理** - 租户隔离、角色权限、审计日志
- 🔐 **API 网关** - API Key、签名认证、频率限制
- 💳 **支付系统** - 发票管理、企业汇款
- 🔔 **通知系统** - 邮件、短信、站内信

## 📦 Modules

| Module | Description |
|--------|-------------|
| `ai` | AI 引擎适配层 |
| `diagnosis` | 品牌诊断服务 |
| `strategy` | 策略生成服务 |
| `content` | 内容管理 |
| `publish` | 发布服务 |
| `semantic` | 语义知识库 |
| `user` | 用户管理系统 |
| `api-gateway` | API 网关 |
| `billing` | 支付系统 |
| `notification` | 通知系统 |
| `i18n` | 多语言国际化支持 |

## 🛠 Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Redis
- **ORM**: TypeORM
- **AI**: DeepSeek / Kimi / Qwen / 豆包 / 智谱 / 文心
- **API**: RESTful API
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Docker

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hiaeo-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migration:run

# Seed initial data (optional)
npm run seed

# Start development server
npm run start:dev
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t hiaeo-backend .
docker run -p 3000:3000 --env-file .env hiaeo-backend
```

### Environment Variables

Create a `.env` file:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=hiaeo

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# AI Engines
DEEPSEEK_API_KEY=
KIMI_API_KEY=
QWEN_API_KEY=
DOUBAO_API_KEY=
ZHIPU_API_KEY=
ERNIE_API_KEY=

# Email (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# SMS (Optional)
SMS_PROVIDER=aliyun
SMS_ACCESS_KEY=
SMS_SECRET_KEY=
```

## 📚 API Documentation

Once the server is running, visit:

- Swagger UI: http://localhost:3000/api/docs
- API Markdown: ./docs/API.md

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
├── common/           # Shared utilities
│   ├── decorators/   # Custom decorators
│   ├── filters/      # Exception filters
│   ├── guards/       # Route guards
│   ├── interceptors/ # Interceptors
│   └── pipes/        # Validation pipes
├── database/         # Database migrations & seeds
├── modules/          # Feature modules
│   ├── ai/           # AI integration
│   ├── diagnosis/    # Brand diagnosis
│   ├── strategy/     # Strategy generation
│   ├── content/      # Content management
│   ├── publish/      # Publish service
│   ├── semantic/     # Semantic knowledge base
│   ├── user/         # User management
│   ├── api-gateway/  # API gateway
│   ├── billing/      # Billing system
│   └── notification/ # Notification system
├── main.ts          # Application entry point
└── app.module.ts     # Root module
```

## 🔒 Security

### Authentication

- JWT-based authentication
- API Key authentication for external access
- Optional signature verification

### Authorization

- Role-based access control (RBAC)
- 5 predefined roles: Super Admin, Org Admin, Brand Admin, Editor, Viewer
- Permission-based guards

### Rate Limiting

| Plan | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free | 10 | 100 |
| Pro | 100 | 10,000 |
| Enterprise | 1,000 | 100,000 |

## 🌐 Deployment

### Kubernetes

Use the provided Helm chart:

```bash
helm install hiaeo ./deploy/helm
```

### Docker Swarm

```bash
docker stack deploy -c docker-compose.yml hiaeo
```

### Manual

```bash
# Build
npm run build

# Run
npm run start:prod
```

## 📈 Monitoring

- Health check: `GET /health`
- Terminus health indicators
- Structured logging

## 🌏 Internationalization (i18n)

### Supported Languages

- `zh-CN` - 简体中文 (Simplified Chinese)
- `en-US` - English

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/i18n/locales` | Get supported languages list |
| GET | `/api/v1/i18n/:locale` | Get language pack |
| POST | `/api/v1/i18n/translate` | Translate text |
| POST | `/api/v1/i18n/set-locale` | Set user locale preference |

### Translation Files

```
src/i18n/
├── zh-CN/
│   ├── common.json    (Common translations)
│   ├── knowledge.json (Knowledge base)
│   ├── workflow.json  (Workflow)
│   └── errors.json    (Error messages)
└── en-US/
    ├── common.json
    ├── knowledge.json
    ├── workflow.json
    └── errors.json
```

### Usage Example

```bash
# Get locales
curl -X GET http://localhost:3000/api/v1/i18n/locales -H "Authorization: Bearer <token>"

# Get translations
curl -X GET http://localhost:3000/api/v1/i18n/zh-CN -H "Authorization: Bearer <token>"

# Translate text
curl -X POST http://localhost:3000/api/v1/i18n/translate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "knowledge.title", "locale": "zh-CN"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

UNLICENSED - Private

## 🆘 Support

For support, please contact: support@hiaeo.com
