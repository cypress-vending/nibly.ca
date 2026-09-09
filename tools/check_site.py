#!/usr/bin/env python3
"""Dependency-free checks for the five-page site; optionally verify preview HTTP routes."""
import argparse
import http.client
import json
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = 'https://www.nibly.ca'
PAGES = {'index.html': '/', 'the-machine.html': '/the-machine',
         'locations.html': '/locations', 'contact-us.html': '/contact-us',
         'privacy-policy.html': '/privacy-policy'}
ROUTE_TO_FILE = {route: file_name for file_name, route in PAGES.items()}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def text(self):
        return ' '.join(c.text() if isinstance(c, Node) else c for c in self.children)
    def find(self, tag=None):
        result = []
        for child in self.children:
            if isinstance(child, Node):
                if tag is None or child.tag == tag:
                    result.append(child)
                result.extend(child.find(tag))
        return result

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break
    def handle_data(self, text):
        self.stack[-1].children.append(text)

normalize = lambda s: re.sub(r'\s+', ' ', s).strip()
docs = {name: Document((ROOT / name).read_text()).root for name in PAGES}
assert {p.name for p in ROOT.glob('*.html')} == set(PAGES), 'Unexpected public page'
titles, descriptions, canonical_urls = set(), set(), set()
for name, doc in docs.items():
    assert len(doc.find('main')) == 1 and len(doc.find('h1')) == 1, name
    title = doc.find('title')[0].text()
    desc = [n.attrs['content'] for n in doc.find('meta') if n.attrs.get('name') == 'description']
    canonical = [n.attrs['href'] for n in doc.find('link') if n.attrs.get('rel') == 'canonical']
    assert len(desc) == len(canonical) == 1, name
    assert canonical[0] == DOMAIN + PAGES[name], name
    titles.add(title); descriptions.add(desc[0]); canonical_urls.add(canonical[0])
    ids = [n.attrs['id'] for n in doc.find() if 'id' in n.attrs]
    assert len(ids) == len(set(ids)), (name, 'Duplicate id')
    for n in doc.find():
        assert n.tag != 'iframe', name
        refs = [(key, n.attrs[key]) for key in ('src', 'href') if key in n.attrs]
        if 'srcset' in n.attrs:
            refs += [('src', value.strip().split()[0]) for value in n.attrs['srcset'].split(',')]
        for key, ref in refs:
            url = urlsplit(ref)
            if url.scheme:
                assert key != 'src' or (n.tag == 'script' and
                    ref == 'https://js.hsforms.net/forms/embed/22691627.js' and
                    'defer' in n.attrs), (name, 'Unexpected remote runtime asset', ref)
                continue
            assert ref, (name, 'Empty reference')
            raw_path = unquote(url.path) if url.path else name
            if raw_path.startswith('/'):
                file_name = ROUTE_TO_FILE.get(raw_path)
                assert file_name, (name, 'Unknown route', ref)
                dest = ROOT / file_name
            else:
                dest = ROOT / raw_path
            assert dest.exists(), (name, 'Missing target', ref)
            if url.fragment and dest.name in docs:
                assert any(n.attrs.get('id') == url.fragment for n in docs[dest.name].find()), (name, ref)
    scripts = [n for n in doc.find('script') if n.attrs.get('type') == 'application/ld+json']
    assert len(scripts) == 1, name
    graph = json.loads(scripts[0].text())['@graph']
    nodes = {n['@id']: n for n in graph}
    assert len(nodes) == len(graph), (name, 'Duplicate schema node')
    def check(value):
        if isinstance(value, dict):
            if set(value) == {'@id'}:
                assert value['@id'] in nodes, (name, 'Unresolved schema reference', value)
            assert value.get('@type') not in {'Offer', 'AggregateOffer', 'Review', 'AggregateRating', 'DonateAction'}, name
            for item in value.values(): check(item)
        elif isinstance(value, list):
            for item in value: check(item)
        elif isinstance(value, str):
            assert 'TODO' not in value and 'localhost' not in value and '127.0.0.1' not in value, name
    check(graph)
    if name == 'the-machine.html':
        visible = {}
        for detail in doc.find('details'):
            summary = detail.find('summary')[0]
            answer = next(n for n in detail.find() if 'answer' in n.attrs.get('class', '').split())
            visible[normalize(summary.text())] = normalize(answer.text())
        faq = next(n for n in graph if n['@type'] == 'FAQPage')
        encoded = {normalize(q['name']): normalize(q['acceptedAnswer']['text']) for q in faq['mainEntity']}
        assert visible == encoded, 'Visible FAQ and schema differ'
        product = next(n for n in graph if n['@type'] == 'Product')
        assert product['width']['value'] == 40 and product['depth']['value'] == 30 and product['height']['value'] == 72
    assert not re.search(r'\b(TODO|AggregateOffer|ShoppingCart)\b', (ROOT / name).read_text()), name
assert len(titles) == len(descriptions) == len(PAGES), 'Duplicate metadata'
sitemap = ET.parse(ROOT / 'sitemap.xml')
assert {n.text for n in sitemap.findall('.//{*}loc')} == canonical_urls, 'Sitemap/canonical mismatch'
robots = (ROOT / 'robots.txt').read_text()
assert 'User-agent: *\nAllow: /' in robots and DOMAIN + '/sitemap.xml' in robots
print('PASS: five pages, unique metadata, H1s, local assets/anchors, graph references, visible FAQ parity and sitemap.')

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url', help='Local preview origin, e.g. http://127.0.0.1:4174')
args = parser.parse_args()
if args.url:
    origin = urlsplit(args.url)
    assert origin.scheme == 'http' and origin.hostname in {'localhost', '127.0.0.1'}, 'Preview checks are local-only'
    def request(path):
        conn = http.client.HTTPConnection(origin.hostname, origin.port)
        conn.request('GET', path)
        response = conn.getresponse()
        result = response.status, dict(response.getheaders()), response.read()
        conn.close()
        assert 'noindex' in result[1].get('X-Robots-Tag', ''), path
        return result
    for line in (ROOT / 'routes.txt').read_text().splitlines():
        if not line.strip() or line.startswith('#'): continue
        source, target, status = line.split()
        actual, headers, body = request(source + '?ref=route-check')
        assert actual == int(status), (source, actual)
        if actual == 301:
            assert headers['Location'] == target + '?ref=route-check', source
            final, _, body = request(headers['Location'])
            assert final == 200, (source, 'Redirect loop or missing destination')
        else:
            assert body == (ROOT / target.lstrip('/')).read_bytes(), source
    assert request('/not-a-real-page')[0] == 404
    for path in ['/store', '/madd', '/request', '/ops-manual']:
        assert request(path)[0] == 404, ('Excluded route unexpectedly remapped', path)
    assert b'Disallow: /' in request('/robots.txt')[2]
    print('PASS: canonical routes, 301 aliases, query preservation, actual HTML responses, 404s and preview noindex.')
