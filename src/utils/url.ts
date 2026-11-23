const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
};

/** Extracts query parameters from a URL without relying on the `URL` polyfill. */
export const parseQueryParams = (url: string): Record<string, string> | undefined => {
  if (typeof url !== 'string') {
    return undefined;
  }
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) {
    return undefined;
  }
  const hashIndex = url.indexOf('#', queryIndex);
  const query = hashIndex === -1 ? url.slice(queryIndex + 1) : url.slice(queryIndex + 1, hashIndex);
  if (!query) {
    return undefined;
  }

  const result: Record<string, string> = {};
  for (const pair of query.split('&')) {
    if (!pair) {
      continue;
    }
    const eqIndex = pair.indexOf('=');
    const key = safeDecode(eqIndex === -1 ? pair : pair.slice(0, eqIndex));
    const value = eqIndex === -1 ? '' : safeDecode(pair.slice(eqIndex + 1));
    result[key] = key in result ? `${result[key]}, ${value}` : value;
  }
  return Object.keys(result).length > 0 ? result : undefined;
};

/** Converts axios `params` (numbers, arrays, nested objects) into a flat string record. */
export const normalizeQueryParams = (params: unknown): Record<string, string> | undefined => {
  if (!params || typeof params !== 'object') {
    return undefined;
  }

  const result: Record<string, string> = {};
  const entries =
    typeof URLSearchParams !== 'undefined' && params instanceof URLSearchParams
      ? Array.from(params.entries())
      : Object.entries(params as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (value === undefined) {
      continue;
    }
    if (value === null || typeof value !== 'object') {
      result[key] = String(value);
    } else {
      try {
        result[key] = JSON.stringify(value);
      } catch {
        result[key] = String(value);
      }
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
};
