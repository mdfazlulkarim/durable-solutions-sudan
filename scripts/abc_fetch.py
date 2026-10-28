"""Download the public data behind the Area-based coordination page.

Runs on GitHub Actions (see .github/workflows/abc-data.yml), which has open internet access.
Writes raw files to raw/ ; scripts/build_abc_data.py then turns them into data/abc/*.json.

Sources (all public):
  - Humanitarian Data Exchange (HDX), CKAN API: population (UNFPA COD-PS), people in need (OCHA HNRP),
    operational presence (OCHA 3W), displacement (IOM DTM), health and education facilities (OpenStreetMap via HOT)
  - IATI Registry: Sudan Humanitarian Fund (OCHA country-based pooled fund) allocations with locations
"""
import csv
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import zipfile
import xml.etree.ElementTree as ET

OUT = "raw"
UA = {"User-Agent": "durable-solutions-sudan-abc/1.0 (+https://mdfazlulkarim.github.io/durable-solutions-sudan/)"}
CKAN = "https://data.humdata.org/api/3/action/"
MAX_FILE = 25 * 1024 * 1024
log_lines = []


def log(*a):
    s = " ".join(str(x) for x in a)
    print(s, flush=True)
    log_lines.append(s)


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            log(f"  retry {i + 1} {url}: {e}")
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"failed: {url}")


def api(action, **params):
    url = CKAN + action + "?" + urllib.parse.urlencode(params)
    return json.loads(get(url))["result"]


def slim(pkg):
    return {
        "name": pkg["name"],
        "title": pkg.get("title"),
        "org": (pkg.get("organization") or {}).get("title"),
        "dataset_date": pkg.get("dataset_date"),
        "last_modified": pkg.get("last_modified") or pkg.get("metadata_modified"),
        "url": f"https://data.humdata.org/dataset/{pkg['name']}",
        "resources": [
            {"name": r.get("name"), "format": r.get("format"), "size": r.get("size"), "last_modified": r.get("last_modified"), "url": r.get("download_url") or r.get("url")}
            for r in pkg.get("resources", [])
        ],
    }


def save(path, data):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "wb") as f:
        f.write(data)
    log(f"  saved {path} ({len(data):,} bytes)")


def download_tabular(pkg, folder, max_files=6, pattern=None):
    n = 0
    for r in pkg.get("resources", []):
        fmt = (r.get("format") or "").lower()
        url = r.get("download_url") or r.get("url") or ""
        name = (r.get("name") or url.split("/")[-1]).replace("/", "_")
        if fmt not in ("csv", "xlsx", "xls", "json") and not url.lower().endswith((".csv", ".xlsx", ".xls")):
            continue
        if pattern and not any(p in name.lower() for p in pattern):
            continue
        if r.get("size") and int(r["size"]) > MAX_FILE:
            log(f"  skip (too big) {name}")
            continue
        try:
            data = get(url)
        except Exception as e:  # noqa: BLE001
            log(f"  could not download {name}: {e}")
            continue
        if len(data) > MAX_FILE:
            log(f"  skip (too big after download) {name}")
            continue
        if not os.path.splitext(name)[1]:
            name += "." + (fmt or "bin")
        save(os.path.join(folder, name), data)
        n += 1
        if n >= max_files:
            break


