import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, TOUCH_TARGET, type } from '@/theme';

type Props = {
  icon?: ReactNode;
  title: string;
  message?: string;
  /** Optional button, e.g. "Clear filters" or "Try again". */
  action?: { label: string; onPress: () => void };
};

/** Centred icon + message for empty lists and error screens. */
export function EmptyState({ icon, title, message, action }: Props) {
  return (
    <View style={styles.root}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingHorizontal: 24 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: 16,
  },
  title: { ...type.sectionTitle, fontSize: 17, color: colors.text, textAlign: 'center' },
  message: {
    ...type.body,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
  },
  action: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionPressed: { backgroundColor: colors.primarySoft },
  actionLabel: { ...type.bodyStrong, color: colors.primary },
});
