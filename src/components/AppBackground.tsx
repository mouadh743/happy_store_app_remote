import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Soft gradient wash behind every screen: a cool blue glow top-left, a violet
 * one top-right and a faint teal one at the bottom, over a light base. Kept
 * low-contrast so white cards and text stay easy to read.
 */
export const AppBackground = memo(function AppBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.bgTop} />
          <Stop offset="0.55" stopColor={colors.background} />
          <Stop offset="1" stopColor={colors.background} />
        </LinearGradient>
        <RadialGradient id="glowBlue" cx="0.05" cy="0" r="0.75" fx="0.05" fy="0">
          <Stop offset="0" stopColor={colors.primary} stopOpacity={0.2} />
          <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="glowViolet" cx="1" cy="0.08" r="0.6" fx="1" fy="0.08">
          <Stop offset="0" stopColor={colors.glowViolet} stopOpacity={0.16} />
          <Stop offset="1" stopColor={colors.glowViolet} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="glowTeal" cx="0.2" cy="1" r="0.7" fx="0.2" fy="1">
          <Stop offset="0" stopColor={colors.glowTeal} stopOpacity={0.1} />
          <Stop offset="1" stopColor={colors.glowTeal} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#base)" />
      <Rect width="100%" height="100%" fill="url(#glowBlue)" />
      <Rect width="100%" height="100%" fill="url(#glowViolet)" />
      <Rect width="100%" height="100%" fill="url(#glowTeal)" />
    </Svg>
  );
});
