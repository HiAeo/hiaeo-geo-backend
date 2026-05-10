import { ConfigService } from '../../../config/config.service';
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
export declare class MailService {
    private configService;
    private readonly logger;
    private transporter;
    private isConfigured;
    constructor(configService: ConfigService);
    private initTransporter;
    private initSMTPTransporter;
    private initSendGridTransporter;
    private initAliyunTransporter;
    send(options: EmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendTemplate(to: string | string[], template: string, data: EmailTemplateData): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    private renderTemplate;
    private getSubjectFromTemplate;
    sendWelcomeEmail(email: string, name: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetUrl: string, name: string): Promise<void>;
    sendEmailVerification(email: string, verifyUrl: string, name: string): Promise<void>;
    sendRenewalReminder(email: string, name: string, expiryDate: string, renewalUrl: string): Promise<void>;
    sendDiagnosisComplete(email: string, name: string, brandName: string, reportUrl: string): Promise<void>;
    private templates;
}
