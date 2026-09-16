#!/usr/bin/env python3
"""Verify the five restored resource PDFs and their page links, locally or live.

Fingerprints in resource-pdfs.json identify the original PDFs visually reviewed
on 2026-09-16. Update them deliberately when replacing a document. Always copy
PDF bytes directly; decoding binary PDFs as text corrupts their contents.
"""
import argparse
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.hrefs = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.hrefs.append(dict(attrs).get('href', ''))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', help='Published origin, e.g. https://nibly.ca')
    args = parser.parse_args()
    for entry in json.loads((ROOT / 'tools/resource-pdfs.json').read_text()):
        version = entry['sha256'][:12]
        if args.url:
            origin = args.url.rstrip('/')
            with urlopen(origin + entry['page'] + '?verify=' + version, timeout=30) as response:
                html = response.read().decode('utf-8')
        else:
            html = (ROOT / (entry['page'].lstrip('/') + '.html')).read_text()
        matches = [urlsplit(href) for href in Links(html).hrefs
                   if urlsplit(href).path == '/' + entry['file']]
        assert len(matches) == 1, (entry['page'], 'Missing or duplicate PDF link')
        link = matches[0]
        assert not link.scheme and not link.netloc, (entry['page'], 'PDF must be local')
        assert parse_qs(link.query).get('v') == [version], (entry['page'], 'Stale PDF link')
        if args.url:
            with urlopen(origin + link.geturl(), timeout=30) as response:
                assert response.headers.get_content_type() == 'application/pdf', entry['file']
                data = response.read()
        else:
            data = (ROOT / entry['file']).read_bytes()
        assert hashlib.sha256(data).hexdigest() == entry['sha256'], (entry['file'], 'PDF integrity failure')
        print('PASS:', entry['page'], 'links to the intact original PDF')


if __name__ == '__main__':
    main()
