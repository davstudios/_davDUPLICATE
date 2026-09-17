import './styles.css';
import './motion.css';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { open, confirm } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';
import { countDuplicateFiles, defaultSelection, extensionChoices, filterGroups, formatBytes, selectedReclaimable, selectionForStrategy } from './duplicate-engine.js';

const icons = {
  duplicate: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="11" height="11" rx="2"/><rect x="9" y="9" width="11" height="11" rx="2"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 5"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3 6.5h6l2 2h10v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 8.5v-2a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M7 2h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v5h5"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="m13 2-8 12h7l-1 8 8-12h-7z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 9a7 7 0 0 1 11.7-2.6L20 9M4 15l2.2 2.6A7 7 0 0 0 17.9 15"/></svg>',
  globe: '<svg class="globe-icon" viewBox="0 0 390 390" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M195,0C87.305,0,0,87.304,0,195s87.305,195,195,195s195-87.304,195-195S302.695,0,195,0z M119.524,45.678c-3.493,4.838-6.838,10.033-10.007,15.6c-4.841,8.503-9.16,17.656-12.945,27.33c-8.064-2.22-16.089-4.713-24.064-7.483C85.91,66.718,101.813,54.667,119.524,45.678z M52.298,107.694c11.438,4.293,22.976,8.056,34.591,11.293c-4.78,18.934-7.744,39.182-8.745,60.087h-49.72C30.888,153.108,39.305,128.852,52.298,107.694z M52.298,282.306c-12.994-21.159-21.411-45.414-23.874-71.38h49.72c1.002,20.905,3.965,41.153,8.745,60.087C75.274,274.25,63.736,278.013,52.298,282.306z M72.508,308.876c7.975-2.77,16-5.265,24.063-7.483c3.786,9.674,8.105,18.827,12.946,27.33c3.168,5.566,6.514,10.762,10.007,15.6C101.813,335.333,85.91,323.283,72.508,308.876z M179.074,354.07c-20.393-7.648-38.458-29.593-51.05-59.894c16.931-3.125,33.977-5.059,51.05-5.8V354.07z M179.074,256.454c-20.448,0.818-40.862,3.221-61.117,7.191c-4.16-16.355-6.908-34.13-7.915-52.72h69.032V256.454z M179.074,179.074h-69.032c1.007-18.59,3.755-36.365,7.915-52.72c20.254,3.971,40.669,6.373,61.117,7.191V179.074z M179.074,101.623c-17.073-0.741-34.118-2.675-51.05-5.8c12.592-30.301,30.657-52.245,51.05-59.894V101.623z M337.703,107.697c12.993,21.157,21.409,45.412,23.872,71.377h-49.72c-1.001-20.903-3.965-41.151-8.744-60.083C314.727,115.754,326.266,111.992,337.703,107.697z M317.495,81.128c-7.975,2.77-16,5.265-24.065,7.484c-3.786-9.676-8.105-18.831-12.947-27.335c-3.169-5.566-6.514-10.762-10.006-15.6C288.189,54.668,304.092,66.72,317.495,81.128z M210.926,35.93c20.393,7.648,38.459,29.595,51.051,59.898c-16.931,3.124-33.977,5.057-51.051,5.797V35.93z M210.926,133.547c20.45-0.817,40.865-3.219,61.118-7.188c4.16,16.354,6.907,34.128,7.914,52.716h-69.032V133.547z M210.926,210.926h69.032c-1.007,18.588-3.754,36.362-7.914,52.716c-20.253-3.97-40.668-6.371-61.118-7.189V210.926z M210.926,354.07v-65.694c17.075,0.741,34.121,2.673,51.051,5.798C249.385,324.475,231.319,346.422,210.926,354.07z M270.477,344.322c3.493-4.838,6.838-10.033,10.006-15.6c4.842-8.504,9.161-17.659,12.947-27.334c8.064,2.22,16.089,4.714,24.065,7.484C304.092,323.28,288.189,335.332,270.477,344.322z M337.703,282.304c-11.437-4.296-22.976-8.058-34.591-11.296c4.779-18.932,7.742-39.179,8.744-60.082h49.72C359.112,236.891,350.696,261.146,337.703,282.304z"/></svg>',
  coffee: '<svg class="coffee-icon" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m20.216 6.415-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 0 0-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 0 0-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 0 1-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 0 1 3.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 0 1-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 0 1-4.743.295 37.059 37.059 0 0 1-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0 0 11.343.376.483.483 0 0 1 .535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 0 1 .39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 0 1-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 0 1-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 0 0-1.322-.238c-.826 0-1.491.284-2.26.613z"/></svg>'
};

