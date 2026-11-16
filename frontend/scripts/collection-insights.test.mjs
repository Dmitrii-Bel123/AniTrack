import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/collectionInsights.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } });
const { collectionInsights, selectWatchingFeature } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const now = new Date(2026, 0, 15);
function entry(id, status, options = {}) {
  return { id, user_status: status, user_rate: null, created_at: '2026-01-04T12:00:00Z', anime: { episodes: 12, genres: [] }, ...options };
}

test('two in-progress titles from the list API render without detail-only timestamps', () => {
  // UserAnimeListSerializer returns created_at, but does not return updated_at.
  const items = [
    entry(1, 'PR', { created_at: '2026-11-01T12:00:00Z' }),
    entry(2, 'PR', { created_at: '2026-11-02T12:00:00Z' }),
    entry(3, 'WW', { created_at: '2026-11-03T12:00:00Z' }),
  ];
  assert.equal(selectWatchingFeature(items)?.id, 2);
  assert.deepEqual(items.map(item => item.id), [1, 2, 3]);
  assert.equal(collectionInsights(items, now).counts.PR, 2);
});

test('watch feature handles no active titles and breaks timestamp ties by id', () => {
  assert.equal(selectWatchingFeature([]), undefined);
  assert.equal(selectWatchingFeature([entry(1, 'WW')]), undefined);
  assert.equal(selectWatchingFeature([entry(1, 'PR'), entry(2, 'PR')])?.id, 2);
});

test('empty collection has finite zero metrics and six months across the year boundary', () => {
  const result = collectionInsights([], now);
  assert.deepEqual(result.counts, { PR: 0, WW: 0, WD: 0, DR: 0 });
  assert.equal(result.completedPercent, 0);
  assert.equal(result.episodes, 0);
  assert.equal(result.months.length, 6);
  assert.equal(result.months[0].key, '2025-7');
  assert.equal(result.months.at(-1).key, '2026-0');
});

test('counts only completed episode totals and explicitly tracks missing metadata', () => {
  const result = collectionInsights([
    entry(1, 'WD'), entry(2, 'WD', { anime: { episodes: null, genres: [] } }),
    entry(3, 'PR', { anime: { episodes: 500, genres: [] } }), entry(4, 'WW'), entry(5, 'DR'),
  ], now);
  assert.deepEqual(result.counts, { PR: 1, WW: 1, WD: 2, DR: 1 });
  assert.equal(result.completedPercent, 40);
  assert.equal(result.episodes, 12);
  assert.equal(result.unknownEpisodes, 1);
});

test('activity uses added dates and excludes out-of-window or invalid dates', () => {
  const result = collectionInsights([
    entry(1, 'WD', { created_at: '2025-08-10T12:00:00Z' }), entry(2, 'WW'),
    entry(3, 'WW', { created_at: '2025-07-10T12:00:00Z' }),
    entry(4, 'WW', { created_at: '2026-02-10T12:00:00Z' }),
    entry(5, 'WW', { created_at: 'invalid' }),
  ], now);
  assert.deepEqual(result.months.map(m => m.count), [1, 0, 0, 0, 0, 1]);
});

test('genres count titles rather than duplicate genre metadata', () => {
  const result = collectionInsights([
    entry(1, 'WD', { anime: { episodes: 12, genres: [{ title: 'Драма' }, { title: 'Драма' }] } }),
    entry(2, 'WW', { anime: { episodes: 12, genres: [{ title: 'Драма' }, { title: 'Фантастика' }] } }),
  ], now);
  assert.deepEqual(result.topGenres, [['Драма', 2], ['Фантастика', 1]]);
});

test('personal favorites sort numeric scores, omit unrated titles and preserve input order', () => {
  const items = [entry(1, 'WD', { user_rate: '9.0' }), entry(2, 'WD', { user_rate: '10.0' }), entry(3, 'WW'), entry(4, 'WD', { user_rate: '0' })];
  const result = collectionInsights(items, now);
  assert.deepEqual(result.topRated.map(i => i.id), [2, 1]);
  assert.deepEqual(items.map(i => i.id), [1, 2, 3, 4]);
});
