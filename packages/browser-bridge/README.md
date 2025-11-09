# Browser Bridge

## 概述 (Overview)

一個跨瀏覽器的通用連接層，支援多種通信技術，使 AI 和網頁應用可以通過不同管道控制 nanobrowser。

A universal cross-browser connection layer supporting multiple communication technologies, enabling AI and web applications to control nanobrowser through different channels.

## 支援的連接方式 (Supported Connection Methods)

### 1. **WebSocket Bridge** (Web Socket 橋接)
- 支援遠端 LLM/AI 應用程式連接
- 雙向即時通信
- 支援多個客户端並發

### 2. **MessagePort Bridge** (消息端口橋接)
- 支援 Web Worker 和 Service Worker
- 支援 iframe 間通信
- 零延遲本地通信

### 3. **SharedWorker Bridge** (共享工作線程橋接)
- 支援多標籤頁面間共享連接
- 跨標籤頁面控制

### 4. **Chrome Extension API** (Chrome 擴充功能 API)
- 原生 Chrome 消息傳遞
- 支援內容腳本、背景页面通信

## 架構設計 (Architecture)

```
┌─────────────────────────────────────────────────────┐
│          Nanobrowser Core Runtime                   │
│  (Chrome Extension / Node.js 環境)                  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────────┬─────────────┐
        │                     │              │             │
┌───────▼────────┐  ┌────────▼────────┐  ┌──▼───────────┐ │
│  WebSocket     │  │  MessagePort    │  │ SharedWorker │ │
│  Bridge        │  │  Bridge         │  │  Bridge      │ │
│                │  │                 │  │              │ │
│ • Server Init  │  │ • Port Transfer │  │ • Worker Mgr │ │
│ • Auth Layer   │  │ • Frame Routes  │  │ • Tab Sync   │ │
│ • Serializer   │  │ • Worker Comm   │  │ • State Sync │ │
└─────────────────┘  └─────────────────┘  └──────────────┘ │
                                                             │
┌─────────────────────────────────────────────────────┐    │
│       Unified Connection Protocol Layer              │    │
│                                                     │────┘
│  • Message Router                                  │
│  • Request/Response Handler                        │
│  • Error Recovery & Retry Logic                    │
│  • Connection State Management                     │
│  • Multi-channel Multiplexing                      │
└─────────────────────────────────────────────────────┘

```

## 使用方式 (Usage)

詳見各子模組文檔。
