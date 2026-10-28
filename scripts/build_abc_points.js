// Area-based coordination page: place points and food insecurity areas in localities.
// Reads raw/ (downloaded by scripts/abc_fetch.py) and writes:
//   data/abc/services-points.json   health facilities and schools from OpenStreetMap, pre-projected for the map
//   raw/_derived/by-locality.json   counts of OSM points and the share of each locality in each IPC phase,
//                                   read by scripts/build_abc_data.py
// Usage: node scripts/build_abc_points.js [raw folder]
// Needs: npm install d3-geo

const fs = require("fs");
const path = require("path");
const d3 = require("d3-geo");

const ROOT = path.join(__dirname, "..");
const RAW = process.argv[2] || path.join(ROOT, "raw");
const geo = JSON.parse(fs.readFileSync(path.join(ROOT, "data/geo.json"), "utf8"));
const adm2 = JSON.parse(fs.readFileSync(path.join(ROOT, "data/boundaries/geoBoundaries-SDN-ADM2_simplified.geojson"), "utf8"));
const adm1 = JSON.parse(fs.readFileSync(path.join(ROOT, "data/boundaries/geoBoundaries-SDN-ADM1_simplified.geojson"), "utf8"));

const reverseRings = (g) => {
  if (g.type === "Polygon") g.coordinates.forEach((r) => r.reverse());
  else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => p.forEach((r) => r.reverse()));
};
const rewind = (fc) => { fc.features.forEach((f) => { if (d3.geoArea(f) > 2 * Math.PI) reverseRings(f.geometry); }); return fc; };
rewind(adm2); rewind(adm1);

// The map projection of data/geo.json, fitted again from the states file (same call as scripts/build_geo.js).
// Small differences from simplification do not matter at this scale.
const W = geo.width, H = geo.height;
const proj = d3.geoMercator().fitExtent([[56, 24], [W - 56, H - 240]], adm1);

const NAME_FIX = { "Gezira": "Aj Jazirah", "Al Jazirah": "Aj Jazirah", "Abyei PCA": "Abyei" };
const states = adm1.features.map((f) => ({ name: NAME_FIX[f.properties.shapeName] || f.properties.shapeName, f, b: d3.geoBounds(f) }));
const STATES = states.map((s) => s.name).sort();
const stateOf = (pt) => { for (const s of states) if (inBox(s.b, pt) && d3.geoContains(s.f, pt)) return s.name; return null; };
const locs = adm2.features.map((f) => ({ name: f.properties.shapeName.trim(), f, b: d3.geoBounds(f) }));
const inBox = (b, [x, y]) => x >= b[0][0] && x <= b[1][0] && y >= b[0][1] && y <= b[1][1];
const whereIs = (pt) => { for (const l of locs) if (inBox(l.b, pt) && d3.geoContains(l.f, pt)) return l.name; return null; };

/* ---------- OpenStreetMap points ---------- */
const readCsv = (file) => {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  const head = lines.shift().split(",");
  return lines.map((ln) => {
    const out = []; let cur = "", q = false;
    for (const ch of ln) { if (ch === '"') q = !q; else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; }
    out.push(cur);
    return Object.fromEntries(head.map((h, i) => [h, out[i] || ""]));
  });
};
const kindHealth = (r) => {
  const a = r.amenity || r.healthcare;
  if (a === "hospital") return "hospital";
  if (["clinic", "doctors", "health_post", "health_centre", "centre", "dentist"].includes(a) || r.healthcare === "clinic") return "clinic";
  if (a === "pharmacy") return "pharmacy";
  return "health-other";
};
const kindEdu = (r) => (["college", "university"].includes(r.amenity) ? "higher" : "school");

// short codes: H hospital, C clinic or health centre, S school, U college or university (pharmacies are counted, not drawn)
const code = { hospital: "H", clinic: "C", school: "S", higher: "U" };
const counts = {};
const pointsOut = [];
for (const [file, kindOf] of [["osm/health/points.csv", kindHealth], ["osm/education/points.csv", kindEdu]]) {
  const fp = path.join(RAW, file);
  if (!fs.existsSync(fp)) { console.log("missing", file); continue; }
  for (const r of readCsv(fp)) {
    const pt = [Number(r.lon), Number(r.lat)];
    const loc = whereIs(pt);
    if (!loc) continue;
    const k = kindOf(r);
    const c = (counts[loc] = counts[loc] || {});
    c[k] = (c[k] || 0) + 1;
    if (!code[k]) continue;
    const [x, y] = proj(pt);
    const st = stateOf(pt);
    pointsOut.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10, code[k], st ? STATES.indexOf(st) : -1]);
  }
}
const healthMeta = JSON.parse(fs.readFileSync(path.join(RAW, "osm/health/_meta.json"), "utf8"));
fs.writeFileSync(path.join(ROOT, "data/abc/services-points.json"), JSON.stringify({
  source: "OpenStreetMap contributors, via the Humanitarian OpenStreetMap Team exports on HDX (Health Facilities of Sudan; Education Facilities of Sudan), ODbL.",
  date: (healthMeta.last_modified || "").slice(0, 10),
  codes: { H: "Hospital", C: "Clinic or health centre", S: "School", U: "College or university" },
  states: STATES,
  points: pointsOut,
}));

/* ---------- IPC (FEWS NET) share of each locality in each phase ---------- */
const ipcFile = fs.readdirSync(path.join(RAW, "ipc")).find((f) => f.endsWith(".geojson"));
const ipc = { ML1: [], ML2: [] };
if (ipcFile) {
  const g = rewind(JSON.parse(fs.readFileSync(path.join(RAW, "ipc", ipcFile), "utf8")));
  for (const f of g.features) {
    if (!/Polygon/.test(f.geometry.type)) continue;
    (ipc[f.properties.scenario] = ipc[f.properties.scenario] || []).push({ v: f.properties.value, f, b: d3.geoBounds(f) });
  }
}
const ipcShare = {};
for (const l of locs) {
  const [[x0, y0], [x1, y1]] = l.b;
  const step = Math.max(0.02, Math.min(0.15, Math.sqrt(((x1 - x0) * (y1 - y0)) / 400)));
  const res = {};
  for (const sc of ["ML1", "ML2"]) {
    const tally = {}; let n = 0;
    for (let x = x0 + step / 2; x < x1; x += step) for (let y = y0 + step / 2; y < y1; y += step) {
      const pt = [x, y];
      if (!d3.geoContains(l.f, pt)) continue;
      n++;
      const hit = ipc[sc].find((p) => inBox(p.b, pt) && d3.geoContains(p.f, pt));
      const k = hit ? String(hit.v) : "none";
      tally[k] = (tally[k] || 0) + 1;
    }
    if (n) res[sc] = Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, Math.round((v / n) * 100) / 100]));
  }
  ipcShare[l.name] = res;
}

fs.mkdirSync(path.join(RAW, "_derived"), { recursive: true });
fs.writeFileSync(path.join(RAW, "_derived/by-locality.json"), JSON.stringify({ osm: counts, ipc: ipcShare }, null, 1));
console.log("points drawn:", pointsOut.length, "| localities with OSM points:", Object.keys(counts).length, "| IPC file:", ipcFile || "none");
