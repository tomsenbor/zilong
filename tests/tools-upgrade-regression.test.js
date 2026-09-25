import fs from "node:fs";
import vm from "node:vm";
import { expect, test } from "vitest";
import { createProgress, exportProgress, importProgress, saveProgress } from "../public/js/tools/community-progress.js";
import { renderFishTool } from "../public/js/tools/fish-tool.js";
import { renderCommunityCenterTool } from "../public/js/tools/community-center-tool.js";

test.each([["fish", renderFishTool, "#fish-results"], ["community", renderCommunityCenterTool, "#community-content"]])(
  "%s failed loading offers retry with the same query", async (name, render, resultSelector) => {
    const originalFetch = globalThis.fetch;
    const nodes = new Map();
    const node = key => {
      if (!nodes.has(key)) nodes.set(key, { innerHTML: "", isConnected: true, listeners: {}, addEventListener(event, fn) { this.listeners[event] = fn; }, querySelector: selector => node(selector) });
      return nodes.get(key);
    };
    const app = { innerHTML: "", querySelector: node };
    const urls = [];
    globalThis.fetch = async url => { urls.push(url); return {ok:false,status:503,json:async()=>({})}; };
    try {
      await render(app, new URLSearchParams("q=test"));
      expect(node(resultSelector).innerHTML).toContain("重试");
      await node("[data-tool-retry]").listeners.click();
      expect(urls).toHaveLength(2);
      expect(urls[1]).toBe(urls[0]);
    } finally { globalThis.fetch = originalFetch; }
  }
);

test("late crop calculation cannot replace the latest result or clear its busy state", async () => {
  const source = fs.readFileSync("public/js/tools/crop-tool.js", "utf8");
  const fn = source.slice(source.indexOf("  async function calculate()"), source.indexOf("  const updateLocationFields"));
  const pending = [], displayed = [], busy = [];
  const sandbox = {
    calculationRequest: 0, latestData: null,
    FormData: class { *[Symbol.iterator]() { yield ["startDay", "1"]; yield ["plots", "10"]; } },
    form: { elements: new Proxy({}, {get: () => ({checked:false})}) },
    parseOwnedSeeds: () => ({}), loading: () => "loading", errorBox: text => text,
    results: { setAttribute: (key, value) => busy.push(value), innerHTML:"" },
    api: () => new Promise((resolve, reject) => pending.push({resolve, reject})),
    initializeDecisionState: () => {}, renderData: data => displayed.push(data.id)
  };
  vm.runInNewContext(fn, sandbox);
  const first = sandbox.calculate(), second = sandbox.calculate();
  pending[1].resolve({id:"new",items:[]}); await second;
  pending[0].resolve({id:"old",items:[]}); await first;
  expect(displayed).toEqual(["new"]);
  expect(busy).toEqual(["true", "true", "false"]);
});

test("community export roundtrip keeps progress and invalid imports do not mutate it", () => {
  const progress = createProgress(["a"], new Date("2026-09-25T00:00:00Z"));
  const before = structuredClone(progress);
  expect(importProgress(exportProgress(progress).text, new Set(["a"]))).toEqual(before);
  expect(() => importProgress("not-json", new Set(["a"]))).toThrow();
  expect(progress).toEqual(before);
  expect(saveProgress({setItem(){throw new Error("quota");}}, progress)).toEqual({persistent:false});
  expect(progress).toEqual(before);
});

test("obsolete community response does not bind controls from a newer page", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  globalThis.localStorage = {getItem:()=>null};
  const content = {innerHTML:"", isConnected:true};
  let finish, staleLookups = 0;
  const app = {innerHTML:"", querySelector(selector) {
    if (selector === "#community-content") return content;
    staleLookups++; return null;
  }};
  globalThis.fetch = () => new Promise(resolve => {finish = resolve;});
  try {
    const loading = renderCommunityCenterTool(app);
    content.isConnected = false;
    finish({ok:true,json:async()=>({knownSlotIds:[],rooms:[]})});
    await loading;
    // A detached response must stop before touching storage or any replacement control.
    expect(content.innerHTML).not.toContain("localStorage");
    expect(staleLookups).toBe(0);
    expect(content.innerHTML).toBe("");
  } finally {globalThis.fetch = originalFetch; globalThis.localStorage = originalStorage;}
});
