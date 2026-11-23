/**
 * Copies text without importing optional packages by name (a missing optional package would
 * break Metro bundling on RN < 0.72) and without touching the deprecated `Clipboard` getter.
 * Order: @react-native-clipboard/clipboard native module → RN core clipboard → web clipboard.
 */
export declare const copyToClipboard: (text: string) => Promise<boolean>;
export declare const extractAuthToken: (headers?: Record<string, string>) => string | null;