const app = document.querySelector('#app');
const isTauri = '__TAURI_INTERNALS__' in window;
const saved = JSON.parse(localStorage.getItem('davduplicate-settings') || '{}');
const state = {
  page: 'exact',
  sources: [],
  groups: [],
  scanSummary: null,
  scanning: false,
  progress: { phase: '', processed: 0, total: 0, path: '' },
  selected: new Set(),
  expanded: new Set(),
  filter: { query: '', minSize: 0, extension: 'all' },
  strategy: 'all-but-one',
  preferredFolder: '',
  groupPage: 0,
  settings: {
    language: saved.language || 'it',
    theme: saved.theme || 'system',
    recursive: saved.recursive ?? true,
    minScanSize: saved.minScanSize ?? 1
  },
  activity: JSON.parse(localStorage.getItem('davduplicate-activity') || '[]'),
  appVersion: ''
};

function t(it, en) {
  return state.settings.language === 'en' ? en : it;
}

function saveSettings() {
  localStorage.setItem('davduplicate-settings', JSON.stringify(state.settings));
}

function applyTheme() {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const actual = state.settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : state.settings.theme;
  document.documentElement.dataset.theme = actual;
  document.documentElement.lang = state.settings.language;
}

function navButton(page, icon, label, disabled = false) {
  return `<button class="nav-item ${state.page === page ? 'active' : ''}" data-page="${page}" ${disabled ? 'disabled' : ''}>${icon}<span>${label}</span>${disabled ? `<small>${t('Presto', 'Soon')}</small>` : ''}</button>`;
}

function shell(content, motion = 'none') {
  applyTheme();
  app.innerHTML = `<div class="shell" data-motion-mode="${motion}">
    <aside class="sidebar">
      <div class="brand"><span>_dav</span>DUPLICATE</div>
      <nav>
        ${navButton('exact', icons.duplicate, t('Duplicati esatti', 'Exact duplicates'))}
        ${navButton('activity', icons.history, t('Attività', 'Activity'))}
        ${navButton('settings', icons.settings, t('Impostazioni', 'Settings'))}
      </nav>
      <div class="sidebar-bottom">
        <button class="coffee-button" data-action="coffee">${icons.coffee}<span>${t('Comprami Un Caffè', 'Buy Me A Coffee')}</span></button>
        <button class="icon-button theme-toggle" data-action="theme"><span class="theme-icon theme-icon-sun">${icons.sun}</span><span class="theme-icon theme-icon-moon">${icons.moon}</span></button>
      </div>
    </aside>
    <main class="main">${content}</main>
    <div id="toast-region"></div>
  </div>`;
  bindGlobalEvents();
}

function render(motion = 'none') {
  if (state.page === 'exact') renderExact(motion);
  if (state.page === 'activity') renderActivity(motion);
  if (state.page === 'settings') renderSettings(motion);
}

