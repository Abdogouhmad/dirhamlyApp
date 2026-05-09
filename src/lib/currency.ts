import currency from "currency.js";

/**
 * Static mock exchange rates (Base: MAD)
 */
export const EXCHANGE_RATES: Record<string, number> = {
  MAD: 1,
  USD: 0.1,
  EUR: 0.092,
  GBP: 0.078,
  JPY: 15.1,
  CAD: 0.14,
};

/**
 * Calculates the multiplier to convert from one currency to another
 */
export function getConversionRate(from: string, to: string): number {
  const fromRate = EXCHANGE_RATES[from] || 1;
  const toRate = EXCHANGE_RATES[to] || 1;
  return toRate / fromRate;
}

/**
 * Formats a number or string amount using localized logic
 */
export function formatAmount(
  value: string | number | null | undefined,
  _currencyCode = "MAD",
  locale = "fr-MA"
): string {
  if (value == null || value === "") return "0,00";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0,00";

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (e) {
    return currency(num, { symbol: "", separator: " ", decimal: "," }).format();
  }
}
