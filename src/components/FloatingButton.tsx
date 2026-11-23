import React, { FC, useCallback, useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useNetworkStore } from '../networkStore';
import { fs, ms, s, vs } from '../utils/responsive';
import { useSafeDeviceInsets } from '../utils/safeArea';
import { NetworkIcon } from './Icons';

const BUTTON_SIZE = s(54);
// Matches platform touch slop (~8-10dp) so a slightly shaky tap still opens the inspector
const TAP_THRESHOLD = 10;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const FloatingButton: FC = () => {
  const isEnabled = useNetworkStore(state => state.isEnabled);
  const showFloatingButton = useNetworkStore(state => state.showFloatingButton);
  const logsCount = useNetworkStore(state => state.logs.length);
  const hasErrors = useNetworkStore(state => state.logs.some(log => log.status === 'error'));
  const setModalVisible = useNetworkStore(state => state.setModalVisible);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeDeviceInsets();

  const minX = insets.left + s(8);
  const maxX = Math.max(minX, windowWidth - BUTTON_SIZE - insets.right - s(8));
  const minY = insets.top + vs(6);
  const maxY = Math.max(minY, windowHeight - BUTTON_SIZE - insets.bottom - vs(6));

  const initialY = clamp(windowHeight * 0.45, minY, maxY);

  const pan = useRef(new Animated.ValueXY({ x: maxX, y: initialY })).current;
  const positionRef = useRef({ x: maxX, y: initialY });
  const dragStartRef = useRef({ x: maxX, y: initialY });
  const snappedSideRef = useRef<'left' | 'right'>('right');
  const hasInitializedRef = useRef(false);

  const boundsRef = useRef({ minX, maxX, minY, maxY, windowWidth });
  boundsRef.current = { minX, maxX, minY, maxY, windowWidth };

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, [setModalVisible]);

  const openModalRef = useRef(openModal);
  openModalRef.current = openModal;

  useEffect(() => {
    const listenerId = pan.addListener(value => {
      positionRef.current = value;
    });
    return () => {
      pan.removeListener(listenerId);
    };
  }, [pan]);

  // Re-clamp & re-snap when screen dimensions or safe area insets change (rotation / iPad split view)
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return;
    }
    const targetX = snappedSideRef.current === 'left' ? minX : maxX;
    const clampedY = clamp(positionRef.current.y, minY, maxY);
    positionRef.current = { x: targetX, y: clampedY };
    pan.setValue({ x: targetX, y: clampedY });
  }, [minX, maxX, minY, maxY, pan]);

  const snapToNearestEdge = useCallback(() => {
    const bounds = boundsRef.current;
    const currentX = positionRef.current.x;
    const snapLeft = currentX < bounds.windowWidth / 2 - BUTTON_SIZE / 2;
    const targetX = snapLeft ? bounds.minX : bounds.maxX;
    snappedSideRef.current = snapLeft ? 'left' : 'right';

    Animated.spring(pan.x, {
      toValue: targetX,
      useNativeDriver: true,
      damping: 18,
      stiffness: 140,
      mass: 0.8,
    }).start();
  }, [pan.x]);

  const snapToNearestEdgeRef = useRef(snapToNearestEdge);
  snapToNearestEdgeRef.current = snapToNearestEdge;

  const panResponder = useRef(
    PanResponder.create({
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
        const isTap =
          Math.abs(gestureState.dx) < TAP_THRESHOLD && Math.abs(gestureState.dy) < TAP_THRESHOLD;

        if (isTap) {
          openModalRef.current();
        }

        snapToNearestEdgeRef.current();
      },
      onPanResponderTerminate: () => {
        snapToNearestEdgeRef.current();
      },
    }),
  ).current;

  if (!isEnabled || !showFloatingButton) {
    return null;
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.floatingContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}>
      <View style={styles.floatingButton}>
        <NetworkIcon color="#60A5FA" size={s(24)} />
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{logsCount}</Text>
        </View>
        {hasErrors ? <View style={styles.errorDot} /> : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: ms(8),
    bottom: -vs(4),
    justifyContent: 'center',
    minWidth: s(18),
    paddingHorizontal: s(4),
    paddingVertical: vs(1),
    position: 'absolute',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: fs(9),
    fontWeight: '700',
  },
  errorDot: {
    backgroundColor: '#EF4444',
    borderColor: '#1E1E1E',
    borderRadius: s(5),
    borderWidth: 1.5,
    height: s(10),
    position: 'absolute',
    right: 0,
    top: 0,
    width: s(10),
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
