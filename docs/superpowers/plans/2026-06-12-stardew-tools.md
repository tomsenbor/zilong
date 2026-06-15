# Stardew Valley Chinese Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-ready fish filtering, crop profit calculation, and community-center progress tools to the existing Chinese Stardew Valley guide site.

**Architecture:** Add a bounded `src/features/tools` server feature containing versioned static game data, pure domain functions, Zod request validation, and a read-only Express router. Add small browser modules under `public/js/tools` for rendering and local progress persistence, while leaving the existing content and admin boundaries intact.

**Tech Stack:** Node.js 22+, Express 5, Zod, HTML, Tailwind CSS, vanilla JavaScript, Vitest, Supertest, SQLite, Docker Compose.

---

## File Structure

- Create `src/features/tools/constants.js`: shared seasons, weather, source types, data versions.
- Create `src/features/tools/data/fish.js`: complete versioned fish records.
- Create `src/features/tools/data/crops.js`: complete versioned crop records and growth stages.
- Create `src/features/tools/data/community-center.js`: standard bundles, rooms, rewards, and slots.
- Create `src/features/tools/fish.js`: pure fish filtering and time matching.
- Create `src/features/tools/crops.js`: pure growth and profit calculations.
- Create `src/features/tools/community-center.js`: data validation and summary helpers.
- Create `src/features/tools/schemas.js`: Zod query/body schemas.
- Create `src/features/tools/router.js`: four public tool endpoints.
- Modify `src/routes.js`: mount the tools router at `/tools`.
- Create `public/js/tools/tool-shell.js`: shared page shell, formatting, loading, and error UI.
- Create `public/js/tools/fish-tool.js`: fish filter form and result cards.
- Create `public/js/tools/crop-tool.js`: crop planner form and ranked results.
- Create `public/js/tools/community-progress.js`: storage, migration, import, and export.
- Create `public/js/tools/community-center-tool.js`: bundle UI, progress summary, filters, and links.
- Modify `public/js/app.js`: add tools routes and landing page.
- Modify `public/index.html`: add tools navigation.
- Modify `public/css/app.css`: responsive tool components and accessible states.
- Create `tests/tools-fish.test.js`: fish domain tests.
- Create `tests/tools-crops.test.js`: crop domain tests.
- Create `tests/tools-community-center.test.js`: bundle and persistence tests.
- Create `tests/tools-api.test.js`: endpoint and validation tests.
- Create `tests/tools-ui.test.js`: static browser module and route contract tests.
- Modify `README.md`: tool use, data maintenance, privacy, deployment, and smoke checks.

### Task 1: Shared Tool Contracts And Router

**Files:**
- Create: `src/features/tools/constants.js`
- Create: `src/features/tools/schemas.js`
- Create: `src/features/tools/router.js`
- Modify: `src/routes.js`
- Test: `tests/tools-api.test.js`

- [ ] **Step 1: Write failing route contract tests**

Add tests asserting:

```js
expect((await request(app).get("/api/tools/fish")).status).toBe(200);
expect((await request(app).get("/api/tools/crops")).status).toBe(200);
expect((await request(app).get("/api/tools/community-center")).status).toBe(200);
expect((await request(app).post("/api/tools/crops/calculate").send({})).status).toBe(400);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm.cmd test -- tests/tools-api.test.js
```

Expected: requests return `404` because the tools router does not exist.

- [ ] **Step 3: Add constants and strict input schemas**

Define:

```js
export const GAME_VERSION = "1.6.15";
export const DATA_VERSION = 1;
export const seasons = ["春季", "夏季", "秋季", "冬季"];
export const weathers = ["晴天", "雨天", "任意"];
```

Crop calculation schema must reject day outside `1..28`, plots outside
`1..9999`, negative budget, unknown fertilizer/profession/method, and planning
days outside `1..365`.

- [ ] **Step 4: Mount a router with versioned response envelopes**

Every successful endpoint returns `gameVersion` and `dataVersion`. Validation
failures pass an `AppError(400, "INVALID_TOOL_INPUT", ...)` to the existing
error middleware.

- [ ] **Step 5: Re-run focused tests and verify GREEN**

Run:

```powershell
npm.cmd test -- tests/tools-api.test.js
```

Expected: route contract tests pass.

### Task 2: Complete Fish Data And Filtering

**Files:**
- Create: `src/features/tools/data/fish.js`
- Create: `src/features/tools/fish.js`
- Modify: `src/features/tools/router.js`
- Test: `tests/tools-fish.test.js`
- Test: `tests/tools-api.test.js`

