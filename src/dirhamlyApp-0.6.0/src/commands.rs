//! A minimized and clean way to interact with the database.
//! hence this module represents the database API through commands.
use crate::db::DiBase;
use crate::model::{Category, MonthlyBalance, Profile, Transaction, TxType};
use anyhow::{anyhow, Result};
use chrono::NaiveDate;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use std::str::FromStr;

/// a command to get a profile from database
pub fn get_profile(db: &DiBase) -> Result<Option<Profile>> {
    db.get_profile()
}

/// a command to set a profile in database
pub fn set_profile(
    db: &DiBase,
    name: String,
    image: Option<String>,
    currency: String,
) -> Result<()> {
    let profile = Profile {
        name,
        image,
        currency,
    };
    db.upsert_profile(&profile)
}

/// a command to add a transaction to database
pub fn add_tx(
    db: &DiBase,
    tx_type: String,
    amount: String,
    category: String,
    description: Option<String>,
    date: String,
) -> Result<i64> {
    let tx_type = tx_type
        .parse::<TxType>()
        .map_err(|_| anyhow!("Invalid tx_type: '{}'", tx_type))?;

    let category = category
        .parse::<Category>()
        .map_err(|_| anyhow!("Invalid category: '{}'", category))?;

    if !category.is_valid_for(tx_type) {
        return Err(anyhow!(
            "Category '{}' is not valid for tx_type '{}'",
            category,
            tx_type
        ));
    }

    let amount = Decimal::from_str(&amount).map_err(|e| anyhow!("Invalid amount: {}", e))?;
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| anyhow!("Invalid date format: {}", e))?;

    let transaction = Transaction::new(tx_type, amount, category, description, date);

    db.add_transaction(&transaction)
}

/// a command to get all transactions from database
pub fn get_all(db: &DiBase) -> Result<Vec<Transaction>> {
    db.get_all_transactions()
}

/// a command to get transactions by month from database
pub fn get_by_month(db: &DiBase, year_month: String) -> Result<Vec<Transaction>> {
    db.get_transactions_by_month(&year_month)
}

/// a command to get balance from database
pub fn get_balance(db: &DiBase) -> Result<f64> {
    db.get_balance()?
        .to_f64()
        .ok_or_else(|| anyhow!("Failed to convert balance to f64"))
}

/// a command to delete a transaction from database
pub fn delete_tx(db: &DiBase, id: i64) -> Result<()> {
    db.delete_transaction(id)
}

/// a command to convert all transactions from database
#[allow(dead_code)]
pub fn convert_all_tx(db: &DiBase, rate: f64) -> Result<()> {
    db.bulk_convert_amounts(rate)
}
/// a command to get monthly balance from database
pub fn get_monthly_balance(db: &DiBase, year: i32) -> Result<Vec<MonthlyBalance>> {
    db.get_monthly_balance(year)
}

/// a command to reset all data from database
pub fn reset_all_data(db: &DiBase) -> Result<()> {
    db.delete_all_data()
}
