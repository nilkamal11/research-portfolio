"""Static publication contract for the education portfolio hub."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.links=[];self.assets=[]
    def handle_starttag(self,tag,attrs):
        values=dict(attrs)
        if values.get('id'):self.ids.append(values['id'])
        if tag=='a':self.links.append(values.get('href',''))
        if tag=='script':self.assets.append(values.get('src',''))
        if tag=='link' and values.get('rel')=='stylesheet':self.assets.append(values['href'])
page=Page();text=(ROOT/'site/index.html').read_text(encoding='utf-8');page.feed(text)
assert len(page.ids)==len(set(page.ids)),'Duplicate HTML IDs'
assert {'k12','higher-ed','publications','approach','borrowing-preview','careers-preview'}<=set(page.ids)
for link in page.links:
    assert 'localhost' not in link and '127.0.0.1' not in link and 'C:/' not in link
    if link.startswith('#'):assert link[1:] in page.ids,link
for asset in page.assets:assert (ROOT/'site'/asset).is_file(),asset
required=[
 'https://nilkamal11.github.io/district-learning-context-explorer/finance.html',
 'https://nilkamal11.github.io/district-learning-context-explorer/illinois.html',
 'https://nilkamal11.github.io/k12-data-library/',
 'https://nilkamal11.github.io/higher-ed-data-library/',
 'https://nilkamal11.github.io/doctoral-borrowing/',
 'https://nilkamal11.github.io/doctorate-careers/',
 'https://doi.org/10.3102/0013189X19864969',
 'https://www.airweb.org/publication/article-148',
]
assert all(link in page.links for link in required),'Missing portfolio resource'
assert 'September 13, 2026' in text,'Catalog review date omitted'
assert 'not an estimate of the effect' in text or 'Not fourth-grade spending' in text
assert text.count('<h1>')==1
print(f'PASS: {len(required)} required resources; {len(page.ids)} unique anchors; all local assets present')
print('Public destinations:',len({u for u in page.links if urlparse(u).scheme=='https'}))
