use blake3::Hasher as BlakeHasher;
use same_file::{is_same_file, Handle};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::hash::{DefaultHasher, Hash, Hasher as StdHasher};
use std::io::{BufReader, Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::UNIX_EPOCH;
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;
use walkdir::WalkDir;

const QUICK_CHUNK: usize = 64 * 1024;
const VERIFY_CHUNK: usize = 1024 * 1024;

#[derive(Clone)]
pub struct ScanState {
    cancel: Arc<AtomicBool>,
}

impl Default for ScanState {
    fn default() -> Self {
        Self { cancel: Arc::new(AtomicBool::new(false)) }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DuplicateFile {
    pub id: String,
    pub path: String,
    pub name: String,
    pub parent: String,
    pub extension: String,
    pub size: u64,
    pub modified: Option<i64>,
    pub hard_link: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DuplicateGroup {
    pub id: String,
    pub size: u64,
    pub hash: String,
    pub files: Vec<DuplicateFile>,
    pub reclaimable: u64,
    pub physical_files: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub groups: Vec<DuplicateGroup>,
    pub scanned_files: usize,
    pub candidate_files: usize,
    pub duplicate_files: usize,
    pub reclaimable: u64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScanProgress {
    phase: String,
    processed: usize,
    total: usize,
    path: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanOptions {
    pub recursive: bool,
    pub min_size: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashResult {
    pub removed: Vec<String>,
    pub failed: Vec<TrashFailure>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashFailure {
    pub path: String,
    pub error: String,
}

fn cancelled(state: &ScanState) -> Result<(), String> {
    if state.cancel.load(Ordering::Relaxed) {
        Err("SCAN_CANCELLED".into())
    } else {
        Ok(())
    }
}

fn emit_progress(app: &AppHandle, phase: &str, processed: usize, total: usize, path: Option<&Path>) {
    let payload = ScanProgress {
        phase: phase.into(),
        processed,
        total,
        path: path.map(|value| value.to_string_lossy().into_owned()),
    };
    let _ = app.emit("duplicate-progress", payload);
}

fn add_file(path: PathBuf, min_size: u64, files: &mut Vec<PathBuf>) {
    if let Ok(metadata) = fs::symlink_metadata(&path) {
        if metadata.file_type().is_symlink() || !metadata.is_file() || metadata.len() < min_size {
            return;
        }
        files.push(path);
    }
}

fn collect_paths(paths: &[String], options: &ScanOptions, app: &AppHandle, state: &ScanState) -> Result<Vec<PathBuf>, String> {
    let mut files = Vec::new();
    for raw in paths {
        cancelled(state)?;
        let path = PathBuf::from(raw);
        let metadata = match fs::symlink_metadata(&path) {
            Ok(value) => value,
            Err(_) => continue,
        };
        if metadata.file_type().is_symlink() {
            continue;
        }
        if metadata.is_file() {
            add_file(path, options.min_size, &mut files);
        } else if metadata.is_dir() && options.recursive {
            for entry in WalkDir::new(&path).follow_links(false).into_iter().filter_map(Result::ok) {
                cancelled(state)?;
                if entry.file_type().is_file() && !entry.file_type().is_symlink() {
                    add_file(entry.path().to_path_buf(), options.min_size, &mut files);
                    if files.len() % 250 == 0 {
                        emit_progress(app, "collecting", files.len(), 0, Some(entry.path()));
                    }
                }
            }
        } else if metadata.is_dir() {
            if let Ok(entries) = fs::read_dir(&path) {
                for entry in entries.flatten() {
                    cancelled(state)?;
                    add_file(entry.path(), options.min_size, &mut files);
                }
            }
        }
    }
    files.sort();
    files.dedup();
    emit_progress(app, "collecting", files.len(), files.len(), None);
    Ok(files)
}

fn quick_hash(path: &Path) -> Result<String, String> {
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    let size = file.metadata().map_err(|error| error.to_string())?.len();
    let mut hasher = BlakeHasher::new();
    hasher.update(&size.to_le_bytes());
    let mut first = vec![0u8; QUICK_CHUNK.min(size as usize)];
    if !first.is_empty() {
        file.read_exact(&mut first).map_err(|error| error.to_string())?;
        hasher.update(&first);
    }
    if size > QUICK_CHUNK as u64 {
        let tail = QUICK_CHUNK.min(size as usize);
        file.seek(SeekFrom::End(-(tail as i64))).map_err(|error| error.to_string())?;
        let mut last = vec![0u8; tail];
        file.read_exact(&mut last).map_err(|error| error.to_string())?;
        hasher.update(&last);
    }
    Ok(hasher.finalize().to_hex().to_string())
}

fn full_hash(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|error| error.to_string())?;
    let mut reader = BufReader::with_capacity(VERIFY_CHUNK, file);
    let mut hasher = BlakeHasher::new();
    let mut buffer = vec![0u8; VERIFY_CHUNK];
    loop {
        let count = reader.read(&mut buffer).map_err(|error| error.to_string())?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }
    Ok(hasher.finalize().to_hex().to_string())
}

fn same_bytes(left: &Path, right: &Path) -> Result<bool, String> {
    let left_meta = fs::metadata(left).map_err(|error| error.to_string())?;
    let right_meta = fs::metadata(right).map_err(|error| error.to_string())?;
    if left_meta.len() != right_meta.len() {
        return Ok(false);
    }
    let mut a = BufReader::with_capacity(VERIFY_CHUNK, File::open(left).map_err(|error| error.to_string())?);
    let mut b = BufReader::with_capacity(VERIFY_CHUNK, File::open(right).map_err(|error| error.to_string())?);
    let mut ab = vec![0u8; VERIFY_CHUNK];
    let mut bb = vec![0u8; VERIFY_CHUNK];
    loop {
        let ac = a.read(&mut ab).map_err(|error| error.to_string())?;
        let bc = b.read(&mut bb).map_err(|error| error.to_string())?;
        if ac != bc {
            return Ok(false);
        }
        if ac == 0 {
            return Ok(true);
        }
        if ab[..ac] != bb[..bc] {
            return Ok(false);
        }
    }
}

fn modified_ms(path: &Path) -> Option<i64> {
    fs::metadata(path).ok()?.modified().ok()?.duration_since(UNIX_EPOCH).ok().map(|value| value.as_millis() as i64)
}

fn to_duplicate_files(paths: &[PathBuf], size: u64) -> (Vec<DuplicateFile>, usize) {
    let mut physical_buckets: HashMap<u64, Vec<PathBuf>> = HashMap::new();
    let mut physical_files = 0usize;
    let mut result = Vec::new();
    for path in paths {
        let hard_link = match Handle::from_path(path) {
            Ok(handle) => {
                let mut hasher = DefaultHasher::new();
                handle.hash(&mut hasher);
                let key = hasher.finish();
                drop(handle);
                let bucket = physical_buckets.entry(key).or_default();
                let same = bucket.iter().any(|representative| is_same_file(representative, path).unwrap_or(false));
                if same {
                    true
                } else {
                    bucket.push(path.clone());
                    physical_files += 1;
                    false
                }
            }
            Err(_) => {
                physical_files += 1;
                false
            }
        };
        let name = path.file_name().and_then(|value| value.to_str()).unwrap_or_default().to_string();
        let parent = path.parent().map(|value| value.to_string_lossy().into_owned()).unwrap_or_default();
        let extension = path.extension().and_then(|value| value.to_str()).unwrap_or_default().to_lowercase();
        result.push(DuplicateFile {
            id: Uuid::new_v4().to_string(),
            path: path.to_string_lossy().into_owned(),
            name,
            parent,
            extension,
            size,
            modified: modified_ms(path),
            hard_link,
        });
    }
    (result, physical_files)
}

#[tauri::command]
pub fn cancel_scan(state: State<'_, ScanState>) {
    state.cancel.store(true, Ordering::Relaxed);
}

#[tauri::command]
pub async fn scan_duplicates(app: AppHandle, state: State<'_, ScanState>, paths: Vec<String>, options: ScanOptions) -> Result<ScanResult, String> {
    let scan_state = state.inner().clone();
    scan_state.cancel.store(false, Ordering::Relaxed);
    tauri::async_runtime::spawn_blocking(move || scan_duplicates_blocking(app, scan_state, paths, options))
        .await
        .map_err(|error| error.to_string())?
}

fn scan_duplicates_blocking(app: AppHandle, state: ScanState, paths: Vec<String>, options: ScanOptions) -> Result<ScanResult, String> {
    let files = collect_paths(&paths, &options, &app, &state)?;
    cancelled(&state)?;
    let scanned_files = files.len();
    let mut size_groups: HashMap<u64, Vec<PathBuf>> = HashMap::new();
    for path in files {
        if let Ok(metadata) = fs::metadata(&path) {
            size_groups.entry(metadata.len()).or_default().push(path);
        }
    }
    size_groups.retain(|_, values| values.len() > 1);
    let candidate_files = size_groups.values().map(Vec::len).sum::<usize>();
    let mut quick_groups: HashMap<(u64, String), Vec<PathBuf>> = HashMap::new();
    let mut quick_processed = 0usize;
    for (size, paths) in size_groups {
        for path in paths {
            cancelled(&state)?;
            if let Ok(hash) = quick_hash(&path) {
                quick_groups.entry((size, hash)).or_default().push(path.clone());
            }
            quick_processed += 1;
            if quick_processed % 20 == 0 || quick_processed == candidate_files {
                emit_progress(&app, "quick", quick_processed, candidate_files, Some(&path));
            }
        }
    }
    quick_groups.retain(|_, values| values.len() > 1);
    let full_total = quick_groups.values().map(Vec::len).sum::<usize>();
    let mut full_groups: HashMap<(u64, String), Vec<PathBuf>> = HashMap::new();
    let mut full_processed = 0usize;
    for ((size, _), paths) in quick_groups {
        for path in paths {
            cancelled(&state)?;
            if let Ok(hash) = full_hash(&path) {
                full_groups.entry((size, hash)).or_default().push(path.clone());
            }
            full_processed += 1;
            if full_processed % 10 == 0 || full_processed == full_total {
                emit_progress(&app, "full", full_processed, full_total, Some(&path));
            }
        }
    }
    full_groups.retain(|_, values| values.len() > 1);
    let verify_total = full_groups.values().map(Vec::len).sum::<usize>();
    let mut verify_processed = 0usize;
    let mut groups = Vec::new();
    for ((size, hash), paths) in full_groups {
        cancelled(&state)?;
        let mut clusters: Vec<Vec<PathBuf>> = Vec::new();
        for path in paths {
            cancelled(&state)?;
            let mut matched = false;
            for cluster in &mut clusters {
                if same_bytes(&cluster[0], &path).unwrap_or(false) {
                    cluster.push(path.clone());
                    matched = true;
                    break;
                }
            }
            if !matched {
                clusters.push(vec![path.clone()]);
            }
            verify_processed += 1;
            if verify_processed % 10 == 0 || verify_processed == verify_total {
                emit_progress(&app, "verify", verify_processed, verify_total, Some(&path));
            }
        }
        for cluster in clusters.into_iter().filter(|value| value.len() > 1) {
            let (duplicate_files, physical_files) = to_duplicate_files(&cluster, size);
            let reclaimable = size.saturating_mul(physical_files.saturating_sub(1) as u64);
            groups.push(DuplicateGroup {
                id: Uuid::new_v4().to_string(),
                size,
                hash: hash.clone(),
                files: duplicate_files,
                reclaimable,
                physical_files,
            });
        }
    }
    groups.sort_by(|a, b| b.reclaimable.cmp(&a.reclaimable).then_with(|| b.size.cmp(&a.size)));
    let reclaimable = groups.iter().map(|group| group.reclaimable).sum();
    let duplicate_files = groups.iter().map(|group| group.physical_files.saturating_sub(1)).sum();
    emit_progress(&app, "complete", verify_total, verify_total, None);
    Ok(ScanResult { groups, scanned_files, candidate_files, duplicate_files, reclaimable })
}

#[tauri::command]
pub fn move_to_trash(paths: Vec<String>) -> TrashResult {
    let mut removed = Vec::new();
    let mut failed = Vec::new();
    for raw in paths {
        let path = PathBuf::from(&raw);
        let valid = fs::symlink_metadata(&path).map(|metadata| metadata.is_file() && !metadata.file_type().is_symlink()).unwrap_or(false);
        if !valid {
            failed.push(TrashFailure { path: raw, error: "File is unavailable or is not a regular file".into() });
            continue;
        }
        match trash::delete(&path) {
            Ok(_) => removed.push(raw),
            Err(error) => failed.push(TrashFailure { path: raw, error: error.to_string() }),
        }
    }
    TrashResult { removed, failed }
}
