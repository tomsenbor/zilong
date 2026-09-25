import { readFileSync, existsSync } from 'node:fs';
import { expect, test } from 'vitest';

const read = file => JSON.parse(readFileSync(new URL(`../docs/${file}`, import.meta.url), 'utf8'));
const baseline = read('wiki-practical-unresolved-review.json');
const closed = new Set(['wiki-practical-interior-closure.json', 'wiki-practical-location-followup.json']
  .flatMap(file => read(file).records.map(row => row.identity)));
const expected = baseline.records.filter(row => ['mechanism-review', 'research-needed'].includes(row.verdict) && !closed.has(row.identity));
const report = () => {
  expect(existsSync(new URL('../docs/wiki-practical-174-review.json', import.meta.url))).toBe(true);
  return read('wiki-practical-174-review.json');
};
const item = identity => report().records.find(row => row.identity === identity);

test('174 review preserves every remaining identity and original source without re-closing the previous 14 maps', () => {
  const r = report();
  expect(expected).toHaveLength(174);
  expect(r.records).toHaveLength(174);
  expect(new Set(r.records.map(row => row.identity)).size).toBe(174);
  expect(r.records.map(row => row.identity).sort()).toEqual(expected.map(row => row.identity).sort());
  for (const row of r.records) {
    const original = expected.find(value => value.identity === row.identity);
    expect(row.nativeSource).toEqual(original.nativeSource);
    expect(row.nativeFields).toEqual(original.nativeFields);
    expect(row.closed).toBe(false);
    expect(row.finding.length).toBeGreaterThan(15);
    expect(row.nextAction.length).toBeGreaterThan(10);
    expect(row.evidenceIds.length).toBeGreaterThan(0);
    for (const id of row.evidenceIds) expect(r.evidence[id], `${row.identity}: ${id}`).toBeDefined();
  }
});

test('Spiker is a real volcano trap, not an unused monster inferred from a discussion page', () => {
  const row = item('Data/Monsters:Spiker');
  expect(row.verdict).toBe('verified-mechanism');
  expect(row.finding).toContain('GenerateEntities');
  expect(row.finding).toContain('不可');
  expect(row.evidenceIds).toContain('spiker-native');
});

test('930 healing pickup never becomes the same-named hat and 528 has explicit normal-play exclusion evidence', () => {
  const heart = item('Data/Objects:930');
  expect(heart.verdict).toBe('verified-mechanism');
  expect(heart.finding).toContain('SC_NO_FOOD');
  expect(heart.finding).toContain('10');
  expect(heart.finding).toContain('(H)92');
  expect(item('Data/Objects:528').verdict).toBe('supported-unobtainable');
  expect(item('Data/Objects:528').evidenceIds).toContain('jukebox-wiki');
  expect(item('Data/Objects:528').finding).not.toContain('未实装');
});

test('slime ball native exclusive upper bound and repeatable fossil roll are recorded instead of copying conflicting wiki numbers', () => {
  const row = item('Data/BigCraftables:56');
  expect(row.finding).toContain('10–20');
  expect(row.finding).toContain('Next(10,21)');
  expect(row.finding).toContain('循环');
  expect(row.evidenceIds).toContain('slimeball-native');
});

test('environment nodes preserve distinct outputs and exceptions instead of mapping all Stone to inventory 390', () => {
  for (const id of ['2', '25', '95', '343', '450', '819', '843', 'BasicCoalNode0', 'CalicoEggStone_0']) {
    const row = item(`Data/Objects:${id}`);
    expect(row.verdict).toBe('verified-mechanism');
    expect(row.manifestKeys).toEqual([]);
    expect(row.evidenceIds).toContain('nodes-native');
  }
  expect(item('Data/Objects:2').finding).toContain('(O)72');
  expect(item('Data/Objects:25').finding).toContain('(O)719');
  expect(item('Data/Objects:819').finding).toContain('(O)749');
  expect(item('Data/Objects:792').finding).toContain('必定');
  expect(item('Data/Objects:319').finding).toContain('冰晶');
  expect(item('Data/Objects:PotOfGold').finding).toContain('春17');
  expect(item('Data/Objects:PotOfGold').finding).toContain('不是煤矿');
});

test('barrel sprite pairs and island puzzle pedestal are mechanisms, not invented twelve shop items', () => {
  for (const id of ['118', '119', '120', '121', '122', '123', '124', '125', '174', '175', '262', '263']) {
    const row = item(`Data/BigCraftables:${id}`);
    expect(row.verdict).toBe('verified-mechanism');
    expect(row.evidenceIds).toContain('containers-native');
    expect(row.manifestKeys).toEqual([]);
  }
  expect(item('Data/BigCraftables:221').finding).toContain('IslandShrine');
  expect(item('Data/BigCraftables:221').finding).toContain('不能');
});

test('unproven legacy entries remain explicit acquisition questions and never get silently excluded or merged', () => {
  for (const id of ['Data/Characters:???', 'Data/Monsters:Cat', 'Data/BigCraftables:31', 'Data/BigCraftables:84', 'Data/BigCraftables:219', 'Data/Objects:927', 'Data/Objects:929']) {
    const row = item(id);
    expect(row.verdict).toBe('unresolved-acquisition');
    expect(row.remainingQuestions.length).toBeGreaterThan(0);
    expect(row.manifestKeys).toEqual([]);
  }
  for (const row of report().records.filter(row => row.verdict === 'unresolved-acquisition')) {
    expect(row.remainingQuestions.join(' ').length).toBeGreaterThan(15);
    expect(row.nextAction).not.toContain('已完成');
  }
});

test('review totals are derived and evidence review cannot grant content completion or release readiness', () => {
  const r = report();
  const statuses = ['verified-mechanism', 'verified-acquisition', 'supported-unobtainable', 'unresolved-acquisition'];
  expect(r.counts).toEqual(Object.fromEntries(statuses.map(status => [status, r.records.filter(row => row.verdict === status).length])));
  expect(Object.values(r.counts).reduce((sum, count) => sum + count, 0)).toBe(174);
  expect(r.contentComplete).toBe(false);
  expect(r.releaseReady).toBe(false);
  expect(r.allIdentitiesResolved).toBe(false);
  expect(r.limitations.join(' ')).toContain('不存在引用不等于不可获得');
  expect(r.limitations.join(' ')).toContain('不是174个缺失页面');
});
