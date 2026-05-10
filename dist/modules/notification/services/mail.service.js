"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../config/config.service");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = null;
        this.isConfigured = false;
        this.templates = {
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
        this.initTransporter();
    }
    async initTransporter() {
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
    async initSMTPTransporter() {
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
    async initSendGridTransporter() {
        const apiKey = this.configService.get('SENDGRID_API_KEY');
        if (!apiKey) {
            this.logger.warn('SendGrid API密钥未配置');
            return;
        }
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
    async initAliyunTransporter() {
        const accessKeyId = this.configService.get('ALIYUN_ACCESS_KEY_ID');
        const accessKeySecret = this.configService.get('ALIYUN_ACCESS_KEY_SECRET');
        const region = this.configService.get('ALIYUN_REGION') || 'cn-hangzhou';
        if (!accessKeyId || !accessKeySecret) {
            this.logger.warn('阿里云邮件配置不完整');
            return;
        }
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
    async send(options) {
        const from = options.from || this.configService.get('MAIL_FROM') || 'noreply@hiaeo.com';
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
        }
        catch (error) {
            this.logger.error(`邮件发送失败: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async sendTemplate(to, template, data) {
        const html = this.renderTemplate(template, data);
        const subject = this.getSubjectFromTemplate(template, data);
        return this.send({
            to,
            subject,
            html,
        });
    }
    renderTemplate(template, data) {
        let html = this.templates[template] || template;
        Object.keys(data).forEach(key => {
            const value = data[key] || '';
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
        return html;
    }
    getSubjectFromTemplate(template, data) {
        const subjects = {
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
    async sendWelcomeEmail(email, name) {
        await this.sendTemplate(email, 'welcome', {
            name,
            year: new Date().getFullYear(),
        });
    }
    async sendPasswordResetEmail(email, resetUrl, name) {
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
    async sendEmailVerification(email, verifyUrl, name) {
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
    async sendRenewalReminder(email, name, expiryDate, renewalUrl) {
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
    async sendDiagnosisComplete(email, name, brandName, reportUrl) {
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
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map