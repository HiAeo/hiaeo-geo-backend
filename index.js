/**
 * Vercel Serverless API Handler
 * 简化版认证 API
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

// 简单的用户存储
const users = new Map();
let userIdCounter = 1;

function generateToken(userId) {
  const payload = { sub: userId, iat: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = (req, res) => {
  // CORS
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const path = (req.url || '').split('?')[0];

  try {
    // 健康检查
    if (path === '/api/health') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // 登录
    if (path === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ message: '邮箱和密码不能为空' });
      }

      // 查找或创建用户
      let user = null;
      for (const u of users.values()) {
        if (u.email === email) { user = u; break; }
      }

      if (!user) {
        user = {
          id: `user_${userIdCounter++}`,
          email,
          password,
          nickname: email.split('@')[0],
          createdAt: new Date().toISOString()
        };
        users.set(user.id, user);
      }

      if (user.password !== password) {
        return res.status(401).json({ message: '邮箱或密码错误' });
      }

      return res.status(200).json({
        accessToken: generateToken(user.id),
        refreshToken: generateToken(user.id + '_refresh'),
        user: { id: user.id, email: user.email, nickname: user.nickname, createdAt: user.createdAt }
      });
    }

    // 注册
    if (path === '/api/auth/register' && req.method === 'POST') {
      const { email, password, nickname } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ message: '邮箱和密码不能为空' });
      }

      for (const u of users.values()) {
        if (u.email === email) {
          return res.status(409).json({ message: '该邮箱已被注册' });
        }
      }

      const user = {
        id: `user_${userIdCounter++}`,
        email,
        password,
        nickname: nickname || email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      users.set(user.id, user);

      return res.status(201).json({
        accessToken: generateToken(user.id),
        refreshToken: generateToken(user.id + '_refresh'),
        user: { id: user.id, email: user.email, nickname: user.nickname, createdAt: user.createdAt }
      });
    }

    // 获取用户信息
    if (path === '/api/auth/profile' && req.method === 'GET') {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      if (!token) return res.status(401).json({ message: '未授权' });
      
      const payload = verifyToken(token);
      if (!payload) return res.status(401).json({ message: 'Token已过期' });
      
      const user = users.get(payload.sub);
      if (!user) return res.status(404).json({ message: '用户不存在' });
      
      return res.status(200).json({ id: user.id, email: user.email, nickname: user.nickname, createdAt: user.createdAt });
    }

    // 刷新Token
    if (path === '/api/auth/refresh' && req.method === 'POST') {
      const { refreshToken } = req.body || {};
      if (!refreshToken) return res.status(400).json({ message: 'refreshToken不能为空' });
      
      const payload = verifyToken(refreshToken);
      if (!payload) return res.status(401).json({ message: 'refreshToken已过期' });
      
      const userId = payload.sub.replace('_refresh', '');
      return res.status(200).json({
        accessToken: generateToken(userId),
        refreshToken: generateToken(userId + '_refresh')
      });
    }

    // Token验证
    if (path === '/api/auth/verify' && req.method === 'GET') {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      return res.status(200).json({ valid: verifyToken(token) !== null });
    }

    return res.status(404).json({ message: 'API端点不存在' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
};
