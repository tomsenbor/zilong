import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";

const manifest = JSON.parse(readFileSync(new URL("../docs/wiki-full-manifest.json", import.meta.url), "utf8"));
const evidence = JSON.parse(readFileSync(new URL("../docs/wiki-full-source-evidence.json", import.meta.url), "utf8"));

test("full manifest uses independently sourced unique identities", () => {
  expect(manifest.version).toBe("1.6.15");
  expect(manifest.groups).toHaveLength(15);
  expect(new Set(manifest.groups.map(group => group.id)).size).toBe(15);
  expect(manifest.records.length).toBeGreaterThan(0);
  expect(new Set(manifest.records.map(record => record.key)).size).toBe(manifest.records.length);
  for (const record of manifest.records) {
    expect(manifest.groups.some(group => group.id === record.group)).toBe(true);
    expect(record.sourceUrl).toMatch(/^https:\/\/(zh\.)?stardewvalleywiki\.com\//);
    expect(record.sourceRevision).toBeTruthy();
    expect(record.versionEvidence).toBeTruthy();
    expect(["include", "exclude"]).toContain(record.disposition);
    expect(evidence.sources.some(source => source.url === record.sourceUrl && source.revision === record.sourceRevision)).toBe(true);
    if (record.disposition === "exclude") expect(record.reason).toBeTruthy();
  }
});

// The release scope is practical coverage, not exhaustive internal-game data.
// Preserve count integrity for reviewed collections without claiming pending ones complete.
test("reviewed collections retain their independently confirmed counts", () => {
  const reviewed = manifest.groups.filter(group => group.status === "complete");
  expect(reviewed.length).toBeGreaterThan(0);
  for (const group of reviewed) {
    expect(Number.isInteger(group.expectedCount)).toBe(true);
    expect(manifest.records.filter(record => record.group === group.id)).toHaveLength(group.expectedCount);
  }
});

test("trinket membership matches the source table, not current seed data", () => {
  const source = evidence.collections.find(collection => collection.title === "Trinkets");
  const names = source.candidates.map(candidate => candidate.sourceName).sort();
  expect(names).toEqual([
    "Basilisk Paw", "Fairy Box", "Frog Egg", "Golden Spur", "Ice Rod",
    "Magic Hair Gel", "Magic Quiver", "Parrot Egg"
  ].sort());
  expect(manifest.records.filter(record => record.collection === "trinkets").map(record => record.originalName).sort()).toEqual(names);
});

test("every independently included identity has exactly one curated entry", () => {
  const issues = [];
  const byIdentity = new Map();
  for (const entry of entries) {
    const key = `${entry.dataset}/${makeEntrySlug(entry)}`;
    const matches = byIdentity.get(key) || [];
    matches.push(entry);
    byIdentity.set(key, matches);
  }
  for (const record of manifest.records.filter(record => record.disposition === "include")) {
    expect(record.dataset).not.toBe("catalog");
    const matches = byIdentity.get(`${record.dataset}/${record.slug}`) || [];
    if (matches.length !== 1 || matches[0]?.name !== record.displayName) {
      issues.push({ key: record.key, expectedName: record.displayName, matches: matches.map(entry => entry.name) });
    }
  }
  expect(issues, "Missing or conflicting curated identities").toEqual([]);
});
