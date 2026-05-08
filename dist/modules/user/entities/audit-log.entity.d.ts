export declare class AuditLog {
    id: string;
    organizationId: string;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    resourceId: string;
    details: Record<string, any>;
    before: Record<string, any>;
    after: Record<string, any>;
    ip: string;
    userAgent: string;
    location: string;
    isSensitive: boolean;
    result: 'success' | 'failure';
    errorMessage: string;
    createdAt: Date;
    static getActionDescription(action: string, resource: string): string;
}