- [ ] **Step 1: Write failing domain tests**

Cover:

```js
expect(matchesTime([{ start: 600, end: 1200 }], 600)).toBe(true);
expect(matchesTime([{ start: 2200, end: 2600 }], 100)).toBe(true);
expect(filterFish(fish, {
  season: "春季", weather: "雨天", time: 1200, location: "小镇河流"
}).map((item) => item.id)).toContain("catfish");
expect(filterFish(fish, {
  sourceType: "蟹笼", season: "冬季", weather: "晴天", time: 700
}).length).toBeGreaterThan(0);
```

Also assert unique IDs, existing image files, valid time ranges, and data counts:
all regular rod fish, legendary fish, legendary-family fish, Night Market fish,
Ginger Island fish, Goby, and crab-pot catches must be represented.

- [ ] **Step 2: Run fish tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/tools-fish.test.js
```

Expected: module import fails because fish data and functions are absent.

- [ ] **Step 3: Add complete normalized fish records**

Each record implements:

```js
{
  id, name, aliases, image, seasons, locations, weather, timeRanges,
  sourceType, category, difficulty, behavior, basePrice, bundleIds,
  notes, gameVersion
}
```

Use stable English IDs, Chinese display text, existing local images, numeric
`HHMM` times, and explicit source/category values.

- [ ] **Step 4: Implement pure matching functions**

Export:

```js
export function matchesTime(ranges, time) {}
export function filterFish(items, filters) {}
export function getFishFilterOptions(items) {}
```

Normalize times after midnight by adding `2400` before testing overnight
ranges. Crab-pot items ignore season, weather, and time but still honor keyword,
source, location, bundle, and category filters.

- [ ] **Step 5: Connect GET `/api/tools/fish`**

Accept `q`, `season`, `weather`, `time`, `location`, `sourceType`, `category`,
and `bundleOnly`. Return filtered `items`, `total`, `filters`, and versions.

- [ ] **Step 6: Verify fish domain and API GREEN**

Run:

```powershell
npm.cmd test -- tests/tools-fish.test.js tests/tools-api.test.js
```

Expected: all fish tests pass.

### Task 3: Complete Crop Data And Calculation Engine

**Files:**
- Create: `src/features/tools/data/crops.js`
- Create: `src/features/tools/crops.js`
- Modify: `src/features/tools/router.js`
- Test: `tests/tools-crops.test.js`
- Test: `tests/tools-api.test.js`

- [ ] **Step 1: Write failing growth tests**

Cover ordinary, repeat, speed, budget, and processing behavior:

```js
expect(getGrowthDays(parsnip, { fertilizer: "none", agriculturist: false })).toBe(4);
expect(getHarvestSchedule(parsnip, { startDay: 24, seasonLength: 28 }).harvests).toBe(1);
expect(getHarvestSchedule(parsnip, { startDay: 25, seasonLength: 28 }).harvests).toBe(0);
expect(getHarvestSchedule(blueberry, { startDay: 1, seasonLength: 28 }).harvests).toBe(4);
expect(getProcessedPrice({ basePrice: 100, kind: "fruit" }, "keg")).toBe(300);
expect(getProcessedPrice({ basePrice: 100, kind: "vegetable" }, "jar")).toBe(250);
```

Add assertions for fertilizer plus Agriculturist, regrow time remaining unchanged,
multi-round seed purchases, finite budget, expected extra yield, greenhouse
planning days, invalid processing methods, and profession price bonuses.

- [ ] **Step 2: Run crop tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/tools-crops.test.js
```

Expected: crop functions do not exist.

- [ ] **Step 3: Add normalized complete crop records**

Each crop implements:

```js
{
  id, name, image, seasons, seedPrice, seedSource, growthStages,
  regrowDays, harvestYield, extraYieldChance, baseSellPrice, kind,
  processing, restrictions, gameVersion
}
```

Include all normal sellable crops, the four 1.6 seasonal crops, Ancient Fruit,
Starfruit, Sweet Gem Berry, Pineapple, Cactus Fruit, Coffee Bean, Taro Root,
Fiber, Tea Leaves, and Qi Fruit where calculation is meaningful. Records with
non-standard seed economics carry an explicit restriction/note.

- [ ] **Step 4: Implement deterministic crop calculations**

Export:

```js
export function getGrowthDays(crop, options) {}
export function getHarvestSchedule(crop, options) {}
export function getProcessedPrice(crop, method) {}
export function calculateCropProfit(crop, input) {}
export function rankCropProfits(items, input) {}
```

