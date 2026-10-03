mod duplicate;

use duplicate::{cancel_scan, move_to_trash, scan_duplicates, ScanState};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.set_icon(tauri::include_image!("./icons/icon.ico"))?;
                }
            }
            Ok(())
        })
        .manage(ScanState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![scan_duplicates, cancel_scan, move_to_trash])
        .run(tauri::generate_context!())
        .expect("error while running _davDUPLICATE");
}

