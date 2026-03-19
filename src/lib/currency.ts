
/**
 * Formats a number or string amount as Moroccan Dirham (MAD) currency
 * Examples:
 *   formatCurrency(1234.5)     → "1 234,50 MAD"
 *   formatCurrency("45.67")    → "45,67 MAD"
 *   formatCurrency(-89.1)      → "-89,10 MAD"
 *   formatCurrency(0)          → "0,00 MAD"
 */
export function formatCurrency(
  value: string | number | null | undefined,
  currency = "MAD",
  locale = "fr-MA" // French Morocco → correct spacing, comma as decimal
): string {
  // Handle null/undefined/empty
  if (value == null || value === "") {
    return `0,00 ${currency}`;
  }

  // Convert to number safely
  const num = typeof value === "string" ? parseFloat(value) : value;

  // If not a valid number → fallback
  if (isNaN(num)) {
    return `0,00 ${currency}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    // Ensures correct MAD formatting (no extra symbols in some locales)
    currencyDisplay: "code", // shows "MAD" instead of symbol
  }).format(num);
}
