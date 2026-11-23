/** Extracts query parameters from a URL without relying on the `URL` polyfill. */
export declare const parseQueryParams: (url: string) => Record<string, string> | undefined;
/** Converts axios `params` (numbers, arrays, nested objects) into a flat string record. */
export declare const normalizeQueryParams: (params: unknown) => Record<string, string> | undefined;
