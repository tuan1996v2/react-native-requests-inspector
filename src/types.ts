import React from 'react';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RequestDetails {
  id: string;
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: unknown;
  queryParameters?: Record<string, string>;
  sentTime: number;
}

export interface ResponseDetails {
  statusCode: number;
  headers: Record<string, string>;
  body?: unknown;
  receivedTime: number;
  durationMs: number;
  error?: string;
}

export interface NetworkLog extends RequestDetails {
  response?: ResponseDetails;
  status: 'pending' | 'success' | 'error';
}

export type FilterType = 'ALL' | 'ERROR' | 'SUCCESS' | 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Transforms a response body before it is displayed / copied / exported.
 * `body` is the parsed JSON value when the raw body is a JSON string, otherwise the raw value.
 */
export type ResponseFormatter = (body: unknown, log: NetworkLog) => unknown;

export interface RequestsInspectorConfig {
  /** Keys (case-insensitive) masked as `[REDACTED]` in headers, query, JSON & form bodies. */
  redactKeys?: string[];
  /** Custom decoder for response bodies (e.g. Base64 / encrypted payloads). */
  responseFormatter?: ResponseFormatter;
  /** Requests whose URL contains a string or matches a RegExp are not recorded. */
  ignoreUrls?: (string | RegExp)[];
  /** Ring-buffer size (default 50, clamped to 1..1000). */
  maxLogs?: number;
}

export interface RequestsInspectorProps extends RequestsInspectorConfig {
  children: React.ReactNode;
  enabled?: boolean;
  showFloatingButton?: boolean;
  interceptGlobalNetwork?: boolean;
}
