import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
}

export const NetworkIcon: FC<IconProps> = ({ size = 20, color = '#60A5FA' }) => {
  const barWidth = Math.max(2, Math.round(size * 0.14));
  const radius = barWidth / 2;
  return (
    <View
      style={[
        styles.networkContainer,
        {
          width: size,
          height: size,
          paddingHorizontal: size * 0.08,
          paddingVertical: size * 0.14,
        },
      ]}>
      <View
        style={{
          width: barWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: radius,
        }}
      />
      <View
        style={{
          width: barWidth,
          height: size * 0.56,
          backgroundColor: color,
          borderRadius: radius,
        }}
      />
      <View
        style={{
          width: barWidth,
          height: size * 0.72,
          backgroundColor: color,
          borderRadius: radius,
        }}
      />
      <View
        style={{
          width: barWidth,
          height: size * 0.4,
          backgroundColor: color,
          borderRadius: radius,
        }}
      />
    </View>
  );
};

export const KeyIcon: FC<IconProps> = ({ size = 14, color = '#FBBF24' }) => {
  const stroke = Math.max(1.5, size * 0.14);
  const ringSize = size * 0.48;
  return (
    <View style={[styles.rowCenter, { width: size, height: size }]}>
      <View
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: size * 0.42,
          height: stroke,
          backgroundColor: color,
          marginLeft: -stroke * 0.4,
          borderRadius: stroke / 2,
        }}>
        <View
          style={[
            styles.absolute,
            {
              right: size * 0.05,
              top: stroke * 0.5,
              width: stroke,
              height: size * 0.18,
              backgroundColor: color,
            },
          ]}
        />
        <View
          style={[
            styles.absolute,
            {
              right: size * 0.18,
              top: stroke * 0.5,
              width: stroke,
              height: size * 0.13,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

export const TrashIcon: FC<IconProps> = ({ size = 14, color = '#EF4444' }) => {
  const stroke = Math.max(1.4, size * 0.12);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.34,
          height: size * 0.14,
          borderTopWidth: stroke,
          borderLeftWidth: stroke,
          borderRightWidth: stroke,
          borderColor: color,
          borderTopLeftRadius: stroke,
          borderTopRightRadius: stroke,
        }}
      />
      <View
        style={{
          width: size * 0.78,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          marginBottom: size * 0.06,
        }}
      />
      <View
        style={[
          styles.trashBin,
          {
            width: size * 0.58,
            height: size * 0.56,
            borderWidth: stroke,
            borderColor: color,
            borderBottomLeftRadius: size * 0.12,
            borderBottomRightRadius: size * 0.12,
          },
        ]}>
        <View
          style={{
            width: stroke * 0.85,
            height: size * 0.3,
            backgroundColor: color,
          }}
        />
        <View
          style={{
            width: stroke * 0.85,
            height: size * 0.3,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

export const CloseIcon: FC<IconProps> = ({ size = 14, color = '#A1A1AA' }) => {
  const thickness = Math.max(1.8, size * 0.15);
  const length = size * 0.85;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={[
          styles.absolute,
          {
            width: length,
            height: thickness,
            backgroundColor: color,
            borderRadius: thickness / 2,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.absolute,
          {
            width: length,
            height: thickness,
            backgroundColor: color,
            borderRadius: thickness / 2,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
    </View>
  );
};

export const CopyIcon: FC<IconProps> = ({ size = 14, color = '#60A5FA' }) => {
  const stroke = Math.max(1.4, size * 0.12);
  const boxSize = size * 0.62;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.absolute,
          {
            top: size * 0.08,
            left: size * 0.08,
            width: boxSize,
            height: boxSize,
            borderTopWidth: stroke,
            borderLeftWidth: stroke,
            borderColor: color,
            borderTopLeftRadius: size * 0.12,
          },
        ]}
      />
      <View
        style={[
          styles.absolute,
          {
            bottom: size * 0.08,
            right: size * 0.08,
            width: boxSize,
            height: boxSize,
            borderWidth: stroke,
            borderColor: color,
            borderRadius: size * 0.12,
          },
        ]}
      />
    </View>
  );
};

export const ChevronLeftIcon: FC<IconProps> = ({ size = 18, color = '#60A5FA' }) => {
  const stroke = Math.max(2, size * 0.14);
  const box = size * 0.52;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: box,
          height: box,
          borderLeftWidth: stroke,
          borderBottomWidth: stroke,
          borderColor: color,
          marginLeft: size * 0.14,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
};

export const EmptyBoxIcon: FC<IconProps> = ({ size = 48, color = '#3F3F46' }) => {
  const stroke = Math.max(2, size * 0.06);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={[
          styles.overflowHidden,
          {
            width: size * 0.78,
            height: size * 0.68,
            borderWidth: stroke,
            borderColor: color,
            borderRadius: size * 0.12,
          },
        ]}>
        <View
          style={[
            styles.center,
            {
              height: size * 0.22,
              borderBottomWidth: stroke,
              borderColor: color,
            },
          ]}>
          <View
            style={{
              width: size * 0.26,
              height: stroke,
              backgroundColor: color,
              borderRadius: stroke / 2,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export const PauseIcon: FC<IconProps> = ({ size = 14, color = '#E4E4E7' }) => {
  const barW = Math.max(2.5, size * 0.24);
  return (
    <View style={[styles.pauseContainer, { width: size, height: size }]}>
      <View
        style={{
          width: barW,
          height: size * 0.72,
          backgroundColor: color,
          borderRadius: barW * 0.3,
        }}
      />
      <View
        style={{
          width: barW,
          height: size * 0.72,
          backgroundColor: color,
          borderRadius: barW * 0.3,
        }}
      />
    </View>
  );
};

export const PlayIcon: FC<IconProps> = ({ size = 14, color = '#10B981' }) => {
  const halfH = size * 0.38;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={[
          styles.playTriangle,
          {
            marginLeft: size * 0.12,
            borderTopWidth: halfH,
            borderBottomWidth: halfH,
            borderLeftWidth: size * 0.64,
            borderLeftColor: color,
          },
        ]}
      />
    </View>
  );
};

export const SearchIcon: FC<IconProps> = ({ size = 16, color = '#71717A' }) => {
  const stroke = Math.max(1.6, size * 0.12);
  const circleSize = size * 0.62;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.absolute,
          {
            top: size * 0.08,
            left: size * 0.08,
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: stroke,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.absolute,
          {
            bottom: size * 0.14,
            right: size * 0.06,
            width: size * 0.36,
            height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
    </View>
  );
};

export const ShareIcon: FC<IconProps> = ({ size = 14, color = '#60A5FA' }) => {
  const stroke = Math.max(1.5, size * 0.12);
  return (
    <View
      style={[styles.shareContainer, { width: size, height: size, paddingVertical: size * 0.08 }]}>
      <View style={styles.alignCenter}>
        <View
          style={{
            width: size * 0.34,
            height: size * 0.34,
            borderTopWidth: stroke,
            borderLeftWidth: stroke,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
            marginBottom: -size * 0.2,
          }}
        />
        <View
          style={{
            width: stroke,
            height: size * 0.44,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
      </View>
      <View
        style={[
          styles.shareTray,
          {
            width: size * 0.76,
            height: size * 0.3,
            borderLeftWidth: stroke,
            borderRightWidth: stroke,
            borderBottomWidth: stroke,
            borderColor: color,
            borderBottomLeftRadius: size * 0.12,
            borderBottomRightRadius: size * 0.12,
          },
        ]}
      />
    </View>
  );
};

export const WarningIcon: FC<IconProps> = ({ size = 12, color = '#F87171' }) => {
  const stroke = Math.max(1.4, size * 0.13);
  return (
    <View
      style={[
        styles.center,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: color,
        },
      ]}>
      <View
        style={{
          width: stroke,
          height: size * 0.36,
          backgroundColor: color,
          borderRadius: stroke / 2,
        }}
      />
      <View
        style={{
          width: stroke,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          marginTop: Math.max(1, size * 0.08),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  alignCenter: {
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  pauseContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  playTriangle: {
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    height: 0,
    width: 0,
  },
  rowCenter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  shareContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareTray: {
    borderTopWidth: 0,
  },
  trashBin: {
    alignItems: 'center',
    borderTopWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
