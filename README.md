<div align="center">
  <h1>🕵️ react-native-requests-inspector</h1>
  <p><b>High-performance, zero-native-dependency In-App Network Inspector for React Native (0.70 – 0.84+)</b></p>
  <p><i>Inspired by the popular Flutter library <a href="https://github.com/tuan1996v2/requests_inspector">requests_inspector</a> by <b>tuan1996v2</b>.</i></p>

  <p>
    <a href="https://github.com/tuan1996v2/react-native-requests-inspector/stargazers"><img src="https://img.shields.io/github/stars/tuan1996v2/react-native-requests-inspector?style=for-the-badge&color=blue" alt="Stars"></a>
    <a href="https://github.com/tuan1996v2/react-native-requests-inspector/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"></a>
    <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React%20Native-0.70%2B-61DAFB.svg?style=for-the-badge&logo=react" alt="React Native"></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  </p>
</div>

---

## 🤖 1-Prompt Integration (Dành cho AI ở dự án mới)

> **Mẹo:** Khi bắt đầu một dự án React Native mới (0.70 – 0.84+, JS thuần hoặc TypeScript), bạn chỉ cần copy nguyên câu prompt dưới đây và dán vào ô chat cho AI (**Cursor, Antigravity, Claude Code, Copilot, ChatGPT**):

```text
Tích hợp thư viện react-native-requests-inspector từ git https://github.com/tuan1996v2/react-native-requests-inspector.git vào dự án này:
1. Cài đặt package qua yarn/npm: yarn add https://github.com/tuan1996v2/react-native-requests-inspector.git (không cần cài thêm thư viện native hay pod install).
2. Bọc component gốc trong App.tsx (hoặc App.jsx) với <RequestsInspector enabled={__DEV__} interceptGlobalNetwork={__DEV__}>...</RequestsInspector> để tự động bắt toàn bộ fetch, Axios, apisauce mà không làm remount app.
3. (Tuỳ chọn) Truyền thêm redactKeys={['password', 'Authorization']} nếu cần che dữ liệu nhạy cảm, hoặc dùng showFloatingButton={false} + showInspector() để mở từ menu debug.
```

---

## 💡 Giới Thiệu

`react-native-requests-inspector` là giải pháp Network Inspector tích hợp trực tiếp trong ứng dụng React Native (tương tự **Chucker trên Android** hay **requests_inspector trên Flutter**).

Giúp Developer và QA có thể kiểm tra, gỡ lỗi và trích xuất mọi request mạng **ngay trên thiết bị thật và máy ảo** mà không cần mở Charles Proxy, Flipper hay cắm dây cáp rườm rà — **không cần native linking**.

---

## ✨ Tính Năng Nổi Bật (Killer Features)

* 🧩 **Zero Native Linking (RN 0.70 – 0.84+)**:
  Chỉ dùng API thuần của React Native (`Animated`, `PanResponder`, `View`) + `zustand`. Không yêu cầu Reanimated, Gesture Handler, SafeAreaContext hay SVG — chạy ngay trên cả dự án JS thuần lẫn TypeScript.
* 🌐 **Global Network Interception (1-Line Setup)**:
  Hỗ trợ `interceptGlobalNetwork` hoặc `enableGlobalNetworkLogging()` tự động bắt toàn bộ `fetch`, nhiều `axios.create()` instance, `apisauce`, kể cả khi interceptor của app tự nuốt/biến đổi `error` làm mất `error.config` (có chống duplicate khi hot-reload và tự bỏ qua request nội bộ của Metro dev server).
* 🔑 **1-Click Authorization Token Extraction**:
  Tự động quét `headers` và `response.headers` để bóc tách token Bearer sạch sẽ, copy vào clipboard chỉ với 1 chạm để test ngay trên Postman hoặc Swagger.
* 📋 **RFC-Compliant cURL Generator**:
  Trích xuất câu lệnh `cURL` hoàn chỉnh (kèm method, POSIX single-quote escaping, `--data-raw`, query parameters, headers và request body).
