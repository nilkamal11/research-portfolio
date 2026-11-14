import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'content/projects.json'),'utf8'));
const site=path.join(root,'site');
const ids=new Set();
for(const p of data.projects){
  assert.match(p.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(!ids.has(p.id),`Duplicate project: ${p.id}`);ids.add(p.id);
  for(const key of ['title','maturity','audience','summary','question','contribution','approach','result','limits'])assert(typeof p[key]==='string'&&p[key].trim(),`${p.id}: missing ${key}`);
  assert(typeof p.featured==='boolean');
  assert(p.categories.length&&p.categories.every(c=>data.categories.includes(c)),`${p.id}: unknown category`);
  assert(p.skills.length&&p.evidence.length&&p.links.length);
  for(const l of p.links){assert(l.label);assert(['demo','code','source','download'].includes(l.kind));assert(new URL(l.url).protocol==='https:');assert(!l.url.includes('example.com'));}
}
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const files=[path.join(site,'index.html'),...data.projects.map(p=>path.join(site,'projects',p.id,'index.html'))];
const external=new Set();let local=0;
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  assert((html.match(/<h1(?:\s|>)/g)||[]).length===1,`${file}: h1`);
  assert(html.includes('name="viewport"'));
  assert(!/name="robots"[^>]+noindex/.test(html),`${file}: review-only indexing restriction in public output`);
  assert(!/visitor-log|<iframe|<script[^>]+src="https:/i.test(html),`${file}: unexpected remote runtime`);
  assert(!/\bKIPP\b|ready_to_submit|application_materials|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/i.test(html),`${file}: excluded content`);
  const names=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert(new Set(names).size===names.length);
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const url=decode(match[1]);
    if(url.startsWith('https:')){external.add(url);continue;}
    if(url.startsWith('mailto:')){assert(url==='mailto:nilkamals@gmail.com');continue;}
    const [pathname,fragment]=url.split('#');
    let target=pathname.split('?')[0];target=target?path.resolve(path.dirname(file),target):file;
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    assert(fs.existsSync(target),`Missing local link ${url} from ${file}`);
    if(fragment){assert(fs.readFileSync(target,'utf8').includes(`id="${fragment}"`),`Missing anchor ${url}`);}local++;
  }
}
for(const p of data.projects){
  const html=fs.readFileSync(path.join(site,'projects',p.id,'index.html'),'utf8');
  for(const l of p.links)assert(html.includes(`href="${l.url.replaceAll('&','&amp;')}"`),`${p.id}: link omitted`);
}
assert(ids.has('doctoral-borrowing')&&ids.has('doctorate-careers'));
assert(external.has('https://doi.org/10.3102/0013189X19864969'));
assert(data.publications.length>=2);
for(const p of data.publications){assert(p.title&&p.citation&&p.contribution);assert(external.has(p.url),`Publication omitted: ${p.title}`);}
assert(external.has('https://nilkamal11.github.io/district-learning-context-explorer/finance.html'));
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/displayed-external-links.json'),JSON.stringify([...external].sort(),null,2)+'\n');
console.log(`Validated ${files.length} pages, ${ids.size} projects, ${local} local links/anchors, and ${external.size} displayed external URLs.`);