function renderExact(motion = 'none') {
  if (!state.scanSummary && !state.scanning) {
    shell(`<header class="topbar"><div><div class="eyebrow">_davDUPLICATE${state.appVersion ? ` · v${escapeHtml(state.appVersion)}` : ''}</div><h1>${t('Trova copie vere. Recupera spazio.', 'Find true copies. Reclaim space.')}</h1></div></header>
      <section class="empty-wrap">
        <div class="drop-zone" id="drop-zone">
          <div class="drop-icon">${icons.duplicate}</div>
          <h2>${t('Trascina file o cartelle qui', 'Drop files or folders here')}</h2>
          <p>${t('Confronto locale in quattro fasi: dimensione, quick hash, BLAKE3 completo e verifica byte per byte.', 'Local four-stage comparison: size, quick hash, full BLAKE3 and byte-for-byte verification.')}</p>
          <div class="drop-actions"><button class="button primary" data-action="add-folder">${icons.folder}${t('Apri cartella', 'Open folder')}</button><button class="button secondary" data-action="add-files">${icons.file}${t('Apri file', 'Open files')}</button></div>
          ${sourceList()}
          ${state.sources.length ? `<button class="button primary scan-main" data-action="scan">${icons.search}${t('Avvia scansione', 'Start scan')}</button>` : ''}
        </div>
        <div class="trust-row"><div><strong>${t('100% locale', '100% local')}</strong><span>${t('I file non vengono caricati online.', 'Files are never uploaded.')}</span></div><div><strong>${t('Verifica reale', 'True verification')}</strong><span>${t('L’hash non è l’ultimo controllo: i candidati vengono confrontati byte per byte.', 'Hashing is not the final check: candidates are compared byte for byte.')}</span></div><div><strong>${t('Hard link riconosciuti', 'Hard links recognized')}</strong><span>${t('Non vengono conteggiati come spazio duplicato.', 'They are not counted as duplicated storage.')}</span></div></div>
      </section>`, motion || 'startup');
    bindExactEvents();
    return;
  }
  if (state.scanning) {
    shell(scanView(), motion || 'content');
    bindExactEvents();
    return;
  }
  const visible = filterGroups(state.groups, state.filter.query, Number(state.filter.minSize), state.filter.extension);
  const perPage = 30;
  const pages = Math.max(1, Math.ceil(visible.length / perPage));
  state.groupPage = Math.min(state.groupPage, pages - 1);
  const pageGroups = visible.slice(state.groupPage * perPage, state.groupPage * perPage + perPage);
  shell(`<header class="topbar"><div><div class="eyebrow">${t('Duplicati esatti', 'Exact duplicates')}</div><h1>${t('Risultati scansione', 'Scan results')}</h1></div><div class="top-actions"><button class="button secondary" data-action="new-scan">${icons.refresh}${t('Nuova scansione', 'New scan')}</button></div></header>
    <section class="result-stats">
      ${statCard(t('File analizzati', 'Files scanned'), state.scanSummary.scannedFiles)}
      ${statCard(t('Gruppi', 'Groups'), state.groups.length)}
      ${statCard(t('Copie duplicate', 'Duplicate copies'), countDuplicateFiles(state.groups))}
      ${statCard(t('Recuperabile', 'Reclaimable'), formatBytes(state.scanSummary.reclaimable), 'accent')}
    </section>
    <section class="workspace duplicate-workspace">
      <div class="panel controls-panel">
        <div class="panel-head"><div><h2>${t('Selezione', 'Selection')}</h2><span>${state.selected.size} ${t('file selezionati', 'files selected')}</span></div></div>
        <label>${t('Auto-selezione', 'Auto selection')}${nativeSelect('strategy', [['all-but-one',t('Seleziona tutti tranne uno','Select all but one')],['oldest',t('Mantieni il più vecchio','Keep oldest')],['newest',t('Mantieni il più recente','Keep newest')],['shortest',t('Mantieni percorso più corto','Keep shortest path')],['preferred',t('Mantieni cartella preferita','Keep preferred folder')]], state.strategy)}</label>
        ${state.strategy === 'preferred' ? `<button class="folder-choice" data-action="preferred-folder">${icons.folder}<span><strong>${state.preferredFolder ? escapeHtml(baseName(state.preferredFolder)) : t('Scegli cartella preferita','Choose preferred folder')}</strong><small>${escapeHtml(state.preferredFolder || t('Nessuna cartella selezionata','No folder selected'))}</small></span></button>` : ''}
        <button class="button secondary full" data-action="apply-strategy">${icons.check}${t('Applica selezione', 'Apply selection')}</button>
        <div class="divider"></div>
        <label>${t('Dimensione minima visualizzata', 'Minimum displayed size')}${nativeSelect('min-size', [[0,t('Qualsiasi','Any')],[1024*1024,'1 MB'],[10*1024*1024,'10 MB'],[100*1024*1024,'100 MB'],[1024*1024*1024,'1 GB']], Number(state.filter.minSize))}</label>
        <label>${t('Estensione', 'Extension')}${nativeSelect('extension', [['all',t('Tutte','All')],...extensionChoices(state.groups).map((value)=>[value,`.${value}`])], state.filter.extension)}</label>
        <label>${t('Cerca', 'Search')}<div class="search-field">${icons.search}<input data-filter="query" value="${escapeAttr(state.filter.query)}" placeholder="${t('Nome o percorso…','Name or path…')}"></div></label>
        <div class="selection-summary"><span>${t('Spazio selezionato', 'Selected space')}</span><strong>${formatBytes(selectedReclaimable(state.groups, state.selected))}</strong></div>
        <button class="button danger full" data-action="trash-selected" ${state.selected.size ? '' : 'disabled'}>${icons.trash}${t('Sposta nel Cestino', 'Move to Trash')}</button>
        <p class="safety-note">${icons.shield}<span>${t('Nessun file viene eliminato automaticamente. Gli hard link sono esclusi dal calcolo dello spazio recuperabile.', 'No file is deleted automatically. Hard links are excluded from reclaimable-space calculations.')}</span></p>
      </div>
      <div class="groups-area">
        ${visible.length ? pageGroups.map(groupCard).join('') : `<div class="panel empty-results"><h2>${t('Nessun gruppo corrisponde ai filtri', 'No groups match the filters')}</h2><p>${t('Modifica ricerca, dimensione o estensione.', 'Change search, size, or extension.')}</p></div>`}
        ${pages > 1 ? `<div class="pager"><button class="button secondary compact" data-action="prev-page" ${state.groupPage === 0 ? 'disabled' : ''}>←</button><span>${state.groupPage + 1} / ${pages}</span><button class="button secondary compact" data-action="next-page" ${state.groupPage + 1 >= pages ? 'disabled' : ''}>→</button></div>` : ''}
      </div>
    </section>`, motion);
  bindExactEvents();
}

