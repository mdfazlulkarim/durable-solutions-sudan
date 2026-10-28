// Builds data/abc/localities-geo.json for the Area-based coordination page (abc.html):
// pre-projected SVG paths for the 189 localities (admin 2), in exactly the same projection as data/geo.json,
// so localities sit on top of the states on the same map.
//
// Run again only when a boundary file changes:
//   npm install d3-geo topojson-server topojson-simplify topojson-client polylabel
//   node scripts/build_abc_geo.js

const fs = require("fs");
const path = require("path");
const d3 = require("d3-geo");
const { topology } = require("topojson-server");
const { presimplify, simplify, quantile } = require("topojson-simplify");
const { feature, mesh } = require("topojson-client");
const polylabel = require("polylabel").default || require("polylabel");

const ROOT = path.join(__dirname, "..");
const ADM1 = path.join(ROOT, "data/boundaries/geoBoundaries-SDN-ADM1_simplified.geojson");
const ADM2 = path.join(ROOT, "data/boundaries/geoBoundaries-SDN-ADM2_simplified.geojson");
const NAME_FIX = { "Gezira": "Aj Jazirah", "Al Jazirah": "Aj Jazirah", "Abyei PCA": "Abyei" };
const nameField = (p) => p.shapeName || p.ADM1_EN || p.ADM2_EN || p.admin1Name_en || p.name;

const reverseRings = (g) => {
  if (g.type === "Polygon") g.coordinates.forEach((r) => r.reverse());
  else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => p.forEach((r) => r.reverse()));
};
const rewind = (fc) => { fc.features.forEach((f) => { if (d3.geoArea(f) > 2 * Math.PI) reverseRings(f.geometry); }); return fc; };
function loadSimplified(file, keep) {
  const gj = JSON.parse(fs.readFileSync(file, "utf8"));
  let topo = presimplify(topology({ layer: gj }));
  topo = simplify(topo, quantile(topo, keep));
  loadSimplified.topo = topo;
  return rewind(feature(topo, topo.objects.layer));
}

// Same projection as scripts/build_geo.js
const states = loadSimplified(ADM1, 0.35);
const W = 860, H = 920;
const proj = d3.geoMercator().fitExtent([[56, 24], [W - 56, H - 240]], states);
proj.clipExtent([[0, 0], [W, H]]);
const pathGen = d3.geoPath(proj).digits(1);

const raw = rewind(JSON.parse(fs.readFileSync(ADM2, "utf8")));
const adm2 = loadSimplified(ADM2, 0.3);
const adm2Topo = loadSimplified.topo;

// Where the centroid falls in the wrong state, follow the OCHA place codes (COD)
const STATE_FIX = { "Al Fashaga": "Gedaref" };
const stateOf = (f) => {
  if (STATE_FIX[nameField(f.properties).trim()]) return STATE_FIX[nameField(f.properties).trim()];
  const c = d3.geoCentroid(f);
  let st = states.features.find((s) => d3.geoContains(s, c));
  if (!st) {
    let bd = Infinity;
    for (const s of states.features) { const dd = d3.geoDistance(c, d3.geoCentroid(s)); if (dd < bd) { bd = dd; st = s; } }
  }
  return NAME_FIX[nameField(st.properties)] || nameField(st.properties);
};

const out = adm2.features.map((f, i) => {
  const name = nameField(f.properties).trim();
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let best = null, bestArea = -1;
  for (const poly of polys) {
    const a = Math.abs(d3.geoArea({ type: "Polygon", coordinates: poly }));
    if (a > bestArea) { bestArea = a; best = poly; }
  }
  const lp = polylabel(best.map((ring) => ring.map((pt) => proj(pt))), 0.5);
  const [[x0, y0], [x1, y1]] = pathGen.bounds(f);
  const [lon, lat] = d3.geoCentroid(raw.features[i]);
  return {
    name, state: stateOf(raw.features[i]), path: pathGen(f),
    x: Math.round(lp[0] * 10) / 10, y: Math.round(lp[1] * 10) / 10,
    bbox: [x0, y0, x1, y1].map((v) => Math.round(v)),
    lon: Math.round(lon * 1000) / 1000, lat: Math.round(lat * 1000) / 1000,
    areaKm2: Math.round(d3.geoArea(raw.features[i]) * 6371.0088 ** 2),
  };
}).sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));

fs.mkdirSync(path.join(ROOT, "data/abc"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "data/abc/localities-geo.json"), JSON.stringify({
  source: "geoBoundaries (gbOpen) SDN ADM2, from OCHA ROSEA, CC BY 3.0 IGO. Admin 2 = locality. Simplified, for illustration only.",
  width: W, height: H,
  // inner locality lines, drawn once
  mesh: pathGen(mesh(adm2Topo, adm2Topo.objects.layer, (a, b) => a !== b)),
  localities: out,
}));

console.log("localities-geo.json", (fs.statSync(path.join(ROOT, "data/abc/localities-geo.json")).size / 1024).toFixed(1) + " KB;", out.length, "localities");
