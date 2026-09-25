# 全量游戏图鉴 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution, or superpowers:subagent-driven-development if the user selects parallel-agent execution. Steps use checkbox syntax. No commits or deployment are authorized.

**Goal:** 原版1.6.15正常游玩实用资料覆盖完整，不再以内部数据零遗漏或批次新增数量代表完成。

## 2026-09-24 执行修订（优先于旧任务中的全量要求）

- [x] 将用户批准的新目标落入范围文件，保留历史全量清单及全部已有改动。
- [ ] 按 `docs/wiki-practical-coverage.md` 对正常玩法集合建立独立清单；已有正式页精确映射，不为同一商店或设施重复建页。
  - 2026-09-24：已建立 `docs/wiki-practical-checklist.json`，15类各自列出必需范围、来源、测试和具体剩余任务。名册映射与逐页内容复核分开；农业、食物、衣帽、家具追加实用映射证据，不能据此勾选整项或宣称全站完成。
- [ ] 优先修正影响玩法的缺项和前置条件，再处理分类清单；内部未确认记录隔离留档，不以未证实的“废弃”理由强行排除。
- [ ] 完成实用覆盖证据后再调整完整性闸门的验收对象；不得直接跳过旧失败测试或把所有 pending 改为 complete。
- [ ] 通过临时库集成、全量测试、构建、链接/素材检查及真实五尺寸验收后，才能报告实用覆盖完成。

当前修订不代表上述验收已通过，旧任务步骤作为方法与历史记录保留。源文件、条目、URL、导入格式和生产环境保护约束继续有效。

**Architecture:** 保持现有datasets、SSR、API和幂等种子导入。先独立建立来源清单并处理身份冲突，再按集合向既有数据入口追加经过核实的资料。清单、来源证据与实现分离，覆盖检查不从实现生成预期值。

**Tech Stack:** 原生JavaScript、现有Node SQLite、Vitest、Supertest；不新增依赖。

**Spec:** `docs/superpowers/specs/2026-09-22-full-game-encyclopedia.md`

## Global Constraints

- 目标版本原版1.6.15；包含帽子、服装、家具、装饰品，排除模组、废弃及调试内容并记录理由。
- 保留全部受保护修改；不得暂存、commit、push、tag、部署、改正式数据库或依赖。
- 不修改路由、API、数据库结构、计算规则、SEO或公共UI。
- 无来源、未核实字段不进入正式数据；资料全量、测试通过、浏览器通过、发布分别汇报。
- 文件读写使用项目已有工具；不运行会覆盖旧素材的全量素材同步。

## Review Focus

1. 同名服装/壁纸导致按名称匹配时记录互相覆盖：任务1与2检验身份唯一，任务3测试重复导入后的ID和字段。
2. 仅有图片catalog、推荐泛页或多个来源重复计数造成虚假覆盖：任务1独立清单与任务3精确映射。
3. 新版Wiki或平台例外混入1.6.15：任务1每条版本证据、平台限制与排除证据，任务2拒绝未核实项。
4. 页面200但专用图标被fallback替代、名称过长截断：任务3断言图标原值，任务4真实浏览器检查。
5. 测试改成当前数据的自证、旧记录和用户内容被导入覆盖：任务3保持旧断言并比较导入前后数据库快照。

## Task 1: 独立来源清单与身份对照（先于数据修改）

**Files:** Create `docs/wiki-full-manifest.json`, `docs/wiki-full-source-evidence.json`; Modify `docs/wiki-completeness-audit.md`; Create `tests/wiki-full-manifest.test.js`.

**Interfaces:** 清单对象为 `{ version, groups, records }`。每条record为 `{ key, group, sourceUrl, sourceRevision, versionEvidence, disposition, reason, dataset, slug, displayName, originalName }`。`disposition`只允许`include`或`exclude`，纳入项必须有站内映射；排除项必须有理由和证据。来源证据单独保存修订号、URL、日期和内容摘要哈希，不写凭据。

- [ ] 对范围文档15行逐组打开权威集合与子表，确认表格分页、同名样式和不可获取分组。逐条收录名册，不用当前481条倒推全集。
- [ ] 对每条记录核实1.6.15与平台适用性，未知项记录到审计台账，不编造完整总数。完成一组才冻结该组名册；未完成其他组仍为整体未完成。
- [ ] 保存修改前HEAD、所有tracked/untracked文件SHA-256、旧481条的dataset/slug/name映射和暂存区状态，临时存档在项目外。
- [ ] 先写并运行下面的覆盖测试，确认缺项红灯；不为了早期变绿跳过未完成组。

```js
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
import { makeEntrySlug } from '../src/utils/entry-slug.js';
const manifest = JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json', import.meta.url)));
test('full manifest has independent sources and unique identities', () => {
  expect(manifest.version).toBe('1.6.15');
  expect(manifest.groups).toHaveLength(15);
  expect(new Set(manifest.records.map(r => r.key)).size).toBe(manifest.records.length);
  for (const r of manifest.records) {
    expect(r.sourceUrl).toMatch(/^https:\/\/(zh\.)?stardewvalleywiki\.com\//);
    expect(r.sourceRevision).toBeTruthy();
    expect(r.versionEvidence).toBeTruthy();
    expect(['include', 'exclude']).toContain(r.disposition);
    if (r.disposition === 'exclude') expect(r.reason).toBeTruthy();
  }
});
test('every included identity has an exact curated entry', () => {
  for (const r of manifest.records.filter(r => r.disposition === 'include')) {
    expect(r.dataset).not.toBe('catalog');
    const matches = entries.filter(e => e.dataset === r.dataset && makeEntrySlug(e) === r.slug);
    expect(matches, r.key).toHaveLength(1);
    expect(matches[0].name).toBe(r.displayName);
  }
});
```

