import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { OrdersIcon, SearchIcon } from '@/components/icons';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import type { StatusFilter } from '@/features/orders/status';
import { StatusFilterChips } from '@/features/orders/StatusFilterChips';
import { strings } from '@/strings';
import { colors, spacing, type } from '@/theme';

export default function OrdersScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const isFiltered = filter !== 'all' || search.trim().length > 0;

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {strings.orders.title}
        </Text>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder={strings.orders.searchPlaceholder}
          accessibilityLabel={strings.orders.searchLabel}
          clearLabel={strings.orders.clearSearch}
        />
      </View>

      <StatusFilterChips value={filter} onChange={setFilter} />

      {/* Step 3 swaps this for a FlatList of order cards, keeping the empty
          states below as its ListEmptyComponent. */}
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled">
        {isFiltered ? (
          <EmptyState
            icon={<SearchIcon color={colors.primary} size={28} />}
            title={strings.orders.emptyFiltered}
            message={strings.orders.emptyFilteredHint}
            action={{
              label: strings.orders.clearFilters,
              onPress: () => {
                setSearch('');
                setFilter('all');
              },
            }}
          />
        ) : (
          <EmptyState
            icon={<OrdersIcon color={colors.primary} size={28} />}
            title={strings.orders.empty}
            message={strings.orders.emptyHint}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.screen, gap: 16, marginBottom: 12 },
  title: { ...type.screenTitle, color: colors.text },
  // Bottom padding nudges the empty state slightly above the true centre.
  body: { flexGrow: 1, justifyContent: 'center', padding: spacing.screen, paddingBottom: 64 },
});
