import { REDACTED_PLACEHOLDER } from './utils/redact';

interface ClipboardModule {
  setString?: (text: string) => void;
}

const getTurboModule = (name: string): ClipboardModule | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require('react-native');
    return (RN?.TurboModuleRegistry?.get?.(name) as ClipboardModule | null) ?? null;
  } catch {
    return null;
  }
};

/**
 * Copies text without importing optional packages by name (a missing optional package would
 * break Metro bundling on RN < 0.72) and without touching the deprecated `Clipboard` getter.
 * Order: @react-native-clipboard/clipboard native module → RN core clipboard → web clipboard.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) {
    return false;
  }

  for (const moduleName of ['RNCClipboard', 'Clipboard']) {
    const clipboardModule = getTurboModule(moduleName);
    if (clipboardModule && typeof clipboardModule.setString === 'function') {
      try {
        clipboardModule.setString(text);
        return true;
      } catch {
        // Try next strategy
      }
    }
  }

  try {
    const webClipboard = (
      globalThis as {
        navigator?: {
          clipboard?: { writeText?: (t: string) => Promise<void> };
        };
      }
    ).navigator?.clipboard;
    if (webClipboard && typeof webClipboard.writeText === 'function') {
      await webClipboard.writeText(text);
      return true;
    }
  } catch {
    // Ignore
  }

  return false;
};

export const extractAuthToken = (headers?: Record<string, string>): string | null => {
  if (!headers) {
    return null;
  }

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === 'authorization' && typeof value === 'string') {
      const cleaned = value
        .trim()
        .replace(/^Bearer\s+/i, '')
        .trim();
      if (!cleaned || cleaned === REDACTED_PLACEHOLDER) {
        return null;
      }
      return cleaned;
    }
  }

  return null;
};