Run: `npm.cmd test -- tests/wiki-full-manifest.test.js`. Expected: explicit missing curated identities, not module import or syntax errors. If independent full enumeration cannot be established, do not claim this task or the whole request complete.

## Task 2: 按清单补入数据和专用素材

**Files:** Modify `src/db/seeds.js`; Create `docs/wiki-full-assets-sources.json`; Add missing files under `public/assets/game/`; Extend `tests/wiki-full-manifest.test.js` with exact verified field fixtures for each group.

**Interfaces:** 继续使用 `{ dataset, slug, name, summary, image, attributes }`。attributes沿用现有分类字段及实用说明、来源、links。已有条目slug不变，新增条目显式指定稳定slug。

- [ ] 顺序处理：资源/农业/鱼类/料理复核 → 机器/工具/装备 → 人物/生物/技能 → 任务/地点/活动 → 帽子/服装 → 家具/壁纸/地板/装饰 → 特殊物品与跨类复核。每个集合完成独立红绿测试后再进入下一组。
- [ ] 对缺项打开单项来源，记录名称、获取、条件、用途及该类型的准确字段。摘要原创，不用批量同文案凑齐资料；测试精确值来自独立证据，不直接读取实现当预期。
- [ ] 在既有种子追加区补条目；同名不同款式使用来源支持的款式标识消歧，保留原名字段。不得修改导入程序绕过身份问题。
- [ ] 专用图片从Wiki真实文件链接下载，检查PNG/GIF签名、尺寸、哈希；只创建缺失文件，不覆盖旧图。来源表记录本地路径和远程URL。
- [ ] 每组运行 `npm.cmd test -- tests/wiki-full-manifest.test.js tests/dataset-icons.test.js tests/content-detail-quality.test.js`，记录已覆盖和仍缺项。全量覆盖测试仍红时如实说明，不能跳过或降低预期。

## Task 3: 临时数据库集成和完整性闸门

**Files:** Create `tests/wiki-full-integration.test.js`; Modify `tests/growth-content.test.js` only after independently confirmed total; reuse `tests/helpers/context.js` unchanged.

**Interfaces:** 现有`createTestContext()`、`initialize(context)`、`seedDatabase(db)`、`createApp(context)`、`makeEntrySlug(entry)`。所有数据库均在临时目录。

- [ ] 在正式条目全集中检查(dataset, slug)及(dataset, name)唯一；检测冲突时修正新条目身份，保留旧URL。
- [ ] 使用下列模式覆盖纳入清单所有详情、图片与内部链接；独立清单的数量和映射测试必须同时通过。

```js
const context = createTestContext();
try {
  await initialize(context);
  const app = createApp(context);
  for (const record of manifest.records.filter(r => r.disposition === 'include')) {
    const source = entries.find(e => e.dataset === record.dataset && makeEntrySlug(e) === record.slug);
    const response = await request(app).get(`/api/datasets/${record.dataset}/entries/${record.slug}`);
    expect(response.status).toBe(200);
    expect(response.body.item.name).toBe(record.displayName);
    expect(response.body.item.image).toBe(source.image);
    expect((await request(app).get(source.image)).status).toBe(200);
    const page = await request(app).get(`/wiki/${record.dataset}/${record.slug}`);
    expect(page.status).toBe(200);
    expect(page.text).toContain(source.attributes['获取方式']);
    for (const link of source.attributes.links || []) {
      expect((await request(app).get(link)).status, link).toBe(200);
    }
  }
  const records = () => context.db.prepare('SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id').all();
  const before = records();
  seedDatabase(context.db);
  expect(records()).toEqual(before);
} finally { context.close(); }
```

- [ ] 另外从任务1保留的旧数据在临时库生成升级前快照，再导入全集，逐条比较旧ID和旧URL；插入一个测试专用自建条目验证仍保留，测试数据只在临时库内存在。
- [ ] 修改增长内容计数为独立清单确认后的实际资料总数，不将计数替换为`entries.length`自证；保留原链接和质量断言。
- [ ] 执行 `npm.cmd run check`、`npm.cmd run build`、`git diff --check`、`git diff --cached --check`。记录真实总数和退出码；本项目没有lint脚本。

## Task 4: 浏览器与终审

**Files:** Update `docs/wiki-completeness-audit.md` with evidence and remaining issues only; do not change UI to hide data issues.

- [ ] 临时数据库、临时端口启动服务，使用实际日志URL；不启动指向正式数据库的默认服务。
- [ ] 在360×800、390×844、430×932、768×1024、1366×768验证新增类型的列表和详情。覆盖最长中文名、同名款式、长材料/来源、多图、不可出售和平台限制。
- [ ] 检查横向溢出、截断、焦点、过滤/排序/分页、图片失效、控制台与异常请求；截图实际尺寸须匹配，工具失败时记录未验收。
- [ ] 清单逐条统计missing=0、unknown=0、collision=0、badLinks=0、badAssets=0；所有排除都有依据。视觉未过则只能称资料补齐，不能称可发布。
- [ ] 停止本次临时服务，比较旧文件哈希、HEAD及暂存区，报告本阶段真实增量而非累计diff。无需清理或回滚用户文件。
- [ ] 最终列出分组应有/已覆盖/排除/缺项，附来源和测试结果；不执行任何Git写入或上线操作。

## 执行方式与当前状态

推荐主任务按上述依赖顺序执行，避免多个任务同时编辑已有大种子文件。此文档是实施计划，不是已完成的全量清单；代码与数据实施待计划审阅后开始。计划本身不授权提交或部署。
