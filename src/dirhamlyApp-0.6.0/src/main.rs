#![windows_subsystem = "windows"]
mod commands;
mod db;
mod handlers;
mod model;
mod money;
mod state;

use crate::db::DiBase;
use slint::ComponentHandle;

slint::include_modules!();

/// Application entry point.
///
/// Locates the data directory, opens (and initializes) the SQLite database,
/// creates the window, performs the initial state load and registers all UI
/// callbacks before starting the event loop.
fn main() -> anyhow::Result<()> {
    let data_dir = dirs::data_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not locate system data directory"))?
        .join("dirhamly");

    std::fs::create_dir_all(&data_dir)?;
    let db_path = data_dir.join("tx.db");

    let db = DiBase::new(&db_path)?;
    db.initialize()?;

    let window = AppWindow::new()?;

    state::refresh_app_state(&window, &db, None);
    handlers::register_handlers(&window, &db);

    window.run()?;

    Ok(())
}
