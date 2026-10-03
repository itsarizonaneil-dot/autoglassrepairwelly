"""Local preview server for this site.

Mirrors what vercel.json does in production, which plain `python -m http.server`
does not: clean URLs ("/faq" serves faq.html), "/faq.html" and "/index.html"
redirect to their clean form, and unknown paths get 404.html with a 404 status.
Caching is disabled so CSS/JS edits show up on a normal refresh.

Usage:  python serve.py [port]        (default port 3466)
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _redirect(self, target, query):
        self.send_response(301)
        self.send_header("Location", target + ("?" + query if query else ""))
        self.end_headers()

    def _resolve(self):
        """Return True if the request was fully handled (redirect or 404)."""
        parts = urlsplit(self.path)
        path = parts.path

        if path.endswith("/index.html"):
            self._redirect(path[: -len("index.html")] or "/", parts.query)
            return True
        if path.endswith(".html"):
            self._redirect(path[: -len(".html")], parts.query)
            return True

        fs_path = os.path.join(ROOT, path.lstrip("/").replace("/", os.sep))
        if path != "/" and not os.path.splitext(path)[1] and os.path.isfile(fs_path + ".html"):
            self.path = path + ".html" + ("?" + parts.query if parts.query else "")
            return False
        if path == "/" or os.path.exists(fs_path):
            return False

        not_found = os.path.join(ROOT, "404.html")
        body = b"Not found"
        if os.path.isfile(not_found):
            with open(not_found, "rb") as f:
                body = f.read()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)
        return True

    def do_GET(self):
        if not self._resolve():
            super().do_GET()

    def do_HEAD(self):
        if not self._resolve():
            super().do_HEAD()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3466
    with ThreadingHTTPServer(("", port), Handler) as server:
        print(f"Serving {ROOT} at http://localhost:{port}  (Ctrl+C to stop)")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
