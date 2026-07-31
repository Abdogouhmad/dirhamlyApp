//! Domain models and their SQLite conversions.
//!
//! Defines the [`TxType`] and [`Category`] enums plus the [`Transaction`],
//! [`Profile`] and [`MonthlyBalance`] structs. The enums can be (de)serialized
//! directly to/from SQLite text columns through the `ToSql`/`FromSql` impls.

use std::str::FromStr;

use chrono::NaiveDate;
use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSqlOutput, ValueRef};
use rusqlite::ToSql;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumString, VariantNames as VariantNamesMacro};

// ── Enums ────────────────────────────────────────────────────────────────────

/// Whether a transaction moves money in (`Income`) or out (`Expense`).
#[derive(
    Debug, Clone, Copy, PartialEq, Display, EnumString, VariantNamesMacro, Serialize, Deserialize,
)]
#[strum(serialize_all = "snake_case", ascii_case_insensitive)]
#[serde(rename_all = "snake_case")]
pub enum TxType {
    Income,
    Expense,
}

/// The expense/income category of a transaction.
#[derive(
    Debug, Clone, Copy, PartialEq, Display, EnumString, VariantNamesMacro, Serialize, Deserialize,
)]
#[strum(serialize_all = "snake_case", ascii_case_insensitive)]
#[serde(rename_all = "snake_case")]
pub enum Category {
    // Expense
    Food,
    Health,
    Entertainment,
    Utilities,
    Shopping,
    EShopping,
    Transport,
    Rent,
    // Income
    Salary,
    Freelance,
    Investment,
    BankInterest,
    Withdrawal,
    Gift,
    // Shared
    Other,
}

impl Category {
    /// Check whether this category may be used with the given transaction type.
    pub fn is_valid_for(&self, tx_type: TxType) -> bool {
        match tx_type {
            TxType::Expense => matches!(
                self,
                Self::Food
                    | Self::Health
                    | Self::Entertainment
                    | Self::Utilities
                    | Self::Shopping
                    | Self::EShopping
                    | Self::Transport
                    | Self::Withdrawal
                    | Self::Rent
                    | Self::Other
            ),
            TxType::Income => matches!(
                self,
                Self::Salary
                    | Self::Freelance
                    | Self::Investment
                    | Self::BankInterest
                    | Self::Gift
                    | Self::Other
            ),
        }
    }
}

// ── SQLite trait impls ────────────────────────────────────────────────────────

/// Implement `ToSql`/`FromSql` for a strum enum (stored as its string form).
macro_rules! impl_sql {
    ($t:ty) => {
        impl ToSql for $t {
            fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
                Ok(ToSqlOutput::from(self.to_string()))
            }
        }

        impl FromSql for $t {
            fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
                Self::from_str(value.as_str()?).map_err(|e| FromSqlError::Other(Box::new(e)))
            }
        }
    };
}

impl_sql!(TxType);
impl_sql!(Category);

// ── Structs ───────────────────────────────────────────────────────────────────

/// One month of aggregated income/expense, used by the monthly chart.
#[derive(Debug, Clone, Serialize)]
pub struct MonthlyBalance {
    /// `YYYY-MM` month key.
    pub month: String,
    /// Total income for the month.
    pub income: Decimal,
    /// Total expense for the month.
    pub expense: Decimal,
}

/// A single transaction record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    /// Database row id, `None` before the row is persisted.
    pub id: Option<i64>,
    pub tx_type: TxType,
    pub amount: Decimal,
    pub category: Category,
    pub description: Option<String>,
    pub date: NaiveDate,
}

/// The user profile stored in the `profile` table.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub name: String,
    /// Absolute path to the profile image, if any.
    pub image: Option<String>,
    /// ISO currency code (e.g. `"MAD"`).
    pub currency: String,
}

impl Transaction {
    /// Build a new transaction, asserting the category is valid for its type.
    pub fn new(
        tx_type: TxType,
        amount: Decimal,
        category: Category,
        description: Option<String>,
        date: NaiveDate,
    ) -> Self {
        assert!(
            category.is_valid_for(tx_type),
            "Category `{category}` is not valid for tx_type `{tx_type}`"
        );
        Self {
            id: None,
            tx_type,
            amount,
            category,
            description,
            date,
        }
    }
}
