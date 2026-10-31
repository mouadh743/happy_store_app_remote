import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CloseIcon, SearchIcon } from '@/components/icons';
import { colors, radius, TOUCH_TARGET } from '@/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  /** Read by screen readers instead of the placeholder. */
  accessibilityLabel: string;
  clearLabel: string;
};

/** Rounded search input with a clear (×) button once something is typed. */
export function SearchField({ value, onChangeText, placeholder, accessibilityLabel, clearLabel }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.root, focused && styles.focused]}>
      <SearchIcon color={focused ? colors.primary : colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          style={({ pressed }) => [styles.clear, pressed && styles.clearPressed]}>
          <CloseIcon color={colors.textMuted} size={18} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingStart: 14,
    paddingEnd: 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
  },
  focused: { borderColor: colors.primary },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.text,
    // Android adds vertical padding to TextInput by default.
    paddingVertical: 0,
  },
  clear: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TOUCH_TARGET / 2,
  },
  clearPressed: { backgroundColor: colors.background },
});
