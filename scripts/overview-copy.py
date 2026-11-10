#!/usr/bin/env python3
"""Make the git page show the Durable Solutions in Sudan overview.

Copies the overview from the Hub repository (durablesolutionshub) into this repository:
  index.html            the overview, at the root of the git page (no redirect)
  sudan/index.html      forwards to the root (kept for links to /sudan/)
  sudan/assets/...      the styles, script and images the overview uses
Every other link on the page opens on https://durablesolutionshub.org.
Old links to a project on the old git map (#project=... or ?...) open that project on the Hub.

Run after the overview changes on the live Hub:
  python3 scripts/overview-copy.py /path/to/durablesolutionshub
"""
import re, shutil, sys, pathlib

HUB = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "../durablesolutionshub")
OUT = pathlib.Path(__file__).resolve().parent.parent
src = (HUB / "sudan/index.html").read_text()

# styles and script: copied, with the header's links starting from sudan/
(OUT / "sudan/assets/hub").mkdir(parents=True, exist_ok=True)
shutil.copy(HUB / "sudan/assets/hub/hub.css", OUT / "sudan/assets/hub/hub.css")
js = (HUB / "sudan/assets/hub/hub.js").read_text()
js, n = re.subn(r'var ROOT = "/sudan/";', 'var ROOT = "sudan/"; // git copy: links are sent to the Hub by the page', js)
assert n == 1, "hub.js: ROOT not found"
(OUT / "sudan/assets/hub/hub.js").write_text(js)

# images the overview uses
for p in re.findall(r'assets/img/[A-Za-z0-9_./-]+\.(?:png|jpg|jpeg|svg|webp)', src):
    f = HUB / "sudan" / p
    if f.exists():
        (OUT / "sudan" / p).parent.mkdir(parents=True, exist_ok=True); shutil.copy(f, OUT / "sudan" / p)
for d in ("flags", "icons"):  # named in the page's script
    shutil.copytree(HUB / f"sudan/assets/img/{d}", OUT / f"sudan/assets/img/{d}", dirs_exist_ok=True)
(OUT / "sudan/mapping/assets/img").mkdir(parents=True, exist_ok=True)
shutil.copy(HUB / "sudan/mapping/assets/img/favicon.svg", OUT / "sudan/mapping/assets/img/favicon.svg")

s = src
s = s.replace('href="/sudan/assets/hub/', 'href="sudan/assets/hub/').replace('src="/sudan/assets/hub/', 'src="sudan/assets/hub/')
s = re.sub(r'([\'"`(])assets/', r'\1sudan/assets/', s)
s = s.replace('"mapping/assets/img/favicon.svg"', '"sudan/mapping/assets/img/favicon.svg"')
s = re.sub(r'\s*<script[^>]*src="/(analytics|dev-banner)\.js"[^>]*></script>', '', s)
assert "/analytics.js" not in s and "/dev-banner.js" not in s

SHIM = r'''
  <link rel="canonical" href="https://durablesolutionshub.org/sudan/">
  <script>
  /* Git copy of the overview at https://durablesolutionshub.org/sudan/: every other link opens on the Hub */
  (function () {
    var HUB = "https://durablesolutionshub.org/sudan";
    if (/^#project=/.test(location.hash)) { location.replace(HUB + "/mapping/" + location.hash); return; }
    var BASE = location.pathname.replace(/\/(index\.html)?$/, "");
    function set(a, v) { if (a.getAttribute("href") !== v) a.setAttribute("href", v); }
    function fix(a) {
      var h = a.getAttribute("href");
      if (!h || h.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(h)) return;
      var u; try { u = new URL(h, location.href); } catch (e) { return; }
      if (u.origin !== location.origin) return;
      var p = u.pathname.indexOf(BASE) === 0 ? u.pathname.slice(BASE.length) : u.pathname;
      if (/^\/(sudan\/)?(index\.html)?$/.test(p)) { set(a, u.hash || "./"); return; }
      set(a, HUB + p.replace(/^\/sudan\//, "/") + u.search + u.hash);
    }
    function all(root) { root.querySelectorAll("a[href]").forEach(fix); if (root.matches && root.matches("a[href]")) fix(root); }
    new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === "attributes") fix(m.target); else m.addedNodes.forEach(function (n) { if (n.nodeType === 1) all(n); }); }); })
      .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    document.addEventListener("DOMContentLoaded", function () { all(document); });
  })();
  </script>'''
i = s.index("</title>") + len("</title>")
s = s[:i] + SHIM + s[i:]
(OUT / "index.html").write_text(s)

(OUT / "sudan/index.html").write_text('''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <!-- The overview is at the root of the git page -->
  <script>location.replace("../" + location.search + location.hash);</script>
  <meta http-equiv="refresh" content="0; url=../">
  <link rel="canonical" href="https://durablesolutionshub.org/sudan/">
  <title>Durable Solutions in Sudan | Durable Solutions Hub</title>
</head>
<body><p><a href="../">Durable Solutions in Sudan</a></p></body>
</html>
''')
print("done")