function sourceList() {
  if (!state.sources.length) return '';
  return `<div class="source-list">${state.sources.map((path) => `<div><span>${icons.folder}</span><strong>${escapeHtml(baseName(path))}</strong><small>${escapeHtml(path)}</small><button class="icon-button" data-remove-source="${escapeAttr(path)}">×</button></div>`).join('')}</div>`;
}

function scanView() {
  const p = state.progress;
  const percent = p.total ? Math.min(100, Math.round((p.processed / p.total) * 100)) : 0;
  const phase = { collecting:t('Raccolta file','Collecting files'), quick:t('Quick hash','Quick hash'), full:t('Hash BLAKE3 completo','Full BLAKE3 hash'), verify:t('Verifica byte per byte','Byte-for-byte verification'), complete:t('Completamento','Completing') }[p.phase] || t('Preparazione scansione','Preparing scan');
  return `<header class="topbar"><div><div class="eyebrow">${t('Scansione in corso', 'Scan in progress')}</div><h1>${phase}</h1></div></header>
    <section class="scan-stage panel"><div class="scan-orbit">${icons.search}</div><h2>${phase}</h2><p>${p.total ? `${p.processed.toLocaleString()} / ${p.total.toLocaleString()}` : `${p.processed.toLocaleString()} ${t('file trovati','files found')}`}</p><div class="progress-track"><div style="width:${percent}%"></div></div><small>${escapeHtml(p.path || '')}</small><button class="button secondary" data-action="cancel-scan">${icons.stop}${t('Annulla scansione','Cancel scan')}</button></section>`;
}

function statCard(label, value, className = '') {
  return `<div class="panel stat-card ${className}"><span>${label}</span><strong>${value}</strong></div>`;
}

