import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/AppBackground';
import { colors, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  /** Set false for screens that manage their own horizontal padding (e.g. lists). */
  padded?: boolean;
  style?: ViewStyle;
};

/** Gradient page background with top padding below the status bar / notch. */
export function Screen({ children, padded = true, style }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.headerTop },
        padded && styles.padded,
        style,
      ]}>
      <AppBackground />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // paddingHorizontal is direction-neutral, so it is RTL-safe.
  padded: { paddingHorizontal: spacing.screen },
});