* 🔒 **Sensitive Data Redaction & Custom Decoder**:
  Hỗ trợ `redactKeys` tự che dữ liệu nhạy cảm (`password`, `Authorization`, ...) trên URL query, headers, JSON & `x-www-form-urlencoded` body, và `responseFormatter` để giải mã Base64/encrypted payload trước khi hiển thị/copy/export.
* 🎛️ **Flexible UI Control**:
  Hỗ trợ `showFloatingButton={false}`, `showInspector()`, `hideInspector()`, `clearLogs()` để tích hợp vào menu debug hoặc gesture ẩn (ví dụ bấm N lần).
* ⏸️ **Pause / Resume Recording**:
  Cho phép "đóng băng" danh sách request khi ứng dụng có WebSocket hoặc Polling API chạy ngầm liên tục, tránh làm trôi request bạn đang muốn debug.
* ⏱️ **Cảnh Báo Tốc Độ Phản Hồi (Slow API Detection)**:
  Tự động đổi màu cảnh báo thời gian phản hồi:
  - `< 500ms`: 🟢 Xanh ngọc (Nhanh)
  - `500ms - 1500ms`: 🟡 Vàng cam (Trung bình)
  - `> 1500ms`: 🔴 Đỏ rực (Cảnh báo API nghẽn mạng)
* 🧠 **Smart Search & Filter**:
  Tìm kiếm tức thì theo **URL**, **HTTP Method**, **Status Code** (ví dụ gõ `404`, `500`, `200`) và nội dung lỗi. Hỗ trợ thanh cuộn Filter Chips: `All`, `Errors`, `Success`, `POST`, `GET`, `PUT`, `DELETE`.
* 📤 **1-Click Export Toàn Bộ Logs**:
  Xuất toàn bộ snapshot network traffic ra JSON dump để gửi ngay cho đồng đội Backend hoặc QA.
* 🎯 **Floating Button Kéo Thả & Tự Hít Mép (Edge Snapping)**:
  Nút tròn kéo thả mượt mà bằng `Animated` + `PanResponder`, tự động hít vào 2 mép màn hình, cập nhật toạ độ theo `useWindowDimensions()` khi xoay màn hình / iPad Split View và xử lý Safe Area thông minh.

---

## 📦 Cài Đặt (Installation)

```bash
# Sử dụng Yarn (Khuyên dùng)
yarn add https://github.com/tuan1996v2/react-native-requests-inspector.git

# Hoặc sử dụng NPM
npm install git+https://github.com/tuan1996v2/react-native-requests-inspector.git
```

Không cần `pod install` hay cài thêm bất kỳ thư viện native nào (`react` >= 18.0.0, `react-native` >= 0.70.0; `axios` là optional peerDependency).

---

## 🚀 Hướng Dẫn Sử Dụng (Quick Start)

### 1. Bọc Component Gốc trong `App.tsx` (1 dòng bật Global Logging)

```tsx
import React from 'react';
import { RequestsInspector } from 'react-native-requests-inspector';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <RequestsInspector
      enabled={__DEV__}
      interceptGlobalNetwork={__DEV__}
      redactKeys={['password', 'Authorization']}
    >
      <RootNavigator />
    </RequestsInspector>
  );
}
```

Hoặc bật/tắt thủ công ở bất kỳ đâu (ví dụ trong `index.js` hoặc `App.tsx`):

```typescript
import {
  enableGlobalNetworkLogging,
  disableGlobalNetworkLogging,
} from 'react-native-requests-inspector';

if (__DEV__) {
  enableGlobalNetworkLogging();
}
```

### 2. Gắn Riêng cho Axios hoặc Fetch (Tương thích ngược)

```typescript
import axios from 'axios';
import {
  attachRequestsInspector,
  requestsInspectorFetch,
} from 'react-native-requests-inspector';

export const apiClient = axios.create({ baseURL: 'https://api.example.com' });
attachRequestsInspector(apiClient);

// Hoặc dùng wrapper thay thế fetch
const res = await requestsInspectorFetch('https://api.example.com/users');
```

### 3. Điều Khiển UI & Decoder Tuỳ Chỉnh

