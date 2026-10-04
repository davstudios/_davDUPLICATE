import test from 'node:test';
import assert from 'node:assert/strict';
import { countDuplicateFiles, defaultSelection, extensionChoices, filterGroups, formatBytes, selectedReclaimable, selectionForStrategy } from '../src/duplicate-engine.js';

const groups = [
  { id: 'a', size: 1000, files: [
    { path: '/a/one.jpg', name: 'one.jpg', extension: 'jpg', modified: 10, hardLink: false },
    { path: '/b/two.jpg', name: 'two.jpg', extension: 'jpg', modified: 20, hardLink: false },
    { path: '/c/link.jpg', name: 'link.jpg', extension: 'jpg', modified: 30, hardLink: true }
  ] },
  { id: 'b', size: 5000, files: [
    { path: '/long/path/report.pdf', name: 'report.pdf', extension: 'pdf', modified: 40, hardLink: false },
    { path: '/r.pdf', name: 'r.pdf', extension: 'pdf', modified: 5, hardLink: false }
  ] }
];

test('formats byte sizes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1.00 KB');
  assert.equal(formatBytes(1024 * 1024), '1.00 MB');
});

test('default selection excludes hard links and keeps one physical file', () => {
  const selected = defaultSelection(groups);
  assert.deepEqual([...selected], ['/b/two.jpg', '/r.pdf']);
});

test('oldest strategy keeps the oldest file', () => {
  const selected = selectionForStrategy(groups, 'oldest');
  assert.equal(selected.has('/a/one.jpg'), false);
  assert.equal(selected.has('/b/two.jpg'), true);
  assert.equal(selected.has('/r.pdf'), false);
});

test('newest strategy keeps the newest file', () => {
  const selected = selectionForStrategy(groups, 'newest');
  assert.equal(selected.has('/a/one.jpg'), true);
  assert.equal(selected.has('/b/two.jpg'), false);
});

test('shortest path strategy keeps shortest paths', () => {
  const selected = selectionForStrategy(groups, 'shortest');
  assert.equal(selected.has('/r.pdf'), false);
  assert.equal(selected.has('/long/path/report.pdf'), true);
});

test('preferred folder strategy keeps a preferred file', () => {
  const selected = selectionForStrategy(groups, 'preferred', '/b');
  assert.equal(selected.has('/b/two.jpg'), false);
  assert.equal(selected.has('/a/one.jpg'), true);
});

test('reclaimable size ignores hard links', () => {
  const selected = new Set(['/b/two.jpg', '/c/link.jpg', '/r.pdf']);
  assert.equal(selectedReclaimable(groups, selected), 6000);
});

test('filters groups by size query and extension', () => {
  assert.equal(filterGroups(groups, '', 2000, 'all').length, 1);
  assert.equal(filterGroups(groups, 'report', 0, 'all').length, 1);
  assert.equal(filterGroups(groups, '', 0, 'jpg').length, 1);
});

test('collects extension choices', () => {
  assert.deepEqual(extensionChoices(groups), ['jpg', 'pdf']);
});

test('counts duplicate file paths', () => {
  assert.equal(countDuplicateFiles(groups), 2);
});


