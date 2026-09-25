import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";

const clothing = () => entries.filter(e => e.dataset === "items" && ["上衣", "下装"].includes(e.attributes.type));
const item = id => clothing().find(e => e.attributes.游戏物品编号 === id);

test("1.6.15 clothing retains 303 independently identified shirts and 17 obtainable pants identities", () => {
  expect(clothing().filter(e => e.attributes.type === "上衣")).toHaveLength(303);
  expect(clothing().filter(e => e.attributes.type === "下装")).toHaveLength(17);
  expect(new Set(clothing().map(e => e.attributes.游戏物品编号)).size).toBe(320);
  expect(new Set(clothing().map(e => e.name)).size).toBe(320);
  expect(item("(P)14")).toBeUndefined(); // A data row alone does not prove normal obtainability.
});

test("same-name heart shirts retain separate identity, acquisition and dyeability", () => {
  expect(item("(S)1028")?.attributes.可染色).toBe("否");
  expect(item("(S)1028")?.attributes.获取方式).toContain("创建角色");
  expect(item("(S)1210")?.attributes.可染色).toBe("是");
  expect(item("(S)1210")?.attributes.获取方式).toContain("奇怪的小面包");
  expect(item("(S)1028")?.slug).not.toBe(item("(S)1210")?.slug);
});

test("sprite position is not substituted for clothing ID and internal Price is not resale value", () => {
  expect(item("(S)1290")?.attributes.图片索引).toBe(292);
  expect(item("(S)1997")?.attributes.图片索引).toBe(272);
  expect(item("(S)SoftEdgePullover")?.attributes.图片索引).toBe(301);
  for (const e of clothing()) expect(e.attributes.出售限制).toBe("不可出售");
});

test("special acquisitions and random prismatic outputs are explained without guaranteed recipes", () => {
  expect(item("(P)7")?.attributes.获取方式).toContain("50个芋头");
  expect(item("(P)9")?.attributes.获取方式).toContain("沙漠节");
  expect(item("(S)1127")?.attributes.获取方式).toContain("14心");
  expect(item("(S)MysteryShirt")?.attributes.获取方式).toContain("谜之盒");
  expect(item("(P)15")?.attributes.获取方式).toContain("不是布料加金锭");
  expect(item("(P)998")?.attributes.制作提醒).toContain("随机");
  expect(item("(P)998")?.attributes.制作提醒).toContain("重复");
  expect(item("(P)998")?.attributes.获取方式).toContain("五彩碎片");
  expect(item("(P)999")?.attributes.获取方式).toContain("五彩碎片");
  expect(item("(S)1997")?.attributes.制作提醒).not.toContain("五彩碎片");
});
