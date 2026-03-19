use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumString, VariantNames};

#[derive(Debug, Clone, Copy, Display, EnumString, VariantNames, Serialize, Deserialize)]
#[strum(serialize_all = "lowercase")]
#[strum(ascii_case_insensitive)]
pub enum TxType {
    Income,
    Expense,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Option<i64>,
    pub tx_type: TxType,
    pub amount: Decimal,
    pub category: String,
    pub description: Option<String>,
    pub date: NaiveDate,
}

impl Transaction {
    pub fn new(
        tx_type: TxType,
        amount: Decimal,
        category: String,
        description: Option<String>,
        date: NaiveDate,
    ) -> Self {
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
