export function formatBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unit = -1;
  do {
    size /= 1024;
    unit += 1;
  } while (size >= 1024 && unit < units.length - 1);
  const digits = size >= 100 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(digits)} ${units[unit]}`;
}

export function flattenGroups(groups) {
  return groups.flatMap((group) => group.files.map((file) => ({ ...file, groupId: group.id, groupSize: group.size })));
}

export function defaultSelection(groups) {
  const selected = new Set();
  for (const group of groups) {
    const eligible = group.files.filter((file) => !file.hardLink);
    eligible.slice(1).forEach((file) => selected.add(file.path));
  }
  return selected;
}

export function selectionForStrategy(groups, strategy, preferredFolder = '') {
  const selected = new Set();
  const preferred = preferredFolder.trim().toLowerCase();
  for (const group of groups) {
    const eligible = group.files.filter((file) => !file.hardLink);
    if (eligible.length < 2) continue;
    let keep = eligible[0];
    if (strategy === 'oldest') keep = [...eligible].sort((a, b) => (a.modified ?? 0) - (b.modified ?? 0))[0];
    if (strategy === 'newest') keep = [...eligible].sort((a, b) => (b.modified ?? 0) - (a.modified ?? 0))[0];
    if (strategy === 'shortest') keep = [...eligible].sort((a, b) => a.path.length - b.path.length || a.path.localeCompare(b.path))[0];
    if (strategy === 'preferred' && preferred) {
      const preferredFiles = eligible.filter((file) => file.path.toLowerCase().startsWith(preferred));
      if (preferredFiles.length) keep = preferredFiles.sort((a, b) => a.path.length - b.path.length)[0];
    }
    eligible.filter((file) => file.path !== keep.path).forEach((file) => selected.add(file.path));
  }
  return selected;
}

export function selectedReclaimable(groups, selected) {
  let total = 0;
  for (const group of groups) {
    for (const file of group.files) {
      if (selected.has(file.path) && !file.hardLink) total += group.size;
    }
  }
  return total;
}

export function filterGroups(groups, query = '', minSize = 0, extension = 'all') {
  const q = query.trim().toLowerCase();
  return groups.filter((group) => {
    if (group.size < minSize) return false;
    if (extension !== 'all' && !group.files.some((file) => file.extension.toLowerCase() === extension.toLowerCase())) return false;
    if (!q) return true;
    return group.files.some((file) => file.name.toLowerCase().includes(q) || file.path.toLowerCase().includes(q));
  });
}

export function extensionChoices(groups) {
  const values = new Set();
  for (const group of groups) for (const file of group.files) if (file.extension) values.add(file.extension.toLowerCase());
  return [...values].sort((a, b) => a.localeCompare(b));
}

export function countDuplicateFiles(groups) {
  return groups.reduce((total, group) => total + Math.max(0, group.files.filter((file) => !file.hardLink).length - 1), 0);
}


