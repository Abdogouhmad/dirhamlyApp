//! UI state population: reads the database and pushes fresh values into the
//! Slint window after any mutation or page transition.

use crate::commands;
use crate::db::DiBase;
use crate::model::TxType;
use crate::money::{format_money, parse_currency_code};
use crate::{AppWindow, CategoryItemData, ChartBarGroup, TransactionRowData};
use chrono::Datelike;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use slint::{ModelRc, VecModel};
use std::collections::HashMap;
use std::path::Path;

/// Derive the avatar initials from a display name.
///
/// Takes the first character of the trimmed name and uppercases it, defaulting
/// to `"U"` for empty names.
pub fn get_avatar_initials(name: &str) -> String {
    name.trim()
        .chars()
        .next()
        .map(|c| c.to_uppercase().to_string())
        .unwrap_or_else(|| "U".to_string())
}

/// Load the profile image at `path_str` into the window.
///
/// No-op when the path is empty or the image cannot be loaded.
pub fn load_profile_image(window: &AppWindow, path_str: &str) {
    if !path_str.is_empty() {
        if let Ok(img) = slint::Image::load_from_path(Path::new(path_str)) {
            window.set_profile_image_path(path_str.into());
            window.set_profile_image_data(img);
        }
    }
}

/// Pull fresh data from the database and repopulate every dashboard widget.
///
/// When `filter_month` is `Some` and non-empty only transactions matching that
/// `YYYY-MM` prefix are loaded; otherwise all transactions are shown. The call
/// also refreshes summary cards, the monthly chart and the category breakdown.
pub fn refresh_app_state(window: &AppWindow, db: &DiBase, filter_month: Option<&str>) {
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
        window.set_currency(parse_currency_code(&p.currency).into());
        if let Some(ref img_path) = p.image {
            load_profile_image(window, img_path);
        }
        window.set_active_page(1);
    } else {
        window.set_active_page(0);
        return;
    }

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

    let current_year = chrono::Local::now().year();
    let monthly_balances = commands::get_monthly_balance(db, current_year).unwrap_or_default();

    let mut monthly_models: Vec<ChartBarGroup> = Vec::new();
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

        monthly_models.push(ChartBarGroup {
            label: short_month.into(),
            primary: inc as f32,
            secondary: exp as f32,
        });
    }

    window.set_monthly_data(ModelRc::new(VecModel::from(monthly_models)));
    window.set_monthly_max(max_val_f64 as f32);

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
