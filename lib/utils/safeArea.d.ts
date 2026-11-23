export interface Insets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export declare const getDeviceSafeAreaFallback: (windowWidth?: number, windowHeight?: number) => Insets;
export declare const useSafeDeviceInsets: () => Insets;
