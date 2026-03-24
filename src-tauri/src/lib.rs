mod db;
mod model;
mod tauricmd;

use crate::db::DiBase;
use std::path::PathBuf;

use crate::tauricmd::{add_tx, delete_tx, get_all, get_balance, get_by_month};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle();

            // Get safe cross-platform path
            let data_dir = app_handle
                .path()
                .app_data_dir()
                .expect("cannot get app data dir");

            let db_path_buf: PathBuf = data_dir.join("tx.db");
            let db_path = db_path_buf.to_str().expect("invalid db path");

            // Create DB instance
            let db = DiBase::new(db_path).expect("failed to open database");

            // Initialize tables
            db.initialize().expect("failed to initialize database");

            // Store in app state (can be cloned & accessed from commands)
            app_handle.manage(db);
            // TODO: remove this devtools block for prod
            // #[cfg(debug_assertions)]
            // {
            //     let window = app.get_webview_window("main").unwrap();
            //     window.open_devtools();
            //     window.close_devtools();
            // }
            Ok(())
        })
        // Register ALL commands in ONE call — very important!
        .invoke_handler(tauri::generate_handler![
            add_tx,
            get_all,
            get_by_month,
            get_balance,
            delete_tx
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