Growth acceleration operates on stage data and never changes `regrowDays`.
Results include calculation steps, exclusion reasons, estimated yield flag,
cost, revenue, profit, profit per tile/day, and ROI.

- [ ] **Step 5: Connect crop endpoints**

`GET /api/tools/crops` returns the complete records and filter options.
`POST /api/tools/crops/calculate` validates input, calculates every eligible
crop, excludes impossible rows with reasons, and returns ranked results plus
best-profit, best-daily, and lowest-startup highlights.

- [ ] **Step 6: Verify crop domain and API GREEN**

Run:

```powershell
npm.cmd test -- tests/tools-crops.test.js tests/tools-api.test.js
```

Expected: all crop tests pass.

### Task 4: Complete Community Center Data And Progress Logic

**Files:**
- Create: `src/features/tools/data/community-center.js`
- Create: `src/features/tools/community-center.js`
- Create: `public/js/tools/community-progress.js`
- Modify: `src/features/tools/router.js`
- Test: `tests/tools-community-center.test.js`
- Test: `tests/tools-api.test.js`

- [ ] **Step 1: Write failing bundle data tests**

Assert the standard route contains Crafts Room, Pantry, Fish Tank, Boiler Room,
Bulletin Board, Vault, and Missing Bundle; IDs are unique; every image exists;
every selectable bundle has `requiredCount <= items.length`; and all required
slots contribute to the total.

- [ ] **Step 2: Write failing progress persistence tests**

Cover:

```js
expect(calculateProgress(data, completed).completedBundles).toBe(expected);
expect(parseProgress(JSON.stringify(valid), knownIds).completedItemIds).toEqual(validIds);
expect(() => parseImport("not-json", knownIds)).toThrow();
expect(migrateProgress(oldData, knownIds).completedItemIds).not.toContain("removed-id");
```

- [ ] **Step 3: Run community tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/tools-community-center.test.js
```

Expected: data and progress modules do not exist.

- [ ] **Step 4: Add complete standard bundle data**

Use stable IDs and include item quantity, quality, source, seasons, image,
bundle reward, room reward, and `requiredCount`. Model Vault donations as four
normal progress slots and the Missing Bundle as a separate room.

- [ ] **Step 5: Implement progress domain and browser storage**

Server exports known slot IDs and summary helpers. Browser module exports:

```js
export const STORAGE_KEY = "pixelharvest.community-center.v1";
export function createProgress(completedItemIds = []) {}
export function parseProgress(value, knownIds) {}
export function migrateProgress(value, knownIds) {}
export function loadProgress(storage, knownIds) {}
export function saveProgress(storage, progress) {}
export function exportProgress(progress, date = new Date()) {}
export function importProgress(text, knownIds) {}
```

Invalid import throws before storage is changed. Storage failures return a
non-persistent status instead of crashing the UI.

- [ ] **Step 6: Connect GET `/api/tools/community-center`**

Return complete rooms, counts, known slot IDs, and versions.

- [ ] **Step 7: Verify community domain and API GREEN**

Run:

```powershell
npm.cmd test -- tests/tools-community-center.test.js tests/tools-api.test.js
```

Expected: all community tests pass.

### Task 5: Shared Tool Landing And Fish UI

**Files:**
- Create: `public/js/tools/tool-shell.js`
- Create: `public/js/tools/fish-tool.js`
- Modify: `public/js/app.js`
- Modify: `public/index.html`
- Modify: `public/css/app.css`
- Test: `tests/tools-ui.test.js`

- [ ] **Step 1: Write failing UI contract tests**

Read the HTML and browser modules and assert navigation contains `#tools`,
router recognizes all three tool hashes, fish controls have labels, and modules
do not use inline event-handler attributes.

- [ ] **Step 2: Run UI tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/tools-ui.test.js
```

Expected: tool links and modules are absent.

- [ ] **Step 3: Add the tool landing page and shared shell**

Render three versioned product cards with concise outcomes, accessible links,
local image icons, loading skeleton, API error message, and retry action.

- [ ] **Step 4: Add fish page behavior**

Render keyword, season, weather, time, location, source, category, and bundle
controls. Fetch query-filtered data, render condition summary and result cards,
support reset and suggested relaxed filters, and preserve filters in the URL.

- [ ] **Step 5: Add responsive fish styles**

Desktop uses a sticky filter panel and card grid. Below 900 px the panel becomes
an expandable block; below 600 px cards become one column. Add visible focus
styles and non-color status labels.

- [ ] **Step 6: Verify UI GREEN and existing client tests**

Run:

```powershell
npm.cmd test -- tests/tools-ui.test.js tests/client-api.test.js
```

Expected: tests pass.

### Task 6: Crop Calculator UI

**Files:**
- Create: `public/js/tools/crop-tool.js`
- Modify: `public/js/app.js`
- Modify: `public/css/app.css`
- Test: `tests/tools-ui.test.js`

- [ ] **Step 1: Add failing calculator UI tests**

Assert fields for season, date/planning days, plots, budget, fertilizer,
Agriculturist, Tiller, method, greenhouse/Ginger Island mode, and cost policy.
Assert results expose profit, daily profit, startup cost, harvests, and steps.

- [ ] **Step 2: Run focused UI tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/tools-ui.test.js -t "crop"
```

