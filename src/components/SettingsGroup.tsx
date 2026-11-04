import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, type } from '@/theme';

type GroupProps = {
  title?: string;
  /** Small help text under the card. */
  footer?: string;
  children: ReactNode;
};

/** A titled white card of rows, with hairline separators between them. */
export function SettingsGroup({ title, footer, children }: GroupProps) {
  const rows = Children.toArray(children);
  return (
    <View>
      {title ? (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={styles.card}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={styles.separator} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        // Selectable so error details can be copied and shared.
        <Text style={styles.footer} selectable>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

type RowProps = {
  label: string;
  value: string;
  /** "warning" shows the value as an amber pill (e.g. "Not set up"). */
  tone?: 'default' | 'warning';
};

/** Label on the start side, read-only value on the end side. */
export function SettingsRow({ label, value, tone = 'default' }: RowProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}, ${value}`}>
      <Text style={styles.label}>{label}</Text>
      {tone === 'warning' ? (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{value}</Text>
        </View>
      ) : (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.meta,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    marginStart: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginStart: 16 },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: { fontSize: 15, color: colors.text },
  value: { fontSize: 15, color: colors.textMuted, flexShrink: 1 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.warningBg,
  },
  pillText: { ...type.pill, color: colors.warningText },
  footer: {
    ...type.meta,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 8,
    marginHorizontal: 4,
  },
});
