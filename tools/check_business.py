#!/usr/bin/env python3
"""Check the production campaign page and its exact HubSpot/pixel configuration."""
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
assert not any(t=='meta' and a.get('http-equiv')=='Content-Security-Policy' for t,a in nodes)
assert len([t for t,a in nodes if t=='form'])==0, 'Use the HubSpot embed, not the obsolete native form'
embeds=[a for t,a in nodes if a.get('class')=='hs-form-frame']
assert len(embeds)==1
assert embeds[0]['data-form-id']=='cfb46a58-42db-4eb5-9d46-53fc060f8252'
assert embeds[0]['data-portal-id']=='22691627'
assert 'not yet enabled' not in html and 'Baseline Preview' not in html
assert [a.get('src') for t,a in nodes if t=='script']==['https://js.hsforms.net/forms/embed/22691627.js','./baseline.js']
config=(ROOT/'site-config.js').read_text()
assert 'previewMode: false' in config and 'adsTrackingEnabled: true' in config
assert embeds[0]['data-form-id'] in config
assert "allowedOrigins: ['https://nibly.ca']" in config
assert "openaiPixelId: 'BngSvGS4SNTF4a2utoBtxg'" in config
assert 'connectHubSpotConversions' in (ROOT/'baseline.js').read_text()
for t,a in nodes:
 for key in ('src','href'):
  ref=a.get(key)
  if not ref:continue
  url=urlsplit(ref)
  if url.scheme or url.netloc:assert key!='src' or ref=='https://js.hsforms.net/forms/embed/22691627.js',('Unexpected remote asset',ref)
  elif url.path:assert (ROOT/unquote(url.path)).is_file(),('Missing asset',ref)
for ref in re.findall(r'url\([\"\']?(\./assets/[^\"\')]+)',html):assert (ROOT/ref).is_file(),ref
assert '127.0.0.1' not in html
print('Business page: assets, noindex, HubSpot embed and production pixel configuration checks passed.')
