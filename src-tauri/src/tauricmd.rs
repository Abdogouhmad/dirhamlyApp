use crate::db::DiBase;
use crate::model::Transaction;
use crate::model::TxType;
use std::str::FromStr;
// use std::path::PathBuf;
use tauri::State;

use chrono::NaiveDate;
use rust_decimal::Decimal;
// use strum::IntoEnumIterator; // if needed

#[tauri::command]
pub fn add_tx(
    state: State<'_, DiBase>,
    tx_type: String, // you'll convert in JS or here
    amount: String,
    category: String,
    description: Option<String>,
    date: String, // "2025-03-18"
) -> Result<i64, String> {
    let tx_type_enum = match tx_type.as_str() {
        "income" => TxType::Income,
        "expense" => TxType::Expense,
        _ => return Err("Invalid tx_type".to_string()),
    };

    let amount_dec = Decimal::from_str(&amount).map_err(|e| e.to_string())?;

    let date_naive = NaiveDate::parse_from_str(&date, "%Y-%m-%d").map_err(|e| e.to_string())?;

    let transaction = Transaction::new(tx_type_enum, amount_dec, category, description, date_naive);

    let id = state
        .add_transaction(&transaction)
        .map_err(|e| e.to_string())?;

    Ok(id)
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
    // year_month like "2025-03"
    state
        .get_transactions_by_month(&year_month)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_balance(state: State<'_, DiBase>) -> Result<String, String> {
    let bal = state.get_balance().map_err(|e| e.to_string())?;
    Ok(bal.to_string()) // or return Decimal if you serialize it properly
}

#[tauri::command]
pub fn delete_tx(state: State<'_, DiBase>, id: i64) -> Result<(), String> {
    state
        .delete_transaction(id)
        .map_err(|e| format!("Failed to delete transaction: {}", e))
}
