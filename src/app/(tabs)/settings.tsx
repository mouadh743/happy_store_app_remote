import Constants from 'expo-constants';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow } from '@/components/SettingsGroup';
import { usePushStatus, type PushStatus } from '@/features/notifications/push';
import { getSupabaseHost } from '@/lib/config';
import { strings } from '@/strings';
import { colors, spacing, type } from '@/theme';

const appVersion = Constants.expoConfig?.version ?? '—';

/** Help text under the push row; for a failure, the step and the raw error. */
function pushFooter(push: PushStatus): string | undefined {
  if (push.state === 'checking') return undefined;
  if (push.state === 'failed') return `${strings.settings.pushFailedStep[push.step]}: ${push.message}`;
  return strings.settings.pushHint[push.state];
}

// Step 2 adds an "Account" group (signed-in email + "Sign out") at the top.
export default function SettingsScreen() {
  const supabaseHost = getSupabaseHost();
  const push = usePushStatus();

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

        <SettingsGroup title={strings.settings.notifications} footer={pushFooter(push)}>
          <SettingsRow
            label={strings.settings.push}
            value={strings.settings.pushState[push.state]}
            tone={push.state === 'registered' || push.state === 'checking' ? 'default' : 'warning'}
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
