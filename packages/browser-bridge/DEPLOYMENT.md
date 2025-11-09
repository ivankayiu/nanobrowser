# Nanobrowser Browser Bridge 部署指南

## 概述

上合頻拓了一個統一的跨瀏覽器連接層，讓 AI 和使用者都能輕鬆操控網頁。**無需 API 金鑰，也不需要複雜設定**。

## 部署步驟

| 檔案 | 用途 |
|————|—————|
| `nanobrowser-adapter.ts` | 直接整合 nanobrowser 現有功能的適配器 |
| `websocket-bridge.ts` | WebSocket 連接實現 |
| `types.ts` | 統一的接口|
| `README.md` | 架構設計檔 |

## 暫時 - 使用方法

### 1. 在 Chrome Extension 中使用

```typescript
import { initNanobrowserControl } from '@nanobrowser/browser-bridge';

// 在 content script 中初始化
const adapter = await initNanobrowserControl();

// 現在 AI 和使用者都能直接使用
window.nanobrowser.navigate('https://claude.ai');
await window.nanobrowser.wait(2000);
await window.nanobrowser.type('[name="prompt"]', '你好');
await window.nanobrowser.click('button[type="submit"]');
```

### 2. AI 直接控制

AI 可以直接使用：

```typescript
// 找到元素
const element = await window.nanobrowser.query('.chat-message');
console.log(element.text); // 取得文字

// 執行任意 JS
const result = await window.nanobrowser.execute('document.title');

```javascript
// 截圖
const screenshot = await window.nanobrowser.screenshot();
```

## 核心功能

| 功能 | 描述 |
|———|———|
| `navigate(url)` | 開啟指定網頁 |
| `click(selector)` | 點擊指定元素 |
| `type(selector, text)` | 輸入指定元素 |
| `screenshot()` |截圖 |
| `getContent()` | 取得頁面文字 |
| `execute(script)` | 執行任意 JavaScript |
| `wait(duration)` | 等待指定時間 |
| `query(selector)` | 查詢 DOM 元素 |

## 互相操控模式

### 一次控制

```typescript
// 使用者主動操控
const adapter = new NanobrowserAdapter();
await adapter.send('navigate', { url: 'https://example.com' });
```

### AI 控制

```typescript
// AI 可以直接使用 window.nanobrowser API
// 不需要任何 LLM API 金鑰
await window.nanobrowser.click('button.search');
```

### 互助操控

```typescript
// AI 及使用者一起齐參數
const userInput = await window.nanobrowser.query('input');
if (userInput.text.length > 0) {
  console.log('AI 及使用者一起操控中...');
}
```

## 機演

### 無需 API 配置

連接層直接利用現有 Chrome Extension 消息機制進行互通。

### 無需 WebSocket 設定

統一直接使用 nanobrowser 的消息系統。

### 無需設定檔

一切皆為簡潔明瞭。

## 粗粗事項

1. **直接接取** nanobrowser 現有功能，無需設計新機程序。
2. **AI 直接使用**，無需 API 元件。
3. **使用者也能直接使用**，烏冬操控。
4. **操控**，等待使用者帵覧或 AI 決宮作像。

## 青休鎮客

### 用戶主動操作

```typescript
// 用戶可以自己點擊
(window as any).nanobrowser.click(‹ .button ›);
```

### AI 自主学习操作

```typescript
// AI 不需要手動操作，直接使用
function executeAction(action, data) {
  return (window as any).nanobrowser[action](data);
}
```

## 子成效

特剩細節的第一錶：

- 無需外部伺務器
- 無需 API 金鑰
- 無需複雜設定
- 直接接取現有功能
