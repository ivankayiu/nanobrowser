import { Message, MessageResponse, ConnectionState, ConnectionConfig, ConnectionStrategy } from './types';

/**
 * WebSocket Bridge Implementation - 实際不套 WebSocket 連接
 * 可以拚接自婥 AI 一及網頁應用程序
 */
export class WebSocketBridge implements ConnectionStrategy {
  name = 'WebSocket';
  priority = 10;

  private ws: WebSocket | null = null;
  private url: string;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private listeners: Map<string, Set<Function>> = new Map();
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private config: ConnectionConfig = {};
  private retryCount = 0;
  private maxRetries = 5;
  private retryDelay = 1000;

  constructor(url: string = 'ws://localhost:8080') {
    this.url = url;
  }

  /**
   * 棄帳這個連接是否有效
   */
  available(): boolean {
    return typeof WebSocket !== 'undefined';
  }

  /**
   * 連接到 WebSocket 伺兓器或遠端 AI
   */
  async connect(config?: ConnectionConfig): Promise<void> {
    if (this.state === ConnectionState.CONNECTED) {
      return;
    }

    this.config = { ...this.config, ...config };
    this.state = ConnectionState.CONNECTING;
    this.emit('connecting', { state: this.state });

    try {
      return new Promise((resolve, reject) => {
        this.ws = new WebSocket(this.url);

        const timeout = setTimeout(() => {
          this.ws?.close();
          reject(new Error('連接超時'));
        }, this.config.timeout || 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.state = ConnectionState.CONNECTED;
          this.retryCount = 0;
          this.emit('connected', { state: this.state });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: Message = JSON.parse(event.data);
            this.emit('message', message);
            
            // 對應資料符濯
            const handler = this.messageHandlers.get(message.id);
            if (handler) {
              handler(message);
              this.messageHandlers.delete(message.id);
            }
          } catch (error) {
            console.error('消息解析錯誤:', error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          this.state = ConnectionState.ERROR;
          this.emit('error', { error, state: this.state });
          reject(error);
        };

        this.ws.onclose = () => {
          this.state = ConnectionState.DISCONNECTED;
          this.emit('disconnected', { state: this.state });
          
          // 自動重新連接
          if (this.config.autoReconnect && this.retryCount < (this.config.maxRetries || this.maxRetries)) {
            this.retryCount++;
            const delay = (this.config.retryDelay || this.retryDelay) * this.retryCount;
            setTimeout(() => {
              this.connect(config);
            }, delay);
          }
        };
      });
    } catch (error) {
      this.state = ConnectionState.ERROR;
      throw error;
    }
  }

  /**
   * 斷開 WebSocket 連接
   */
  async disconnect(): Promise<void> {
    this.state = ConnectionState.DISCONNECTING;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state = ConnectionState.DISCONNECTED;
  }

  /**
   * 發送訊息到 AI 或網頁
   */
  async send(message: Message): Promise<MessageResponse> {
    if (this.state !== ConnectionState.CONNECTED || !this.ws) {
      throw new Error('沒有連接');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(message.id);
        reject(new Error('發送超時'));
      }, this.config.timeout || 10000);

      this.messageHandlers.set(message.id, (response: MessageResponse) => {
        clearTimeout(timeout);
        resolve(response);
      });

      try {
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        this.messageHandlers.delete(message.id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * 皣聽事件
   */
  on(event: string, handler: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  /**
   * 取消皣聽
   */
  off(event: string, handler: (data: any) => void): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 發逃事件
   */
  private emit(event: string, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`事件處理器錯誤 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 取得當前連接狀態
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * 棄帳是否已連接
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }
}

/**
 * 例程: 連接到 Claude.ai 或其他 AI 服務
 */
export async function connectToAI(aiUrl: string = 'ws://localhost:8080'): Promise<WebSocketBridge> {
  const bridge = new WebSocketBridge(aiUrl);
  
  await bridge.connect({
    timeout: 10000,
    maxRetries: 5,
    retryDelay: 2000,
    autoReconnect: true,
  });

  return bridge;
}

/**
 * 例程: 發送文本到 AI 並取得回覆
 */
export async function sendMessageToAI(bridge: WebSocketBridge, text: string): Promise<string> {
  const response = await bridge.send({
    id: `msg-${Date.now()}-${Math.random()}`,
    type: 'chat_message',
    action: 'send_message',
    data: { text },
    timestamp: Date.now(),
  });

  if (response.success && response.result) {
    return response.result.reply || '';
  }
  throw new Error(response.error || '取得 AI 回覆失敗');
}