function groupCard(group) {
  const expanded = state.expanded.has(group.id);
  const selectedInGroup = group.files.filter((file) => state.selected.has(file.path)).length;
  return `<article class="panel duplicate-group ${expanded ? 'is-expanded' : ''}">
    <button class="group-head" data-expand="${group.id}"><div><span class="group-kicker">${t('Gruppo duplicato', 'Duplicate group')}</span><h2>${group.files.length} ${t('file identici', 'identical files')}</h2></div><div class="group-metrics"><span>${formatBytes(group.size)} ${t('ciascuno','each')}</span><strong>${formatBytes(group.reclaimable)} ${t('recuperabili','reclaimable')}</strong><span class="chev">${icons.chevron}</span></div></button>
    ${expanded ? `<div class="group-files">${group.files.map((file, index) => fileRow(file, group, index)).join('')}</div><div class="group-foot"><span>${selectedInGroup} ${t('selezionati','selected')}</span><button class="text-button" data-select-group="${group.id}">${t('Seleziona tutti tranne uno','Select all but one')}</button></div>` : ''}
  </article>`;
}

function fileRow(file, group, index) {
  const checked = state.selected.has(file.path);
  const date = file.modified ? new Intl.DateTimeFormat(state.settings.language === 'en' ? 'en-US' : 'it-IT', { dateStyle:'medium', timeStyle:'short' }).format(new Date(file.modified)) : '—';
  return `<div class="duplicate-file ${file.hardLink ? 'is-hardlink' : ''}">
    <label class="file-check"><input type="checkbox" data-file-path="${escapeAttr(file.path)}" ${checked ? 'checked' : ''} ${file.hardLink ? 'disabled' : ''}><span></span></label>
    <div class="file-mark">${file.hardLink ? icons.link : icons.file}</div>
    <div class="file-copy"><strong>${escapeHtml(file.name)}</strong><small>${escapeHtml(file.parent)}</small></div>
    <div class="file-meta"><span>${date}</span><small>${file.hardLink ? t('Hard link · nessuno spazio extra','Hard link · no extra space') : index === 0 ? t('Copia iniziale','Initial copy') : formatBytes(group.size)}</small></div>
  </div>`;
}

function renderActivity(motion = 'page') {
  shell(`<header class="topbar"><div><div class="eyebrow">${t('Registro locale', 'Local log')}</div><h1>${t('Attività', 'Activity')}</h1></div></header><section class="panel activity-page">${state.activity.length ? state.activity.map((item) => `<div class="activity-item"><div><strong>${t(`${item.count} file spostati nel Cestino`, `${item.count} files moved to Trash`)}</strong><span>${new Intl.DateTimeFormat(state.settings.language === 'en' ? 'en-US' : 'it-IT', { dateStyle:'medium', timeStyle:'short' }).format(new Date(item.timestamp))} · ${formatBytes(item.bytes)}</span></div><span class="status ready">${t('Completato','Completed')}</span></div>`).join('') : `<div class="empty-mini"><h2>${t('Nessuna attività', 'No activity yet')}</h2><p>${t('Le operazioni di pulizia completate appariranno qui.', 'Completed cleanup operations will appear here.')}</p></div>`}</section>`, motion);
}

