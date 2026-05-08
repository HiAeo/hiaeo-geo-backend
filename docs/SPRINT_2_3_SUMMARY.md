# Sprint 2.3: 订阅与计费系统 - 完成总结

## 📅 Sprint 周期
- 开始日期：2026-05-08
- 完成日期：2026-05-08

---

## ✅ 完成的功能模块

### 1. 后端订阅管理系统 (T046)

#### 1.1 订阅实体 (`subscription.entity.ts`)
- 订阅状态管理：ACTIVE, EXPIRED, CANCELLED, SUSPENDED, PENDING
- 订阅类型：MONTHLY, YEARLY, LIFETIME
- 自动续费开关
- 订阅历史记录

#### 1.2 订阅服务 (`subscription.service.ts`)
核心功能：
- `createSubscription()` - 创建新订阅
- `upgradeSubscription()` - 升级订阅（计算差价）
- `renewSubscription()` - 续费订阅
- `cancelSubscription()` - 取消订阅（支持取消原因）
- `pauseSubscription()` - 暂停订阅
- `resumeSubscription()` - 恢复订阅
- `getCurrentSubscription()` - 获取当前订阅
- `getSubscriptionHistory()` - 获取订阅历史
- `setAutoRenew()` - 设置自动续费
- `checkAndExpireSubscriptions()` - 检查并处理过期订阅（定时任务）

#### 1.3 订阅控制器 (`subscription.controller.ts`)
RESTful API 端点：
- `GET /subscriptions/current` - 获取当前订阅
- `GET /subscriptions/history` - 获取订阅历史
- `POST /subscriptions` - 创建订阅
- `PUT /subscriptions/upgrade` - 升级订阅
- `PUT /subscriptions/renew` - 续费订阅
- `PUT /subscriptions/:id/cancel` - 取消订阅
- `PUT /subscriptions/:id/pause` - 暂停订阅
- `PUT /subscriptions/:id/resume` - 恢复订阅
- `PUT /subscriptions/:id/auto-renew` - 设置自动续费

---

### 2. 积分系统 (T048)

#### 2.1 积分实体 (`credit.entity.ts`)
- 积分账户（余额、累计获得、累计消费）
- 积分交易记录（类型、金额、描述）

#### 2.2 积分服务 (`credit.service.ts`)
核心功能：
- `getBalance()` - 获取积分余额
- `getInfo()` - 获取积分详情（余额、总获得、总消费）
- `earnCredits()` - 获得积分（支持来源类型）
- `consumeCredits()` - 消费积分
- `refundCredits()` - 退款积分
- `getTransactions()` - 获取交易记录（支持分页）

#### 2.3 积分控制器 (`credit.controller.ts`)
RESTful API 端点：
- `GET /credits/balance` - 获取余额
- `GET /credits/info` - 获取详情
- `GET /credits/transactions` - 获取交易记录

---

### 3. 订单管理系统 (T050)

#### 3.1 订单实体 (`order.entity.ts`)
- 订单状态：PENDING, PAID, CANCELLED, REFUNDED, EXPIRED
- 订单类型：NEW_SUBSCRIPTION, RENEWAL, UPGRADE, CREDIT_PURCHASE
- 支持优惠码

#### 3.2 订单服务 (`order.service.ts`)
核心功能：
- `createOrder()` - 创建订单
- `payOrder()` - 支付订单
- `cancelOrder()` - 取消订单
- `refundOrder()` - 申请退款
- `getOrderById()` - 获取订单详情
- `getOrderList()` - 获取订单列表（支持状态筛选）
- `getOrderStats()` - 获取订单统计

#### 3.3 订单控制器 (`order.controller.ts`)
RESTful API 端点：
- `GET /orders` - 获取订单列表
- `POST /orders` - 创建订单
- `GET /orders/:id` - 获取订单详情
- `POST /orders/:id/pay` - 发起支付
- `PUT /orders/:id/cancel` - 取消订单
- `PUT /orders/:id/refund` - 申请退款
- `POST /orders/coupon/validate` - 验证优惠券

---

### 4. 支付集成 (T049)

#### 4.1 支付实体 (`payment.entity.ts`)
- 支付记录（支付方式、状态、交易流水号）
- 退款记录（退款金额、退款原因、退款状态）

#### 4.2 支付服务 (`payment.service.ts`)
支持的支付方式：
- 支付宝（Alipay）
- 微信支付（WeChat Pay）

核心功能：
- `unifiedOrder()` - 统一收单交易
- `queryOrder()` - 查询订单
- `refund()` - 申请退款
- `handleAlipayCallback()` - 支付宝回调处理
- `handleWechatCallback()` - 微信支付回调处理

#### 4.3 优惠券实体 (`coupon.entity.ts`)
- 优惠券（码、名称、折扣类型、折扣值、有效期）
- 用户优惠券（领取状态、使用状态）

