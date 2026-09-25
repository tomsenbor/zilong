import {expect,test} from 'vitest';
import {giftQuery, giftResults, giftCoverage} from '../public/js/tools/gift-tool.js';
test('switching query mode removes incompatible criteria and preserves season',()=>{
  expect(giftQuery('item','66','春季').toString()).toBe('item=66&season=%E6%98%A5%E5%AD%A3');
  expect(giftQuery('villager','vincent','').toString()).toBe('villager=vincent');
});
test('empty results distinguish missing evidence from dislike',()=>{
  expect(giftResults({villagers:[],gifts:[]})).toContain('未查到');
  expect(giftCoverage).toContain('不是完整喜恶表');
});
test('results escape text and reject external item links',()=>{
  const html=giftResults({villagers:[{entrySlug:'v',name:'<script>',giftIds:['g']}],gifts:[{id:'g',name:'<img>',wikiHref:'https://evil.test'}]});
  expect(html).not.toContain('<script>');
  expect(html).not.toContain('https://evil.test');
  expect(html).toContain('暂未核实');
});
test('gift page provides a local error recovery action without changing query',async()=>{
  const {renderGiftTool}=await import('../public/js/tools/gift-tool.js');
  const original=globalThis.fetch;
  let retry;
  const content={isConnected:true,innerHTML:'',querySelector:()=>({addEventListener:(event,fn)=>{retry=fn;}})};
  const app={innerHTML:'',querySelector:()=>content};
  globalThis.fetch=async()=>({ok:false,status:503,json:async()=>({})});
  try {
    await renderGiftTool(app,new URLSearchParams('item=66'));
    expect(content.innerHTML).toContain('重试');expect(content.innerHTML).not.toContain('没有人喜欢');
    expect(retry).toBeTypeOf('function');
  } finally {globalThis.fetch=original;}
});