def osm_points(pkg, folder):
    """HOT OpenStreetMap exports: keep a light CSV of points (lon, lat, a few tags)."""
    for r in pkg.get("resources", []):
        url = r.get("download_url") or r.get("url") or ""
        if not url.lower().endswith("geojson.zip"):
            continue
        try:
            z = zipfile.ZipFile(io.BytesIO(get(url)))
        except Exception as e:  # noqa: BLE001
            log(f"  could not open {url}: {e}")
            continue
        rows = []
        for nm in z.namelist():
            if not nm.lower().endswith(".geojson"):
                continue
            gj = json.loads(z.read(nm))
            for f in gj.get("features", []):
                g = f.get("geometry") or {}
                if g.get("type") == "Point":
                    lon, lat = g["coordinates"][:2]
                elif g.get("type") in ("Polygon", "MultiPolygon"):
                    ring = g["coordinates"][0] if g["type"] == "Polygon" else g["coordinates"][0][0]
                    lon = sum(p[0] for p in ring) / len(ring)
                    lat = sum(p[1] for p in ring) / len(ring)
                else:
                    continue
                p = f.get("properties") or {}
                rows.append([round(lon, 5), round(lat, 5), p.get("amenity") or "", p.get("healthcare") or "", p.get("building") or "",
                             p.get("isced:level") or "", p.get("operator:type") or "", (p.get("name:en") or p.get("name") or "")[:80]])
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["lon", "lat", "amenity", "healthcare", "building", "isced_level", "operator_type", "name"])
        w.writerows(rows)
        save(os.path.join(folder, "points.csv"), buf.getvalue().encode("utf-8"))
        log(f"  {len(rows)} points")
        return


def iati_cbpf(years):
    """Sudan Humanitarian Fund allocations published by OCHA to IATI, with locations."""
    out = []
    for y in years:
        pid = f"unocha-cbpf-sudan-allocation-{y}"
        try:
            # 15 is the Sudan Humanitarian Fund in the CBPF system
            url = f"https://cbpfapi.unocha.org/iati/iati/15/{y}/GetAllocation.xml"
            log(f"IATI {pid}: {url}")
            xml = get(url)
        except Exception as e:  # noqa: BLE001
            log(f"IATI {pid}: not available ({e})")
            continue
        save(f"iati/{pid}.xml", xml) if len(xml) < MAX_FILE else None
        root = ET.fromstring(xml)
        for a in root.findall("iati-activity"):
            def txt(path):
                el = a.find(path)
                return (el.text or "").strip() if el is not None and el.text else ""
            title = txt("title/narrative")
            locs = []
            for loc in a.findall("location"):
                nm = loc.find("name/narrative")
                pos = loc.find("point/pos")
                adm = [(x.get("level"), x.get("code")) for x in loc.findall("administrative")]
                locs.append({"name": (nm.text or "").strip() if nm is not None and nm.text else "", "pos": (pos.text or "").strip() if pos is not None and pos.text else "", "adm": adm})
            impl = [ (p.find("narrative").text or "").strip() for p in a.findall("participating-org") if p.get("role") == "4" and p.find("narrative") is not None and p.find("narrative").text]
            sectors = [ (s.find("narrative").text or "").strip() if s.find("narrative") is not None and s.find("narrative").text else s.get("code") for s in a.findall("sector")]
            dates = {d.get("type"): d.get("iso-date") for d in a.findall("activity-date")}
            budget = 0.0
            for t in a.findall("transaction"):
                tt = t.find("transaction-type")
                v = t.find("value")
                if tt is not None and tt.get("code") == "2" and v is not None and v.text:  # 2 = outgoing commitment
                    try:
                        budget += float(v.text)
                    except ValueError:
                        pass
            if not budget:
                for b in a.findall("budget/value"):
                    try:
                        budget += float(b.text)
                    except (TypeError, ValueError):
                        pass
            out.append({"id": txt("iati-identifier"), "year": y, "title": title, "description": txt("description/narrative")[:600], "implementers": impl,
                        "sectors": sectors, "start": dates.get("1") or dates.get("2"), "end": dates.get("3") or dates.get("4"), "budget": budget, "locations": locs})
    save("iati/cbpf-sudan-activities.json", json.dumps(out, ensure_ascii=False, indent=1).encode("utf-8"))
    log(f"IATI: {len(out)} activities")


