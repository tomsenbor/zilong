import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";

const find = name => entries.find(e => e.dataset === "items" && e.name === name);
test("special equipment has eight distinct obtainable identities and no resale claim", () => {
  for (const name of ["咖啡机", "分解机", "缝纫机", "电话", "迷你出货箱", "工作台", "无尽财富之雕像", "回程魔杖"]) {
    expect(find(name), name).toBeDefined();
    expect(find(name).attributes.出售限制).toBe("不可出售");
  }
});
test("utility equipment preserves capacity, salvage and access restrictions", () => {
  expect(find("迷你出货箱")?.attributes.使用限制).toContain("9格");
  expect(find("工作台")?.attributes.使用限制).toContain("祝尼魔宝箱");
  expect(find("分解机")?.attributes.加工时间).toBe("60游戏分钟");
  expect(find("分解机")?.attributes.使用限制).toContain("不是返还全部材料");
  expect(find("电话")?.attributes.使用限制).toContain("绿雨");
});
test("special equipment distinguishes acquisition prices from recurring output", () => {
  expect(find("回程魔杖")?.attributes.获取方式).toContain("2000000金");
  expect(find("回程魔杖")?.attributes.使用限制).toContain("不消耗");
  expect(find("无尽财富之雕像")?.attributes.获取方式).toContain("1000000金");
  expect(find("无尽财富之雕像")?.attributes.使用限制).toContain("替换");
  expect(find("咖啡机")?.attributes.主要用途).toContain("一杯");
});
