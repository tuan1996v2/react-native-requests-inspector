"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const networkStore_1 = require("../networkStore");
const responsive_1 = require("../utils/responsive");
const safeArea_1 = require("../utils/safeArea");
const Icons_1 = require("./Icons");
const BUTTON_SIZE = (0, responsive_1.s)(54);
// Matches platform touch slop (~8-10dp) so a slightly shaky tap still opens the inspector
const TAP_THRESHOLD = 10;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const FloatingButton = () => {
    const isEnabled = (0, networkStore_1.useNetworkStore)(state => state.isEnabled);
    const showFloatingButton = (0, networkStore_1.useNetworkStore)(state => state.showFloatingButton);
    const logsCount = (0, networkStore_1.useNetworkStore)(state => state.logs.length);
    const hasErrors = (0, networkStore_1.useNetworkStore)(state => state.logs.some(log => log.status === 'error'));
    const setModalVisible = (0, networkStore_1.useNetworkStore)(state => state.setModalVisible);
    const { width: windowWidth, height: windowHeight } = (0, react_native_1.useWindowDimensions)();
    const insets = (0, safeArea_1.useSafeDeviceInsets)();
    const minX = insets.left + (0, responsive_1.s)(8);
    const maxX = Math.max(minX, windowWidth - BUTTON_SIZE - insets.right - (0, responsive_1.s)(8));
    const minY = insets.top + (0, responsive_1.vs)(6);
    const maxY = Math.max(minY, windowHeight - BUTTON_SIZE - insets.bottom - (0, responsive_1.vs)(6));
    const initialY = clamp(windowHeight * 0.45, minY, maxY);
    const pan = (0, react_1.useRef)(new react_native_1.Animated.ValueXY({ x: maxX, y: initialY })).current;
    const positionRef = (0, react_1.useRef)({ x: maxX, y: initialY });
    const dragStartRef = (0, react_1.useRef)({ x: maxX, y: initialY });
    const snappedSideRef = (0, react_1.useRef)('right');
    const hasInitializedRef = (0, react_1.useRef)(false);
    const boundsRef = (0, react_1.useRef)({ minX, maxX, minY, maxY, windowWidth });
    boundsRef.current = { minX, maxX, minY, maxY, windowWidth };
    const openModal = (0, react_1.useCallback)(() => {
        setModalVisible(true);
    }, [setModalVisible]);
    const openModalRef = (0, react_1.useRef)(openModal);
    openModalRef.current = openModal;
    (0, react_1.useEffect)(() => {
        const listenerId = pan.addListener(value => {
            positionRef.current = value;
        });
        return () => {
            pan.removeListener(listenerId);
        };
    }, [pan]);
    // Re-clamp & re-snap when screen dimensions or safe area insets change (rotation / iPad split view)
    (0, react_1.useEffect)(() => {
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            return;
        }
        const targetX = snappedSideRef.current === 'left' ? minX : maxX;
        const clampedY = clamp(positionRef.current.y, minY, maxY);
        positionRef.current = { x: targetX, y: clampedY };
        pan.setValue({ x: targetX, y: clampedY });
    }, [minX, maxX, minY, maxY, pan]);
    const snapToNearestEdge = (0, react_1.useCallback)(() => {
        const bounds = boundsRef.current;
        const currentX = positionRef.current.x;
        const snapLeft = currentX < bounds.windowWidth / 2 - BUTTON_SIZE / 2;
        const targetX = snapLeft ? bounds.minX : bounds.maxX;
        snappedSideRef.current = snapLeft ? 'left' : 'right';
        react_native_1.Animated.spring(pan.x, {
            toValue: targetX,
            useNativeDriver: true,
            damping: 18,
            stiffness: 140,
            mass: 0.8,
        }).start();
    }, [pan.x]);
    const snapToNearestEdgeRef = (0, react_1.useRef)(snapToNearestEdge);
    snapToNearestEdgeRef.current = snapToNearestEdge;
    const panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
            pan.stopAnimation(value => {
                positionRef.current = value;
            });
            dragStartRef.current = { ...positionRef.current };
        },
        onPanResponderMove: (_, gestureState) => {
            const bounds = boundsRef.current;
            const nextX = clamp(dragStartRef.current.x + gestureState.dx, bounds.minX, bounds.maxX);
            const nextY = clamp(dragStartRef.current.y + gestureState.dy, bounds.minY, bounds.maxY);
            pan.setValue({ x: nextX, y: nextY });
        },
        onPanResponderRelease: (_, gestureState) => {
            const isTap = Math.abs(gestureState.dx) < TAP_THRESHOLD && Math.abs(gestureState.dy) < TAP_THRESHOLD;
            if (isTap) {
                openModalRef.current();
            }
            snapToNearestEdgeRef.current();
        },
        onPanResponderTerminate: () => {
            snapToNearestEdgeRef.current();
        },
    })).current;
    if (!isEnabled || !showFloatingButton) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { ...panResponder.panHandlers, style: [
            styles.floatingContainer,
            {
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
        ], children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.floatingButton, children: [(0, jsx_runtime_1.jsx)(Icons_1.NetworkIcon, { color: "#60A5FA", size: (0, responsive_1.s)(24) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.countBadge, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.countText, children: logsCount }) }), hasErrors ? (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.errorDot }) : null] }) }));
};
exports.FloatingButton = FloatingButton;
const styles = react_native_1.StyleSheet.create({
    countBadge: {
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        borderRadius: (0, responsive_1.ms)(8),
        bottom: -(0, responsive_1.vs)(4),
        justifyContent: 'center',
        minWidth: (0, responsive_1.s)(18),
        paddingHorizontal: (0, responsive_1.s)(4),
        paddingVertical: (0, responsive_1.vs)(1),
        position: 'absolute',
    },
    countText: {
        color: '#FFFFFF',
        fontSize: (0, responsive_1.fs)(9),
        fontWeight: '700',
    },
    errorDot: {
        backgroundColor: '#EF4444',
        borderColor: '#1E1E1E',
        borderRadius: (0, responsive_1.s)(5),
        borderWidth: 1.5,
        height: (0, responsive_1.s)(10),
        position: 'absolute',
        right: 0,
        top: 0,
        width: (0, responsive_1.s)(10),
    },
    floatingButton: {
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderColor: '#3B82F6',
        borderRadius: BUTTON_SIZE / 2,
        borderWidth: 2,
        elevation: 10,
        height: BUTTON_SIZE,
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        width: BUTTON_SIZE,
    },
    floatingContainer: {
        elevation: 9999,
        height: BUTTON_SIZE,
        left: 0,
        position: 'absolute',
        top: 0,
        width: BUTTON_SIZE,
        zIndex: 9999,
    },
});
