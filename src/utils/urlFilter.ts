import { useNetworkStore } from '../networkStore';

// Metro / dev-server endpoints that React Native itself calls in __DEV__
const METRO_PATH_RE =
  /^\/(symbolicate|logs|open-stack-frame|open-url|reload|status|launch-js-devtools|message|hot|inspector|json|debugger-ui|events|assets|[^/?#]+\.bundle|[^/?#]+\.map)(\/|\?|#|$)/i;

let cachedDevServerOrigin: string | null | undefined;

const getDevServerOrigin = (): string | null => {
  if (cachedDevServerOrigin !== undefined) {
    return cachedDevServerOrigin;
  }
  cachedDevServerOrigin = null;
  try {
    // Lazy require keeps this module loadable outside React Native (unit tests, web).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require('react-native');
    const sourceCode = RN?.TurboModuleRegistry?.get?.('SourceCode');
    const scriptURL: unknown = sourceCode?.getConstants?.()?.scriptURL ?? sourceCode?.scriptURL;
    const match = typeof scriptURL === 'string' ? scriptURL.match(/^(https?:\/\/[^/?#]+)/i) : null;
    cachedDevServerOrigin = match ? match[1].toLowerCase() : null;
  } catch {
    cachedDevServerOrigin = null;
  }
  return cachedDevServerOrigin;
};

export const isDevServerUrl = (url: string): boolean => {
  const lower = url.toLowerCase();
  const origin = getDevServerOrigin();
  if (origin && (lower === origin || lower.startsWith(`${origin}/`))) {
    return true;
  }
  const match = lower.match(/^https?:\/\/[^/?#]+:8081(\/[^]*)?$/);
  if (match) {
    return METRO_PATH_RE.test(match[1] || '/');
  }
  return false;
};

export const isIgnoredUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }
  if (isDevServerUrl(url)) {
    return true;
  }
  const { ignoreUrls } = useNetworkStore.getState();
  for (const pattern of ignoreUrls) {
    if (typeof pattern === 'string') {
      if (pattern && url.includes(pattern)) {
        return true;
      }
    } else if (pattern instanceof RegExp) {
      pattern.lastIndex = 0;
      if (pattern.test(url)) {
        return true;
      }
    }
  }
  return false;
};
