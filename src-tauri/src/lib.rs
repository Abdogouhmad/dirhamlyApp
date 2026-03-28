mod db;
mod model;
mod tauricmd;
use crate::db::DiBase;
use crate::tauricmd::{add_tx, delete_tx, get_all, get_balance, get_by_month, get_monthly_balance};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle();

            let data_dir = app_handle
                .path()
                .app_data_dir()
                .expect("cannot get app data dir");

            std::fs::create_dir_all(&data_dir).expect("failed to create app data directory");

            let db_path = data_dir.join("tx.db");

            // println!("DB path: {:?}", db_path);

            let db = DiBase::new(&db_path).expect("failed to open database");

            db.initialize().expect("failed to initialize database");

            app_handle.manage(db);

            Ok(())
        })
        // Register ALL commands in ONE call — very important!
        .invoke_handler(tauri::generate_handler![
            add_tx,
            get_all,
            get_by_month,
            get_balance,
            delete_tx,
            get_monthly_balance
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
