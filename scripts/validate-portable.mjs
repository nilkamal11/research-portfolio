import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'review/portfolio-private-review.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'content/projects.json'),'utf8'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'Duplicate ID in single-file preview');
assert.equal((html.match(/<h1>/g)||[]).length,1);
assert.equal((html.match(/<details class="portable-case"/g)||[]).length,data.projects.length);
assert(!/<script[^>]+src=|<link[^>]+rel="stylesheet"/.test(html),'Preview depends on external runtime');
for(const m of html.matchAll(/href="([^"]+)"/g)){
  const href=m[1];
  if(href.startsWith('#'))assert(ids.includes(href.slice(1)),`Missing portable anchor: ${href}`);
  else assert(href.startsWith('https:')||href.startsWith('mailto:')||href.startsWith('?'),`Nonportable link: ${href}`);
}
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
for(const p of data.projects){assert(ids.includes(`case-${p.id}`));assert(html.includes(p.summary.replaceAll('&','&amp;')));}
console.log(`Validated standalone HTML: ${data.projects.length} expandable cases, unique anchors, embedded runtime, and valid script syntax.`);
