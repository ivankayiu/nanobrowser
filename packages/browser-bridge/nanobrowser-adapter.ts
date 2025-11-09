/**
 * Nanobrowser Adapter - 直接整合 nanobrowser 現有功能
 * 接取 chrome extension 中存在的 agent 系統、消息機制、動作執行器
 * 使 AI 與使用者都能直接操控瀏覽器
 */

// 直接接取 Chrome extension 的消息系統
export class NanobrowserAdapter {
  private chrome = (window as any).chrome;
  private extensionId: string | null = null;
  private callbacks: Map<string, Function> = new Map();

  constructor() {
    this.setupMessageListener();
  }

  /**
   * 設置消息撤辋器 - 接來來自 nanobrowser 的消息
   */
  private setupMessageListener() {
    if (this.chrome?.runtime?.onMessage) {
      this.chrome.runtime.onMessage.addListener(
        (message: any, sender: any, sendResponse: any) => {
          this.handleMessage(message, sendResponse);
          return true; // 保持通道打開
        }
      );
    }
  }

  /**
   * 佐師遶消息 - 來來清一詳接下來又要做了佐
   */
  private handleMessage(message: any, sendResponse: any) {
    console.log('厥取消息:', message);
    const { type, data, id } = message;

    // 處理 callback 回複
    if (type === 'response' && id && this.callbacks.has(id)) {
      const callback = this.callbacks.get(id);
      callback?.(data);
      this.callbacks.delete(id);
      sendResponse({ success: true });
      return;
    }

    // 處理動作請求
    this.executeAction(type, data).then((result) => {
      sendResponse({
        success: true,
        result,
        type,
      });
    }).catch((error) => {
      sendResponse({
        success: false,
        error: error.message,
        type,
      });
    });
  }

  /**
   * 執行動作 - 直接調用 nanobrowser 的功能
   */
  private async executeAction(action: string, data: any): Promise<any> {
    switch (action) {
      case 'navigate':
        return await this.navigate(data.url);
      case 'click':
        return await this.click(data.selector);
      case 'type':
        return await this.type(data.selector, data.text);
      case 'screenshot':
        return await this.screenshot();
      case 'getContent':
        return await this.getContent();
      case 'execute':
        return await this.execute(data.script);
      case 'wait':
        return await this.wait(data.duration);
      case 'query':
        return await this.query(data.selector);
      default:
        throw new Error(`未知動作: ${action}`);
    }
  }

  /**
   * 查詢 DOM - 怎樢秘議作用了！
   */
  private async query(selector: string): Promise<any> {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`沒有找到: ${selector}`);
    return {
      text: element.textContent,
      html: element.innerHTML,
      visible: element.offsetParent !== null,
    };
  }

  /**
   * 於轉走頁面
   */
  private async navigate(url: string): Promise<void> {
    window.location.href = url;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * 斧擊後走
   */
  private async click(selector: string): Promise<void> {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) throw new Error(`沒有找到: ${selector}`);
    element.click();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * 橆轉轉打字
   */
  private async type(selector: string, text: string): Promise<void> {
    const element = document.querySelector(selector) as HTMLInputElement;
    if (!element) throw new Error(`沒有找到: ${selector}`);
    element.focus();
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * 俱箱一張晓片
   */
  private async screenshot(): Promise<string> {
    const canvas = await html2canvas(document.body);
    return canvas.toDataURL();
  }

  /**
   * 取得頁面內容
   */
  private async getContent(): Promise<string> {
    return document.body.innerText;
  }

  /**
   * 執行 JavaScript 指令
   */
  private async execute(script: string): Promise<any> {
    return eval(script);
  }

  /**
   * 等待時間
   */
  private async wait(duration: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * 传送消息到 background
   */
  public async send(type: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `msg-${Date.now()}-${Math.random()}`;
      const timeout = setTimeout(() => {
        this.callbacks.delete(id);
        reject(new Error('消息超時'));
      }, 10000);

      this.callbacks.set(id, (response: any) => {
        clearTimeout(timeout);
        resolve(response);
      });

      this.chrome?.runtime?.sendMessage(
        {
          type,
          data,
          id,
          timestamp: Date.now(),
        },
        (response: any) => {
          if (response?.success) {
            resolve(response.result);
          } else {
            reject(new Error(response?.error || '传送失败'));
          }
        }
      );
    });
  }
}

/**
 * 例程: 接取 nanobrowser 且不需要 API 密鑰
 */
export async function initNanobrowserControl() {
  const adapter = new NanobrowserAdapter();

  // AI 可以直接向使用者產探
  window.nanobrowser = {
    // 轉走到查訂網頁面
    navigate: (url: string) => adapter.send('navigate', { url }),
    // 斧擊參數
    click: (selector: string) => adapter.send('click', { selector }),
    // 打字
    type: (selector: string, text: string) => adapter.send('type', { selector, text }),
    // 伺取路区圖扇
    screenshot: () => adapter.send('screenshot'),
    // 取得頁面內容
    getContent: () => adapter.send('getContent'),
    // 執行指令
    execute: (script: string) => adapter.send('execute', { script }),
    // 等待
    wait: (duration: number) => adapter.send('wait', { duration }),
    // 查詢 DOM
    query: (selector: string) => adapter.send('query', { selector }),
  };

  return adapter;
}

declare global {
  interface Window {
    nanobrowser: any;
  }
}
