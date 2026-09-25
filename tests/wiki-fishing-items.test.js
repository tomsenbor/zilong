import {expect,test} from "vitest";
import request from "supertest";
import {entries} from "../src/db/seeds.js";
import {createApp} from "../src/app.js";
import {initialize} from "../src/db/initialize.js";
import {createTestContext} from "./helpers/context.js";
const identities=[["bait","鱼饵","鱼饵"],["magnet","磁铁","鱼饵"],["wild-bait","万能鱼饵","鱼饵"],["magic-bait","魔法鱼饵","鱼饵"],["deluxe-bait","高级鱼饵","鱼饵"],["challenge-bait","挑战鱼饵","鱼饵"],["targeted-bait","针对性鱼饵","鱼饵"],["spinner","旋式鱼饵","钓具"],["dressed-spinner","精装旋式鱼饵","钓具"],["trap-bobber","陷阱浮标","钓具"],["cork-bobber","软木塞浮标","钓具"],["lead-bobber","铅制浮标","钓具"],["treasure-hunter","寻宝者","钓具"],["barbed-hook","倒刺钩","钓具"],["curiosity-lure","珍稀诱钩","钓具"],["quality-bobber","优质浮标","钓具"],["sonar-bobber","声纳浮漂","钓具"]];
const get=slug=>{
  const item=entries.find(e=>e.dataset==="items" && e.slug===slug);
  expect(item,slug).toBeDefined();
  return item.attributes;
};
test("all seven bait and ten tackle base identities have correctly typed entries",()=>{
  expect(identities).toHaveLength(17);
  for(const [slug,name,type] of identities){
    const found=entries.filter(e=>e.dataset==="items"&&e.slug===slug);
    expect(found,name).toHaveLength(1);
    expect(found[0].name).toBe(name);
    expect(found[0].attributes.type).toBe(type);
  }
});
test("bait recipes, yield and fishing-condition exceptions are explicit",()=>{
  expect(get("bait").制作产量).toBe("5个");
  expect(get("magnet").制作产量).toBe("3个");
  expect(get("magic-bait").使用限制).toContain("地点");
  expect(get("targeted-bait").使用限制).toContain("季节");
  expect(get("targeted-bait").制作产量).toBe("5至10个（鱼饵制造机）");
  expect(get("challenge-bait").属性).toContain("离开3次");
  expect(get("deluxe-bait").属性).toContain("12像素");
  expect(get("wild-bait").使用限制).toContain("一代传奇鱼");
});
test("tackle does not inherit bait compatibility or nonexistent crafting recipes",()=>{
  expect(get("spinner").适用装备).toContain("铱金鱼竿");
  expect(get("spinner").适用装备).toContain("玻璃纤维鱼竿不能");
  expect(get("lead-bobber").制作配方).toBe("无法制作");
  expect(get("curiosity-lure").制作配方).toBe("无法制作");
  expect(get("trap-bobber").属性).toContain("33%");
  expect(get("cork-bobber").属性).toContain("24像素");
  expect(get("quality-bobber").属性).toContain("一级");
  expect(get("sonar-bobber").使用限制).toContain("两个");
});
test("fishing item details, icons and navigation resolve in an isolated database",async()=>{
  const context=createTestContext();
  try {
    await initialize(context);const app=createApp(context);
    for(const [slug,name] of identities){
      const api=await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(api.status,name).toBe(200);
      expect(api.body.item.name).toBe(name);
      expect(api.body.item.image).not.toContain("Prismatic_Shard");
      expect((await request(app).get(api.body.item.image)).status).toBe(200);
      expect((await request(app).get(`/wiki/items/${slug}`)).status).toBe(200);
      for(const link of get(slug).links)expect((await request(app).get(link)).status,link).toBe(200);
    }
  }finally{context.close();}
},15000);
