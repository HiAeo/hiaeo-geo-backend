import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';

// 使用 any 类型简化 socket.io 类型问题
type AuthSocket = any;

/** WebSocket 事件 */
export const WS_EVENTS = {
  // 工作流事件
  WORKFLOW_STATE_UPDATE: 'workflow:state_update',
  WORKFLOW_STAGE_CHANGE: 'workflow:stage_change',
  WORKFLOW_PROGRESS: 'workflow:progress',
  
  // Agent 事件
  AGENT_MESSAGE: 'agent:message',
  AGENT_CHAIN_START: 'agent:chain_start',
  AGENT_CHAIN_PROGRESS: 'agent:chain_progress',
  AGENT_CHAIN_COMPLETE: 'agent:chain_complete',
  
  // 诊断事件
  DIAGNOSIS_START: 'diagnosis:start',
  DIAGNOSIS_PROGRESS: 'diagnosis:progress',
  DIAGNOSIS_COMPLETE: 'diagnosis:complete',
  
  // 策略事件
  STRATEGY_GENERATE: 'strategy:generate',
  STRATEGY_PROGRESS: 'strategy:progress',
  STRATEGY_COMPLETE: 'strategy:complete',
  
  // 内容事件
  CONTENT_GENERATE: 'content:generate',
  CONTENT_PROGRESS: 'content:progress',
  CONTENT_COMPLETE: 'content:complete',
  
  // 通知事件
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  
  // 系统事件
  SYSTEM_ALERT: 'system:alert',
  HEALTH_STATUS: 'health:status',
} as const;

/**
 * WebSocket 网关
 * 提供实时通信能力
 */
@WebSocketGateway({
  cors: {
    origin: '*', // 生产环境应该限制
    credentials: true,
  },
  namespace: '/ws',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients: Map<string, AuthSocket> = new Map();

  constructor(private eventEmitter: EventEmitter2) {
    // 监听内部事件并转发到 WebSocket
    this.setupEventListeners();
  }

  /**
   * 客户端连接
   */
  handleConnection(client: AuthSocket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`客户端连接: ${client.id}`);
    
    // 发送欢迎消息
    client.emit('connected', {
      success: true,
      clientId: client.id,
      message: '已连接到 WebSocket 服务',
    });
  }

  /**
   * 客户端断开
   */
  handleDisconnect(client: AuthSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`客户端断开: ${client.id}`);
    
    // 离开所有房间
    if (client.rooms) {
      client.rooms.forEach((room: string) => {
        if (room !== client.id) {
          client.leave(room);
        }
      });
    }
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners() {
    // 工作流状态更新
    this.eventEmitter.on('workflow.state.update', (data: {
      brandId: string;
      module: string;
      state: string;
    }) => {
      this.emitToBrand(data.brandId, WS_EVENTS.WORKFLOW_STATE_UPDATE, data);
    });

    // Agent 消息
    this.eventEmitter.on('agent.message', (data: {
      sessionId: string;
      message: string;
    }) => {
      this.emitToAgentSession(data.sessionId, WS_EVENTS.AGENT_MESSAGE, data);
    });

    // 诊断完成
    this.eventEmitter.on('diagnosis.complete', (data: {
      brandId: string;
      reportId: string;
    }) => {
      this.emitToBrand(data.brandId, WS_EVENTS.DIAGNOSIS_COMPLETE, data);
    });

    // 新通知
    this.eventEmitter.on('notification.new', (data: {
      brandId: string;
      notification: any;
    }) => {
      this.emitToBrand(data.brandId, WS_EVENTS.NOTIFICATION_NEW, data);
    });
  }

  // ==================== 消息处理 ====================

  /**
   * 订阅品牌房间
   */
  @SubscribeMessage('subscribe:brand')
  handleSubscribeBrand(
    @MessageBody() data: { brandId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    client.join(`brand:${data.brandId}`);
    client.brandId = data.brandId;
    this.logger.log(`客户端 ${client.id} 订阅品牌 ${data.brandId}`);
    
    return { success: true, room: `brand:${data.brandId}` };
  }

  /**
   * 取消订阅品牌房间
   */
  @SubscribeMessage('unsubscribe:brand')
  handleUnsubscribeBrand(
    @MessageBody() data: { brandId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    client.leave(`brand:${data.brandId}`);
    this.logger.log(`客户端 ${client.id} 取消订阅品牌 ${data.brandId}`);
    
    return { success: true };
  }

  /**
   * 订阅 Agent 会话
   */
  @SubscribeMessage('subscribe:agent')
  handleSubscribeAgent(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    client.join(`agent:${data.sessionId}`);
    this.logger.log(`客户端 ${client.id} 订阅 Agent 会话 ${data.sessionId}`);
    
    return { success: true, room: `agent:${data.sessionId}` };
  }

  /**
   * Ping-Pong 心跳
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthSocket) {
    client.emit('pong', { timestamp: Date.now() });
    return { success: true };
  }

  // ==================== 广播方法 ====================

  /**
   * 向品牌房间发送消息
   */
  emitToBrand(brandId: string, event: string, data: any) {
    this.server.to(`brand:${brandId}`).emit(event, data);
    this.logger.debug(`推送消息到品牌 ${brandId}: ${event}`);
  }

  /**
   * 向 Agent 会话发送消息
   */
  emitToAgentSession(sessionId: string, event: string, data: any) {
    this.server.to(`agent:${sessionId}`).emit(event, data);
  }

  /**
   * 广播到所有连接
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  /**
   * 推送工作流状态更新
   */
  pushWorkflowState(brandId: string, module: string, state: string, data?: any) {
    this.emitToBrand(brandId, WS_EVENTS.WORKFLOW_STATE_UPDATE, {
      module,
      state,
      ...data,
    });
  }

  /**
   * 推送诊断进度
   */
  pushDiagnosisProgress(brandId: string, progress: number, message?: string) {
    this.emitToBrand(brandId, WS_EVENTS.DIAGNOSIS_PROGRESS, {
      progress,
      message,
    });
  }

  /**
   * 推送策略生成进度
   */
  pushStrategyProgress(brandId: string, progress: number, message?: string) {
    this.emitToBrand(brandId, WS_EVENTS.STRATEGY_PROGRESS, {
      progress,
      message,
    });
  }

  /**
   * 推送内容生成进度
   */
  pushContentProgress(brandId: string, progress: number, contentId?: string) {
    this.emitToBrand(brandId, WS_EVENTS.CONTENT_PROGRESS, {
      progress,
      contentId,
    });
  }

  /**
   * 发送系统告警
   */
  sendSystemAlert(brandId: string, level: 'info' | 'warning' | 'error', message: string) {
    this.emitToBrand(brandId, WS_EVENTS.SYSTEM_ALERT, {
      level,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 获取连接统计
   */
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      clients: Array.from(this.connectedClients.entries()).map(([id, client]) => ({
        id,
        userId: client.userId,
        brandId: client.brandId,
        rooms: client.rooms ? Array.from(client.rooms) : [],
      })),
    };
  }
}
