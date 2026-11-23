"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAuthToken = exports.copyToClipboard = void 0;
const redact_1 = require("./utils/redact");
const getTurboModule = (name) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const RN = require('react-native');
        return RN?.TurboModuleRegistry?.get?.(name) ?? null;
    }
    catch {
        return null;
    }
};
/**
 * Copies text without importing optional packages by name (a missing optional package would
 * break Metro bundling on RN < 0.72) and without touching the deprecated `Clipboard` getter.
 * Order: @react-native-clipboard/clipboard native module → RN core clipboard → web clipboard.
 */
const copyToClipboard = async (text) => {
    if (!text) {
        return false;
    }
    for (const moduleName of ['RNCClipboard', 'Clipboard']) {
        const clipboardModule = getTurboModule(moduleName);
        if (clipboardModule && typeof clipboardModule.setString === 'function') {
            try {
                clipboardModule.setString(text);
                return true;
            }
            catch {
                // Try next strategy
            }
        }
    }
    try {
        const webClipboard = globalThis.navigator?.clipboard;
        if (webClipboard && typeof webClipboard.writeText === 'function') {
            await webClipboard.writeText(text);
            return true;
        }
    }
    catch {
        // Ignore
    }
    return false;
};
exports.copyToClipboard = copyToClipboard;
const extractAuthToken = (headers) => {
    if (!headers) {
        return null;
    }
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === 'authorization' && typeof value === 'string') {
            const cleaned = value
                .trim()
                .replace(/^Bearer\s+/i, '')
                .trim();
            if (!cleaned || cleaned === redact_1.REDACTED_PLACEHOLDER) {
                return null;
            }
            return cleaned;
        }
    }
    return null;
};
exports.extractAuthToken = extractAuthToken;
