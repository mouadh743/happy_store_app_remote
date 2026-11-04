import { useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { OrdersIcon, SearchIcon, SettingsIcon } from '@/components/icons';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { orderCode, useOrders, type OrderSummary } from '@/features/orders/api';
import { OrderCard } from '@/features/orders/OrderCard';
import type { StatusFilter } from '@/features/orders/status';
import { StatusFilterChips } from '@/features/orders/StatusFilterChips';
import { isSupabaseConfigured } from '@/lib/supabase';
import { strings } from '@/strings';
import { colors, spacing, type } from '@/theme';

function matches(order: OrderSummary, filter: StatusFilter, query: string): boolean {
  if (filter !== 'all' && order.status !== filter) return false;
  if (!query) return true;
  const code = query.replace(/^#/, '');
  return (
    (order.customer_name ?? '').toLowerCase().includes(query) ||
    (code.length > 0 && orderCode(order).toLowerCase().replace(/^#/, '').includes(code))
  );
}

export default function OrdersScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { data: orders, isPending, isError, refetch } = useOrders();

  const query = search.trim().toLowerCase();
  const isFiltered = filter !== 'all' || query.length > 0;
  const visible = (orders ?? []).filter((order) => matches(order, filter, query));

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilter('all');
  };

  let body;
  if (!isSupabaseConfigured) {
    body = (
      <View style={styles.centered}>
        <EmptyState
          icon={<SettingsIcon color={colors.primary} size={28} />}
          title={strings.settings.notConfigured}
          message={strings.settings.notConfiguredHint}
        />
      </View>
    );
  } else if (isPending) {
    body = (
      <Animated.View entering={FadeIn.delay(150)} style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </Animated.View>
    );
  } else if (isError && !orders) {
    body = (
      <View style={styles.centered}>
        <EmptyState
          icon={<OrdersIcon color={colors.primary} size={28} />}
          title={strings.orders.loadError}
          action={{ label: strings.orders.retry, onPress: () => refetch() }}
        />
      </View>
    );
  } else {
    body = (
      <Animated.FlatList
        data={visible}
        keyExtractor={(order) => order.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={cardEntering(index)} exiting={FadeOut.duration(150)}>
            <OrderCard order={item} />
          </Animated.View>
        )}
        // Remaining cards glide into place when a filter or search removes some.
        itemLayoutAnimation={LinearTransition.springify().damping(20).stiffness(220)}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={[styles.list, visible.length === 0 && styles.listEmpty]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Animated.View entering={FadeIn.duration(200)}>
            {isFiltered ? (
              <EmptyState
                icon={<SearchIcon color={colors.primary} size={28} />}
                title={strings.orders.emptyFiltered}
                message={strings.orders.emptyFilteredHint}
                action={{ label: strings.orders.clearFilters, onPress: clearFilters }}
              />
            ) : (
              <EmptyState
                icon={<OrdersIcon color={colors.primary} size={28} />}
                title={strings.orders.empty}
                message={strings.orders.emptyHint}
              />
            )}
          </Animated.View>
        }
      />
    );
  }

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

      {body}
    </Screen>
  );
}

// Cards visible on first paint slide up in a short cascade. Cards further down
// mount while scrolling, so they appear without a delay that would feel laggy.
const STAGGER_LIMIT = 10;
function cardEntering(index: number) {
  if (index >= STAGGER_LIMIT) return undefined;
  return FadeInDown.duration(260).delay(index * 35);
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.screen, gap: 16, marginBottom: 12 },
  title: { ...type.screenTitle, color: colors.text },
  list: { padding: spacing.screen, paddingBottom: 32 },
  // Bottom padding nudges the empty state slightly above the true centre.
  listEmpty: { flexGrow: 1, justifyContent: 'center', paddingBottom: 64 },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.screen, paddingBottom: 64 },
  separator: { height: 10 },
});
