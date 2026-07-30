mod commands;
mod db;
mod model;

use crate::db::DiBase;
use crate::model::TxType;
use chrono::Datelike;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use rusty_money::{iso, Money};
use slint::{ComponentHandle, ModelRc, VecModel};
use std::collections::HashMap;

slint::include_modules!();

fn format_money(amount: &Decimal, currency_code: &str) -> String {
    let currency = match currency_code {
        "USD" => iso::USD,
        "EUR" => iso::EUR,
        "GBP" => iso::GBP,
        "MAD" => iso::MAD,
        _ => iso::MAD,
    };
    Money::from_decimal(*amount, currency).to_string()
}

fn get_avatar_initials(name: &str) -> String {
    name.trim()
        .chars()
        .next()
        .map(|c| c.to_uppercase().to_string())
        .unwrap_or_else(|| "U".to_string())
}

fn refresh_app_state(window: &AppWindow, db: &DiBase, filter_month: Option<&str>) {
    // 1. Check Profile
    let profile = match commands::get_profile(db) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Failed to get profile: {}", e);
            None
        }
    };

    if let Some(ref p) = profile {
        window.set_user_name(p.name.as_str().into());
        window.set_avatar_initials(get_avatar_initials(&p.name).into());
        window.set_currency(p.currency.as_str().into());
        window.set_active_page(1); // Dashboard
    } else {
        window.set_active_page(0); // Onboarding
        return;
    }

    // 2. Fetch Transactions (filtered by month if specified, else all)
    let tx_list = match filter_month {
        Some(m) if !m.is_empty() => commands::get_by_month(db, m.to_string()).unwrap_or_default(),
        _ => commands::get_all(db).unwrap_or_default(),
    };

    let mut total_income_dec = Decimal::ZERO;
    let mut total_expense_dec = Decimal::ZERO;

    let mut row_models: Vec<TransactionRowData> = Vec::new();
    let mut category_expenses: HashMap<String, Decimal> = HashMap::new();

    for tx in &tx_list {
        let is_income = matches!(tx.tx_type, TxType::Income);
        if is_income {
            total_income_dec += tx.amount;
        } else {
            total_expense_dec += tx.amount;
            *category_expenses
                .entry(tx.category.to_string())
                .or_insert(Decimal::ZERO) += tx.amount;
        }

        row_models.push(TransactionRowData {
            id: tx.id.unwrap_or(0) as i32,
            tx_type: tx.tx_type.to_string().into(),
            amount_str: tx.amount.to_string().into(),
            category: tx.category.to_string().into(),
            description: tx.description.clone().unwrap_or_default().into(),
            date: tx.date.format("%Y-%m-%d").to_string().into(),
            is_income,
        });
    }

    window.set_transactions(ModelRc::new(VecModel::from(row_models)));

    // 3. Balance Metrics
    let balance_f64 = commands::get_balance(db).unwrap_or(0.0);
    let net_savings_dec = total_income_dec - total_expense_dec;

    let currency_code = profile
        .as_ref()
        .map(|p| p.currency.as_str())
        .unwrap_or("MAD");
    window.set_total_income(format_money(&total_income_dec, currency_code).into());
    window.set_total_expense(format_money(&total_expense_dec, currency_code).into());
    window.set_net_savings(format_money(&net_savings_dec, currency_code).into());
    let balance_dec = Decimal::try_from(balance_f64).unwrap_or(Decimal::ZERO);
    window.set_current_balance(format_money(&balance_dec, currency_code).into());

    // 4. Monthly Chart Data for current year
    let current_year = chrono::Local::now().year();
    let monthly_balances = commands::get_monthly_balance(db, current_year).unwrap_or_default();

    let mut monthly_models: Vec<MonthlyBalanceData> = Vec::new();
    let mut max_val_f64: f64 = 100.0;

    for m in &monthly_balances {
        let inc = m.income.to_f64().unwrap_or(0.0);
        let exp = m.expense.to_f64().unwrap_or(0.0);
        if inc > max_val_f64 {
            max_val_f64 = inc;
        }
        if exp > max_val_f64 {
            max_val_f64 = exp;
        }

        let short_month = if m.month.len() >= 7 {
            &m.month[5..7]
        } else {
            &m.month
        };

        monthly_models.push(MonthlyBalanceData {
            month: short_month.into(),
            income: inc as f32,
            expense: exp as f32,
        });
    }

    window.set_monthly_data(ModelRc::new(VecModel::from(monthly_models)));
    window.set_monthly_max(max_val_f64 as f32);

    // 5. Category Breakdown Data
    let total_expense_f64 = total_expense_dec.to_f64().unwrap_or(0.0);
    let mut cat_models: Vec<CategoryItemData> = Vec::new();

    let mut sorted_cats: Vec<_> = category_expenses.into_iter().collect();
    sorted_cats.sort_by_key(|b| std::cmp::Reverse(b.1));

    for (cat_name, amt) in sorted_cats {
        let amt_f64 = amt.to_f64().unwrap_or(0.0);
        let pct = if total_expense_f64 > 0.0 {
            amt_f64 / total_expense_f64
        } else {
            0.0
        };

        cat_models.push(CategoryItemData {
            category: cat_name.into(),
            amount: amt_f64 as f32,
            amount_str: amt.to_string().into(),
            percentage: pct as f32,
        });
    }

    window.set_category_data(ModelRc::new(VecModel::from(cat_models)));
}

