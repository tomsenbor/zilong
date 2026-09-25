import {api, escapeHtml as esc} from '../api.js';
import {navigateTo} from '../routes.js';
import {uiClass} from '../ui-class.js';
import {toolHero, toolImage, loading, errorBox} from './tool-shell.js';

export const giftCoverage='仅展示已核实并收录的最爱礼物，不是完整喜恶表。未查到不代表该村民不喜欢。';
export function giftQuery(mode,value,season) {
  const query=new URLSearchParams();
  if(value) query.set(mode==='item'?'item':'villager',value);
  if(season) query.set('season',season);
  return query;
}
export function giftResults(data) {
  if(!data.villagers.length) return '<p role="status">未查到已核实的匹配关系，请调整条件。未查到不代表不喜欢。</p>';
  const gifts=new Map(data.gifts.map(g=>[g.id,g]));
  return data.villagers.map(v=>`<article class="${uiClass('card')} gift-result">
    <div class="fish-card-heading">${v.image?toolImage(v.image,v.name):''}<h2><a href="/wiki/villagers/${encodeURIComponent(v.entrySlug)}">${esc(v.name)}</a></h2></div>
    <p><b>生日：</b>${v.birthday?`${esc(v.birthday.season)} ${esc(v.birthday.day)} 日`:'暂未核实'}</p>
    <p><b>住址：</b>${esc(v.address||'暂未核实')}</p>
    <h3>已核实最爱</h3><ul class="gift-list">${v.giftIds.map(id=>{
      const g=gifts.get(id);if(!g)return '';
      const safe=/^\/(?:wiki\/|search\?)/.test(g.wikiHref||'');
      const tools=(g.toolLinks||[]).filter(link=>/^\/tools\/(?:fish|crops)\?/.test(link.href)).map(link=>`<a href="${esc(link.href)}" aria-label="${esc(g.name+'：'+link.label)}">${esc(link.label)}</a>`).join(' ');
      return `<li>${safe?`<a href="${esc(g.wikiHref)}">${esc(g.name)}</a>`:esc(g.name)} ${tools}</li>`;
    }).join('')}</ul></article>`).join('');
}
const options=(items,current)=>items.map(x=>`<option value="${esc(x.id)}"${x.id===current?' selected':''}>${esc(x.name)}</option>`).join('');

export async function renderGiftTool(app,params=new URLSearchParams()) {
  app.innerHTML=`${toolHero('生日与最爱礼物查询','按村民或具体物品查询，按游戏季节查看生日。',null,[{href:'/tools',label:'全部工具'}])}
    <section class="section"><div class="shell gift-tool"><p class="${uiClass('card')} gift-coverage">${giftCoverage}</p><div data-gift-content>${loading('正在加载已核实的礼物资料…')}</div></div></section>`;
  // Capture this render's node: an obsolete request must not overwrite a later route.
  const content=app.querySelector('[data-gift-content]');
  try {
    const data=await api(`/api/tools/gifts?${params.toString()}`);
    if(!content.isConnected)return;
    const mode=params.has('item')?'item':'villager';
    const current=params.get(mode)||'';
    const unknown=current&&! (mode==='item'?data.gifts:data.options).some(x=>x.id===current);
    content.innerHTML=`<form class="${uiClass('card')} gift-filters">
      <label>查询方式<select name="mode"><option value="villager"${mode==='villager'?' selected':''}>按村民查</option><option value="item"${mode==='item'?' selected':''}>按物品查</option></select></label>
      <label data-choice-label>${mode==='item'?'具体物品':'村民'}<select name="choice"><option value="">全部</option>${unknown?`<option selected value="${esc(current)}">未收录：${esc(current)}</option>`:''}${options(mode==='item'?data.gifts:data.options,current)}</select></label>
      <label>生日季节<select name="season"><option value="">全部季节</option>${options(['春季','夏季','秋季','冬季'].map(x=>({id:x,name:x})),params.get('season'))}</select></label>
      <button class="${uiClass('btn')}" type="submit">查询</button><a class="${uiClass('btn secondary')}" href="/tools/gifts">清空条件</a>
    </form><p role="status">找到 ${Number(data.total)} 位村民 · 生日按游戏季节排序 · ${esc(data.gameVersion)}</p><div class="gift-results">${giftResults(data)}</div>`;
    const form=content.querySelector('form');
    form.elements.mode.addEventListener('change',()=>{
      const next=form.elements.mode.value;
      content.querySelector('[data-choice-label]').innerHTML=`${next==='item'?'具体物品':'村民'}<select name="choice"><option value="">全部</option>${options(next==='item'?data.gifts:data.options,'')}</select>`;
    });
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const query=giftQuery(form.elements.mode.value,form.elements.choice.value,form.elements.season.value);
      // Preserve item mode even for the all-items selection.
      if(form.elements.mode.value==='item'&&!query.has('item'))query.set('item','');
      navigateTo(`/tools/gifts${query.size?'?'+query:''}`);
    });
  } catch(error) {
    if(!content.isConnected)return;
    content.innerHTML=`${errorBox(error.message)}<button class="${uiClass('btn')}" data-retry>重试</button> <a href="/tools/gifts">清空条件</a>`;
    content.querySelector('[data-retry]').addEventListener('click',()=>renderGiftTool(app,params));
  }
}
