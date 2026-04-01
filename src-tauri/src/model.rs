use std::str::FromStr;

use chrono::NaiveDate;
use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSqlOutput, ValueRef};
use rusqlite::ToSql;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumString, VariantNames as VariantNamesMacro};

// ── Enums ────────────────────────────────────────────────────────────────────

#[derive(
    Debug, Clone, Copy, PartialEq, Display, EnumString, VariantNamesMacro, Serialize, Deserialize,
)]
#[strum(serialize_all = "snake_case", ascii_case_insensitive)]
#[serde(rename_all = "snake_case")]
pub enum TxType {
    Income,
    Expense,
}

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

#[derive(Debug, Clone, Serialize)]
pub struct MonthlyBalance {
    pub month: String,
    pub income: Decimal,
    pub expense: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Option<i64>,
    pub tx_type: TxType,
    pub amount: Decimal,
    pub category: Category,
    pub description: Option<String>,
    pub date: NaiveDate,
}

impl Transaction {
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