fn main() -> anyhow::Result<()> {
    // 1. App Data directory setup
    let data_dir = dirs::data_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not locate system data directory"))?
        .join("dirhamly");

    std::fs::create_dir_all(&data_dir)?;
    let db_path = data_dir.join("tx.db");

    let db = DiBase::new(&db_path)?;
    db.initialize()?;

    // 2. Instantiate Slint App Window
    let window = AppWindow::new()?;

    // Initial state populate
    refresh_app_state(&window, &db, None);

    // 3. Register Callbacks

    // Save profile (from onboarding)
    let db_clone1 = db.clone();
    let window_weak1 = window.as_weak();
    window.on_save_profile(move |name, _img, currency| {
        let name_str = name.to_string();
        let curr_str = if currency.is_empty() {
            "MAD".to_string()
        } else {
            currency.to_string()
        };

        if let Err(e) = commands::set_profile(&db_clone1, name_str, None, curr_str) {
            eprintln!("Failed to save profile: {}", e);
        }

        if let Some(win) = window_weak1.upgrade() {
            refresh_app_state(&win, &db_clone1, None);
        }
    });

    // Update settings (from settings dialog)
    let db_clone_settings = db.clone();
    let window_weak_settings = window.as_weak();
    window.on_update_settings(move |name, currency| {
        let name_str = name.to_string();
        let curr_str = if currency.is_empty() {
            "MAD".to_string()
        } else {
            currency.to_string()
        };

        if let Err(e) = commands::set_profile(&db_clone_settings, name_str, None, curr_str) {
            eprintln!("Failed to update settings: {}", e);
        }

        if let Some(win) = window_weak_settings.upgrade() {
            refresh_app_state(&win, &db_clone_settings, None);
        }
    });

    // Reset profile (delete all data)
    let db_clone_reset = db.clone();
    let window_weak_reset = window.as_weak();
    window.on_reset_profile(move || {
        if let Err(e) = commands::reset_all_data(&db_clone_reset) {
            eprintln!("Failed to reset data: {}", e);
        }

        if let Some(win) = window_weak_reset.upgrade() {
            win.set_show_settings(false);
            refresh_app_state(&win, &db_clone_reset, None);
        }
    });

    // Add transaction
    let db_clone2 = db.clone();
    let window_weak2 = window.as_weak();
    window.on_add_transaction(move |tx_type, amount, category, desc, date| {
        let desc_opt = if desc.is_empty() {
            None
        } else {
            Some(desc.to_string())
        };

        if let Err(e) = commands::add_tx(
            &db_clone2,
            tx_type.to_string(),
            amount.to_string(),
            category.to_string(),
            desc_opt,
            date.to_string(),
        ) {
            eprintln!("Failed to add transaction: {}", e);
        }

        if let Some(win) = window_weak2.upgrade() {
            refresh_app_state(&win, &db_clone2, None);
        }
    });

    // Delete transaction
    let db_clone3 = db.clone();
    let window_weak3 = window.as_weak();
    window.on_delete_transaction(move |id| {
        if let Err(e) = commands::delete_tx(&db_clone3, id as i64) {
            eprintln!("Failed to delete transaction: {}", e);
        }

        if let Some(win) = window_weak3.upgrade() {
            refresh_app_state(&win, &db_clone3, None);
        }
    });

    // Filter transactions by month
    let db_clone4 = db.clone();
    let window_weak4 = window.as_weak();
    window.on_filter_transactions(move |month_filter| {
        if let Some(win) = window_weak4.upgrade() {
            let filter_str = month_filter.to_string();
            refresh_app_state(&win, &db_clone4, Some(&filter_str));
        }
    });

    // 4. Run App Loop
    window.run()?;

    Ok(())
}
