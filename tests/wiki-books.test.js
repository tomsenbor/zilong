import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";
import { readFileSync } from "node:fs";

test("all 19 power books and seven skill or recipe books have distinct records", () => {
  const books = entries.filter(e => e.dataset === "items" && e.attributes.type === "书籍");
  expect(books).toHaveLength(26);
  expect(books.filter(e => e.attributes.书籍类别 === "能力书")).toHaveLength(19);
  expect(books.filter(e => e.attributes.书籍类别 === "技能与食谱书")).toHaveLength(7);
  expect(new Set(books.map(e => e.slug)).size).toBe(26);
  for (const book of books) {
    expect(book.attributes.首次阅读).toBeTruthy();
    expect(book.attributes.重复阅读).toBeTruthy();
    expect(book.attributes.获取方式.length).toBeGreaterThan(15);
    expect(readFileSync(`public${book.image}`).subarray(1, 4).toString()).toBe("PNG");
  }
});

test("books distinguish unlock prerequisites, repeated reading and mastery conversion", () => {
  const get = slug => {
    const item = entries.find(e => e.dataset === "items" && e.slug === slug);
    expect(item, slug).toBeDefined();
    return item.attributes;
  };
  expect(get("animal-catalogue").获取方式).toContain("第二年");
  expect(get("animal-catalogue").重复阅读).toContain("无");
  expect(get("way-of-the-wind-pt-2").获取方式).toContain("阅读");
  expect(get("way-of-the-wind-pt-2").首次阅读).toContain("0.25");
  expect(get("book-of-stars").使用限制).toContain("1125");
  expect(get("queen-of-sauce-cookbook").获取方式).toContain("100");
  expect(get("queen-of-sauce-cookbook").使用限制).toContain("不是所有");
  expect(get("the-art-o-crabbing").首次阅读).toContain("25%");
});
