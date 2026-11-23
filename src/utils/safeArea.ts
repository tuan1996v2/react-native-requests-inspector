import { Dimensions, Platform, StatusBar, useWindowDimensions } from 'react-native';

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface WindowMetrics {
  insets: Insets;
  frame: { width: number; height: number };
}

let cachedInitialMetrics: WindowMetrics | null | undefined;

const isValidInsets = (value: unknown): value is Insets => {
  const v = value as Partial<Insets> | null;
  return (
    !!v &&
    typeof v.top === 'number' &&
    typeof v.bottom === 'number' &&
    typeof v.left === 'number' &&
    typeof v.right === 'number'
  );
};

/**
 * Reads exact startup insets from react-native-safe-area-context's native module when the host
 * app already has it installed — without importing the package or requiring a SafeAreaProvider.
 */
const getInitialWindowMetrics = (): WindowMetrics | null => {
  if (cachedInitialMetrics !== undefined) {
    return cachedInitialMetrics;
  }
  cachedInitialMetrics = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require('react-native');
    const nativeModule = RN?.TurboModuleRegistry?.get?.('RNCSafeAreaContext');
    const metrics =
      nativeModule?.getConstants?.()?.initialWindowMetrics ?? nativeModule?.initialWindowMetrics;
    if (
      metrics &&
      isValidInsets(metrics.insets) &&
      metrics.frame &&
      typeof metrics.frame.width === 'number' &&
      typeof metrics.frame.height === 'number'
    ) {
      cachedInitialMetrics = { insets: metrics.insets, frame: metrics.frame };
    }
  } catch {
    cachedInitialMetrics = null;
  }
  return cachedInitialMetrics;
};

const getAndroidStatusBarHeight = (): number => StatusBar.currentHeight ?? 24;

export const getDeviceSafeAreaFallback = (windowWidth?: number, windowHeight?: number): Insets => {
  const dims =
    windowWidth !== undefined && windowHeight !== undefined
      ? { width: windowWidth, height: windowHeight }
      : Dimensions.get('window');

  const { width, height } = dims;
  const isLandscape = width > height;

  // 1. Exact native insets when orientation matches the startup orientation
  const metrics = getInitialWindowMetrics();
  if (metrics && metrics.frame.width > metrics.frame.height === isLandscape) {
    const { insets } = metrics;
    return Platform.OS === 'android'
      ? {
          // Inspector modal is statusBarTranslucent, so always clear the status bar
          top: Math.max(insets.top, isLandscape ? 0 : getAndroidStatusBarHeight()),
          bottom: insets.bottom,
          left: insets.left,
          right: insets.right,
        }
      : insets;
  }

  // 2. Heuristic fallback
  if (Platform.OS === 'ios') {
    if (Platform.isPad) {
      return { top: 24, bottom: 20, left: 0, right: 0 };
    }

    const longEdge = Math.max(width, height);
    // iPhone X and newer (notch / Dynamic Island) have a long edge >= 812pt
    const isNotchOrIsland = !Platform.isTV && longEdge >= 812;
    const isDynamicIsland = !Platform.isTV && longEdge >= 852;

    const top = isDynamicIsland ? 59 : isNotchOrIsland ? 47 : 20;
    const bottom = isNotchOrIsland ? 34 : 0;

    return {
      top: isLandscape ? 0 : top,
      bottom: isLandscape ? (isNotchOrIsland ? 21 : 0) : bottom,
      left: isLandscape && isNotchOrIsland ? 47 : 0,
      right: isLandscape && isNotchOrIsland ? 47 : 0,
    };
  }

  // Android: when the window is shorter than the screen, system bars are outside the app
  // window (legacy layout); otherwise the app is edge-to-edge and needs a nav-bar inset.
  const screen = Dimensions.get('screen');
  const isEdgeToEdge = Math.max(screen.width, screen.height) - Math.max(width, height) < 1;
  return {
    top: getAndroidStatusBarHeight(),
    bottom: isEdgeToEdge ? 32 : 8,
    left: 0,
    right: 0,
  };
};

export const useSafeDeviceInsets = (): Insets => {
  const { width, height } = useWindowDimensions();
  return getDeviceSafeAreaFallback(width, height);
};
