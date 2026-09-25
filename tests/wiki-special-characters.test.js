import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";

const names = ["贝啼", "门卫", "菲兹", "吉尔", "州长", "爷爷", "冈瑟", "仆从", "马龙", "莫里斯", "齐先生", "蜗牛教授", "老水手"];

test("named special characters have independent records without invented birthdays or friendship gifts", () => {
  for (const name of names) {
    const found = entries.filter(e => e.dataset === "villagers" && e.name === name);
    expect(found, name).toHaveLength(1);
    const item = found[0];
    expect(item.attributes.birthday).toBe("未公开（无生日送礼机制）");
    expect(item.attributes.loves).toContain("不适用");
    expect(item.attributes.交互限制).toContain("好感");
    expect(item.image).toMatch(/^\/assets\/game\/NPC_/);
  }
});

test("quest handovers, paid services and evaluations remain distinct from gifting", () => {
  const get = name => entries.find(e => e.dataset === "villagers" && e.name === name)?.attributes;
  expect(get("仆从")?.主要用途).toContain("虚空蛋黄酱");
  expect(get("菲兹")?.主要用途).toContain("500000");
  expect(get("菲兹")?.主要用途).toContain("1%");
  expect(get("爷爷")?.主要用途).toContain("12");
  expect(get("冈瑟")?.主要用途).toContain("60");
  expect(get("莫里斯")?.主要用途).toContain("5000");
  expect(get("老水手")?.获取方式).toContain("雨天");
});