#### 4.4 优惠券服务 (`coupon.service.ts`)
核心功能：
- `validateCoupon()` - 验证优惠券
- `calculateDiscount()` - 计算折扣
- `redeemCoupon()` - 兑换优惠券
- `useCoupon()` - 使用优惠券
- `getAvailableCoupons()` - 获取可用优惠券

---

### 5. 前端实现 (T047)

#### 5.1 API 层 (`useApi.js`)
新增 API 方法：
- `getPlans()` - 获取套餐列表
- `getPlanById()` - 获取套餐详情
- `getCurrentSubscription()` - 获取当前订阅
- `createSubscription()` - 创建订阅
- `upgradeSubscription()` - 升级订阅
- `cancelSubscription()` - 取消订阅
- `renewSubscription()` - 续费订阅
- `getSubscriptionHistory()` - 获取订阅历史
- `setAutoRenew()` - 设置自动续费
- `getCreditsBalance()` - 获取积分余额
- `getCreditsInfo()` - 获取积分详情
- `getCreditsTransactions()` - 获取积分交易记录
- `createOrder()` - 创建订单
- `getOrderList()` - 获取订单列表
- `getOrderDetail()` - 获取订单详情
- `payOrder()` - 支付订单
- `cancelOrder()` - 取消订单
- `refundOrder()` - 申请退款
- `getRefundList()` - 获取退款记录
- `validateCoupon()` - 验证优惠券
- `getMyCoupons()` - 获取我的优惠券
- `initiatePayment()` - 发起支付
- `queryPaymentStatus()` - 查询支付状态

#### 5.2 积分页面 (`CreditsPage.vue`)
功能：
- 积分余额展示
- 积分统计（总获得、总消费）
- 交易记录列表（获取/消费）
- 获取积分引导

#### 5.3 订单页面 (`OrdersPage.vue`)
功能：
- 订单列表展示
- 订单状态筛选
- 订单详情查看
- 退款申请
- 退款记录查看

#### 5.4 路由配置
- `/app/credits` - 积分管理页面
- `/app/orders` - 订单管理页面

#### 5.5 侧边栏导航
新增导航项：
- 订单管理 - OrdersIcon

---

## 📊 数据库变更

### subscription 模块
```sql
-- Subscription 表已存在
-- 需要执行迁移添加字段：
ALTER TABLE subscription ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500);
ALTER TABLE subscription ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;
```

### credits 模块
```sql
-- Credit 表
CREATE TABLE credit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_earned DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_consumed DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit Transaction 表
CREATE TABLE credit_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'earn', 'consume', 'refund'
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255),
  source_type VARCHAR(50), -- 'subscription', 'purchase', 'diagnosis', 'refund'
  source_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### order 模块
```sql
-- Payment 表
CREATE TABLE payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  payment_method VARCHAR(20) NOT NULL, -- 'alipay', 'wechat'
  payment_no VARCHAR(100) UNIQUE,
  trade_no VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'pending', 'success', 'failed', 'refunded'
  raw_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refund 表
CREATE TABLE refund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  refund_no VARCHAR(100) UNIQUE,
  refund_amount DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(500),
  status VARCHAR(20) NOT NULL, -- 'pending', 'processing', 'completed', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Coupon 表
CREATE TABLE coupon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  total_count INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Coupon 表
CREATE TABLE user_coupon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coupon_id UUID NOT NULL,
  order_id UUID,
  status VARCHAR(20) NOT NULL, -- 'unused', 'used', 'expired'
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP
);
```

---

## 🔧 环境配置

### 支付宝配置
```bash
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=alipay_public_key
ALIPAY_NOTIFY_URL=https://your-domain.com/api/orders/callback/alipay
```

### 微信支付配置
```bash
WECHAT_APP_ID=your_app_id
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_KEY=your_api_key
WECHAT_NOTIFY_URL=https://your-domain.com/api/orders/callback/wechat
```

---

## 📝 待办事项

### 生产环境部署前
1. ✅ 支付接口正式签约
2. ⬜ 优惠券批量创建脚本
3. ⬜ 订阅过期定时任务配置（CronJob）
4. ⬜ 退款审批流程
5. ⬜ 发票开具功能

### 可选功能
1. ⬜ 积分兑换礼品
2. ⬜ 推荐返利
3. ⬜ 企业团购
4. ⬜ 多币种支持

---

## 🧪 测试计划

### 单元测试
- [ ] SubscriptionService 单元测试
- [ ] CreditService 单元测试
- [ ] OrderService 单元测试
- [ ] PaymentService 单元测试

### 集成测试
- [ ] 完整订阅流程测试
- [ ] 支付回调测试
- [ ] 退款流程测试

### E2E 测试
- [ ] 用户订阅完整流程
- [ ] 支付失败重试
- [ ] 退款申请审批

---

## 📞 技术支持

如有问题，请联系：
- 技术负责人：[待定]
- 产品负责人：[待定]

---

*文档生成时间：2026-05-08*
