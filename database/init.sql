-- 组织表（租户）
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    type TEXT DEFAULT 'individual',
    tier TEXT DEFAULT 'free',
    description TEXT,
    logo TEXT,
    website TEXT,
    phone TEXT,
    address TEXT,
    user_count INTEGER DEFAULT 1,
    brand_count INTEGER DEFAULT 1,
    max_users INTEGER DEFAULT 1,
    max_brands INTEGER DEFAULT 1,
    settings TEXT DEFAULT '{}',
    trial_ends_at TEXT,
    subscription_ends_at TEXT,
    is_active INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 诊断任务表
CREATE TABLE IF NOT EXISTS diagnosis_tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    target_market TEXT,
    type TEXT DEFAULT 'full',
    status TEXT DEFAULT 'pending',
    ai_engine TEXT,
    progress INTEGER DEFAULT 0,
    config TEXT,
    report_id TEXT,
    error_message TEXT,
    started_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 诊断报告表
CREATE TABLE IF NOT EXISTS diagnosis_reports (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    overall_score REAL NOT NULL,
    grade TEXT DEFAULT 'fair',
    health_level INTEGER DEFAULT 0,
    dimension_scores TEXT NOT NULL,
    competitor_analysis TEXT,
    issues TEXT NOT NULL,
    suggestions TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    ai_insights TEXT,
    raw_ai_response TEXT,
    engines_used TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    order_id TEXT,
    status TEXT DEFAULT 'active',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    diagnosis_used INTEGER DEFAULT 0,
    diagnosis_limit INTEGER DEFAULT 10,
    auto_renew INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 积分表
CREATE TABLE IF NOT EXISTS credits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_consumed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 积分交易表
CREATE TABLE IF NOT EXISTS credit_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    source_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'completed',
    balance_before INTEGER,
    balance_after INTEGER,
    description TEXT,
    related_order_id TEXT,
    created_at TEXT NOT NULL
);

-- 套餐表
CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    billing_cycle TEXT DEFAULT 'monthly',
    features TEXT DEFAULT '{}',
    diagnosis_limit INTEGER DEFAULT 10,
    report_limit INTEGER DEFAULT 5,
    ai_engine_limit INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    channels TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    data TEXT,
    action_url TEXT,
    action_text TEXT,
    sent_at TEXT,
    error_message TEXT,
    read_at TEXT,
    created_at TEXT NOT NULL
);

-- 通知偏好表
CREATE TABLE IF NOT EXISTS notification_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email_enabled INTEGER DEFAULT 1,
    email_types TEXT,
    sms_enabled INTEGER DEFAULT 1,
    sms_types TEXT,
    quiet_hours_start TEXT DEFAULT '22:00',
    quiet_hours_end TEXT DEFAULT '08:00',
    quiet_hours_enabled INTEGER DEFAULT 0,
    marketing_enabled INTEGER DEFAULT 0,
    aggregation_mode TEXT DEFAULT 'realtime',
    updated_at TEXT NOT NULL
);

-- API Key表
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    secret TEXT NOT NULL,
    description TEXT,
    scopes TEXT,
    status TEXT DEFAULT 'active',
    rate_limit INTEGER DEFAULT 0,
    monthly_limit INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    expires_at TEXT,
    last_used_at TEXT,
    last_used_ip TEXT,
    is_production INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- API使用日志表
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id TEXT PRIMARY KEY,
    api_key_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time INTEGER,
    error_message TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL
);

-- 策略表
CREATE TABLE IF NOT EXISTS strategies (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'content',
    status TEXT DEFAULT 'draft',
    content TEXT NOT NULL,
    diagnosis_report_id TEXT,
    summary TEXT,
    target_keywords TEXT,
    target_channels TEXT,
    execution_progress INTEGER DEFAULT 0,
    metadata TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_no TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    package_name TEXT NOT NULL,
    amount REAL NOT NULL,
    original_amount REAL,
    discount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_time TEXT,
    transaction_id TEXT,
    remark TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    payment_no TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending',
    total_amount REAL NOT NULL,
    paid_amount REAL,
    refunded_amount REAL DEFAULT 0,
    payment_method TEXT,
    channel_transaction_id TEXT,
    paid_at TEXT,
    expire_at TEXT,
    channel_response TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 退款记录表
CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    payment_id TEXT,
    refund_no TEXT NOT NULL UNIQUE,
    refund_amount REAL NOT NULL,
    reason TEXT,
    admin_id TEXT,
    status TEXT DEFAULT 'pending',
    channel_refund_id TEXT,
    processed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 优惠券表
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    discount_type TEXT DEFAULT 'percentage',
    discount_value REAL NOT NULL,
    min_amount REAL DEFAULT 0,
    max_discount REAL,
    total_count INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    valid_from TEXT,
    valid_until TEXT,
    applicable_packages TEXT,
    applicable_users TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 用户优惠券表
CREATE TABLE IF NOT EXISTS user_coupons (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    coupon_id TEXT NOT NULL,
    order_id TEXT,
    status TEXT DEFAULT 'unused',
    used_at TEXT,
    created_at TEXT NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_strategies_brand_id ON strategies(brand_id);
CREATE INDEX IF NOT EXISTS idx_strategies_status ON strategies(status);
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
-- 邀请表
CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    inviter_id TEXT NOT NULL,
    invitee_id TEXT,
    code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending',
    reward_credits INTEGER DEFAULT 0,
    reward_discount REAL DEFAULT 0,
    referral_order_id TEXT,
    invited_at TEXT,
    completed_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_id ON invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(code);

-- 团队成员表
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    invited_by TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    permissions TEXT,
    expires_at TEXT,
    accepted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_members_organization_id ON team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
