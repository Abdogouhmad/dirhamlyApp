//! Slint callback handlers.
//!
//! [`register_handlers`] wires every UI event (profile save, settings update,
//! reset, image picking, add/delete/filter transaction) to the corresponding
//! database command and triggers a state refresh afterwards.

use crate::commands;
use crate::db::DiBase;
use crate::money::parse_currency_code;
use crate::state::refresh_app_state;
use crate::AppWindow;
use slint::ComponentHandle;

/// Register every UI callback on the window.
///
/// Each callback captures a clone of the database handle and a weak reference
/// to the window, performs its database operation and then repopulates the UI
/// through [`refresh_app_state`].
pub fn register_handlers(window: &AppWindow, db: &DiBase) {
    // Save profile (from onboarding)
    let db_save = db.clone();
    let weak_save = window.as_weak();
    window.on_save_profile(move |name, img_path, currency| {
        let name_str = name.to_string();
        let img_str = if img_path.is_empty() {
            None
        } else {
            Some(img_path.to_string())
        };
        let curr_str = parse_currency_code(&currency).to_string();

        if let Err(e) = commands::set_profile(&db_save, name_str, img_str, curr_str) {
            eprintln!("Failed to save profile: {}", e);
        }

        if let Some(win) = weak_save.upgrade() {
            refresh_app_state(&win, &db_save, None);
        }
    });

    // Update settings (from settings dialog) — receives (name, currency, image_path)
    let db_settings = db.clone();
    let weak_settings = window.as_weak();
    window.on_update_settings(move |name, currency, img_path| {
        let name_str = name.to_string();
        let curr_str = parse_currency_code(&currency).to_string();
        let img_str = if img_path.is_empty() {
            None
        } else {
            Some(img_path.to_string())
        };

        if let Err(e) = commands::set_profile(&db_settings, name_str, img_str, curr_str) {
            eprintln!("Failed to update settings: {}", e);
        }

        if let Some(win) = weak_settings.upgrade() {
            refresh_app_state(&win, &db_settings, None);
        }
    });

    // Reset profile (delete all data)
    let db_reset = db.clone();
    let weak_reset = window.as_weak();
    window.on_reset_profile(move || {
        if let Err(e) = commands::reset_all_data(&db_reset) {
            eprintln!("Failed to reset data: {}", e);
        }

        if let Some(win) = weak_reset.upgrade() {
            win.set_show_settings(false);
            refresh_app_state(&win, &db_reset, None);
        }
    });

    // Pick profile image (native file dialog)
    let weak_pfp = window.as_weak();
    window.on_pick_profile_image(move || {
        if let Some(win) = weak_pfp.upgrade() {
            if let Some(path) = rfd::FileDialog::new()
                .add_filter("Images", &["png", "jpg", "jpeg", "webp", "bmp", "gif"])
                .pick_file()
            {
                if let Ok(img) = slint::Image::load_from_path(&path) {
                    win.set_profile_image_path(path.to_string_lossy().as_ref().into());
                    win.set_profile_image_data(img);
                }
            }
        }
    });

    // Add transaction
    let db_add = db.clone();
    let weak_add = window.as_weak();
    window.on_add_transaction(move |tx_type, amount, category, desc, date| {
        let desc_opt = if desc.is_empty() {
            None
        } else {
            Some(desc.to_string())
        };

        if let Err(e) = commands::add_tx(
            &db_add,
            tx_type.to_string(),
            amount.to_string(),
            category.to_string(),
            desc_opt,
            date.to_string(),
        ) {
            eprintln!("Failed to add transaction: {}", e);
        }

        if let Some(win) = weak_add.upgrade() {
            refresh_app_state(&win, &db_add, None);
        }
    });

    // Delete transaction
    let db_delete = db.clone();
    let weak_delete = window.as_weak();
    window.on_delete_transaction(move |id| {
        if let Err(e) = commands::delete_tx(&db_delete, id as i64) {
            eprintln!("Failed to delete transaction: {}", e);
        }

        if let Some(win) = weak_delete.upgrade() {
            refresh_app_state(&win, &db_delete, None);
        }
    });

    // Filter transactions by month
    let db_filter = db.clone();
    let weak_filter = window.as_weak();
    window.on_filter_transactions(move |month_filter| {
        if let Some(win) = weak_filter.upgrade() {
            let filter_str = month_filter.to_string();
            refresh_app_state(&win, &db_filter, Some(&filter_str));
        }
    });
}
