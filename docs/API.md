# HIAEO Backend API Documentation

## Overview

HIAEO Backend 是一个智能品牌健康度分析平台的后端服务，提供 AI 驱动的品牌诊断、策略生成、内容发布等功能。

## Quick Start

### Development

```bash
npm install
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

### Docker

```bash
docker-compose up -d
```

## API Endpoints

### Health

```
GET /health
```

### AI Engines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ai/engines | List available AI engines |
| POST | /api/ai/diagnosis | Run brand diagnosis |
| POST | /api/ai/strategy | Generate brand strategy |
| POST | /api/ai/content | Generate content |
| POST | /api/ai/semantic | Search semantic knowledge |

### Brand Diagnosis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/diagnosis/:brandId | Get brand diagnosis |
| POST | /api/diagnosis | Create diagnosis |
| GET | /api/diagnosis/:brandId/report | Get diagnosis report |
| POST | /api/diagnosis/:brandId/analyze | Analyze brand health |

### Brand Strategy

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/strategy/:brandId | Get brand strategies |
| POST | /api/strategy | Create strategy |
| PUT | /api/strategy/:id | Update strategy |
| DELETE | /api/strategy/:id | Delete strategy |
| POST | /api/strategy/:id/execute | Execute strategy |

### Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/content | List content items |
| POST | /api/content | Create content |
| GET | /api/content/:id | Get content |
| PUT | /api/content/:id | Update content |
| DELETE | /api/content/:id | Delete content |
| POST | /api/content/:id/audit | Audit content |

### Publish

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/publish/:contentId | Get publish status |
| POST | /api/publish/:contentId/copy | Copy to clipboard |
| POST | /api/publish/:contentId/download | Download content |
| POST | /api/publish/:contentId/cms | Push to CMS |
| POST | /api/publish/webhook | Register webhook |

### Semantic Knowledge

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/semantic/brands | List brands |
| GET | /api/semantic/categories | List categories |
| GET | /api/semantic/terms | List terms |
| GET | /api/semantic/terms/:id | Get term |
| POST | /api/semantic/terms | Create term |
| PUT | /api/semantic/terms/:id | Update term |
| DELETE | /api/semantic/terms/:id | Delete term |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List users |
| POST | /api/users | Create user |
| GET | /api/users/:id | Get user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/organizations | List organizations |
| POST | /api/organizations | Create organization |
| GET | /api/organizations/:id | Get organization |
| PUT | /api/organizations/:id | Update organization |
| DELETE | /api/organizations/:id | Delete organization |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/audit-logs | List audit logs |
| GET | /api/audit-logs/:id | Get audit log |

### API Keys

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/keys | List API keys |
| POST | /api/keys | Create API key |
| GET | /api/keys/:id | Get API key |
| PUT | /api/keys/:id | Update API key |
| DELETE | /api/keys/:id | Delete API key |
| GET | /api/keys/:id/stats | Get API key stats |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/billing/invoices | List invoices |
| POST | /api/billing/invoices | Create invoice |
| GET | /api/billing/invoices/:id | Get invoice |
| GET | /api/billing/summary | Get billing summary |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | List notifications |
| POST | /api/notifications | Send notification |
| PUT | /api/notifications/:id/read | Mark as read |
| PUT | /api/notifications/read-all | Mark all as read |
| GET | /api/notifications/preferences | Get preferences |
| PUT | /api/notifications/preferences | Update preferences |

## Authentication

### API Key

Include your API key in the request header:

```
X-API-Key: your-api-key
```

### Signature (Optional)

For enhanced security, use signature authentication:

```
X-API-Key: your-api-key
X-Timestamp: 1234567890
X-Signature: sha256-signature
```

## Rate Limits

| Plan | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free | 10 | 100 |
| Pro | 100 | 10,000 |
| Enterprise | 1,000 | 100,000 |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## Response Format

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

## Examples

### Brand Diagnosis

```bash
curl -X POST http://localhost:3000/api/ai/diagnosis \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "brandName": "Example Brand",
    "industry": "tech",
    "products": ["Product A", "Product B"],
    "competitors": ["Competitor X"]
  }'
```

### Content Generation

```bash
curl -X POST http://localhost:3000/api/ai/content \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "brandId": "brand-uuid",
    "type": "faq",
    "product": "Product A",
    "tone": "professional"
  }'
```

## Support

For support, please contact support@hiaeo.com