function renderSettings(motion = 'page') {
  shell(`<header class="topbar"><div><div class="eyebrow">_davDUPLICATE</div><h1>${t('Impostazioni', 'Settings')}</h1></div></header>
    <section class="settings-grid">
      <div class="panel settings-card"><h2>${t('Scansione', 'Scanning')}</h2><div class="setting-row"><span><strong>${t('Cartelle ricorsive','Recursive folders')}</strong><small>${t('Scansiona anche tutte le sottocartelle senza seguire symlink.','Scan subfolders without following symlinks.')}</small></span><label class="switch"><input type="checkbox" data-setting="recursive" ${state.settings.recursive ? 'checked' : ''}><span></span></label></div><div class="setting-control"><span class="setting-control-label">${t('Dimensione minima durante la scansione','Minimum size while scanning')}</span>${davSelect('minScanSize', String(state.settings.minScanSize), [['1',t('Qualsiasi file non vuoto','Any non-empty file')],['1048576','1 MB'],['10485760','10 MB'],['104857600','100 MB']])}</div></div>
      <div class="panel settings-card"><h2>${t('Aspetto', 'Appearance')}</h2><div class="setting-control"><span class="setting-control-label">${t('Tema','Theme')}</span>${davSelect('theme', state.settings.theme, [['system',t('Sistema','System')],['light',t('Chiaro','Light')],['dark',t('Scuro','Dark')]])}</div><div class="setting-control"><span class="setting-control-label">${t('Lingua','Language')}</span>${davSelect('language', state.settings.language, [['it','Italiano'],['en','English']])}</div></div>
      <div class="panel about-card"><div class="brand big"><span>_dav</span>DUPLICATE</div><p>${t('Ricerca duplicati esatti locale, verificata byte per byte e progettata per non cancellare automaticamente nulla.', 'Local exact-duplicate finder, verified byte for byte and designed to never delete anything automatically.')}</p><div class="about-links"><button class="website-button" data-action="website">${icons.globe}<span>davstudios.it</span></button><button class="coffee-button wide" data-action="coffee">${icons.coffee}<span>${t('Comprami Un Caffè','Buy Me A Coffee')}</span></button></div><div class="version">${state.appVersion ? `v${escapeHtml(state.appVersion)} · ` : ''}${t('Release stabile','Stable release')}</div></div>
    </section>`, motion);
  bindSettings();
}

