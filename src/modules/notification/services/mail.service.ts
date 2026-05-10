import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import * as nodemailer from 'nodemailer';
import { LessThan } from 'typeorm';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

export interface EmailTemplateData {
  [key: string]: string | number | boolean | undefined;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  /**
   * 初始化邮件传输器
   */
  private async initTransporter(): Promise<void> {
    const provider = this.configService.get('MAIL_PROVIDER') || 'console';
    
    switch (provider) {
      case 'smtp':
        await this.initSMTPTransporter();
        break;
      case 'sendgrid':
        await this.initSendGridTransporter();
        break;
      case 'aliyun':
        await this.initAliyunTransporter();
        break;
      case 'console':
      default:
        this.logger.log('邮件服务配置为控制台模式，仅打印邮件内容');
        this.isConfigured = false;
        break;
    }
  }

  /**
   * SMTP传输器
   */
  private async initSMTPTransporter(): Promise<void> {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const secure = this.configService.get('SMTP_SECURE') === 'true';
    const user = this.configService.get('SMTP_USER');
    const password = this.configService.get('SMTP_PASSWORD');

    if (!host || !user || !password) {
      this.logger.warn('SMTP配置不完整，邮件功能不可用');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(port) || 587,
      secure,
      auth: {
        user,
        pass: password,
      },
    });

