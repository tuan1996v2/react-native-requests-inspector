import type nodeAssert from 'node:assert/strict';
import type nodeModuleType from 'node:module';
import type nodeTest from 'node:test';

/* eslint-disable @typescript-eslint/no-require-imports */
const assert: typeof nodeAssert = require('node:assert/strict');
const Module: typeof nodeModuleType = require('node:module');
const test: typeof nodeTest = require('node:test');

// Stub 'react-native' in pure Node before requiring any compiled modules
const nodeModule = Module as unknown as {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
};
const originalLoad = nodeModule._load;
nodeModule._load = function (request: string, parent: unknown, isMain: boolean): unknown {
  if (request === 'react-native') {
    return {
      Platform: { OS: 'ios', isPad: false, isTV: false },
      Dimensions: {
        get: () => ({ width: 390, height: 844 }),
      },
      StatusBar: { currentHeight: 24 },
      PixelRatio: {
        roundToNearestPixel: (v: number) => Math.round(v),
        getFontScale: () => 1,
      },
      TurboModuleRegistry: {
        get: () => null,
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const { useNetworkStore } = require('../lib/networkStore') as typeof import('../src/networkStore');
const {
  safeExtractBody,
  enableGlobalNetworkLogging,
  disableGlobalNetworkLogging,
  isGlobalNetworkLoggingEnabled,
  attachRequestsInspector,
  requestsInspectorFetch,
  requestsInspectorAxiosInterceptor,
} = require('../lib/interceptor') as typeof import('../src/interceptor');
const { formatAndRedactLog, redactUrl, REDACTED_PLACEHOLDER } =
  require('../lib/utils/redact') as typeof import('../src/utils/redact');
const { generateCurlCommand } = require('../lib/curlHelper') as typeof import('../src/curlHelper');
const { parseQueryParams, normalizeQueryParams } =
  require('../lib/utils/url') as typeof import('../src/utils/url');
const { isIgnoredUrl, isDevServerUrl } =
  require('../lib/utils/urlFilter') as typeof import('../src/utils/urlFilter');
const { extractAuthToken } =
  require('../lib/clipboardHelper') as typeof import('../src/clipboardHelper');
/* eslint-enable @typescript-eslint/no-require-imports */

import type { AxiosLikeInstance, AxiosLikeRequestConfig } from '../src/interceptor';
import type { NetworkLog } from '../src/types';

const resetStore = (): void => {
  disableGlobalNetworkLogging();
  useNetworkStore.setState({
    logs: [],
    isEnabled: true,
    showFloatingButton: true,
    isPaused: false,
    isModalVisible: false,
    selectedLogId: null,
    filter: 'ALL',
    searchQuery: '',
    redactKeys: [],
    responseFormatter: undefined,
    ignoreUrls: [],
    maxLogs: 50,
  });
};

test('safeExtractBody handles primitives, circular objects, huge payloads, and binary types', () => {
  assert.equal(safeExtractBody(undefined), undefined);
  assert.equal(safeExtractBody(null), undefined);
  assert.equal(safeExtractBody(42), 42);
  assert.equal(safeExtractBody(true), true);
  assert.equal(safeExtractBody(9007199254740993n), '9007199254740993');

  // Large string truncated at 250KB
  const bigStr = 'a'.repeat(260 * 1024);
  const extractedStr = safeExtractBody(bigStr) as string;
  assert.equal(typeof extractedStr, 'string');
  assert.ok(extractedStr.includes('Body truncated: Exceeds 250KB limit'));
  assert.ok(extractedStr.length < 252 * 1024);

  // Circular reference & Date / Error
  const circular: Record<string, unknown> = {
    name: 'root',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    err: new Error('boom'),
  };
  circular.self = circular;
  const extractedCircular = safeExtractBody(circular) as Record<string, unknown>;
  assert.equal(extractedCircular.self, '[Circular]');
  assert.equal(extractedCircular.createdAt, '2026-01-01T00:00:00.000Z');
  assert.deepEqual(extractedCircular.err, { name: 'Error', message: 'boom' });
  assert.doesNotThrow(() => JSON.stringify(extractedCircular));

  // Huge nested object truncated by budget
  const hugeObj: Record<string, string> = {};
  for (let i = 0; i < 5000; i += 1) {
    hugeObj[`key_${i}`] = 'x'.repeat(100);
  }
  const extractedHugeObj = safeExtractBody(hugeObj) as string;
  assert.equal(typeof extractedHugeObj, 'string');
  assert.ok(extractedHugeObj.includes('Body truncated: Exceeds 250KB limit'));

  // Binary types
  const ab = new ArrayBuffer(128);
  assert.equal(safeExtractBody(ab), '[ArrayBuffer: 128 bytes]');
  const u8 = new Uint8Array(64);
  assert.equal(safeExtractBody(u8), '[Uint8Array: 64 bytes]');

  // RN FormData (_parts)
  const rnForm = {
    _parts: [
      ['username', 'tuan'],
      ['avatar', { uri: 'file:///a.jpg', name: 'a.jpg', type: 'image/jpeg' }],
    ],
  };
  assert.deepEqual(safeExtractBody(rnForm), {
    username: 'tuan',
    avatar: '[File: a.jpg (image/jpeg)]',
  });

  // RN Blob (_data)
  assert.equal(
    safeExtractBody({ _data: { blobId: 'b1', size: 2048, type: 'application/pdf' } }),
    '[Blob: 2048 bytes (application/pdf)]',
  );
});

test('redact helpers mask headers, query strings, JSON & form-urlencoded bodies, and chain responseFormatter', () => {
  const log: NetworkLog = {
    id: '1',
    url: 'https://api.example.com/login?token=secret123&page=1',
    method: 'POST',
    headers: { Authorization: 'Bearer top-secret', 'Content-Type': 'application/json' },
    queryParameters: { token: 'secret123', page: '1' },
    body: 'username=alice&password=myPassword%21',
    sentTime: 1000,
    status: 'success',
    response: {
      statusCode: 200,
      headers: { 'Set-Cookie': 'abc' },
      body: JSON.stringify({ payload: { apiKey: 'key-999', ok: true } }),
      receivedTime: 1050,
      durationMs: 50,
    },
  };

  const formatted = formatAndRedactLog(
    log,
    ['authorization', 'token', 'password', 'apiKey'],
    body => (body as { payload: unknown }).payload,
  );

  assert.equal(formatted.url, `https://api.example.com/login?token=${REDACTED_PLACEHOLDER}&page=1`);
  assert.equal(formatted.headers.Authorization, REDACTED_PLACEHOLDER);
  assert.equal(formatted.queryParameters?.token, REDACTED_PLACEHOLDER);
  assert.equal(formatted.queryParameters?.page, '1');
  assert.equal(formatted.body, `username=alice&password=${REDACTED_PLACEHOLDER}`);
  assert.deepEqual(formatted.response?.body, { apiKey: REDACTED_PLACEHOLDER, ok: true });
  assert.equal(extractAuthToken(formatted.headers), null);
  assert.equal(
    redactUrl('https://x.io/a?secret=123', ['secret']),
    `https://x.io/a?secret=${REDACTED_PLACEHOLDER}`,
  );

  // Broken user formatter must not throw
  const safeFallback = formatAndRedactLog(log, [], () => {
    throw new Error('decode error');
  });
  assert.equal(safeFallback.response?.body, log.response?.body);
});

test('generateCurlCommand escapes shell metacharacters and uses --data-raw', () => {
  const curl = generateCurlCommand({
    id: '1',
    url: 'https://api.example.com/items',
    method: 'POST',
    headers: { 'X-Custom': "val'ue$HOME" },
    queryParameters: { q: 'hello world' },
    body: { note: "@file's $PATH" },
    sentTime: 1,
    status: 'pending',
  });

  assert.ok(curl.includes("'https://api.example.com/items?q=hello%20world'"));
  assert.ok(curl.includes(`-H 'X-Custom: val'\\''ue$HOME'`));
  assert.ok(curl.includes(`--data-raw '{"note":"@file'\\''s $PATH"}'`));
});

test('URL query parsing & Metro dev-server filtering work properly', () => {
  assert.deepEqual(parseQueryParams('https://x.io/search?a=1&b=hello+world&a=2#top'), {
    a: '1, 2',
    b: 'hello world',
  });
  assert.deepEqual(normalizeQueryParams({ page: 2, tags: ['a', 'b'], skip: undefined }), {
    page: '2',
    tags: '["a","b"]',
  });

  assert.equal(isDevServerUrl('http://localhost:8081/symbolicate'), true);
  assert.equal(isDevServerUrl('http://10.0.2.2:8081/logs'), true);
  assert.equal(isDevServerUrl('http://localhost:8081/api/users'), false);

  resetStore();
  useNetworkStore.getState().setConfig({ ignoreUrls: ['analytics', /\/ping$/g] });
  assert.equal(isIgnoredUrl('https://api.example.com/analytics/track'), true);
  // Stateful /g regex must match reliably across consecutive calls
  assert.equal(isIgnoredUrl('https://api.example.com/ping'), true);
  assert.equal(isIgnoredUrl('https://api.example.com/ping'), true);
  assert.equal(isIgnoredUrl('https://api.example.com/users'), false);
});

test('networkStore enforces maxLogs ring buffer and partial setConfig merge', () => {
  resetStore();
  const store = useNetworkStore.getState();
  store.setConfig({ redactKeys: [' Password '], maxLogs: 3 });

  assert.deepEqual(useNetworkStore.getState().redactKeys, ['password']);
  assert.equal(useNetworkStore.getState().maxLogs, 3);

  // Updating another key preserves redactKeys & maxLogs
  store.setConfig({ ignoreUrls: ['/health'] });
  assert.deepEqual(useNetworkStore.getState().redactKeys, ['password']);
  assert.equal(useNetworkStore.getState().maxLogs, 3);

  for (let i = 1; i <= 5; i += 1) {
    store.addRequest({ url: `https://api.example.com/${i}`, method: 'GET', headers: {} });
  }
  assert.equal(useNetworkStore.getState().logs.length, 3);
  assert.equal(useNetworkStore.getState().logs[0].url, 'https://api.example.com/5');
});

test('global network logging intercepts XHR & fetch without duplicates and restores cleanly', async () => {
  resetStore();

  class FakeXMLHttpRequest {
    readyState = 0;
    status = 0;
    response = '';
    _method = '';
    _url = '';
    _listeners = new Map<string, Set<() => void>>();

    addEventListener(evt: string, cb: () => void): void {
      if (!this._listeners.has(evt)) {
        this._listeners.set(evt, new Set());
      }
      this._listeners.get(evt)?.add(cb);
    }

    removeEventListener(evt: string, cb: () => void): void {
      this._listeners.get(evt)?.delete(cb);
    }

    _emit(evt: string): void {
      for (const cb of this._listeners.get(evt) || []) {
        cb();
      }
    }

    open(method: string, url: string): void {
      this._method = method;
      this._url = url;
      this.readyState = 1;
    }

    setRequestHeader(): void {}

    getAllResponseHeaders(): string {
      return 'content-type: application/json\r\n';
    }

    send(): void {
      this.readyState = 4;
      this.status = 200;
      this.response = '{"ok":true}';
      this._emit('loadend');
    }
  }

  const originalGlobalXhr = globalThis.XMLHttpRequest;
  const originalGlobalFetch = globalThis.fetch;

  const baseFetch = (async (input: RequestInfo | URL) => {
    const xhr = new globalThis.XMLHttpRequest();
    const targetUrl = typeof input === 'string' ? input : (input as { url: string }).url;
    xhr.open('GET', targetUrl);
    xhr.send();
    return {
      status: 201,
      ok: true,
      type: 'default',
      headers: new Map([['content-type', 'application/json']]),
      clone() {
        return { text: async () => '{"created":true}' };
      },
    } as unknown as Response;
  }) as typeof fetch;

  globalThis.XMLHttpRequest = FakeXMLHttpRequest as unknown as typeof XMLHttpRequest;
  globalThis.fetch = baseFetch;

  try {
    enableGlobalNetworkLogging();
    enableGlobalNetworkLogging(); // Idempotent (hot-reload / double call)
    assert.equal(isGlobalNetworkLoggingEnabled(), true);

    // 1. Direct XHR request -> 1 log
    const xhr = new globalThis.XMLHttpRequest();
    xhr.open('POST', 'https://api.example.com/xhr');
    xhr.setRequestHeader('X-Test', '1');
    xhr.send('{"a":1}');

    // 2. Global fetch (which internally creates an XHR) -> MUST still produce only 1 log
    await globalThis.fetch('https://api.example.com/fetch');

    // 3. requestsInspectorFetch while global logging enabled -> MUST still produce only 1 log
    await requestsInspectorFetch('https://api.example.com/manual-fetch');

    // 4. Axios interceptor while global logging enabled -> skips duplicate request entry
    const fakeAxiosConfig = requestsInspectorAxiosInterceptor.request({
      url: '/ignored-by-axios',
      baseURL: 'https://api.example.com',
      method: 'get',
    } as AxiosLikeRequestConfig);
    assert.equal(fakeAxiosConfig._requestsInspectorId, undefined);

    await new Promise(resolve => setTimeout(resolve, 10));

    const logs = useNetworkStore.getState().logs;
    assert.equal(logs.length, 3);
    assert.equal(logs[0].url, 'https://api.example.com/manual-fetch');
    assert.equal(logs[0].response?.statusCode, 201);
    assert.equal(logs[0].response?.body, '{"created":true}');
    assert.equal(logs[1].url, 'https://api.example.com/fetch');
    assert.equal(logs[2].url, 'https://api.example.com/xhr');
    assert.equal(logs[2].headers['X-Test'], '1');
    assert.equal(logs[2].response?.statusCode, 200);

    // Disable restores originals
    disableGlobalNetworkLogging();
    assert.equal(isGlobalNetworkLoggingEnabled(), false);
    assert.equal(globalThis.fetch, baseFetch);
    assert.equal(globalThis.XMLHttpRequest.prototype.open, FakeXMLHttpRequest.prototype.open);

    // attachRequestsInspector works normally when global logging is disabled
    const interceptors: {
      req: ((cfg: AxiosLikeRequestConfig) => AxiosLikeRequestConfig) | null;
      res: ((res: { config: AxiosLikeRequestConfig; status: number; headers: unknown; data: unknown }) => unknown) | null;
    } = { req: null, res: null };

    const fakeAxios: AxiosLikeInstance = {
      interceptors: {
        request: {
          use: fn => {
            interceptors.req = fn as typeof interceptors.req;
            return 1;
          },
        },
        response: {
          use: ok => {
            interceptors.res = ok as typeof interceptors.res;
            return 1;
          },
        },
      },
    };
    attachRequestsInspector(fakeAxios);
    const cfg = interceptors.req!({
      baseURL: 'https://api.example.com',
      url: '/v1/test',
      method: 'get',
      params: { page: 1 },
    });
    assert.ok(cfg._requestsInspectorId);
    interceptors.res!({ config: cfg, status: 200, headers: {}, data: { hello: 'world' } });
    assert.equal(useNetworkStore.getState().logs[0].queryParameters?.page, '1');
  } finally {
    disableGlobalNetworkLogging();
    globalThis.XMLHttpRequest = originalGlobalXhr;
    globalThis.fetch = originalGlobalFetch;
  }
});