def main():
    os.makedirs(OUT, exist_ok=True)
    catalog = {}

    # 1. Catalogue of candidate datasets, newest first, for the record and for the build step
    queries = {
        "population": "Sudan subnational population statistics",
        "needs": "Sudan humanitarian needs people in need",
        "presence": "Sudan 3W operational presence who does what where",
        "dtm": "Sudan DTM displacement baseline locality",
        "health": "Sudan health facilities",
        "education": "Sudan education facilities schools",
        "water": "Sudan water points",
        "ipc": "Sudan acute food insecurity IPC",
    }
    for k, q in queries.items():
        try:
            res = api("package_search", q=q, fq="groups:sdn", rows=15, sort="metadata_modified desc")
            catalog[k] = [slim(p) for p in res["results"]]
            log(f"search {k}: {len(res['results'])} of {res['count']}")
        except Exception as e:  # noqa: BLE001
            log(f"search {k} failed: {e}")
    save("_catalog.json", json.dumps(catalog, ensure_ascii=False, indent=1).encode("utf-8"))

    # 2. Downloads
    def show(name):
        try:
            return api("package_show", id=name)
        except Exception as e:  # noqa: BLE001
            log(f"package {name}: not found ({e})")
            return None

    for name, folder in [("cod-ps-sdn", "population"), ("sudan-humanitarian-needs", "needs")]:
        p = show(name)
        if p:
            log(f"package {name}: {p.get('title')} | {p.get('dataset_date')} | {p.get('last_modified')}")
            download_tabular(p, folder, max_files=8)

    def pick(name, match, folder, n=1):
        """Download the first n resources of a dataset whose name matches (resources are listed newest first)."""
        p = show(name)
        if not p:
            return
        log(f"package {name}: {p.get('title')} | {p.get('dataset_date')} | {p.get('last_modified')}")
        save(os.path.join(folder, "_meta.json"), json.dumps(slim(p), indent=1).encode("utf-8"))
        k = 0
        for r in p.get("resources", []):
            nm = (r.get("name") or "").strip()
            if not match(nm.lower()):
                continue
            url = r.get("download_url") or r.get("url")
            try:
                data = get(url)
            except Exception as e:  # noqa: BLE001
                log(f"  could not download {nm}: {e}")
                continue
            if len(data) > MAX_FILE:
                log(f"  skip (too big) {nm}")
                continue
            ext = os.path.splitext(url.split("?")[0])[1].lower() or ".bin"
            safe = re.sub(r"[^A-Za-z0-9._-]+", "_", nm)[:90]
            save(os.path.join(folder, safe if safe.lower().endswith(ext) else safe + ext), data)
            k += 1
            if k >= n:
                break

    # OCHA Sudan 3W (who does what where), latest consolidated file
    pick("sudan-operational-presence", lambda n: n.startswith("2026-consolidated"), "presence/ocha-sudan-3w", 1)
    # IOM DTM, latest Displacement and Return Snapshot (IDPs and returnees by locality)
    pick("sudan-displacement-situation-countrywide-idps-iom-dtm", lambda n: "snapshot" in n or "mobility" in n, "dtm/snapshot", 1)
    # HDX HAPI for Sudan: humanitarian needs, returnees, IDPs, operational presence, population
    pick("hdx-hapi-sdn", lambda n: any(k in n for k in ("humanitarian needs", "returnees", "internally-displaced", "operational presence", "baseline population")), "hapi", 6)
    # HeiGIT risk assessment inputs by locality: facilities and access to services
    pick("sudan---risk-assessment-indicators", lambda n: n.endswith(".csv"), "heigit", 10)
    # FEWS NET acute food insecurity, September 2026 projection
    pick("sudan-acute-food-insecurity-classification-september-2026-january-2027", lambda n: "geojson" in n, "ipc", 1)

    # Basic services from OpenStreetMap (HOT exports)
    for name, folder in [("hotosm_sdn_health_facilities", "osm/health"), ("hotosm_sdn_education_facilities", "osm/education")]:
        p = show(name)
        if p:
            log(f"package {name}: {p.get('last_modified')}")
            osm_points(p, folder)
            save(os.path.join(folder, "_meta.json"), json.dumps(slim(p), indent=1).encode("utf-8"))

    # Sudan Humanitarian Fund projects (OCHA), via IATI
    iati_cbpf([2025, 2026])

    save("_log.txt", "\n".join(log_lines).encode("utf-8"))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001
        log(f"FAILED: {e}")
        save("_log.txt", "\n".join(log_lines).encode("utf-8"))
        sys.exit(0)
