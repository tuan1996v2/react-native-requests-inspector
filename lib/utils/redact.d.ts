import { NetworkLog, ResponseFormatter } from '../types';
export declare const REDACTED_PLACEHOLDER = "[REDACTED]";
/** Parses JSON strings lazily (UI time only); returns the input unchanged otherwise. */
export declare const tryParseJson: (value: unknown) => unknown;
/** Redacts sensitive query parameters in a URL (cheap; used by list items). */
export declare const redactUrl: (url: string, redactKeys?: string[]) => string;
/**
 * Applies optional responseFormatter and redactKeys before displaying, copying, or exporting logs.
 * Runs only at UI time, never on the network hot path.
 */
export declare const formatAndRedactLog: (log: NetworkLog, redactKeys?: string[], responseFormatter?: ResponseFormatter) => NetworkLog;
