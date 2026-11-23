<div align="center">
  <h1>🕵️ react-native-requests-inspector</h1>
  <p><b>High-performance, zero-native-dependency In-App Network Inspector for React Native (0.70 – 0.84+)</b></p>
  <p><i>Inspired by <a href="https://github.com/tuan1996v2/requests_inspector">requests_inspector</a> by <b>tuan1996v2</b>.</i></p>

  <p>
    <a href="https://github.com/tuan1996v2/react-native-requests-inspector/stargazers"><img src="https://img.shields.io/github/stars/tuan1996v2/react-native-requests-inspector?style=for-the-badge&color=blue" alt="Stars"></a>
    <a href="https://github.com/tuan1996v2/react-native-requests-inspector/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"></a>
    <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React%20Native-0.70%2B-61DAFB.svg?style=for-the-badge&logo=react" alt="React Native"></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  </p>
</div>

---

## ✨ Tính Năng Nổi Bật

* 🧩 **Zero Native Linking**: Chỉ dùng API thuần của React Native (`Animated`, `PanResponder`, `View`) + `zustand`. Không yêu cầu Reanimated, Gesture Handler, SafeAreaContext hay SVG — chạy ngay trên mọi dự án RN 0.70 – 0.84+, JS thuần lẫn TypeScript.
* 🌐 **Global Network Interception (1-Line Setup)**: Hỗ trợ `interceptGlobalNetwork` hoặc `enableGlobalNetworkLogging()` tự động bắt toàn bộ `fetch`, nhiều `axios.create()` instance, `apisauce`, kể cả khi app interceptor nuốt/biến đổi `error`.
* 🔑 **1-Click Token & RFC cURL Export**: Trích xuất Bearer token và generate lệnh `cURL` chuẩn xác chỉ với 1 chạm.
* 🔒 **Sensitive Data Redaction & Custom Decoder**: Hỗ trợ `redactKeys` tự che dữ liệu nhạy cảm (`password`, `Authorization`, ...) và `responseFormatter` để giải mã Base64/encrypted payload trước khi hiển thị/copy/export.
* 🎛️ **Flexible UI Control**: Hỗ trợ `showFloatingButton={false}`, `showInspector()`, `hideInspector()`, `clearLogs()` để tích hợp vào menu debug hoặc gesture ẩn.
* 🛡️ **RAM & Payload Safe**: Ring-buffer 50 requests, tự động xử lý circular JSON, `FormData`, `ArrayBuffer`, `Blob` và cắt ngắn payload vượt 250KB.

---

## 📦 Cài Đặt (Installation)

```bash
# Yarn
yarn add https://github.com/tuan1996v2/react-native-requests-inspector.git

# NPM
npm install git+https://github.com/tuan1996v2/react-native-requests-inspector.git
```

Không cần `pod install` hay cài thêm thư viện native nào (`react` >= 18, `react-native` >= 0.70; `axios` là optional).

---

## 🚀 Hướng Dẫn Sử Dụng (Quick Start)

### 1. Bọc Component Gốc (1 dòng bật Global Logging)

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

Hoặc bật/tắt thủ công ở bất kỳ đâu:

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
| `redactKeys` | `string[]` | Danh sách key nhạy cảm cần che thành `[REDACTED]` khi xem/copy/export (hỗ trợ headers, URL query, JSON & form-urlencoded) |
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

## 👨‍💻 Tác Giả & Giấy Phép

- Tác giả: **Phạm Văn Tuấn ([tuan1996v2](https://github.com/tuan1996v2))**
- Giấy phép: **MIT License**