    this.isConfigured = true;
    this.logger.log('SMTP邮件服务已初始化');
  }

  /**
   * SendGrid传输器
   */
  private async initSendGridTransporter(): Promise<void> {
    const apiKey = this.configService.get('SENDGRID_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('SendGrid API密钥未配置');
      return;
    }

    // 使用SendGrid的SMTP中继
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: apiKey,
      },
    });

    this.isConfigured = true;
    this.logger.log('SendGrid邮件服务已初始化');
  }

  /**
   * 阿里云邮件传输器
   */
  private async initAliyunTransporter(): Promise<void> {
    const accessKeyId = this.configService.get('ALIYUN_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get('ALIYUN_ACCESS_KEY_SECRET');
    const region = this.configService.get('ALIYUN_REGION') || 'cn-hangzhou';

    if (!accessKeyId || !accessKeySecret) {
      this.logger.warn('阿里云邮件配置不完整');
      return;
    }

    // 阿里云邮件使用SMTP
    const host = this.configService.get('ALIYUN_MAIL_HOST') || 'smtp.mail.aliyuncs.com';
    
    this.transporter = nodemailer.createTransport({
      host,
      port: 465,
      secure: true,
      auth: {
        user: accessKeyId,
        pass: accessKeySecret,
      },
    });

    this.isConfigured = true;
    this.logger.log('阿里云邮件服务已初始化');
  }

  /**
   * 发送邮件
   */
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const from = options.from || this.configService.get('MAIL_FROM') || 'noreply@hiaeo.com';

    // 控制台模式
    if (!this.isConfigured || !this.transporter) {
      this.logger.log('========== 邮件内容 (开发模式) ==========');
      this.logger.log(`收件人: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      this.logger.log(`主题: ${options.subject}`);
      this.logger.log(`内容: ${options.html.substring(0, 200)}...`);
      this.logger.log('==========================================');
      return { success: true, messageId: 'console-' + Date.now() };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      this.logger.log(`邮件发送成功: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`邮件发送失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送模板邮件
   */
  async sendTemplate(
    to: string | string[],
    template: string,
    data: EmailTemplateData,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.renderTemplate(template, data);
    const subject = this.getSubjectFromTemplate(template, data);

    return this.send({
      to,
      subject,
      html,
    });
  }

  /**
   * 渲染邮件模板
   */
  private renderTemplate(template: string, data: EmailTemplateData): string {
    let html = this.templates[template] || template;
    
    Object.keys(data).forEach(key => {
      const value = data[key] || '';
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return html;
  }

  /**
   * 从模板获取主题
   */
  private getSubjectFromTemplate(template: string, data: EmailTemplateData): string {
    const subjects: Record<string, string> = {
      'welcome': '欢迎注册 Hiaeo - 开启GEO优化之旅',
      'password-reset': '重置您的 Hiaeo 密码',
      'email-verification': '验证您的 Hiaeo 邮箱',
      'subscription-renewal': '您的订阅即将续费',
      'subscription-expired': '您的订阅已过期',
      'diagnosis-complete': '品牌诊断报告已生成',
      'team-invitation': '您被邀请加入团队',
      'usage-alert': '用量提醒',
    };

    return subjects[template] || '来自 Hiaeo 的通知';
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendTemplate(email, 'welcome', {
      name,
      year: new Date().getFullYear(),
    });
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail(email: string, resetUrl: string, name: string): Promise<void> {
    await this.send({
      to: email,
      subject: '重置您的 Hiaeo 密码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>您好 ${name},</h2>
          <p>您请求重置密码，请点击下面的链接：</p>
          <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">重置密码</a></p>
          <p>或者复制以下链接到浏览器：</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>此链接将在1小时后过期。</p>
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">此邮件由 Hiaeo 系统自动发送</p>
        </div>
      `,
    });
  }

  /**
   * 发送邮箱验证邮件
   */
  async sendEmailVerification(email: string, verifyUrl: string, name: string): Promise<void> {
    await this.send({
      to: email,
      subject: '验证您的 Hiaeo 邮箱',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>您好 ${name},</h2>
          <p>感谢您注册 Hiaeo，请点击下面的链接验证您的邮箱：</p>
          <p><a href="${verifyUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">验证邮箱</a></p>
          <p>或者复制以下链接到浏览器：</p>
          <p style="word-break: break-all;">${verifyUrl}</p>
          <p>此链接将在24小时后过期。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">此邮件由 Hiaeo 系统自动发送</p>
        </div>
      `,
    });
  }

  /**
   * 发送订阅续费提醒
   */
  async sendRenewalReminder(email: string, name: string, expiryDate: string, renewalUrl: string): Promise<void> {
    await this.send({
      to: email,
      subject: '您的 Hiaeo 订阅即将续费',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>您好 ${name},</h2>
          <p>您的 Hiaeo 订阅将于 <strong>${expiryDate}</strong> 到期。</p>
          <p>为确保服务不中断，请及时续费：</p>
          <p><a href="${renewalUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">立即续费</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">此邮件由 Hiaeo 系统自动发送</p>
        </div>
      `,
    });
  }

  /**
   * 发送诊断报告完成通知
   */
  async sendDiagnosisComplete(email: string, name: string, brandName: string, reportUrl: string): Promise<void> {
    await this.send({
      to: email,
      subject: `品牌诊断报告已生成 - ${brandName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>您好 ${name},</h2>
          <p>您的品牌 <strong>${brandName}</strong> 的诊断报告已生成。</p>
          <p><a href="${reportUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">查看报告</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">此邮件由 Hiaeo 系统自动发送</p>
        </div>
      `,
    });
  }

  /**
   * 邮件模板
   */
  private templates: Record<string, string> = {
    welcome: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>欢迎加入 Hiaeo, {{name}}!</h2>
        <p>感谢您注册 Hiaeo，GEO优化平台。</p>
        <p>我们致力于帮助您提升品牌在AI搜索引擎中的可见度。</p>
        <p>立即开始探索：</p>
        <ul>
          <li>创建您的第一个品牌</li>
          <li>进行品牌诊断</li>
          <li>生成SEO优化内容</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">© {{year}} Hiaeo. All rights reserved.</p>
      </div>
    `,
    'password-reset': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>密码重置请求</h2>
        <p>您好 {{name}},</p>
        <p>我们收到了您的密码重置请求。如果不是您本人操作，请忽略此邮件。</p>
        <p>点击下面的链接重置密码：</p>
        <p><a href="{{resetUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">重置密码</a></p>
        <p>链接有效期：1小时</p>
      </div>
    `,
  };
}
