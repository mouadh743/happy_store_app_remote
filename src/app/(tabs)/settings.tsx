import Constants from 'expo-constants';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow } from '@/components/SettingsGroup';
import { getSupabaseHost } from '@/lib/config';
import { strings } from '@/strings';
import { colors, spacing, type } from '@/theme';

const appVersion = Constants.expoConfig?.version ?? '—';

// Step 2 adds an "Account" group (signed-in email + "Sign out") at the top.
export default function SettingsScreen() {
  const supabaseHost = getSupabaseHost();

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {strings.settings.title}
        </Text>

        <SettingsGroup
          title={strings.settings.connection}
          footer={supabaseHost ? undefined : strings.settings.notConfiguredHint}>
          <SettingsRow
            label={strings.settings.supabaseProject}
            value={supabaseHost ?? strings.settings.notConfigured}
            tone={supabaseHost ? 'default' : 'warning'}
          />
        </SettingsGroup>

        <SettingsGroup title={strings.settings.about}>
          <SettingsRow label={strings.settings.app} value={strings.appName} />
          <SettingsRow label={strings.settings.version} value={appVersion} />
        </SettingsGroup>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screen, paddingBottom: 32, gap: 24 },
  title: { ...type.screenTitle, color: colors.text },
});
