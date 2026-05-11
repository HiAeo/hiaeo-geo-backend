/**
 * Vercel Serverless API Handler
 * 支持 Vercel 无服务器环境，兼容前端登录功能
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// 简单的用户存储（Vercel 环境下的内存存储）
interface User {
  id: string;
  email: string;
  password: string;
  nickname: string;
  createdAt: string;
}

const users: Map<string, User> = new Map();

// 生成随机ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 简单的密码验证（生产环境请使用 bcrypt）
function verifyPassword(password: string, hash: string): boolean {
  return password === hash;
}

// 生成 JWT token（简化版，生产环境请使用 jsonwebtoken）
function generateToken(userId: string): string {
  const payload = { sub: userId, iat: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 验证 token（简化版）
function verifyToken(token: string): { sub: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.iat && Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) {
      return null; // 过期
    }
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

// CORS 头部
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  const path = req.url || '';
  
  // 移除查询参数获取路径
  const urlPath = path.split('?')[0];
  
  // 路由匹配
  try {
    // 登录
    if (urlPath === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ message: '邮箱和密码不能为空' });
      }

      // 查找用户
      let foundUser: User | undefined;
      users.forEach(user => {
        if (user.email === email) foundUser = user;
      });

      // 如果用户不存在，创建一个测试用户（演示用）
      if (!foundUser) {
        foundUser = {
          id: generateId(),
          email,
          password, // 简化：直接存储密码明文（仅用于演示）
          nickname: email.split('@')[0],
          createdAt: new Date().toISOString()
        };
        users.set(foundUser.id, foundUser);
      }

      // 验证密码
      if (!verifyPassword(password, foundUser.password)) {
        return res.status(401).json({ message: '邮箱或密码错误' });
      }

      // 生成 token
      const accessToken = generateToken(foundUser.id);
      const refreshToken = generateToken(foundUser.id + '_refresh');

      return res.status(200).json({
        accessToken,
        refreshToken,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          nickname: foundUser.nickname,
          createdAt: foundUser.createdAt
        }
      });
    }

    // 注册
    if (urlPath === '/api/auth/register' && req.method === 'POST') {
      const { email, password, nickname } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ message: '邮箱和密码不能为空' });
      }

      // 检查用户是否存在
      let exists = false;
      users.forEach(user => {
        if (user.email === email) exists = true;
      });

      if (exists) {
        return res.status(409).json({ message: '该邮箱已被注册' });
      }

      // 创建用户
      const newUser: User = {
        id: generateId(),
        email,
        password, // 简化：直接存储密码明文（仅用于演示）
        nickname: nickname || email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      users.set(newUser.id, newUser);

      // 生成 token
      const accessToken = generateToken(newUser.id);
      const refreshToken = generateToken(newUser.id + '_refresh');

      return res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          nickname: newUser.nickname,
          createdAt: newUser.createdAt
        }
      });
    }

    // 获取用户信息
    if (urlPath === '/api/auth/profile' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '未授权，请先登录' });
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      if (!payload) {
        return res.status(401).json({ message: 'Token 已过期' });
      }

      const user = users.get(payload.sub);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      return res.status(200).json({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt
      });
    }

    // 刷新 Token
    if (urlPath === '/api/auth/refresh' && req.method === 'POST') {
      const { refreshToken } = req.body || {};
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'refreshToken 不能为空' });
      }

      const payload = verifyToken(refreshToken);
      if (!payload) {
        return res.status(401).json({ message: 'refreshToken 已过期' });
      }

      const userId = payload.sub.replace('_refresh', '');
      const newAccessToken = generateToken(userId);
      const newRefreshToken = generateToken(userId + '_refresh');

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    }

    // Token 验证端点
    if (urlPath === '/api/auth/verify' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false });
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      return res.status(200).json({ valid: !!payload });
    }

    // 健康检查
    if (urlPath === '/api/health' || urlPath === '/api') {
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Vercel API Server is running'
      });
    }

    // 默认返回 404
    return res.status(404).json({ message: 'API 端点不存在' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
