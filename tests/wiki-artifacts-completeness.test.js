import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";
import { createTestContext } from "./helpers/context.js";

const names = ["矮人卷轴 I", "矮人卷轴 II", "矮人卷轴 III", "矮人卷轴 IV", "有缺口的土罐", "箭头", "古代玩偶", "精灵珠宝", "咀嚼洁齿棒", "装饰用扇子", "恐龙蛋", "稀有圆盘", "古剑", "生锈的汤匙", "生锈的靴刺", "生锈的齿轮", "鸡雕像", "古代种子", "史前工具", "干海星", "锚", "玻璃碎片", "骨笛", "史前手斧", "矮人头盔", "矮人小工具", "古代鼓", "黄金面具", "黄金遗物", "诡异玩偶（绿）", "诡异玩偶（黄）", "史前肩胛骨", "史前胫骨", "史前头骨", "手部骨骼", "史前肋骨", "史前脊骨", "尾部骨骼", "鹦鹉螺化石", "两栖动物化石", "棕榈化石", "三叶虫"];

test("all 42 museum artifacts exist exactly once, including both dolls", () => {
  for (const name of names) expect(entries.filter(e => e.dataset === "items" && e.name === name), name).toHaveLength(1);
});

test("artifact routes and icons work and a second import preserves distinct IDs", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const name of names) {
      const entry = entries.find(e => e.dataset === "items" && e.name === name);
      expect(entry, name).toBeDefined();
      const response = await request(app).get(`/wiki/items/${makeEntrySlug(entry)}`);
      expect(response.status, name).toBe(200);
      expect(response.text).toContain(name);
      const detail = await request(app).get(`/api/datasets/items/entries/${makeEntrySlug(entry)}`);
      expect(detail.status, name).toBe(200);
      expect(detail.body.item.image, name).toBe(entry.image);
      expect((await request(app).get(entry.image)).status, name).toBe(200);
    }
    const sql = "SELECT e.id,e.name,e.slug FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id WHERE d.slug='items' ORDER BY e.id";
    const before = context.db.prepare(sql).all();
    seedDatabase(context.db);
    expect(context.db.prepare(sql).all()).toEqual(before);
    expect(before.filter(e => e.name.startsWith("诡异玩偶"))).toHaveLength(2);
  } finally { context.close(); }
}, 15000);
