import { Dimensions, PixelRatio } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Standard mobile baseline (390 x 844)
const BASELINE_WIDTH = 390;
const BASELINE_HEIGHT = 844;
export const s = (size) => PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASELINE_WIDTH) * size);
export const vs = (size) => PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / BASELINE_HEIGHT) * size);
export const ms = (size, factor = 0.5) => size + (s(size) - size) * factor;
export const fs = (size) => ms(size) * PixelRatio.getFontScale();