- [ ] **Step 3: Implement calculator form and API integration**

Preserve entered values on validation/network failure. Toggle day input to
planning days in greenhouse/island mode. Render three highlights and ranked
results with sort controls and expandable calculation steps.

- [ ] **Step 4: Add responsive result cards**

Use a table at wide widths and card rows below 760 px. Keep profit, daily profit,
and startup cost visible without expansion.

- [ ] **Step 5: Verify calculator UI GREEN**

Run:

```powershell
npm.cmd test -- tests/tools-ui.test.js tests/tools-crops.test.js tests/tools-api.test.js
```

### Task 7: Community Center UI And Cross-Tool Links

**Files:**
- Create: `public/js/tools/community-center-tool.js`
- Modify: `public/js/tools/fish-tool.js`
- Modify: `public/js/tools/crop-tool.js`
- Modify: `public/js/app.js`
- Modify: `public/css/app.css`
- Test: `tests/tools-ui.test.js`
- Test: `tests/tools-community-center.test.js`

- [ ] **Step 1: Add failing checklist UI tests**

Assert total progress, bundle/room counts, season and completion filters,
checkbox labels, export/import/reset controls, and cross-tool hash links.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/tools-ui.test.js -t "community"
```

- [ ] **Step 3: Implement checklist rendering and immediate persistence**

Load known IDs and progress, render rooms/bundles/items, calculate requiredCount
completion, save every change, and handle `storage` events. Filters include all,
incomplete, current season, expiring this season, and room.

- [ ] **Step 4: Implement safe import/export/reset**

Download a dated JSON blob, validate imported JSON before confirmation and
overwrite, reset only after confirmation, and show persistence warnings when
LocalStorage is unavailable.

- [ ] **Step 5: Add cross-tool navigation**

Fish slots link to `#tools/fish?q=<name>&bundleOnly=true`; crop slots link to
`#tools/crops?crop=<id>&season=<season>`. Fish results link back to focused
bundle IDs.

- [ ] **Step 6: Verify checklist and linkage GREEN**

Run:

```powershell
npm.cmd test -- tests/tools-ui.test.js tests/tools-community-center.test.js
```

### Task 8: Full Regression, Assets, And Documentation

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Modify: `Dockerfile` only if a new copied path is missing
- Test: all tests

- [ ] **Step 1: Add data integrity and syntax checks to `npm run check`**

Ensure Node syntax checks cover all browser tool modules. Data integrity tests
must fail for missing assets, duplicate IDs, invalid seasons, bad bundle
references, or unsupported crop processing formulas.

- [ ] **Step 2: Document usage and data maintenance**

Add:

- URLs for all three tools.
- Local-only progress and privacy behavior.
- Fish/crop/bundle data file ownership and update checklist.
- Focused and full test commands.
- Docker build, start, health, API, upgrade, backup, and rollback commands.

- [ ] **Step 3: Run the full verification suite**

Run:

```powershell
npm.cmd run check
```

Expected: all Vitest suites, Tailwind build, and syntax checks pass.

- [ ] **Step 4: Build and start production Compose**

Run:

```powershell
docker compose --env-file .env.production build
docker compose --env-file .env.production up -d
docker compose --env-file .env.production ps
```

Expected: `stardew-guide` is running and becomes healthy.

- [ ] **Step 5: Run production smoke checks**

Verify HTTP 200 and expected JSON/HTML for:

```text
/api/health
/api/tools/fish
/api/tools/crops
/api/tools/community-center
/#tools/fish
/#tools/crops
/#tools/community-center
```

- [ ] **Step 6: Audit every design requirement**

Compare implementation evidence against
`docs/superpowers/specs/2026-06-12-stardew-tools-design.md`. Record any missing
coverage and fix it before declaring the long-running goal complete.
