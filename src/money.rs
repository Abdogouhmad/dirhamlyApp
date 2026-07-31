//! Currency parsing and locale-aware money formatting helpers.

use rust_decimal::Decimal;
use rusty_money::{iso, Money};

/// Extract the raw ISO currency code from a ComboBox label.
///
/// The UI stores currencies as `"MAD - Moroccan Dirham"`; this returns the
/// leading code (`"MAD"`), falling back to the whole input when the label has
/// no `" - "` separator.
pub fn parse_currency_code(input: &str) -> &str {
    input.split(" - ").next().unwrap_or(input).trim()
}

/// Format a [`Decimal`] amount using the currency matching `currency_code`.
///
/// The code is normalized through [`parse_currency_code`]; unknown codes fall
/// back to Moroccan Dirham (MAD).
pub fn format_money(amount: &Decimal, currency_code: &str) -> String {
    let code = parse_currency_code(currency_code);
    let currency = match code {
        "USD" => iso::USD,
        "EUR" => iso::EUR,
        "GBP" => iso::GBP,
        "JPY" => iso::JPY,
        "CAD" => iso::CAD,
        "AUD" => iso::AUD,
        "CHF" => iso::CHF,
        "CNY" => iso::CNY,
        "INR" => iso::INR,
        "AED" => iso::AED,
        "SAR" => iso::SAR,
        "TRY" => iso::TRY,
        "SEK" => iso::SEK,
        "NOK" => iso::NOK,
        "DKK" => iso::DKK,
        "PLN" => iso::PLN,
        "BRL" => iso::BRL,
        "MXN" => iso::MXN,
        "ZAR" => iso::ZAR,
        "NGN" => iso::NGN,
        "EGP" => iso::EGP,
        "MAD" => iso::MAD,
        _ => iso::MAD,
    };
    Money::from_decimal(*amount, currency).to_string()
}
