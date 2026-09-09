#!/usr/bin/env python3
"""Local-only preview of the five-page static site and its proposed URL mapping.
No production backend is needed; translate routes.txt on the chosen static host.
"""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
RULES = {}
for line in (ROOT / 'routes.txt').read_text().splitlines():
    if line.strip() and not line.startswith('#'):
        source, target, status = line.split()
        RULES[source] = (target, int(status))

class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('X-Robots-Tag', 'noindex, nofollow')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def send_head(self):
        url = urlsplit(self.path)
        if url.path == '/robots.txt':
            from io import BytesIO
            body = b'User-agent: *\nDisallow: /\n'
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            return BytesIO(body)
        if url.path in RULES:
            target, status = RULES[url.path]
            if status == 301:
                self.send_response(301)
                self.send_header('Location', target + ('?' + url.query if url.query else ''))
                self.send_header('Content-Length', '0')
                self.end_headers()
                return None
            self.path = target
        return super().send_head()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4174)
    args = parser.parse_args()
    print(f'Local preview: http://127.0.0.1:{args.port}/ (noindex)', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Preview).serve_forever()
