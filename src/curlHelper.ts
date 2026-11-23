import { NetworkLog } from './types';

/** POSIX-safe single-quote escaping: prevents `$`, backticks and `!` from being expanded. */
const shellQuote = (value: string): string => `'${value.replace(/'/g, "'\\''")}'`;

export const generateCurlCommand = (log: NetworkLog): string => {
  let url = log.url;

  if (log.queryParameters && Object.keys(log.queryParameters).length > 0) {
    const queryString = Object.entries(log.queryParameters)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(val ?? ''))}`)
      .join('&');
    url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
  }

  const parts: string[] = [`curl -X ${log.method.toUpperCase()} ${shellQuote(url)}`];

  if (log.headers) {
    Object.entries(log.headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        parts.push(`  -H ${shellQuote(`${key}: ${String(value)}`)}`);
      }
    });
  }

  if (
    log.body !== undefined &&
    log.body !== null &&
    log.method !== 'GET' &&
    log.method !== 'HEAD'
  ) {
    let bodyString: string;
    if (typeof log.body === 'string') {
      bodyString = log.body;
    } else {
      try {
        bodyString = JSON.stringify(log.body);
      } catch {
        bodyString = String(log.body);
      }
    }

    if (bodyString) {
      // --data-raw avoids curl interpreting a leading "@" as a file path
      parts.push(`  --data-raw ${shellQuote(bodyString)}`);
    }
  }

  return parts.join(' \\\n');
};
