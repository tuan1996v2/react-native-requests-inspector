export interface Insets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export declare const getDeviceSafeAreaFallback: () => Insets;
export declare const useSafeDeviceInsets: () => Insets;
