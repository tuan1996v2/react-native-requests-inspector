"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIgnoredUrl = exports.isDevServerUrl = void 0;
const networkStore_1 = require("../networkStore");
// Metro / dev-server endpoints that React Native itself calls in __DEV__
const METRO_PATH_RE = /^\/(symbolicate|logs|open-stack-frame|open-url|reload|status|launch-js-devtools|message|hot|inspector|json|debugger-ui|events|assets|[^/?#]+\.bundle|[^/?#]+\.map)(\/|\?|#|$)/i;
let cachedDevServerOrigin;
const getDevServerOrigin = () => {
    if (cachedDevServerOrigin !== undefined) {
        return cachedDevServerOrigin;
    }
    cachedDevServerOrigin = null;
    try {
        // Lazy require keeps this module loadable outside React Native (unit tests, web).
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const RN = require('react-native');
        const sourceCode = RN?.TurboModuleRegistry?.get?.('SourceCode');
        const scriptURL = sourceCode?.getConstants?.()?.scriptURL ?? sourceCode?.scriptURL;
        const match = typeof scriptURL === 'string' ? scriptURL.match(/^(https?:\/\/[^/?#]+)/i) : null;
        cachedDevServerOrigin = match ? match[1].toLowerCase() : null;
    }
    catch {
        cachedDevServerOrigin = null;
    }
    return cachedDevServerOrigin;
};
const isDevServerUrl = (url) => {
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
exports.isDevServerUrl = isDevServerUrl;
const isIgnoredUrl = (url) => {
    if (!url) {
        return false;
    }
    if ((0, exports.isDevServerUrl)(url)) {
        return true;
    }
    const { ignoreUrls } = networkStore_1.useNetworkStore.getState();
    for (const pattern of ignoreUrls) {
        if (typeof pattern === 'string') {
            if (pattern && url.includes(pattern)) {
                return true;
            }
        }
        else if (pattern instanceof RegExp) {
            pattern.lastIndex = 0;
            if (pattern.test(url)) {
                return true;
            }
        }
    }
    return false;
};
exports.isIgnoredUrl = isIgnoredUrl;
