import {expect, test} from 'vitest';
import {resolveCommunityView} from '../public/js/tools/community-center-view-state.js';
import {buildFishQuery} from '../public/js/tools/fish-view-state.js';
import {giftResults} from '../public/js/tools/gift-tool.js';
import {SiteFooter} from '../public/js/components/site-components.js';
import * as fishUI from '../public/js/tools/fish-tool.js';

test('empty fish results offer only active restrictions, not irrelevant weather/location buttons',()=>{
  expect(fishUI.emptyFishResults?.(new URLSearchParams('q=不存在的鱼'))).toContain('data-relax-filter="q"');
  const html=fishUI.emptyFishResults(new URLSearchParams('q=不存在的鱼'));
  expect(html).not.toContain('data-relax-filter="weather"');
  expect(html).not.toContain('data-relax-filter="location"');
  expect(fishUI.emptyFishResults(new URLSearchParams('weather=雨天'))).toContain('data-relax-filter="weather"');
});
test('time controls show legacy after-midnight values and an unrestricted option',()=>{
  const html=fishUI.fishTimeControls?.(new URLSearchParams('time=150'));
  expect(html).toContain('value="25" selected');
  expect(html).toContain('次日01时');
  expect(html).toContain('value="50" selected');
  expect(fishUI.fishTimeControls(new URLSearchParams())).toContain('不限时间');
  expect(fishUI.fishTimeControls(new URLSearchParams())).not.toContain('>03时</option>');
  expect(fishUI.fishTimeControls(new URLSearchParams())).not.toContain('>05分</option>');
});

const rooms=[{id:'room',progressScope:'standard',bundles:[{id:'bundle',requiredCount:3,items:[
  {id:'done',seasons:['春季']},{id:'spring',seasons:['春季']},
  {id:'summer',seasons:['夏季']},{id:'year',seasons:[]}
]}]}];
test('season and incomplete combine without changing saved completion or source items',()=>{
  const completedItemIds=['bundle:done'];
  const before=JSON.stringify(rooms);
  const view=resolveCommunityView(rooms,{filter:'season-incomplete',season:'春季',completedItemIds});
  expect(view.displayedRooms[0].bundles[0].items.map(x=>x.id)).toEqual(['spring','year']);
  expect(completedItemIds).toEqual(['bundle:done']);
  expect(JSON.stringify(rooms)).toBe(before);
});
test.each([['18','30','1830'],['24','10','2410'],['26','40','2600'],['','30',null]])('time selectors %s:%s serialize to existing API time', (hour,minute,want)=>{
  const query=buildFishQuery(new URLSearchParams({timeHour:hour,timeMinute:minute,season:'春季'}));
  expect(query.get('time')).toBe(want);
  expect(query.has('timeHour')).toBe(false);
  expect(query.has('timeMinute')).toBe(false);
  expect(query.get('season')).toBe('春季');
});
test('legacy time query is preserved',()=>{
  expect(buildFishQuery(new URLSearchParams('time=150')).get('time')).toBe('150');
});
test('gift empty result explains verified season conflict with a recovery link',()=>{
  const data={villagers:[],gifts:[]};
  const baseline={villagers:[{name:'卡洛琳',birthday:{season:'冬季',day:7}}]};
  const html=giftResults(data,new URLSearchParams('villager=caroline&season=春季'),baseline);
  expect(html).toContain('冬季 7 日');
  expect(html).toContain('生日不在');
  expect(html).toContain('href="/tools/gifts?villager=caroline"');
});
test('unverified empty gift results never invent a birthday conflict',()=>{
  expect(giftResults({villagers:[],gifts:[]},new URLSearchParams('season=春季'),{villagers:[]})).not.toContain('生日不在');
});
test('gift names and tool actions have separate groups',()=>{
  const html=giftResults({villagers:[{name:'甲',entrySlug:'a',giftIds:['g']}],gifts:[{id:'g',name:'草莓',wikiHref:'/wiki/crops/strawberry',toolLinks:[{href:'/tools/crops?crop=strawberry',label:'计算作物收益'}]}]});
  expect(html).toContain('class="gift-name"');
  expect(html).toContain('class="gift-actions"');
});
test('shared footer exposes the fourth tool',()=>{
  expect(SiteFooter()).toContain('href="/tools/gifts"');
});