function nativeSelect(id, options, value) {
  return `<select data-select="${id}">${options.map(([v,l]) => `<option value="${escapeAttr(v)}" ${String(v) === String(value) ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}</select>`;
}

function davSelect(id, value, options) {
  const selected = options.find(([v]) => String(v) === String(value)) || options[0];
  return `<div class="dav-select" data-dav-select="${id}"><button class="dav-select-trigger" type="button"><span>${escapeHtml(selected[1])}</span><span class="dav-select-chevron">${icons.chevron}</span></button><div class="dav-select-menu">${options.map(([v,l]) => `<button class="dav-select-option ${String(v) === String(value) ? 'is-selected' : ''}" data-value="${escapeAttr(v)}"><span>${escapeHtml(l)}</span><span class="dav-select-check">${icons.check}</span></button>`).join('')}</div></div>`;
}

function bindGlobalEvents() {
  document.querySelectorAll('[data-page]').forEach((node) => node.addEventListener('click', () => { state.page = node.dataset.page; render('page'); }));
  document.querySelectorAll('[data-action="coffee"]').forEach((node) => node.addEventListener('click', () => external('https://buymeacoffee.com/davstudios')));
  document.querySelectorAll('[data-action="website"]').forEach((node) => node.addEventListener('click', () => external(state.settings.language === 'en' ? 'https://www.davstudios.it/en' : 'https://www.davstudios.it')));
  document.querySelectorAll('[data-action="theme"]').forEach((node) => node.addEventListener('click', () => { const current = document.documentElement.dataset.theme; setVisualSetting('theme', current === 'dark' ? 'light' : 'dark', 'theme'); }));
}

function bindExactEvents() {
  document.querySelectorAll('[data-action="add-files"]').forEach((node) => node.addEventListener('click', addFiles));
  document.querySelectorAll('[data-action="add-folder"]').forEach((node) => node.addEventListener('click', addFolder));
  document.querySelectorAll('[data-remove-source]').forEach((node) => node.addEventListener('click', () => { state.sources = state.sources.filter((path) => path !== node.dataset.removeSource); render('content'); }));
  document.querySelector('[data-action="scan"]')?.addEventListener('click', startScan);
  document.querySelector('[data-action="cancel-scan"]')?.addEventListener('click', () => invoke('cancel_scan'));
  document.querySelector('[data-action="new-scan"]')?.addEventListener('click', () => { state.scanSummary = null; state.groups = []; state.selected.clear(); state.sources = []; render('content'); });
  document.querySelectorAll('[data-expand]').forEach((node) => node.addEventListener('click', () => { const id=node.dataset.expand; state.expanded.has(id) ? state.expanded.delete(id) : state.expanded.add(id); render(); }));
  document.querySelectorAll('[data-file-path]').forEach((node) => node.addEventListener('change', () => { node.checked ? state.selected.add(node.dataset.filePath) : state.selected.delete(node.dataset.filePath); render(); }));
  document.querySelectorAll('[data-select-group]').forEach((node) => node.addEventListener('click', () => { const group=state.groups.find((value)=>value.id===node.dataset.selectGroup); if (!group) return; group.files.filter((file)=>!file.hardLink).forEach((file,index)=> index ? state.selected.add(file.path) : state.selected.delete(file.path)); render(); }));
  document.querySelector('[data-action="apply-strategy"]')?.addEventListener('click', applyStrategy);
  document.querySelector('[data-action="preferred-folder"]')?.addEventListener('click', choosePreferredFolder);
  document.querySelector('[data-action="trash-selected"]')?.addEventListener('click', trashSelected);
  document.querySelector('[data-action="prev-page"]')?.addEventListener('click', () => { state.groupPage=Math.max(0,state.groupPage-1); render(); });
  document.querySelector('[data-action="next-page"]')?.addEventListener('click', () => { state.groupPage+=1; render(); });
  document.querySelector('[data-filter="query"]')?.addEventListener('input', (event) => { state.filter.query=event.target.value; state.groupPage=0; render(); requestAnimationFrame(()=>{ const input=document.querySelector('[data-filter="query"]'); input?.focus(); input?.setSelectionRange(input.value.length,input.value.length); }); });
  document.querySelector('[data-select="strategy"]')?.addEventListener('change', (event) => { state.strategy=event.target.value; render(); });
  document.querySelector('[data-select="min-size"]')?.addEventListener('change', (event) => { state.filter.minSize=Number(event.target.value); state.groupPage=0; render(); });
  document.querySelector('[data-select="extension"]')?.addEventListener('change', (event) => { state.filter.extension=event.target.value; state.groupPage=0; render(); });
}

function bindSettings() {
  document.querySelector('[data-setting="recursive"]')?.addEventListener('change', (event) => { state.settings.recursive=event.target.checked; saveSettings(); });
  document.querySelectorAll('.dav-select').forEach((select) => {
    const trigger=select.querySelector('.dav-select-trigger');
    trigger.addEventListener('click', () => { document.querySelectorAll('.dav-select.is-open').forEach((node)=>{ if(node!==select) node.classList.remove('is-open'); }); select.classList.toggle('is-open'); });
    select.querySelectorAll('.dav-select-option').forEach((option) => option.addEventListener('click', () => {
      const id=select.dataset.davSelect;
      const value=option.dataset.value;
      select.classList.remove('is-open');
      if (id === 'theme' || id === 'language') setVisualSetting(id, value, id);
      else { state.settings[id]=Number(value); saveSettings(); render(); }
    }));
  });
}

function setVisualSetting(key, value, kind) {
  if (String(state.settings[key]) === String(value)) return;
  const apply=()=>{ state.settings[key]=value; saveSettings(); render(); };
  document.documentElement.dataset.uiTransition=kind;
  if (document.startViewTransition) {
    const transition=document.startViewTransition(apply);
    transition.finished.finally(()=>delete document.documentElement.dataset.uiTransition);
  } else {
    document.documentElement.dataset.uiTransition=`${kind}-out`;
    setTimeout(()=>{ apply(); document.documentElement.dataset.uiTransition=`${kind}-in`; setTimeout(()=>delete document.documentElement.dataset.uiTransition,430); },180);
  }
}

async function addFiles() {
  const result=await open({ multiple:true, directory:false });
  if (result) addSources(Array.isArray(result) ? result : [result]);
}

async function addFolder() {
  const result=await open({ multiple:true, directory:true });
  if (result) addSources(Array.isArray(result) ? result : [result]);
}

function addSources(paths) {
  state.sources=[...new Set([...state.sources,...paths])];
  render('content');
}

async function startScan() {
  if (!state.sources.length || state.scanning) return;
  state.scanning=true;
  state.progress={ phase:'collecting', processed:0, total:0, path:'' };
  render('content');
  try {
    const result=await invoke('scan_duplicates',{ paths:state.sources, options:{ recursive:state.settings.recursive, minSize:Number(state.settings.minScanSize) } });
    state.groups=result.groups;
    state.scanSummary=result;
    state.selected=defaultSelection(state.groups);
    state.expanded=new Set(state.groups.slice(0,4).map((group)=>group.id));
    state.groupPage=0;
  } catch (error) {
    if (!String(error).includes('SCAN_CANCELLED')) toast(t('Scansione non completata.','Scan could not be completed.'),'warning');
  } finally {
    state.scanning=false;
    render('content');
  }
}

function applyStrategy() {
  const strategy=state.strategy === 'all-but-one' ? 'shortest' : state.strategy;
  state.selected=state.strategy === 'all-but-one' ? defaultSelection(state.groups) : selectionForStrategy(state.groups,strategy,state.preferredFolder);
  toast(t('Selezione aggiornata.','Selection updated.'));
  render();
}

async function choosePreferredFolder() {
  const result=await open({ multiple:false, directory:true });
  if (result) { state.preferredFolder=result; render(); }
}

async function trashSelected() {
  const paths=[...state.selected];
  if (!paths.length) return;
  const sizeByPath=new Map(state.groups.flatMap((group)=>group.files.map((file)=>[file.path,file.hardLink ? 0 : group.size])));
  const ok=await confirm(t(`Spostare ${paths.length} file nel Cestino? Gli originali selezionati non verranno eliminati definitivamente.`,`Move ${paths.length} files to Trash? Selected files will not be permanently deleted.`),{ title:'_davDUPLICATE', kind:'warning' });
  if (!ok) return;
  const result=await invoke('move_to_trash',{ paths });
  const removed=new Set(result.removed);
  if (removed.size) {
    const bytes=[...removed].reduce((total,path)=>total+(sizeByPath.get(path)||0),0);
    state.activity.unshift({ timestamp:Date.now(), count:removed.size, bytes });
    state.activity=state.activity.slice(0,100);
    localStorage.setItem('davduplicate-activity',JSON.stringify(state.activity));
  }
  if (result.failed.length) toast(t(`${result.failed.length} file non sono stati spostati.`,`${result.failed.length} files could not be moved.`),'warning');
  else toast(t('File spostati nel Cestino.','Files moved to Trash.'));
  if (removed.size) await startScan();
  else render('content');
}

async function external(url) {
  if (isTauri) await openUrl(url);
  else window.open(url,'_blank','noopener,noreferrer');
}

function baseName(path) {
  return String(path).replace(/[\\/]+$/,'').split(/[\\/]/).pop() || path;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g,(char)=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function toast(text, kind='success') {
  const region=document.querySelector('#toast-region');
  if (!region) return;
  const node=document.createElement('div');
  node.className=`toast ${kind}`;
  node.textContent=text;
  region.appendChild(node);
  setTimeout(()=>{ node.classList.add('is-leaving'); setTimeout(()=>node.remove(),190); },2600);
}

async function init() {
  applyTheme();
  try {
    state.appVersion = await getVersion();
  } catch {
    state.appVersion = '';
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{ if(state.settings.theme==='system') render(); });
  await listen('duplicate-progress',(event)=>{ state.progress=event.payload; if(state.scanning) render(); });
  if (isTauri) {
    await getCurrentWebview().onDragDropEvent((event)=>{
      if (event.payload.type === 'over') document.querySelector('#drop-zone')?.classList.add('drag-over');
      if (event.payload.type === 'leave') document.querySelector('#drop-zone')?.classList.remove('drag-over');
      if (event.payload.type === 'drop') { document.querySelector('#drop-zone')?.classList.remove('drag-over'); addSources(event.payload.paths); }
    });
  }
  render('startup');
}

init();
