"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fs = exports.ms = exports.vs = exports.s = void 0;
const react_native_1 = require("react-native");
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = react_native_1.Dimensions.get('window');
// Standard mobile baseline (390 x 844), orientation-invariant
const SHORT_SIDE = Math.min(WINDOW_WIDTH, WINDOW_HEIGHT);
const LONG_SIDE = Math.max(WINDOW_WIDTH, WINDOW_HEIGHT);
const BASELINE_WIDTH = 390;
const BASELINE_HEIGHT = 844;
const s = (size) => react_native_1.PixelRatio.roundToNearestPixel((SHORT_SIDE / BASELINE_WIDTH) * size);
exports.s = s;
const vs = (size) => react_native_1.PixelRatio.roundToNearestPixel((LONG_SIDE / BASELINE_HEIGHT) * size);
exports.vs = vs;
const ms = (size, factor = 0.5) => size + ((0, exports.s)(size) - size) * factor;
exports.ms = ms;
const fs = (size) => (0, exports.ms)(size) * react_native_1.PixelRatio.getFontScale();
exports.fs = fs;
