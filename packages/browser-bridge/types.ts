/**
 * Nanobrowser Browser Bridge - 連接方式类型定义
 * Cross-browser connection layer type definitions
 */

/** 訊息類母 - 所有通信的基礎類母 */
export interface BaseMessage {
  /** 消息 ID */
  id: string;
  /** 消息類別 */
  type: string;
  /** 消息資料 */
  data?: any;
  /** 時戳 */
  timestamp: number;
  /** 可選 - 作業 程序 ID */
  sessionId?: string;
}

/** 訊息藥 - 譠求/回應統一格式 */
export interface Message extends BaseMessage {
  /** 動作名稱 */
  action: string;
  /** 客户端 ID */
  clientId?: string;
}

/** 訊息回應 - 可選 */
export interface MessageResponse extends BaseMessage {
  /** 是否成功 */
  success: boolean;
  /** 錯誤訊息 */
  error?: string;
  /** 回應資料 */
  result?: any;
}

/** 連接狀況 */
export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

/** 連接配置 */
export interface ConnectionConfig {
  /** 連接超時（毫秒）*/
  timeout?: number;
  /** 重試次數 */
  maxRetries?: number;
  /** 重試延遲（毫秒）*/
  retryDelay?: number;
  /** 是否自動重新連接 */
  autoReconnect?: boolean;
}

/** 連接策略 */
export interface ConnectionStrategy {
  /** 連接名稱 */
  name: string;
  /** 是否可用 */
  available: () => boolean;
  /** 优先級（低値優先）*/
  priority: number;
  /** 初始化 */
  connect(config?: ConnectionConfig): Promise<void>;
  /** 斷開 */
  disconnect(): Promise<void>;
  /** 種子 */
  send(message: Message): Promise<MessageResponse>;
  /** 收聽 */
  on(event: string, handler: (data: any) => void): void;
}

/** 优化可用連接下最优的咡畳策略 */
export interface SelectionStrategy {
  /** 選列一個最適合的連接策略 */
  selectBest(strategies: ConnectionStrategy[]): ConnectionStrategy;
}

/** 橋接流程 */
export interface BridgeConfig extends ConnectionConfig {
  /** 橋接名稱 */
  bridgeName?: string;
  /** 設定選擇策略 */
  selectionStrategy?: SelectionStrategy;
}
