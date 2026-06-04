/**
 * Vercel Serverless Entry Point for NestJS
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: any = null;

async function createApp() {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    transform: true,
    forbidNonWhitelisted: false,
  }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const url = new URL(req.url || '/', `https://${req.headers.host}`);
    const pathname = url.pathname;

    // 健康检查
    if (pathname === '/api/health') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // 跳过 Swagger 文档请求
    if (pathname.startsWith('/api/docs') || pathname === '/api/docs-json') {
      return res.status(404).json({ message: 'Swagger not available' });
    }

    const app = await createApp();
    const httpAdapter = app.getHttpAdapter();
    const expressApp = httpAdapter.getInstance();

    // 处理请求
    await new Promise<void>((resolve, reject) => {
      const mockReq = {
        ...req,
        path: pathname,
        url: req.url,
        originalUrl: req.url,
        query: Object.fromEntries(url.searchParams),
        params: {},
        body: req.body || {},
        headers: req.headers,
        method: req.method,
        get: (name: string) => req.headers[name.toLowerCase()],
        header: (name: string) => req.headers[name.toLowerCase()],
      };

      expressApp(mockReq, res, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

  } catch (error: any) {
    console.error('Handler Error:', error);
    res.statusCode = error.status || 500;
    res.json({ message: error.message || 'Internal Server Error' });
  }
}
