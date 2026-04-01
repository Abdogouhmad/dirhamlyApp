use crate::db::DiBase;
use crate::model::{Category, MonthlyBalance, Transaction, TxType};
use chrono::NaiveDate;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use std::str::FromStr;
use tauri::State;

#[tauri::command]
pub fn add_tx(
    state: State<'_, DiBase>,
    tx_type: String,
    amount: String,
    category: String,
    description: Option<String>,
    date: String,
) -> Result<i64, String> {
    let tx_type = tx_type
        .parse::<TxType>()
        .map_err(|_| format!("Invalid tx_type: '{}'", tx_type))?;

    let category = category
        .parse::<Category>()
        .map_err(|_| format!("Invalid category: '{}'", category))?;

    if !category.is_valid_for(tx_type) {
        return Err(format!(
            "Category '{}' is not valid for tx_type '{}'",
            category, tx_type
        ));
    }

    let amount = Decimal::from_str(&amount).map_err(|e| e.to_string())?;
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d").map_err(|e| e.to_string())?;

    let transaction = Transaction::new(tx_type, amount, category, description, date);

    state
        .add_transaction(&transaction)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all(state: State<'_, DiBase>) -> Result<Vec<Transaction>, String> {
    state.get_all_transactions().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_by_month(
    state: State<'_, DiBase>,
    year_month: String,
) -> Result<Vec<Transaction>, String> {
    state
        .get_transactions_by_month(&year_month)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_balance(state: State<'_, DiBase>) -> Result<f64, String> {
    state
        .get_balance()
        .map_err(|e| e.to_string())?
        .to_f64()
        .ok_or_else(|| "Failed to convert balance to f64".to_string())
}

#[tauri::command]
pub fn delete_tx(state: State<'_, DiBase>, id: i64) -> Result<(), String> {
    state
        .delete_transaction(id)
        .map_err(|e| format!("Failed to delete transaction: {}", e))
}

#[tauri::command]
pub fn get_monthly_balance(
    state: State<'_, DiBase>,
    year: i32,
) -> Result<Vec<MonthlyBalance>, String> {
    state.get_monthly_balance(year).map_err(|e| e.to_string())
}
