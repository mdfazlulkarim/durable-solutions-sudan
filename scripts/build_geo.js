// Builds data/geo.json (pre-projected SVG paths for the 18 states and Abyei)
// from a state boundary GeoJSON. Run once, or again when the boundary file changes:
//   npm install d3-geo topojson-server topojson-simplify topojson-client polylabel
//   node scripts/build_geo.js data/boundaries/<file>.geojson
// The site itself needs no libraries: it reads the paths from data/geo.json.

const fs = require("fs");
const path = require("path");
const d3 = require("d3-geo");
const { topology } = require("topojson-server");
const { presimplify, simplify, quantile } = require("topojson-simplify");
const { feature } = require("topojson-client");
const polylabel = require("polylabel");

const src = process.argv[2] || "data/boundaries/geoBoundaries-SDN-ADM1_simplified.geojson";
const out = path.join(__dirname, "..", "data", "geo.json");

// Boundary names to the standard English state names used on the site
const NAME_FIX = { "Gezira": "Aj Jazirah", "Al Jazirah": "Aj Jazirah", "Abyei PCA": "Abyei" };
const nameField = (p) => p.shapeName || p.ADM1_EN || p.admin1Name_en || p.name;

const gj = JSON.parse(fs.readFileSync(src, "utf8"));
let topo = presimplify(topology({ states: gj }));
topo = simplify(topo, quantile(topo, 0.35));
const fc = feature(topo, topo.objects.states);

// d3 expects clockwise outer rings; GeoJSON files often use the opposite order.
const reverseRings = (g) => {
  if (g.type === "Polygon") g.coordinates.forEach((r) => r.reverse());
  else g.coordinates.forEach((p) => p.forEach((r) => r.reverse()));
};
fc.features.forEach((f) => { if (d3.geoArea(f) > 2 * Math.PI) reverseRings(f.geometry); });

const W = 800, H = 700;
const proj = d3.geoMercator().fitExtent([[8, 8], [W - 8, H - 8]], fc);
const pathGen = d3.geoPath(proj).digits(1);

const states = fc.features.map((f) => {
  const raw = nameField(f.properties);
  const name = NAME_FIX[raw] || raw;
  // label point: pole of inaccessibility of the largest ring, in screen space
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let best = null, bestArea = -1;
  for (const poly of polys) {
    const a = Math.abs(d3.geoArea({ type: "Polygon", coordinates: poly }));
    if (a > bestArea) { bestArea = a; best = poly; }
  }
  const projected = best.map((ring) => ring.map((pt) => proj(pt)));
  const lp = polylabel(projected, 0.5);
  return {
    name,
    path: pathGen(f),
    x: Math.round(lp[0]),
    y: Math.round(lp[1]),
    r: Math.round(lp.distance),
  };
});

const result = {
  source: "geoBoundaries (gbOpen) SDN ADM1, simplified. For illustration only.",
  width: W,
  height: H,
  states: states.filter((s) => s.name !== "Abyei").sort((a, b) => a.name.localeCompare(b.name)),
  abyei: states.find((s) => s.name === "Abyei") || null,
};
fs.writeFileSync(out, JSON.stringify(result));
console.log("Wrote", out, (fs.statSync(out).size / 1024).toFixed(1) + " KB", result.states.length, "states");
