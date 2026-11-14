import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'site/index.html'),'utf8');
const code=fs.readFileSync(path.join(root,'site/assets/portfolio.js'),'utf8');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
function setup(query='',hash=''){
  const el=()=>({value:'',hidden:false,dataset:{},events:{},attrs:{},addEventListener(type,fn){this.events[type]=fn},setAttribute(k,v){this.attrs[k]=v},focus(){this.focused=true}});
  const elements=Object.fromEntries(['project-controls','project-search','maturity-filter','results-count','empty-state','reset-filters','filter-link'].map(id=>[id,el()]));
  const buttons=[...html.matchAll(/<button type="button" data-filter="([^"]*)"/g)].map(m=>Object.assign(el(),{dataset:{filter:decode(m[1])}}));
  const cards=[...html.matchAll(/<article class="project-card[^>]+data-category="([^"]+)" data-maturity="([^"]+)" data-search="([^"]+)"/g)].map(m=>Object.assign(el(),{dataset:{category:decode(m[1]),maturity:decode(m[2]),search:decode(m[3])}}));
  elements['project-controls'].querySelectorAll=()=>buttons;
  vm.runInNewContext(code,{document:{getElementById:id=>elements[id],querySelectorAll:()=>cards},location:{search:query,hash,href:'http://127.0.0.1:8789/'+query+hash},URL,URLSearchParams});
  return {elements,buttons,cards,count:()=>cards.filter(c=>!c.hidden).length};
}
test('all nine projects render and controls initialize',()=>{const s=setup();assert.equal(s.cards.length,9);assert.equal(s.count(),9);assert.equal(s.elements['project-controls'].hidden,false)});
test('K-12 category includes district, metadata, sources, and trade demo',()=>{const s=setup();s.buttons.find(b=>b.dataset.filter==='K–12 analytics').events.click();assert.equal(s.count(),4);assert.equal(s.elements['results-count'].textContent,'4 of 9 projects')});
test('prototype and source-guide maturity groups are distinct',()=>{const s=setup();const m=s.elements['maturity-filter'];m.value='prototype';m.events.change();assert.equal(s.count(),3);m.value='guide';m.events.change();assert.equal(s.count(),2)});
test('multi-term search accepts ASCII hyphen in K-12',()=>{const s=setup('?q=K-12+source');assert.equal(s.count(),2)});
test('combined filters and a reusable URL select the intended project',()=>{const s=setup('?category=Higher-ed%20analytics&maturity=prototype');assert.equal(s.count(),1);assert(s.cards.find(c=>!c.hidden).dataset.search.includes('Institution Atlas'));assert(s.elements['filter-link'].href.includes('maturity=prototype'))});
test('zero-result state and clear restore all cards and focus',()=>{const s=setup('?q=nonexistentitem');assert.equal(s.count(),0);assert.equal(s.elements['empty-state'].hidden,false);s.elements['reset-filters'].events.click();assert.equal(s.count(),9);assert.equal(s.elements['empty-state'].hidden,true);assert.equal(s.elements['project-search'].focused,true)});
test('invalid URL filters safely fall back to all work',()=>assert.equal(setup('?category=invalid&maturity=invalid').count(),9));
test('existing K-12 and higher-ed section links retain the appropriate project views',()=>{const k12=setup('','#k12');assert.equal(k12.count(),4);assert(k12.cards.filter(c=>!c.hidden).every(c=>c.dataset.category.includes('K–12 analytics')));const higher=setup('','#higher-ed');assert.equal(higher.count(),4);assert(higher.cards.filter(c=>!c.hidden).every(c=>c.dataset.category.includes('Higher-ed analytics')))});
