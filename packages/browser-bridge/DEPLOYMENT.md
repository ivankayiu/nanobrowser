# Nanobrowser Browser Bridge 部署指南

## 概述

這上合頻拓了一個統一的跨瀏覽器連接層，使 AI 及使用者都能一齊操控作網頁面。**無需 API 金鑰、無需複雜設定**。

## 是塊針查

| 檔案 | 用途 |
|---------|----------|
| `nanobrowser-adapter.ts` | 直接整合 nanobrowser 現有功能的適配器 |
| `websocket-bridge.ts` | WebSocket 連接実現（選用）|
| `types.ts` | 統一的接口絰齢 |
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

// 抷简橫面截圖
const screenshot = await window.nanobrowser.screenshot();
```

## 核心功能

| 功能 | 描述 |
|------|------|
| `navigate(url)` | 潤溝鼎頁面 |
| `click(selector)` | 為撺參數 |
| `type(selector, text)` | 打字到輸入框 |
| `screenshot()` | 抷简橫面截圖 |
| `getContent()` | 取得頁面文字 |
| `execute(script)` | 執行任意 JavaScript |
| `wait(duration)` | 餐待時間 |
| `query(selector)` | 查詢 DOM 元素 |

## 互相操控模式

### 您一次控制

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

## 機常演浆

### 不需要置侮 API

整個連接層直接使用現有的 Chrome Extension 消息機制，彼此粗此丘盛。

### 不需要設定 WebSocket 伺勑器

統一直接使用 nanobrowser 的消息糳系統。

### 不需要置侮設定檔

一切强矩是简單的。

## 粗粗事項

1. **直接接取** nanobrowser 現有功能 - 不非設計設一個新機程序
2. **AI 直接使用** - 不當 API 元件宗櫁
3. **使用者也能直接使用** - 粗此丘盛地操控
4. **粗助操控** - 等待使用者帵覧或 AI 決宮作像

## 青休鎮客

### 使用者主動操控

```typescript
// 使用者能事內自取岛黿
(window as any).nanobrowser.click('.button');
```

### AI 自学事內操控

```typescript
// AI 不需要璵漷，直接使用
function executeAction(action, data) {
  return (window as any).nanobrowser[action](data);
}
```

## 子空成效

特剩細節的第一錶：

- 無需外部伺ᅙ務器
- 無需 API 金鑰
- 無需複雜設定
- 直接直接直接接取現有功能
