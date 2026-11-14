import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'content/projects.json'),'utf8'));
let html=fs.readFileSync(path.join(root,'site/index.html'),'utf8');
html=html.replace('<head>','<head><meta name="robots" content="noindex,nofollow">');
const css=fs.readFileSync(path.join(root,'site/assets/portfolio.css'),'utf8');
const js=fs.readFileSync(path.join(root,'site/assets/portfolio.js'),'utf8');
html=html.replace('<link rel="stylesheet" href="assets/portfolio.css">',`<style>${css}\n.portable-details{padding-block:45px}.portable-case{border:1px solid var(--line);margin-bottom:16px}.portable-case>summary{cursor:pointer;padding:20px 25px;font:24px/1.3 var(--serif)}.portable-case>summary:focus-visible{outline:3px solid #a9511e}.portable-case .case-main{width:calc(100% - 50px)}.portable-case .case-layout{gap:40px}.portable-note{padding:12px 20px;border-bottom:1px solid var(--line);font-size:12px;margin:0;background:#eee9dd}.portable-note a{font-weight:600}</style>`);
html=html.replace('<script src="assets/portfolio.js" defer></script>',`<script>${js}</script>`);
html=html.replace('<main id="main">','<p class="portable-note">Private review copy · <a href="#case-summaries">Browse case summaries</a> · no publication or public sharing change</p><main id="main">');
let cases='<section class="wrap portable-details" id="case-summaries"><p class="eyebrow">Case summaries · offline review</p><h2>A closer look at the work.</h2>';
for(const p of data.projects){
  const file=fs.readFileSync(path.join(root,'site/projects',p.id,'index.html'),'utf8');
  const body=file.match(/<main id="main"([^>]+)>([\s\S]*?)<\/main>/);
  const content=body[2].replace('<a class="back-link" href="../../index.html#projects">← All projects</a>','<a class="back-link" href="#projects">← All projects</a>').replaceAll('<h2>','<h3>').replaceAll('</h2>','</h3>').replaceAll('<h1>','<h2>').replaceAll('</h1>','</h2>');
  const title=p.title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  cases+=`<details class="portable-case" id="case-${p.id}"><summary>${title}</summary><div${body[1]}>${content}</div></details>`;
}
cases+='</section>';
html=html.replace('</main>',`</main>${cases}`);
for(const p of data.projects){html=html.replaceAll(`projects/${p.id}/index.html`,`#case-${p.id}`).replaceAll(`../${p.id}/index.html`,`#case-${p.id}`);}
html=html.replaceAll('../../index.html','').replaceAll('href="index.html"','href="#main"').replaceAll('href="index.html#','href="#');
html=html.replace('</body>',`<script>function openCase(){const id=location.hash.slice(1);const panel=document.getElementById(id);if(panel&&panel.classList.contains('portable-case')){panel.open=true;panel.scrollIntoView();}}addEventListener('hashchange',openCase);document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.getAttribute('href')?.startsWith('#case-')){const panel=document.querySelector(a.getAttribute('href'));if(panel)panel.open=true;}});openCase();</script></body>`);
fs.mkdirSync(path.join(root,'review'),{recursive:true});
fs.writeFileSync(path.join(root,'review/portfolio-private-review.html'),html);
console.log('Created self-contained review/portfolio-private-review.html with all nine case summaries.');
