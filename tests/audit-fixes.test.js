import { expect, test } from "vitest";
import * as view from "../public/js/site-view.js";
import { formatGameTime } from "../public/js/tools/fish-view-state.js";
import { fish } from "../src/features/tools/data/fish.js";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";
import * as cropView from "../public/js/tools/crop-tool.js";
import { entries } from "../src/db/seeds.js";
import { seedDatabase } from "../src/db/seed.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";

test("guide additions render budget examples and cautions as separate paragraphs", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, starts] of [
      ["beginner-backpack-and-energy-route", ["一次升级增加12格", "例如手上3000金", "资料核对："]],
      ["coop-barn-animal-products-route", ["从零到豪华鸡舍", "以新建普通鸡舍", "资料核对："]],
      ["seasonal-items-to-keep", ["品质作物包", "此外，饲料包", "资料核对："]]
    ]) {
      const response = await request(app).get(`/guides/${slug}`);
      expect(response.status).toBe(200);
      for (const start of starts) expect(response.text, `${slug}: ${start}`).toContain(`<p>${start}`);
    }
  } finally { context.close(); }
});

test("all 71 fish pages and icons resolve, and repeated import preserves existing identities", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const item of entries.filter(entry => entry.dataset === "fish")) {
      const response = await request(app).get("/wiki/fish/" + makeEntrySlug(item));
      expect(response.status, item.name).toBe(200);
      expect(response.text, item.name).toContain(item.name);
      expect((await request(app).get(item.image)).status, item.image).toBe(200);
    }
    const sql = "SELECT e.id,e.name,e.slug FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id WHERE d.slug='fish' ORDER BY e.id";
    const before = context.db.prepare(sql).all();
    expect(before).toHaveLength(71);
    seedDatabase(context.db);
    expect(context.db.prepare(sql).all()).toEqual(before);
  } finally { context.close(); }
});

test("fish catalogue covers all verified rod and crab-pot species without synthetic fish", () => {
  const expected = ["河豚","鳀鱼","金枪鱼","沙丁鱼","鲷鱼","大嘴鲈鱼","小嘴鲈鱼","虹鳟鱼","鲑鱼","大眼鱼","河鲈","鲤鱼","鲶鱼","狗鱼","太阳鱼","红鲻鱼","鲱鱼","鳗鱼","章鱼","红鲷鱼","鱿鱼","海参","大海参","鬼鱼","石鱼","冰柱鱼","岩浆鳗鱼","沙鱼","蝎鲤鱼","比目鱼","午夜鲤鱼","鲟鱼","虎纹鳟鱼","大头鱼","罗非鱼","鲢鱼","麻哈脂鲤","青花鱼","西鲱","蛇齿单线鱼","大比目鱼","木跃鱼","虚空鲑鱼","史莱姆鱼","黄貂鱼","狮子鱼","蓝铁饼鱼","虾虎鱼","午夜鱿鱼","幽灵鱼","水滴鱼","绯红鱼","鮟鱇鱼","传说之鱼","冰川鱼","变种鲤鱼","绯红鱼之子","雌鮟鱇鱼","传说之鱼二代","小冰川鱼","放射性鲤鱼","龙虾","蛤","小龙虾","螃蟹","鸟蛤","蚌","虾","蜗牛","玉黍螺","牡蛎"];
  const catalogue = entries.filter(item => item.dataset === "fish");
  expect(catalogue.map(item => item.name).sort()).toEqual([...expected].sort());
  expect(fish.some(item => item.id === "dace")).toBe(false);
  expect(fish.find(item => item.id === "anchovy").aliases).toContain("凤尾鱼");
});

test("unprocessed scenarios explain raw sale instead of implying processing revenue", () => {
  expect(typeof cropView.scenarioCards).toBe("function");
  const scenario = {supported:true,profit:120,processedInputQuantity:0,remainingRawQuantity:10};
  const html = cropView.scenarioCards({scenarios:{sell:scenario,jar:scenario,keg:scenario}});
  expect(html).toContain("按原料出售");
  expect(html).toContain("未完成加工");
});

test("after-midnight times identify the following day", () => {
  expect(formatGameTime(2400)).toBe("次日00:00");
  expect(formatGameTime(2600)).toBe("次日02:00");
  expect(formatGameTime(100)).toBe("次日01:00");
  expect(formatGameTime(600)).toBe("06:00");
});

test("carp keeps the mountain winter exclusion separate from underground and forest waters", () => {
  const rules = fish.find(item => item.id === "carp").availabilityRules;
  expect(rules.some(rule => rule.locations.includes("山区湖泊") && rule.seasons.includes("冬季"))).toBe(false);
  expect(rules.some(rule => rule.locations.includes("下水道") && rule.seasons.includes("冬季"))).toBe(true);
});

test("Ghostfish and Spook Fish have unambiguous Chinese names", () => {
  expect(fish.find(item => item.id === "ghostfish").name).toBe("鬼鱼");
  expect(fish.find(item => item.id === "spook-fish").name).toBe("幽灵鱼");
});

test("villagers display birthday and gifts rather than item sale instructions", () => {
  const html = view.renderItemDialog({name:"文森特",dataset_slug:"villagers",attributes:{birthday:"春季10日",address:"柳巷1号",loves:["葡萄","蜗牛"]}});
  expect(html).toContain("春季10日");
  expect(html).toContain("柳巷1号");
  expect(html).toContain("葡萄");
  expect(html).not.toContain("售价");
  expect(html).not.toContain("第一份建议先保留");
  expect(html).toContain("村民详情");
});

test("related links never expose untranslated URL paths as labels", () => {
  const html = view.renderItemDialog({name:"材料",attributes:{links:["/wiki/cooking/omelet","/guides/backpack-upgrade-route"]}});
  expect(html).not.toContain(">wiki/cooking/omelet<");
  expect(html).not.toContain(">guides/backpack-upgrade-route<");
});

test("filter options include published values beyond page one without changing the API", async () => {
  expect(typeof view.loadLibraryFilterOptions).toBe("function");
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    const fetchPage = async url => {
      const response = await request(app).get(url);
      expect(response.status).toBe(200);
      return response.body;
    };
    const options = await view.loadLibraryFilterOptions(fetchPage, "cooking");
    expect(options.source).toContain("艾芙琳4心事件");
    expect(options.ingredients).toContain("苔藓（20）");
    expect(new Set(options.source).size).toBe(options.source.length);
  } finally { context.close(); }
});
