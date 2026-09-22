#!/usr/bin/env python3
"""Check the inactive campaign baseline without changing existing site contracts."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re
ROOT=Path(__file__).resolve().parents[1]/'business'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.nodes=[];self.feed(text)
 def handle_starttag(self,t,a):self.nodes.append((t,dict(a)))
html=(ROOT/'index.html').read_text();nodes=Page(html).nodes
assert any(t=='meta' and a.get('name')=='robots' and a.get('content')=='noindex,nofollow' for t,a in nodes)
assert any(t=='meta' and a.get('http-equiv')=='Content-Security-Policy' and a.get('content')=="form-action 'none'" for t,a in nodes)
assert len([t for t,a in nodes if t=='form'])==1
assert all('disabled' in a for t,a in nodes if t=='button')
assert 'Info-kit requests are not yet enabled.' in html
assert [a.get('src') for t,a in nodes if t=='script']==['./baseline.js']
assert 'previewMode: true' in (ROOT/'site-config.js').read_text()
assert 'adsTrackingEnabled: false' in (ROOT/'site-config.js').read_text()
assert 'button.disabled = true;' in (ROOT/'baseline.js').read_text()
for t,a in nodes:
 for key in ('src','href'):
  ref=a.get(key)
  if not ref:continue
  url=urlsplit(ref)
  if url.scheme or url.netloc:assert key!='src',('Remote asset',ref)
  elif url.path:assert (ROOT/unquote(url.path)).is_file(),('Missing asset',ref)
for ref in re.findall(r'url\([\"\']?(\./assets/[^\"\')]+)',html):assert (ROOT/ref).is_file(),ref
assert '127.0.0.1' not in html
print('Business baseline: local assets, noindex, inactive form and tracking checks passed.')