```tsx
import {
  RequestsInspector,
  showInspector,
  hideInspector,
  clearLogs,
} from 'react-native-requests-inspector';

// Ẩn nút nổi, mở modal từ menu debug hoặc gesture ẩn
<RequestsInspector
  enabled={__DEV__}
  interceptGlobalNetwork
  showFloatingButton={false}
  redactKeys={['password', 'token']}
  responseFormatter={(body, log) => {
    // Ví dụ giải mã payload tuỳ chỉnh trước khi hiển thị/export
    return body;
  }}
>
  <AppContent />
</RequestsInspector>

// Mở / đóng / xoá logs bằng code
showInspector();
hideInspector();
clearLogs();
```

---

## 📚 API Reference

| Export / Prop | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `enabled` | `boolean` (default `true`) | Bật/tắt inspector mà không làm remount cây `{children}` |
| `interceptGlobalNetwork` | `boolean` (default `false`) | Tự động bắt toàn bộ `XMLHttpRequest` và `fetch` ở tầng global |
| `showFloatingButton` | `boolean` (default `true`) | Hiện/ẩn nút nổi kéo thả |
| `redactKeys` | `string[]` | Danh sách key nhạy cảm cần che thành `[REDACTED]` khi xem/copy/export (headers, URL query, JSON & form-urlencoded) |
| `responseFormatter` | `(body, log) => unknown` | Hàm transform/decode response body trước khi hiển thị/export |
| `ignoreUrls` | `(string \| RegExp)[]` | Bỏ qua các URL không muốn ghi log (mặc định đã tự bỏ qua request nội bộ của Metro dev server) |
| `maxLogs` | `number` (default `50`) | Số lượng request tối đa lưu trong ring-buffer (`1..1000`) |
| `showInspector()` / `hideInspector()` | `() => void` | Mở hoặc đóng modal inspector từ code |
| `clearLogs()` | `() => void` | Xoá toàn bộ log hiện tại |
| `configureRequestsInspector(cfg)` | `(RequestsInspectorConfig) => void` | Cấu hình `redactKeys`, `responseFormatter`, `ignoreUrls`, `maxLogs` bằng code |
| `enableGlobalNetworkLogging()` / `disableGlobalNetworkLogging()` | `() => void` | Bật/tắt interceptor global (chống duplicate khi hot-reload) |
| `attachRequestsInspector(instance)` | `(AxiosInstance) => void` | Gắn interceptor vào Axios instance cụ thể |
| `requestsInspectorFetch` | `typeof fetch` | Wrapper cho `fetch` |

---

## ⚙️ Chi Tiết Kỹ Thuật (Architecture & Performance)

| Tiêu chí | Giải pháp kỹ thuật |
| :--- | :--- |
| **State Management** | Zustand singleton store (`Symbol.for`), selector granular (`logs.length`, `hasErrors`) tránh re-render thừa. |
| **Giới hạn RAM** | Ring buffer FIFO mặc định 50 requests (tuỳ chỉnh qua `maxLogs`), unmount Modal hoàn toàn khi đóng. |
| **An toàn Payload** | Hỗ trợ circular JSON, `FormData`, `ArrayBuffer`, `TypedArray`, `Blob`; rút gọn > 250KB, bỏ qua stream/binary response. |
| **Safe Area Handling** | Tự động đọc `RNCSafeAreaContext` nếu app có cài, fallback `useWindowDimensions()` + `StatusBar` theo orientation & edge-to-edge. |
| **Icons & Packaging** | 100% `View` thuần không phụ thuộc font/SVG; build sẵn CommonJS + `.d.ts` tại `lib/` cho mọi dự án JS/TS. |

---

## 👨‍💻 Tác Giả & Đóng Góp (Author & License)

- Tác giả: **Phạm Văn Tuấn ([tuan1996v2](https://github.com/tuan1996v2))**
- Thư viện tham chiếu: [requests_inspector (Flutter)](https://github.com/tuan1996v2/requests_inspector)
- Giấy phép: **MIT License** — Thoải mái sử dụng trong các dự án cá nhân và thương mại.

---
<div align="center">
  <b>⭐ Đừng quên bấm Star trên <a href="https://github.com/tuan1996v2/react-native-requests-inspector">GitHub</a> nếu thư viện giúp ích cho công việc của bạn! ⭐</b>
</div>
