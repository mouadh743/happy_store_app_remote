import { locale, strings } from '@/strings';

// Tunisian dinar uses 3 decimals: 86.5 -> "86.500 TND".
const moneyFormat = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function formatMoney(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return `${moneyFormat.format(Number.isFinite(n) ? n : 0)} ${strings.currency}`;
}

const timeFormat = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
const dayMonthFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
const fullDateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Today, 10:42" · "Yesterday, 18:03" · "29 Oct, 16:50" · "29 Oct 2025, 16:50" */
export function formatOrderDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const time = timeFormat.format(date);
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (dayDiff === 0) return `${strings.date.today}, ${time}`;
  if (dayDiff === 1) return `${strings.date.yesterday}, ${time}`;
  const day = date.getFullYear() === now.getFullYear() ? dayMonthFormat.format(date) : fullDateFormat.format(date);
  return `${day}, ${time}`;
}
