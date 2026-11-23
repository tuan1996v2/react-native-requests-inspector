import { Dimensions, PixelRatio } from 'react-native';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

// Standard mobile baseline (390 x 844), orientation-invariant
const SHORT_SIDE = Math.min(WINDOW_WIDTH, WINDOW_HEIGHT);
const LONG_SIDE = Math.max(WINDOW_WIDTH, WINDOW_HEIGHT);
const BASELINE_WIDTH = 390;
const BASELINE_HEIGHT = 844;

export const s = (size: number): number =>
  PixelRatio.roundToNearestPixel((SHORT_SIDE / BASELINE_WIDTH) * size);

export const vs = (size: number): number =>
  PixelRatio.roundToNearestPixel((LONG_SIDE / BASELINE_HEIGHT) * size);

export const ms = (size: number, factor = 0.5): number => size + (s(size) - size) * factor;

export const fs = (size: number): number => ms(size) * PixelRatio.getFontScale();
