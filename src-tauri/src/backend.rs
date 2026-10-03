use crate::core::{result, ActionOptions, ActionResult};
use blake3::Hasher;
use std::{collections::HashMap, fs::File, io::Read};
use walkdir::WalkDir;

fn hash_file(path:&str)->Result<String,String>{let mut f=File::open(path).map_err(|e|e.to_string())?;let mut h=Hasher::new();let mut b=[0u8;1024*1024];loop{let n=f.read(&mut b).map_err(|e|e.to_string())?;if n==0{break;}h.update(&b[..n]);}Ok(h.finalize().to_hex().to_string())}

#[tauri::command]
pub fn run_action(action:String,paths:Vec<String>,_options:ActionOptions)->ActionResult{
    if action!="scan_duplicates"{return result(false,"Preview feature","Deletion and similarity workflows are intentionally disabled in v0.1.0",action);}
    let Some(root)=paths.first()else{return result(false,"Folder required","Choose a folder to scan",String::new());};
    let mut by_size:HashMap<u64,Vec<String>>=HashMap::new();
    for e in WalkDir::new(root).follow_links(false).into_iter().filter_map(Result::ok){if !e.file_type().is_file(){continue;}if let Ok(m)=e.metadata(){if m.len()>0{by_size.entry(m.len()).or_default().push(e.path().to_string_lossy().into_owned());}}}
    let mut groups=Vec::new();let mut reclaim=0u64;
    for (size,items) in by_size.into_iter().filter(|(_,v)|v.len()>1){let mut by_hash:HashMap<String,Vec<String>>=HashMap::new();for p in items{if let Ok(h)=hash_file(&p){by_hash.entry(h).or_default().push(p);}}for (_,g) in by_hash.into_iter().filter(|(_,v)|v.len()>1){reclaim+=size*((g.len()-1)as u64);groups.push((size,g));}}
    let details=groups.iter().enumerate().map(|(i,(s,g))|format!("Group {} · {} bytes each\n{}",i+1,s,g.join("\n"))).collect::<Vec<_>>().join("\n\n");
    result(true,"Duplicate scan completed",&format!("{} groups · {} bytes potentially recoverable",groups.len(),reclaim),details)
}

