/* Area-based coordination (git page only, not in the menu).
   One map of Sudan by state and locality with population, people in need, IDPs, returnees, basic services,
   food insecurity and partners present, the projects reported to the DSWG (Solutions Footprint) and the
   Sudan Humanitarian Fund (OCHA), a ranking of localities, and a project planner that saves up to 20 plans
   in this browser and shares any plan as a link.
   Data: data/abc/*.json (built by scripts/build_abc_data.py from public sources), data/projects.json, data/geo.json. */
"use strict";
(() => {
  const esc = SF.esc;
  const $ = (id) => document.getElementById(id);
  const IC = SF.ICONS_THEME || {};
  const icon = (k) => IC[k] || SF.icon(k) || "";
  const trim = (t) => (t.includes(".") ? t.replace(/0+$/, "").replace(/\.$/, "") : t);
  const big = (n) => (n == null ? "n/a" : n >= 1e6 ? `${trim((n / 1e6).toFixed(1))} million` : SF.fmtInt(n));
  const short = (n) => (n == null ? "n/a" : n >= 1e6 ? `${trim((n / 1e6).toFixed(1))}M` : n >= 1e4 ? `${Math.round(n / 1e3)}K` : n >= 1e3 ? `${trim((n / 1e3).toFixed(1))}K` : SF.fmtInt(n));
  const pct = (s) => (s == null || isNaN(s) ? "n/a" : `${Math.round(s * 100)}%`);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const when = (d) => {
    const m = String(d || "").match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
    if (!m) return String(d || "");
    return m[3] ? `${Number(m[3])} ${MONTHS[m[2] - 1]} ${m[1]}` : m[2] ? `${MONTHS[m[2] - 1]} ${m[1]}` : m[1];
  };
  const month = (ym) => { const m = String(ym || "").match(/^(\d{4})-(\d{2})/); return m ? `${MONTHS[m[2] - 1].slice(0, 3)} ${m[1]}` : ""; };
  const ADSWG = ["Aj Jazirah", "Blue Nile", "Gedaref", "Kassala", "White Nile"];
  const IPC = { 1: { c: "#cdfacd", t: "#1c2230", l: "1 Minimal" }, 2: { c: "#fae61e", t: "#1c2230", l: "2 Stressed" }, 3: { c: "#e67800", t: "#fff", l: "3 Crisis" }, 4: { c: "#c80000", t: "#fff", l: "4 Emergency" }, 5: { c: "#640000", t: "#fff", l: "5 Famine" } };
  const PAL = {
    up: ["#dbe8f6", "#a6c6ec", "#6c9fdb", "#3a73bd", "#1b4a8a"],
    low: ["#9c3d14", "#d4612a", "#ef8a4c", "#f8b98a", "#fde3cf"],
  };
  const OCHA_COLOR = "#e0731f";

  /* ---------- sources, numbered in the order they appear ---------- */
  let D, GEO, LG, HUB = [], SHF = { projects: [] }, WATER, PTS;
  const SRC = [];
  const SRCK = {};
  const addSrc = (k, s) => { if (!SRCK[k]) { SRC.push({ k, ...s }); SRCK[k] = SRC.length; } };
  const cite = (...keys) => keys.filter((k) => SRCK[k]).map((k) => `<a class="abc-cite" href="#src-${k}" title="${esc(SRC[SRCK[k] - 1].title)}">${SRCK[k]}</a>`).join("");

  function registerSources() {
    const s = D.sources;
    addSrc("parker", { title: "Humanitarian response to urban crises: a review of area-based approaches (Working Paper)", org: "Elizabeth Parker and Victoria Maynard, International Institute for Environment and Development (IIED)", date: "2015-07", url: "https://www.iied.org/sites/default/files/pdfs/migrate/10742IIED.pdf" });
    addSrc("uswg", { title: "Area-based approaches in urban settings: compendium of case studies, May 2019 edition", org: "Urban Settlements Working Group, Global Shelter Cluster", date: "2019-05", url: "https://reliefweb.int/report/world/area-based-approaches-urban-settings-compendium-case-studies-may-2019-edition" });
    addSrc("fsc", { title: "Handbook 10.4.2: Other models of decentralised coordination, area-based coordination", org: "Global Food Security Cluster", date: "2023-12", url: "https://handbook.fscluster.org/docs/1042-other-models-of-decentralised-coordination-area-based-coordination" });
    addSrc("alnap", { title: "Area-based programming and coordination approaches in urban response (Urban Webinar 11, transcript)", org: "ALNAP", date: "2015-07-27", url: "https://library.alnap.org/system/files/content/resource/files/main/area-based-programming-and-coordination-approaches-in-urban-response-transcript.pdf" });
    addSrc("reset", { title: "The Humanitarian Reset: Cluster Simplification, final proposal to the IASC Principals", org: "IASC Operational Policy and Advocacy Group", date: "2025-06-09", url: "https://www.nutritioncluster.net/sites/nutritioncluster.com/files/2025-07/Humanitarian%20Reset%20-%20Cluster%20Simplification%20final%20proposal.pdf" });
    addSrc("pulse", { title: "The Pulse of Humanitarian Coordination 2024: Overview of IASC Structures at the Country Level", org: "OCHA", date: "2025-12", url: "https://reliefweb.int/report/world/pulse-humanitarian-coordination-2024-overview-iasc-structures-country-level-december-2025" });
    addSrc("err", { title: "Key considerations: Mutual aid lessons and experiences from Emergency Response Rooms in Sudan", org: "Social Science in Humanitarian Action Platform (SSHAP)", date: "2024", url: "https://reliefweb.int/report/sudan/key-considerations-mutual-aid-lessons-and-experiences-emergency-response-rooms-sudan" });
    addSrc("iasc", { title: SF.IASC_SOURCE.label, org: "Inter-Agency Standing Committee", date: "2010", url: SF.IASC_SOURCE.url });
    addSrc("unhabitat", { title: "UN-Habitat Global Institutional Plan on Solutions to Internal Displacement", org: "UN-Habitat", date: "2023-06", url: "https://un.org/sites/un2.un.org/files/230601_unh_institutional_plan_solutions_internal_displacement.pdf" });
    addSrc("k4d", { title: "Area-based Programming in Fragile- and Conflict-affected Contexts (K4D Helpdesk Report 1066)", org: "Huma Haider, Institute of Development Studies", date: "2021-11-19", url: "https://k4d.ids.ac.uk/resource/area-based-programming-in-fragile-and-conflict-affected-contexts/" });
    addSrc("needs", { title: `${s.needs.title}: ${D.needsYear} locality figures and ${Object.keys(D.national).slice(-1)[0]} national figures`, org: "OCHA, Humanitarian Needs and Response Plans, on HDX", date: s.needs.updated, url: s.needs.url });
    addSrc("hnrp", { title: "Sudan Humanitarian Needs and Response Plan 2026", org: "OCHA", date: "2026-02-26", url: "https://humanitarianaction.info/plan/1514/document/sudan-humanitarian-needs-and-response-plan-2026" });
    addSrc("dtm", { title: `${s.dtm.title}: Displacement and Return Snapshot (IDPs ${when(D.dtmDates.idps)}, returnees ${when(D.dtmDates.ret)})`, org: "IOM Displacement Tracking Matrix, on HDX", date: s.dtm.updated, url: s.dtm.url });
    addSrc("pop", { title: `${s.population.title} (${s.population.file})`, org: "UNFPA, common operational dataset on HDX", date: s.population.updated || "2025-12", url: s.population.url });
    addSrc("w3", { title: `${s.w3.title}: 2026 consolidated 3W, ${month(D.w3Months[0])} to ${month(D.w3Months[D.w3Months.length - 1])}`, org: "OCHA Sudan, on HDX", date: s.w3.updated, url: s.w3.url });
    addSrc("heigit", { title: `${s.heigit.title}: facilities and access to services by locality`, org: "HeiGIT (Heidelberg Institute for Geoinformation Technology), on HDX", date: s.heigit.updated, url: s.heigit.url });
    addSrc("osm", { title: "Health Facilities of Sudan and Education Facilities of Sudan (OpenStreetMap exports)", org: "Humanitarian OpenStreetMap Team and OpenStreetMap contributors (ODbL), on HDX", date: s.osmHealth.updated, url: s.osmHealth.url, url2: s.osmEdu.url });
    addSrc("ipc", { title: s.ipc.title, org: "FEWS NET, on HDX", date: s.ipc.updated, url: s.ipc.url });
    addSrc("water", { title: `${WATER.title} (digitised from the Arabic table)`, org: "Aj Jazirah State table shared with the Durable Solutions Unit", date: "2026-08", url: "data/abc/aj-jazirah-water-sources-2026-08.json" });
    addSrc("hub", { title: "Solutions Footprint: projects reported to the Durable Solutions Working Group", org: "Durable Solutions Working Group, Sudan", dl: "last updated", date: HUB.lastUpdated, url: "./" });
    addSrc("shf", { title: "Sudan Humanitarian Fund allocations 2025 and 2026, published to IATI", org: "OCHA, Country-Based Pooled Funds", dl: "retrieved", date: SHF.updated, url: "https://iatiregistry.org/dataset/unocha-cbpf-sudan-allocation-2025" });
    addSrc("bounds", { title: "Sudan subnational administrative boundaries (states and localities)", org: "OCHA, via geoBoundaries (CC BY 3.0 IGO)", date: "", url: SF.config.hdxAdminUrl });
  }

  /* ---------- areas: localities and states ---------- */
  const LOC = new Map(); // "state|name" -> area
  const STATE = new Map(); // name -> state area
  const key = (s, n) => `${s}|${n}`;
  const locByName = new Map();
  function buildAreas() {
    const shapes = new Map(LG.localities.map((l) => [key(l.state, l.name), l]));
    D.areas.forEach((a) => {
      const g = shapes.get(key(a.s, a.n));
      const area = { ...a, kind: "loc", id: key(a.s, a.n), g, hub: [], hubState: [], shf: [], shfState: [] };
      if (a.pin != null && a.hnoPop) area.pinShare = a.pin / a.hnoPop;
      LOC.set(area.id, area);
      (locByName.get(a.n) || locByName.set(a.n, []).get(a.n)).push(area);
    });
    GEO.states.forEach((st) => {
      const locs = [...LOC.values()].filter((a) => a.s === st.name);
      const sum = (f) => (locs.some((a) => a[f] != null) ? locs.reduce((t, a) => t + (a[f] || 0), 0) : null);
      const wavg = (f) => { const ok = locs.filter((a) => a[f] != null && a.hPop); const w = ok.reduce((t, a) => t + a.hPop, 0); return w ? ok.reduce((t, a) => t + a[f] * a.hPop, 0) / w : null; };
      const ipcPop = {};
      locs.forEach((a) => { if (a.ipc) ipcPop[a.ipc] = (ipcPop[a.ipc] || 0) + (a.pop || 0); });
      const ipc = Object.keys(ipcPop).length ? Number(Object.entries(ipcPop).sort((x, y) => y[1] - x[1])[0][0]) : null;
      const pinBy = {};
      locs.forEach((a) => Object.entries(a.pinBy || {}).forEach(([c, v]) => { pinBy[c] = (pinBy[c] || 0) + v; }));
      const osm = {};
      locs.forEach((a) => Object.entries(a.osm || {}).forEach(([c, v]) => { osm[c] = (osm[c] || 0) + v; }));
      const water = locs.some((a) => a.water) ? locs.reduce((t, a) => { Object.entries(a.water || {}).forEach(([k, v]) => { t[k] = (t[k] || 0) + v; }); return t; }, {}) : null;
      const area = {
        kind: "state", id: st.name, n: st.name, s: st.name, g: st, locs,
        pop: sum("pop"), popF: sum("popF"), hnoPop: sum("hnoPop"), pin: sum("pin"), idps: sum("idps"), ret: sum("ret"),
        hosp: sum("hosp"), phc: sum("phc"), edu: sum("edu"), hPop: sum("hPop"),
        accHosp: wavg("accHosp"), accPhc: wavg("accPhc"), accEdu: wavg("accEdu"), ipc, pinBy, osm, water,
        w3: (D.states[st.name] || {}).w3 || null, w3c: (D.states[st.name] || {}).w3c || null,
        hub: [], hubState: [], shf: [], shfState: [],
      };
      if (area.pin != null && area.hnoPop) area.pinShare = area.pin / area.hnoPop;
      STATE.set(st.name, area);
    });
  }
  const findLoc = (state, name) => {
    const c = locByName.get(name) || [];
    return c.length === 1 ? c[0] : c.find((a) => a.s === state) || null;
  };

  // Place projects in areas. A project naming localities counts there; one naming only states counts state-wide.
  function placeProjects() {
    const place = (p, field) => {
      const locs = [];
      (p.localities || []).forEach((l) => { const a = typeof l === "string" ? findLoc((p.states || [])[0], l) : findLoc(l.s, l.n); if (a) locs.push(a); });
      p._locs = [...new Set(locs)];
      p._states = [...new Set([...(p.states || []), ...p._locs.map((a) => a.s)])].filter((s) => STATE.has(s));
      p._locs.forEach((a) => a[field].push(p));
      p._states.forEach((s) => {
        const st = STATE.get(s);
        st[field].push(p);
        if (!p._locs.some((a) => a.s === s)) st[field + "State"].push(p);
      });
    };
    HUB.projects.forEach((p) => place(p, "hub"));
    SHF.projects.forEach((p) => place(p, "shf"));
  }

  /* ---------- layers ---------- */
  const LAYERS = [
    { k: "pop", label: "Population", src: "pop", get: (a) => a.pop, fmt: big, pal: "up", legend: "People" },
    { k: "pin", label: () => `People in need (${D.needsYear})`, src: "needs", get: (a) => a.pin, fmt: big, pal: "up", legend: "People in need" },
    { k: "pinShare", label: "Share of people in need", src: "needs", get: (a) => a.pinShare, fmt: pct, pal: "up", legend: "Share in need", bins: [0.4, 0.5, 0.6, 0.7] },
    { k: "idps", label: "IDPs", src: "dtm", get: (a) => a.idps, fmt: big, pal: "up", legend: "IDPs" },
    { k: "ret", label: "Returnees", src: "dtm", get: (a) => a.ret, fmt: big, pal: "up", legend: "Returnees" },
    { k: "w3", label: "Organisations present (OCHA 3W)", src: "w3", get: (a) => a.w3, fmt: SF.fmtInt, pal: "up", legend: "Organisations" },
    { k: "accHosp", label: "Within 1 hour of a hospital", src: "heigit", get: (a) => a.accHosp, fmt: pct, pal: "low", legend: "Share of people", bins: [0.2, 0.4, 0.6, 0.8], note: "Darker: fewer people can reach a hospital within an hour." },
    { k: "accPhc", label: "Within 1 hour of primary health care", src: "heigit", get: (a) => a.accPhc, fmt: pct, pal: "low", legend: "Share of people", bins: [0.2, 0.4, 0.6, 0.8], note: "Darker: fewer people can reach primary health care within an hour." },
    { k: "accEdu", label: "Within 5 km of a school", src: "heigit", get: (a) => a.accEdu, fmt: pct, pal: "low", legend: "Share of people", bins: [0.2, 0.4, 0.6, 0.8], note: "Darker: fewer people live within 5 km of a school." },
    { k: "ipc", label: "Food insecurity, Oct 2026 to Jan 2027", src: "ipc", get: (a) => a.ipc, fmt: (v) => (IPC[v] ? `Phase ${IPC[v].l}` : "n/a"), ipc: true, legend: "IPC phase, most of the area" },
    { k: "water", label: "Water sources (Aj Jazirah only)", src: "water", get: (a) => (a.water ? a.water.total : null), fmt: SF.fmtInt, pal: "up", legend: "Water sources", only: "Aj Jazirah" },
  ];
  const OVERLAYS = [
    { k: "hub", label: "Solutions Footprint projects", sub: "Reported to the DSWG", src: "hub", color: "var(--brand)", on: true },
    { k: "shf", label: "Sudan Humanitarian Fund projects", sub: "OCHA, 2025 and 2026", src: "shf", color: OCHA_COLOR, on: true },
    { k: "pts", label: "Health facilities and schools", sub: "OpenStreetMap, shown when you zoom into a state", src: "osm", color: "#5b6474", on: false },
  ];
  const labelOf = (L) => (typeof L.label === "function" ? L.label() : L.label);

  /* ---------- state of the page ---------- */
  const S = { layer: "pin", level: "states", focus: null, sel: null, ov: Object.fromEntries(OVERLAYS.map((o) => [o.k, o.on])) };

  /* ---------- top ---------- */
  function drawTop() {
    const n26 = D.national[Object.keys(D.national).slice(-1)[0]];
    const yr = Object.keys(D.national).slice(-1)[0];
    const all = [...LOC.values()];
    const idps = all.reduce((t, a) => t + (a.idps || 0), 0), ret = all.reduce((t, a) => t + (a.ret || 0), 0);
    $("abc-sub").innerHTML = `An area-based approach plans the response around one place and everyone who lives there${cite("parker", "uswg")}. Area-based coordination brings everyone working in that place around the same picture and one plan${cite("fsc")}. This page puts that picture on one map of Sudan, so you can find where to invest, see what you can build on, and plan a project that fills a gap.`;
    const tiles = [
      { ic: "people-in-need", v: big(n26.pin), l: `people in need in ${yr}`, n: `of ${big(n26.population)} people`, src: ["needs", "hnrp"] },
      { ic: "internally-displaced", v: big(idps), l: "internally displaced people", n: `as of ${when(D.dtmDates.idps)}`, src: ["dtm"] },
      { ic: "return", v: big(ret), l: "people who have returned", n: `as of ${when(D.dtmDates.ret)}`, src: ["dtm"] },
      { ic: "location", v: SF.fmtInt(all.filter((a) => a.pop).length), l: "localities on one map", n: "people, needs, services, partners", src: ["pop", "bounds"] },
    ];
    $("abc-big").innerHTML = tiles.map((t) => `<div class="abc-big-c"><span class="abc-ico">${icon(t.ic)}</span><div><div class="abc-big-v">${esc(t.v)}${cite(...t.src)}</div><div class="abc-big-l">${esc(t.l)}</div><div class="abc-big-n">${esc(t.n)}</div></div></div>`).join("");
  }

  function drawWhat() {
    $("abc-what-lead").innerHTML = `Two sides of one way of working. The approach shapes what is done in an area; coordination makes sure everyone working there does it together. Programmes that work across sectors in one place do not fit neatly into sector clusters, which is why practitioners called for coordination by area alongside the clusters${cite("alnap")}.`;
    // the comparison: one row per question, approach on the left, coordination on the right
    const list = (items) => `<ul class="abc-vs-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
    const go = (href, label) => `<a class="abc-vs-go" href="${href}">${esc(label)}</a>`;
    const rows = [
      ["Starting point",
        `The area, not a sector or a group of people, is the entry point. Assistance considers everyone affected who lives there${cite("uswg")}.`,
        `The area, not the sector, is where actors meet. The response is organised by place, below the national clusters${cite("fsc")}.`],
      ["Key features",
        `${list(["One defined area", "Several sectors at once", "Residents and local stakeholders take part", "IDPs, returnees and host communities together"])}All three of area, sectors and participation need to be present${cite("parker")}.`,
        `${list(["A shared picture of needs, services and gaps", "One area plan with joint priorities", "Co-led with local actors where possible", "Linked to the clusters and national coordination"])}Drawn from the cluster handbook and the Humanitarian Reset proposal${cite("fsc", "reset")}.`],
      ["The question it answers",
        "What should we do here, and with whom, to meet several needs at once?",
        "Who is already doing what here, and how do we fit together?"],
      ["What it produces",
        `Integrated projects that build on the services, markets and local structures already there${cite("fsc")}.`,
        `One area plan and shared data, reviewed together, with the local authorities in the lead where feasible${cite("fsc", "reset")}.`],
      ["On this page",
        `${go("#invest", "Where to invest first")} ${go("#plan", "Plan your project")}`,
        `${go("#explore", "Explore the areas")} with partners present and projects on the map`],
    ];
    $("abc-vs").innerHTML = `
      <table class="abc-vs-table">
        <caption class="sr-only">Area-based approach and area-based coordination compared</caption>
        <thead><tr>
          <td></td>
          <th scope="col"><span class="abc-vs-tag">ABA</span><span class="abc-vs-kick">Area-based approach</span><span class="abc-vs-h">How we work in a place</span></th>
          <th scope="col"><span class="abc-vs-tag c">ABC</span><span class="abc-vs-kick">Area-based coordination</span><span class="abc-vs-h">How we work together in a place</span></th>
        </tr></thead>
        <tbody>${rows.map(([k, a, c]) => `<tr><th scope="row">${esc(k)}</th><td data-k="Area-based approach (ABA)">${a}</td><td data-k="Area-based coordination (ABC)">${c}</td></tr>`).join("")}</tbody>
      </table>`;
    const cards = [
      { ic: "meeting", h: "Why it matters now", t: `Under the Humanitarian Reset, the June 2025 proposal to the IASC Principals on simplifying clusters calls for scaling up area-based models at local level (admin 2 to 4, which in Sudan means localities and below), alongside the clusters rather than instead of them, with integrated planning by area, local actors co-leading, and community action plans setting priorities${cite("reset")}. In 2024, area-based coordination was reported in 52 per cent of coordinated operations, across 216 locations${cite("pulse")}.` },
      { ic: "partnership", h: "For durable solutions in Sudan", t: `Durable solutions are reached place by place: safety, services, livelihoods, housing and documents where people live${cite("iasc")}. Local authorities are at the front line of integrating IDPs, and area-based approaches are a way to scale up integrated solutions in towns and cities${cite("unhabitat")}. Locally led groups such as the Emergency Response Rooms already coordinate in their neighbourhoods, and international actors are encouraged to work through these local mechanisms${cite("err")}.` },
      { ic: "chart", h: "What the evidence says", t: `Area-based programming suits places where needs are complex and linked across sectors, and evaluations suggest it can work at sub-national level in conflict settings. The evidence is still thinner than for sector programmes${cite("k4d")}, so joint monitoring of results by area matters as much as the plan itself.` },
    ];
    $("abc-why").innerHTML = cards.map((c) => `<div class="card abc-why-c"><span class="abc-ico sm">${icon(c.ic)}</span><h3>${esc(c.h)}</h3><p>${c.t}</p></div>`).join("");
    const steps = [
      ["Define the area", "Usually a locality, or a town or group of villages that people see as one place.", null],
      ["Know the people", "Population, people in need, IDPs and returnees, with women, children, older persons and persons with disabilities in view.", ["#explore", "Map layers"]],
      ["Map the services", "Health facilities, schools and water sources, and how many people can reach them.", ["#explore", "Map layers"]],
      ["See who is there", "Humanitarian, development and local actors, and the projects already running.", ["#explore", "Partners and projects"]],
      ["Find the gaps", "Places with high need, poor access to services and few partners.", ["#invest", "Where to invest first"]],
      ["Plan and act together", "One area plan with the local authorities and communities, shared targets and regular joint reviews.", ["#plan", "Plan your project"]],
    ];
    $("abc-steps").innerHTML = steps.map(([h, t, l], i) => `<li><span class="abc-n">${i + 1}</span><b>${esc(h)}</b><span>${esc(t)}</span>${l ? `<a class="abc-step-go" href="${l[0]}">${esc(l[1])}</a>` : ""}</li>`).join("")
      + `<li class="abc-steps-src">Drawn from${cite("parker", "uswg", "fsc", "reset")}</li>`;
  }

  /* ---------- map ---------- */
  const svgNS = "http://www.w3.org/2000/svg";
  const HOME = [40, 14, 780, 680];
  let VB = HOME.slice();
  function drawMapBase() {
    const svg = $("abc-map");
    svg.setAttribute("viewBox", VB.join(" "));
    svg.innerHTML = `
      <defs><pattern id="abc-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--hatch-b)"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--hatch-a)" stroke-width="3"/></pattern></defs>
      <rect class="water" x="-2000" y="-2000" width="5000" height="5000"/>
      <g>${GEO.land.map((l) => `<path class="land" d="${l.path}"/>`).join("")}</g>
      <g>${GEO.labels.map((l) => `<text class="country-lbl" x="${l.x}" y="${l.y}" text-anchor="${l.anchor}">${esc(l.name)}</text>`).join("")}</g>
      <g id="abc-g-states">${GEO.states.map((s) => `<path class="abc-st" data-id="${esc(s.name)}" d="${s.path}" tabindex="0" role="button" aria-label="${esc(s.name)}"/>`).join("")}</g>
      ${GEO.abyei ? `<path class="abyei" d="${GEO.abyei.path}"/>` : ""}
      <g id="abc-g-locs">${LG.localities.map((l) => `<path class="abc-lc" data-id="${esc(key(l.state, l.name))}" d="${l.path}"/>`).join("")}</g>
      <path class="abc-mesh" d="${LG.mesh}"/>
      <g class="abc-stb">${GEO.states.map((s) => `<path d="${s.path}"/>`).join("")}</g>
      <path class="sudan-outline" d="${GEO.outline}"/>
      <path class="border-undetermined" d="${GEO.undeterminedBoundary}"/>
      <g id="abc-g-pts"></g>
      <path class="hover-outline" id="abc-hover" d=""/>
      <path class="sel-outline" id="abc-sel" d=""/>
      <g id="abc-g-lbl"></g>
      <g id="abc-g-bub"></g>`;
    svg.addEventListener("click", onMapClick);
    svg.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset.id) { e.preventDefault(); onMapClick(e); } });
    svg.addEventListener("mousemove", onMapMove);
    svg.addEventListener("mouseleave", () => { $("abc-tip").hidden = true; $("abc-hover").setAttribute("d", ""); });
  }

  // which unit colours the map now
  const unitLocs = () => S.focus || S.level === "localities";
  const layer = () => LAYERS.find((l) => l.k === S.layer);
  function breaks(L, vals) {
    if (L.bins) return L.bins;
    const v = vals.filter((x) => x != null && !isNaN(x) && x > 0).sort((a, b) => a - b);
    if (!v.length) return [];
    const q = (p) => v[Math.min(v.length - 1, Math.floor(p * v.length))];
    const nice = (x) => { if (x < 10) return Math.round(x); const m = 10 ** Math.floor(Math.log10(x)); return Math.round(x / m * 2) / 2 * m; };
    return [...new Set([0.2, 0.4, 0.6, 0.8].map((p) => nice(q(p))))].filter((x) => x > 0);
  }
  function colourFor(L, br, v) {
    if (v == null || isNaN(v)) return "url(#abc-hatch)";
    if (L.ipc) return (IPC[v] || {}).c || "url(#abc-hatch)";
    const pal = PAL[L.pal];
    let i = 0;
    while (i < br.length && v >= br[i]) i++;
    if (L.k === "w3" || L.k === "idps" || L.k === "ret" || L.k === "water") { if (v === 0) return "var(--map-none)"; }
    return pal[Math.min(i, pal.length - 1)];
  }
  let BR = [];
  function paint() {
    const L = layer();
    const locMode = unitLocs();
    const pool = locMode ? [...LOC.values()].filter((a) => !S.focus || a.s === S.focus) : [...STATE.values()];
    const scope = L.only ? pool.filter((a) => a.s === L.only) : pool;
    BR = breaks(L, (locMode && S.focus ? [...LOC.values()] : pool).filter((a) => !L.only || a.s === L.only).map(L.get));
    document.querySelectorAll("#abc-g-states .abc-st").forEach((el) => {
      const a = STATE.get(el.dataset.id);
      const inScope = !L.only || a.s === L.only;
      el.style.fill = locMode ? "var(--map-land)" : inScope ? colourFor(L, BR, L.get(a)) : "var(--map-none)";
      el.classList.toggle("is-dim", !!S.focus && a.id !== S.focus);
      el.style.pointerEvents = locMode && (!S.focus || a.id === S.focus) ? "none" : "";
    });
    document.querySelectorAll("#abc-g-locs .abc-lc").forEach((el) => {
      const a = LOC.get(el.dataset.id);
      const show = locMode && a && (!S.focus || a.s === S.focus);
      el.style.display = show ? "" : "none";
      if (show) el.style.fill = !L.only || a.s === L.only ? colourFor(L, BR, L.get(a)) : "var(--map-none)";
    });
    document.querySelector("#abc-map .abc-mesh").style.display = locMode ? "" : "none";
    drawLegend(L, scope);
    drawLabels();
    drawBubbles();
    drawPoints();
    drawSelection();
    const sel = S.sel ? (S.sel.includes("|") ? LOC.get(S.sel) : STATE.get(S.sel)) : null;
    $("abc-map-kicker").textContent = S.focus ? `${S.focus} state` : "Sudan";
    $("abc-map-title").textContent = `${labelOf(L)}${locMode ? ", by locality" : ", by state"}`;
    $("abc-back").hidden = !S.focus;
    drawPanel(sel || (S.focus ? STATE.get(S.focus) : null));
  }

  function drawLegend(L, scope) {
    let bins;
    if (L.ipc) bins = [1, 2, 3, 4, 5].map((p) => `<span><i style="background:${IPC[p].c}"></i>${IPC[p].l}</span>`).join("");
    else {
      const pal = PAL[L.pal], f = L.fmt;
      const edges = [null, ...BR, null];
      bins = pal.slice(0, BR.length + 1).map((c, i) => {
        const lo = edges[i], hi = edges[i + 1];
        const t = lo == null ? `under ${f(hi)}` : hi == null ? `${f(lo)} or more` : `${f(lo)} to ${f(hi)}`;
        return `<span><i style="background:${c}"></i>${esc(t)}</span>`;
      }).join("");
    }
    const ovs = OVERLAYS.filter((o) => S.ov[o.k] && o.k !== "pts").map((o) => `<span><i class="abc-dot" style="background:${o.color}"></i>${esc(o.label)}</span>`).join("");
    const pts = S.ov.pts && S.focus ? `<span><i class="abc-pt H"></i>Hospital</span><span><i class="abc-pt C"></i>Clinic</span><span><i class="abc-pt S"></i>School</span>` : "";
    $("abc-legend").innerHTML = `
      <div class="abc-leg-row"><b>${esc(L.legend)}</b>${cite(L.src)}<span class="abc-leg-bins">${bins}<span><i style="background:url(#x);background-image:repeating-linear-gradient(45deg,var(--hatch-a) 0 3px,var(--hatch-b) 3px 6px)"></i>No data</span></span></div>
      ${L.note ? `<div class="abc-leg-note">${esc(L.note)}</div>` : ""}
      ${L.only ? `<div class="abc-leg-note">This layer covers ${esc(L.only)} only, from the state table of August 2026. Other states are shown in grey.</div>` : ""}
      ${ovs || pts ? `<div class="abc-leg-row"><b>Projects and services</b><span class="abc-leg-bins">${ovs}${pts}</span></div><div class="abc-leg-note">${S.ov.hub || S.ov.shf ? "Circles show the number of projects. Projects that name only a state are counted on the state, not on a locality." : ""}</div>` : ""}`;
  }

  const kScale = () => VB[2] / HOME[2];
  function drawLabels() {
    const g = $("abc-g-lbl");
    const k = kScale();
    if (S.focus) {
      const locs = LG.localities.filter((l) => l.state === S.focus);
      g.innerHTML = locs.map((l) => `<text class="lbl abc-lbl-lc" x="${l.x}" y="${l.y + 9 * k}" text-anchor="middle" style="font-size:${10.5 * k}px;stroke-width:${3 * k}px">${esc(l.name)}</text>`).join("");
    } else {
      g.innerHTML = unitLocs() ? "" : GEO.states.map((s) => `<text class="lbl" x="${s.x}" y="${s.y + 10}" text-anchor="middle" style="font-size:11px">${esc(s.name)}</text>`).join("");
    }
  }

  function drawBubbles() {
    const g = $("abc-g-bub");
    const k = kScale();
    const items = [];
    const unitList = S.focus ? [...LOC.values()].filter((a) => a.s === S.focus) : unitLocs() ? [...LOC.values()] : [...STATE.values()];
    const pos = (a) => (a.kind === "state" ? [a.g.x, a.g.y] : a.g ? [a.g.x, a.g.y] : null);
    const maxN = Math.max(1, ...unitList.map((a) => Math.max(S.ov.hub ? a.hub.length : 0, S.ov.shf ? a.shf.length : 0)));
    const rOf = (n) => (S.focus ? 7 : unitLocs() ? 4.2 : 7) * k + Math.sqrt(n / maxN) * (S.focus ? 8 : unitLocs() ? 5 : 8) * k;
    unitList.forEach((a) => {
      const p = pos(a);
      if (!p) return;
      const sets = [];
      if (S.ov.hub && a.hub.length) sets.push(["hub", a.hub.length, "var(--brand)"]);
      if (S.ov.shf && a.shf.length) sets.push(["shf", a.shf.length, OCHA_COLOR]);
      sets.forEach(([t, n, c], i) => {
        const r = rOf(n);
        const dx = sets.length > 1 ? (i ? 1 : -1) * (r * 0.95) : 0;
        const showNum = !(unitLocs() && !S.focus);
        items.push(`<g class="abc-bub" data-id="${esc(a.id)}" data-t="${t}" transform="translate(${(p[0] + dx).toFixed(1)},${(p[1] - (unitLocs() && !S.focus ? 0 : r + 2 * k)).toFixed(1)})">
          <circle r="${r.toFixed(2)}" style="fill:${c};stroke-width:${1.4 * k}px"/>${showNum ? `<text dy="0.35em" style="font-size:${(S.focus ? 10.5 : 10.5) * k}px">${n}</text>` : ""}</g>`);
      });
    });
    g.innerHTML = items.join("");
  }

  function drawPoints() {
    const g = $("abc-g-pts");
    if (!S.ov.pts || !S.focus || !PTS) { g.innerHTML = ""; return; }
    const si = (PTS.states || []).indexOf(S.focus);
    const k = kScale();
    const r = { H: 2.6, C: 2, S: 1.3, U: 1.6 };
    g.innerHTML = PTS.points.filter((pt) => pt[3] === si)
      .sort((a, b) => (a[2] === "H") - (b[2] === "H"))
      .map(([x, y, c]) => `<circle class="abc-pt ${c}" cx="${x}" cy="${y}" r="${(r[c] * k).toFixed(2)}" style="stroke-width:${0.5 * k}px"/>`).join("");
  }

  function drawSelection() {
    const a = S.sel ? (S.sel.includes("|") ? LOC.get(S.sel) : STATE.get(S.sel)) : null;
    $("abc-sel").setAttribute("d", a && a.g ? a.g.path : "");
  }

  function zoomTo(target) {
    const svg = $("abc-map");
    const from = VB.slice();
    const to = target ? (() => {
      const [x0, y0, x1, y1] = target.bbox;
      let w = (x1 - x0) * 1.25, h = (y1 - y0) * 1.25;
      const r = HOME[2] / HOME[3];
      if (w / h > r) h = w / r; else w = h * r;
      w = Math.max(w, 150); h = w / r;
      return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h];
    })() : HOME.slice();
    const t0 = performance.now(), dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380;
    const step = (t) => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      VB = from.map((v, i) => v + (to[i] - v) * e);
      svg.setAttribute("viewBox", VB.map((v) => v.toFixed(1)).join(" "));
      if (p < 1) requestAnimationFrame(step); else { VB = to; paint(); }
    };
    requestAnimationFrame(step);
  }

  function focusState(name) {
    S.focus = name;
    S.sel = name;
    zoomTo(name ? STATE.get(name).g : null);
    paint();
  }
  function selectArea(id, opts = {}) {
    if (id.includes("|")) {
      const a = LOC.get(id);
      if (!a) return;
      if (S.focus !== a.s) { S.focus = a.s; zoomTo(STATE.get(a.s).g); }
      S.sel = id;
    } else {
      if (S.focus !== id) { focusState(id); return; }
      S.sel = id;
    }
    paint();
    if (opts.scroll) document.getElementById("explore").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function onMapClick(e) {
    const b = e.target.closest(".abc-bub");
    const el = b || e.target.closest("[data-id]");
    if (!el) return;
    const id = el.dataset.id;
    if (!id.includes("|") && S.level === "states" && !S.focus) { focusState(id); return; }
    selectArea(id);
  }
  function onMapMove(e) {
    const tip = $("abc-tip");
    const el = e.target.closest("[data-id]");
    if (!el) { tip.hidden = true; $("abc-hover").setAttribute("d", ""); return; }
    const id = el.dataset.id;
    const a = id.includes("|") ? LOC.get(id) : STATE.get(id);
    if (!a) return;
    const L = layer();
    const v = L.get(a);
    const t = el.dataset.t;
    let body;
    if (t === "hub") body = `${a.hub.length} Solutions Footprint project${a.hub.length === 1 ? "" : "s"}`;
    else if (t === "shf") body = `${a.shf.length} Sudan Humanitarian Fund project${a.shf.length === 1 ? "" : "s"}`;
    else body = L.only && a.s !== L.only ? "No data for this state" : `${esc(labelOf(L))}: <b>${v == null ? "no data" : esc(L.fmt(v))}</b>`;
    tip.innerHTML = `<strong>${esc(a.n)}${a.kind === "loc" ? `<span class="abc-tip-s">, ${esc(a.s)}</span>` : ""}</strong>${body}`;
    const wrap = $("abc-map-wrap").getBoundingClientRect();
    tip.style.left = `${e.clientX - wrap.left}px`;
    tip.style.top = `${e.clientY - wrap.top}px`;
    tip.hidden = false;
    $("abc-hover").setAttribute("d", a.g ? a.g.path : "");
  }

  /* ---------- side controls ---------- */
  function drawControls() {
    $("abc-layer-list").innerHTML = LAYERS.map((L) => `
      <label class="abc-opt"><input type="radio" name="abc-layer" value="${L.k}" ${L.k === S.layer ? "checked" : ""}><span>${esc(labelOf(L))}${cite(L.src)}</span></label>`).join("");
    $("abc-overlay-list").innerHTML = OVERLAYS.map((o) => `
      <label class="abc-opt"><input type="checkbox" value="${o.k}" ${S.ov[o.k] ? "checked" : ""}><span><i class="abc-dot" style="background:${o.color}"></i>${esc(o.label)}${cite(o.src)}<small>${esc(o.sub)}</small></span></label>`).join("");
    $("abc-layer-list").addEventListener("change", (e) => { S.layer = e.target.value; paint(); });
    $("abc-overlay-list").addEventListener("change", (e) => { S.ov[e.target.value] = e.target.checked; paint(); });
    $("abc-level").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      S.level = b.dataset.v;
      $("abc-level").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (S.focus) { S.focus = null; S.sel = null; zoomTo(null); }
      paint();
    });
    $("abc-back").addEventListener("click", () => { S.focus = null; S.sel = null; zoomTo(null); paint(); });
  }

  /* ---------- area panel ---------- */
  const span3w = () => { const a = month(D.w3Months[0]), b = month(D.w3Months[D.w3Months.length - 1]); return a.slice(-4) === b.slice(-4) ? `${a.slice(0, 3)} to ${b}` : `${a} to ${b}`; };
  const bars = (rows, max, color) => rows.map(([l, v, t]) => `<div class="abc-bar-row"><span>${esc(l)}</span><span class="bar"><i style="width:${max ? Math.max(2, (v / max) * 100) : 0}%;background:${color}"></i></span><span class="n">${esc(t)}</span></div>`).join("");
  function projList(list, kind, limit = 4) {
    if (!list.length) return `<p class="abc-small abc-none">${kind === "hub" ? "None reported yet." : "None found for this area."}</p>`;
    const sorted = list.slice().sort((a, b) => (b.start || "").localeCompare(a.start || ""));
    const card = (p) => kind === "hub"
      ? `<button type="button" class="proj-card abc-pc" data-hub="${esc(p.id)}"><span class="t">${esc(p.name)}</span><span class="o">${esc(p.lead)}</span><span class="d">${SF.render.statusChip(p)}${p.criteria.length ? SF.render.critIcons(p) : ""}</span></button>`
      : `<div class="proj-card abc-pc is-shf"><span class="t">${esc(p.name)}</span><span class="o">${esc(p.orgType || "Partner")}${p.sectors.length ? ` · ${esc(p.sectors.join(", "))}` : ""}</span><span class="d">${p.budget ? `<b>${SF.fmtMoney(p.budget)}</b>` : ""}${p.start ? ` ${esc(month(p.start))} to ${esc(month(p.end))}` : ""}</span></div>`;
    const head = sorted.slice(0, limit).map(card).join("");
    const rest = sorted.slice(limit);
    return head + (rest.length ? `<details class="abc-more"><summary>${rest.length} more</summary>${rest.map(card).join("")}</details>` : "");
  }
  function drawPanel(a) {
    const P = $("abc-panel");
    if (!a) {
      const n = D.national[Object.keys(D.national).slice(-1)[0]];
      P.innerHTML = `
        <div class="abc-kick">How to use the map</div>
        <h3 class="abc-pn">Select a state or a locality</h3>
        <p class="abc-small" style="font-size:14px;color:var(--ink-2)">The panel then shows its people, needs, basic services, partners and projects, with a button to plan a project there.</p>
        <div class="abc-pk">
          <div class="mini"><div class="l">People in need, ${Object.keys(D.national).slice(-1)[0]}</div><div class="v">${short(n.pin)}${cite("needs")}</div></div>
          <div class="mini"><div class="l">Projects on the hub</div><div class="v">${HUB.projects.length}${cite("hub")}</div></div>
          <div class="mini"><div class="l">SHF projects</div><div class="v">${SHF.projects.length}${cite("shf")}</div></div>
        </div>
        <div class="abc-small">Tip: pick <b>Returnees</b> in the layer list, then open Aj Jazirah to see where people are coming back and what is there to receive them.</div>`;
      return;
    }
    const isLoc = a.kind === "loc";
    const pinRows = Object.entries(a.pinBy || {}).sort((x, y) => y[1] - x[1]).map(([c, v]) => [D.clusters[c] || c, v, short(v)]);
    const pinMax = Math.max(0, ...pinRows.map((r) => r[1]));
    const w3Rows = Object.entries(a.w3c || {}).map(([c, v]) => [c, v, String(v)]);
    const w3Max = Math.max(0, ...w3Rows.map((r) => r[1]));
    const acc = [["Hospital within 1 hour", a.accHosp], ["Primary health care within 1 hour", a.accPhc], ["School within 5 km", a.accEdu]].filter((r) => r[1] != null);
    const osm = a.osm || {};
    const water = a.water;
    const wtypes = WATER.types.filter((t) => water && water[t.key]);
    P.innerHTML = `
      <div class="abc-pn-head">
        <div><div class="abc-kick">${isLoc ? `Locality · ${esc(a.s)}` : "State"}</div>
        <h3 class="abc-pn">${esc(a.n)}${isLoc && a.ar ? ` <span class="abc-ar" lang="ar" dir="rtl">${esc(a.ar)}</span>` : ""}</h3></div>
        ${isLoc ? `<button type="button" class="link-btn" data-go="${esc(a.s)}">Whole state</button>` : ""}
      </div>
      <div class="abc-pk">
        <div class="mini"><div class="l">Population</div><div class="v">${short(a.pop)}${cite("pop")}</div></div>
        <div class="mini"><div class="l">In need, ${D.needsYear}</div><div class="v">${short(a.pin)}${cite("needs")}</div>${a.pinShare != null ? `<div class="s">${pct(a.pinShare)} of people</div>` : ""}</div>
        <div class="mini"><div class="l">IDPs</div><div class="v">${short(a.idps || 0)}${cite("dtm")}</div></div>
        <div class="mini"><div class="l">Returnees</div><div class="v">${short(a.ret || 0)}${cite("dtm")}</div></div>
      </div>
      <button type="button" class="btn btn-primary abc-plan-here" data-plan="${esc(a.id)}">${SF.icons.plus || "+"} Plan a project here</button>
      ${pinRows.length ? `<div class="abc-ps">Needs by sector, ${D.needsYear}${cite("needs")}</div>${bars(pinRows, pinMax, "var(--brand)")}` : ""}
      <div class="abc-ps">Basic services${cite("heigit", "osm")}</div>
      <div class="abc-svc">
        <div><b>${a.hosp ?? "n/a"}</b><span>hospitals</span></div>
        <div><b>${a.phc ?? "n/a"}</b><span>primary health care</span></div>
        <div><b>${a.edu ?? "n/a"}</b><span>schools</span></div>
        ${osm.pharmacy ? `<div><b>${osm.pharmacy}</b><span>pharmacies</span></div>` : ""}
      </div>
      ${acc.length ? bars(acc.map(([l, v]) => [l, v, pct(v)]), 1, "#d4612a") : ""}
      <p class="abc-small">Facilities mapped in OpenStreetMap; some are missing, closed or damaged. Reach is estimated from where people live.</p>
      ${water ? `<div class="abc-ps">Water sources, August 2026${cite("water")}</div>
        <div class="abc-water"><b>${SF.fmtInt(water.total)}</b> sources: ${wtypes.map((t) => `${SF.fmtInt(water[t.key])} ${esc(t.en.toLowerCase())}`).join(", ")}</div>` : ""}
      ${a.ipc ? `<div class="abc-ps">Food insecurity, Oct 2026 to Jan 2027${cite("ipc")}</div><span class="abc-ipc" style="background:${IPC[a.ipc].c};color:${IPC[a.ipc].t}">Phase ${esc(IPC[a.ipc].l)}</span>${a.ipcMax && a.ipcMax > a.ipc ? ` <span class="abc-small">parts of the area in Phase ${esc(IPC[a.ipcMax].l)}</span>` : ""}` : ""}
      <div class="abc-ps">Who is there, ${esc(span3w())}${cite("w3")}<small>${a.w3 ? `${a.w3} organisations` : "none reported"}</small></div>
      ${w3Rows.length ? bars(w3Rows, w3Max, "#6250d6") : ""}
      <div class="abc-ps"><span><i class="abc-dot" style="background:var(--brand)"></i>Solutions Footprint projects${cite("hub")}</span><small>${a.hub.length}${!isLoc && a.hubState.length ? `, ${a.hubState.length} state-wide` : ""}</small></div>
      ${projList(a.hub, "hub")}
      ${isLoc && STATE.get(a.s).hubState.length ? `<p class="abc-small">Plus ${STATE.get(a.s).hubState.length} project${STATE.get(a.s).hubState.length === 1 ? "" : "s"} across ${esc(a.s)} that do not name localities.</p>` : ""}
      <div class="abc-ps"><span><i class="abc-dot" style="background:${OCHA_COLOR}"></i>Sudan Humanitarian Fund projects${cite("shf")}</span><small>${a.shf.length}</small></div>
      ${projList(a.shf, "shf", 3)}`;
    P.querySelector("[data-go]")?.addEventListener("click", (e) => selectArea(e.target.dataset.go));
    P.querySelector("[data-plan]").addEventListener("click", (e) => planAt(e.currentTarget.dataset.plan));
    P.querySelectorAll("[data-hub]").forEach((b) => b.addEventListener("click", () => openHub(b.dataset.hub)));
  }

  function openHub(id) {
    const p = HUB.projects.find((x) => x.id === id);
    if (!p) return;
    const d = $("detail");
    d.innerHTML = `
      <button type="button" class="modal-close" aria-label="Close" data-close>&times;</button>
      <div class="modal-scroll">
        <div class="hero">${SF.render.hero(p)}</div>
        ${SF.render.body(p, GEO, { titleId: "detail-title" })}
        <div class="pop-actions"><a class="btn" href="./#project=${encodeURIComponent(p.id)}">Open on the Solutions Footprint map</a></div>
      </div>`;
    d.querySelector("[data-close]").addEventListener("click", () => d.close());
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); }, { once: true });
    d.showModal();
  }

  /* ---------- where to invest ---------- */
  const FACTORS = [
    { k: "need", label: "People in need", get: (a) => a.pin },
    { k: "ret", label: "Returnees", get: (a) => a.ret || 0 },
    { k: "idps", label: "IDPs", get: (a) => a.idps || 0 },
    { k: "svc", label: "Poor access to services", get: (a) => (a.accHosp == null ? null : 1 - (a.accHosp + a.accPhc + a.accEdu) / 3) },
    { k: "gap", label: "Few partners per person in need", get: (a) => (a.pin ? -((a.w3 || 0) / a.pin) : null) },
    { k: "ds", label: "No durable solutions project yet", get: (a) => -(a.hub.length) },
  ];
  const PRESETS = [
    { l: "Return areas", w: { need: 1, ret: 3, idps: 0, svc: 2, gap: 1, ds: 2 } },
    { l: "Highest need", w: { need: 3, ret: 1, idps: 1, svc: 1, gap: 1, ds: 0 } },
    { l: "Least served", w: { need: 1, ret: 1, idps: 1, svc: 3, gap: 3, ds: 1 } },
    { l: "Hosting IDPs", w: { need: 1, ret: 0, idps: 3, svc: 2, gap: 1, ds: 1 } },
  ];
  const W = { ...PRESETS[0].w };
  let preset = 0;
  function drawRankControls() {
    $("abc-presets").innerHTML = PRESETS.map((p, i) => `<button type="button" class="pill" data-p="${i}" aria-pressed="${i === preset}">${esc(p.l)}</button>`).join("");
    $("abc-weights").innerHTML = FACTORS.map((f) => `
      <label class="abc-w"><span>${esc(f.label)}</span><input type="range" min="0" max="3" step="1" value="${W[f.k]}" data-k="${f.k}" aria-valuetext="${["Off", "Low", "Medium", "High"][W[f.k]]}"><output>${["Off", "Low", "Medium", "High"][W[f.k]]}</output></label>`).join("");
    const states = GEO.states.map((s) => s.name);
    $("abc-rank-where").innerHTML = `<option value="adswg">Five ADSWG states</option><option value="all">All of Sudan</option>${states.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}`;
    $("abc-presets").onclick = (e) => {
      const b = e.target.closest("[data-p]"); if (!b) return;
      preset = Number(b.dataset.p); Object.assign(W, PRESETS[preset].w); drawRankControls(); drawRank();
    };
    $("abc-weights").oninput = (e) => {
      const r = e.target.closest("input"); if (!r) return;
      W[r.dataset.k] = Number(r.value);
      const t = ["Off", "Low", "Medium", "High"][W[r.dataset.k]];
      r.nextElementSibling.textContent = t; r.setAttribute("aria-valuetext", t);
      preset = -1; $("abc-presets").querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", "false"));
      drawRank();
    };
    $("abc-rank-where").onchange = drawRank;
  }
  function drawRank() {
    const where = $("abc-rank-where").value;
    const pool = [...LOC.values()].filter((a) => a.pop && a.pin != null && (where === "all" || (where === "adswg" ? ADSWG.includes(a.s) : a.s === where)));
    const rank = {};
    FACTORS.forEach((f) => {
      const vals = pool.map((a) => [a.id, f.get(a)]).filter(([, v]) => v != null).sort((x, y) => x[1] - y[1]);
      const n = vals.length;
      rank[f.k] = {};
      vals.forEach(([id, v], i) => {
        // ties share the same rank, so many zeros do not push each other apart
        let j = i; while (j > 0 && vals[j - 1][1] === v) j--;
        rank[f.k][id] = n > 1 ? j / (n - 1) : 0.5;
      });
    });
    const wsum = FACTORS.reduce((t, f) => t + W[f.k], 0) || 1;
    const scored = pool.map((a) => ({ a, s: FACTORS.reduce((t, f) => t + W[f.k] * (rank[f.k][a.id] ?? 0.5), 0) / wsum })).sort((x, y) => y.s - x.s).slice(0, 12);
    $("abc-rank-table").innerHTML = `
      <thead><tr><th>#</th><th>Locality</th><th>Score</th><th class="r">In need${cite("needs")}</th><th class="r">Returnees${cite("dtm")}</th><th class="r">IDPs${cite("dtm")}</th><th class="r">Hospital within 1 hour${cite("heigit")}</th><th class="r">Partners${cite("w3")}</th><th class="r">DS projects${cite("hub")}</th><th></th></tr></thead>
      <tbody>${scored.map(({ a, s }, i) => `<tr>
        <td class="abc-rk">${i + 1}</td>
        <td><button type="button" class="link-btn abc-go" data-id="${esc(a.id)}">${esc(a.n)}</button><span class="abc-st-n">${esc(a.s)}</span></td>
        <td><span class="abc-score"><i style="width:${Math.round(s * 100)}%"></i></span><span class="abc-score-n">${Math.round(s * 100)}</span></td>
        <td class="r">${short(a.pin)}</td><td class="r">${short(a.ret || 0)}</td><td class="r">${short(a.idps || 0)}</td><td class="r">${pct(a.accHosp)}</td><td class="r">${a.w3 ?? 0}</td><td class="r">${a.hub.length}</td>
        <td class="r"><button type="button" class="btn btn-sm" data-plan="${esc(a.id)}">Plan here</button></td></tr>`).join("")}</tbody>`;
    $("abc-rank-table").querySelectorAll(".abc-go").forEach((b) => b.addEventListener("click", () => selectArea(b.dataset.id, { scroll: true })));
    $("abc-rank-table").querySelectorAll("[data-plan]").forEach((b) => b.addEventListener("click", () => planAt(b.dataset.plan)));
    $("abc-rank-note").innerHTML = `Score from 0 to 100 among the ${pool.length} localities in this selection. Each factor ranks localities from lowest to highest; partners are counted per person in need, so a large locality with few partners ranks as underserved. DS projects: projects on the Solutions Footprint that name the locality.`;
  }

  /* ---------- planner ---------- */
  const KEY = "sf-abc-plans";
  const MAX_PLANS = 20;
  let current = null; // id of the saved plan being edited
  const loadPlans = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const savePlans = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } };
  const F = (id) => $(id);
  function drawForm() {
    F("pf-state").innerHTML = `<option value="">Choose a state</option>${GEO.states.map((s) => `<option>${esc(s.name)}</option>`).join("")}`;
    F("pf-types").innerHTML = SF.INTERVENTION_TYPES.map((t) => `<label class="abc-chip"><input type="checkbox" value="${esc(t)}"><span>${esc(t)}</span></label>`).join("");
    F("pf-crit").innerHTML = SF.CRITERIA.map((c) => `<label class="abc-chip"><input type="checkbox" value="${c.n}"><span><i class="ci" style="background:${c.color}">${SF.critIcon(c.n)}</i>${c.n}. ${esc(c.short)}</span></label>`).join("");
    F("pf-state").addEventListener("change", () => { drawLocPicks(); drawContext(); });
    F("abc-form").addEventListener("input", (e) => { if (e.target.id !== "pf-state") drawContext(); });
    F("abc-form").addEventListener("submit", (e) => { e.preventDefault(); savePlan(); });
    F("abc-new").addEventListener("click", () => { current = null; setPlan({}); F("pf-name").focus(); });
    F("abc-share").addEventListener("click", sharePlan);
    F("abc-print").addEventListener("click", () => { document.body.classList.add("abc-printing"); window.print(); setTimeout(() => document.body.classList.remove("abc-printing"), 500); });
  }
  function drawLocPicks(selected = []) {
    const st = F("pf-state").value;
    if (!st) { F("pf-locs").innerHTML = `<p class="abc-small" style="margin:0">Choose a state first.</p>`; return; }
    const locs = [...LOC.values()].filter((a) => a.s === st).sort((a, b) => a.n.localeCompare(b.n));
    F("pf-locs").innerHTML = locs.map((a) => `<label class="abc-chip sm"><input type="checkbox" value="${esc(a.n)}" ${selected.includes(a.n) ? "checked" : ""}><span>${esc(a.n)}</span></label>`).join("")
      + `<p class="abc-small" style="margin:4px 0 0;width:100%">Leave all unticked for the whole state.</p>`;
  }
  const vals = (id) => [...F(id).querySelectorAll("input:checked")].map((i) => i.value);
  function getPlan() {
    return {
      name: F("pf-name").value.trim(), org: F("pf-org").value.trim(), state: F("pf-state").value, locs: vals("pf-locs"),
      types: vals("pf-types"), crit: vals("pf-crit").map(Number), people: F("pf-people").value ? Number(F("pf-people").value) : null,
      budget: F("pf-budget").value ? Number(F("pf-budget").value) : null, start: F("pf-start").value, end: F("pf-end").value, notes: F("pf-notes").value.trim(),
    };
  }
  function setPlan(p) {
    F("pf-name").value = p.name || ""; F("pf-org").value = p.org || ""; F("pf-state").value = p.state || "";
    drawLocPicks(p.locs || []);
    F("pf-types").querySelectorAll("input").forEach((i) => { i.checked = (p.types || []).includes(i.value); });
    F("pf-crit").querySelectorAll("input").forEach((i) => { i.checked = (p.crit || []).includes(Number(i.value)); });
    F("pf-people").value = p.people ?? ""; F("pf-budget").value = p.budget ?? ""; F("pf-start").value = p.start || ""; F("pf-end").value = p.end || ""; F("pf-notes").value = p.notes || "";
    F("abc-plan-state").textContent = current ? "Saved plan" : p.name ? "Shared plan (not saved yet)" : "New plan";
    drawContext();
  }
  function planAt(id) {
    const a = id.includes("|") ? LOC.get(id) : STATE.get(id);
    if (!a) return;
    const p = getPlan();
    p.state = a.s;
    p.locs = a.kind === "loc" ? [a.n] : [];
    setPlan(p);
    document.getElementById("plan").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function areasOf(p) {
    if (!p.state) return [];
    const locs = [...LOC.values()].filter((a) => a.s === p.state);
    return p.locs && p.locs.length ? locs.filter((a) => p.locs.includes(a.n)) : locs;
  }
  function drawContext() {
    const p = getPlan();
    const C = $("abc-context");
    if (!p.state) {
      C.innerHTML = `<div class="abc-kick">Your project in context</div><h3 class="abc-pn">Choose where it will work</h3>
        <p class="abc-small" style="font-size:14px;color:var(--ink-2)">Pick a state, and localities if you know them, or use <b>Plan a project here</b> on the map or in the ranking. This panel then shows the people, services, partners and projects in that area, and the gaps your project would fill.</p>`;
      return;
    }
    const as = areasOf(p);
    const whole = !(p.locs && p.locs.length);
    const st = STATE.get(p.state);
    const sum = (f) => as.reduce((t, a) => t + (a[f] || 0), 0);
    const wavg = (f) => { const ok = as.filter((a) => a[f] != null && a.hPop); const w = ok.reduce((t, a) => t + a.hPop, 0); return w ? ok.reduce((t, a) => t + a[f] * a.hPop, 0) / w : null; };
    const pin = sum("pin"), pop = sum("pop");
    const hub = [...new Set((whole ? st.hub : [...as.flatMap((a) => a.hub), ...st.hubState]))];
    const shf = [...new Set((whole ? st.shf : [...as.flatMap((a) => a.shf), ...st.shfState]))];
    // what the area already covers, and what this project adds
    const covered = new Set(hub.flatMap((h) => h.criteria));
    const fills = p.crit.filter((c) => !covered.has(c));
    const score = (h) => h.criteria.filter((c) => p.crit.includes(c)).length * 2 + (h.interventionTypes || []).filter((t) => p.types.includes(t)).length + (h.status === "Ongoing" ? 1 : 0);
    const hubRanked = hub.map((h) => ({ h, s: score(h) })).sort((x, y) => y.s - x.s);
    const w3c = {};
    as.forEach((a) => Object.entries(a.w3c || {}).forEach(([c, v]) => { w3c[c] = Math.max(w3c[c] || 0, v); }));
    const shfSectors = [...new Set(shf.flatMap((x) => x.sectors))];
    const typesHint = p.types.length ? p.types : [];
    const reach = p.people && pin ? p.people / pin : null;
    const perPerson = p.people && p.budget ? p.budget / p.people : null;
    const where = whole ? `${p.state} (whole state)` : `${as.map((a) => a.n).join(", ")}, ${p.state}`;
    C.innerHTML = `
      <div class="abc-kick">Your project in context</div>
      <h3 class="abc-pn">${esc(p.name || "Untitled plan")}</h3>
      <div class="abc-small" style="margin-top:-2px">${esc(where)}</div>
      <div class="abc-pk">
        <div class="mini"><div class="l">Population</div><div class="v">${short(pop)}${cite("pop")}</div></div>
        <div class="mini"><div class="l">In need, ${D.needsYear}</div><div class="v">${short(pin)}${cite("needs")}</div></div>
        <div class="mini"><div class="l">IDPs</div><div class="v">${short(sum("idps"))}${cite("dtm")}</div></div>
        <div class="mini"><div class="l">Returnees</div><div class="v">${short(sum("ret"))}${cite("dtm")}</div></div>
      </div>
      ${reach != null || perPerson != null ? `<div class="abc-callout">${reach != null ? `Your project would reach <b>${pct(Math.min(reach, 9.99))}</b> of the people in need here.` : ""}${perPerson != null ? ` About <b>${SF.fmtUSD(perPerson)}</b> per person reached.` : ""}</div>` : ""}
      <div class="abc-ps">Gaps your project fills${cite("hub")}</div>
      ${p.crit.length
        ? fills.length
          ? `<div class="abc-fills">${fills.map((n) => `<span class="crit-pill"><span class="ci" style="background:${SF.CRITERIA[n - 1].color}">${SF.critIcon(n)}</span>${n}. ${esc(SF.CRITERIA[n - 1].short)}</span>`).join("")}</div><p class="abc-small">No Solutions Footprint project here covers ${fills.length === 1 ? "this criterion" : "these criteria"} yet.</p>`
          : `<p class="abc-small">Projects here already cover the criteria you chose. Check the list below to join up rather than duplicate.</p>`
        : `<p class="abc-small">Tick the IASC criteria your project contributes to, to see which ones no project covers here yet.</p>`}
      ${(() => { const open = SF.CRITERIA.filter((c) => !covered.has(c.n) && !p.crit.includes(c.n)); return open.length ? `<p class="abc-small">Still uncovered here: ${open.map((c) => esc(c.short.toLowerCase())).join(", ")}.</p>` : ""; })()}
      <div class="abc-ps">Basic services${cite("heigit")}</div>
      ${bars([["Hospital within 1 hour", wavg("accHosp")], ["Primary health care within 1 hour", wavg("accPhc")], ["School within 5 km", wavg("accEdu")]].filter((r) => r[1] != null).map(([l, v]) => [l, v, pct(v)]), 1, "#d4612a")}
      ${as.some((a) => a.water) ? `<p class="abc-small">Water sources in the selected localities: <b>${SF.fmtInt(as.reduce((t, a) => t + (a.water ? a.water.total : 0), 0))}</b>${cite("water")}</p>` : ""}
      <div class="abc-ps"><span><i class="abc-dot" style="background:var(--brand)"></i>Projects you can build on${cite("hub")}</span><small>${hub.length}</small></div>
      ${hubRanked.length ? hubRanked.slice(0, 5).map(({ h, s }) => `<button type="button" class="proj-card abc-pc" data-hub="${esc(h.id)}"><span class="t">${esc(h.name)}</span><span class="o">${esc(h.lead)}${h._locs && h._locs.length ? ` · ${esc(h._locs.filter((a) => a.s === p.state).map((a) => a.n).join(", ") || "")}` : " · state-wide"}</span><span class="d">${SF.render.statusChip(h)}${h.criteria.length ? SF.render.critIcons(h) : ""}${s >= 2 ? `<span class="chip abc-match">Shares your focus</span>` : ""}</span></button>`).join("") : `<p class="abc-small">No Solutions Footprint project here yet. Yours would be the first.</p>`}
      <div class="abc-ps"><span><i class="abc-dot" style="background:${OCHA_COLOR}"></i>Humanitarian projects to link with${cite("shf")}</span><small>${shf.length}</small></div>
      ${shf.length ? `<p class="abc-small">Sudan Humanitarian Fund projects here work on ${esc(shfSectors.join(", ").toLowerCase() || "several sectors")}. Linking to them helps people move from aid towards solutions, for example from water trucking to repaired water points.</p>${projList(shf, "shf", 2)}` : `<p class="abc-small">No Sudan Humanitarian Fund project found for this area.</p>`}
      <div class="abc-ps">Partners already present${cite("w3")}</div>
      ${Object.keys(w3c).length ? `<p class="abc-small">${Object.entries(w3c).sort((x, y) => y[1] - x[1]).map(([c, v]) => `${esc(c)} (${v})`).join(", ")}. Most in one locality, by sector.</p>` : `<p class="abc-small">No organisations reported to OCHA here in the last three months.</p>`}
      <div class="abc-next"><b>Next step:</b> bring this plan to the ${ADSWG.includes(p.state) ? `${esc(p.state)} Area Durable Solutions Working Group` : "Durable Solutions Working Group"}, and when it starts, <a href="add.html">add it to the Solutions Footprint</a>.</div>`;
    C.querySelectorAll("[data-hub]").forEach((b) => b.addEventListener("click", () => openHub(b.dataset.hub)));
  }
  function drawMine() {
    const list = loadPlans();
    $("abc-mine-count").textContent = `${list.length} of ${MAX_PLANS}`;
    $("abc-mine-list").innerHTML = list.length ? list.map((p) => `
      <div class="abc-mine-row${p.id === current ? " is-on" : ""}"><button type="button" class="link-btn" data-open="${p.id}">${esc(p.name || "Untitled plan")}</button>
      <span class="abc-small">${esc(p.state || "")}${p.locs && p.locs.length ? `, ${esc(p.locs.join(", "))}` : ""} · ${esc(when(p.saved))}</span>
      <button type="button" class="abc-x" data-del="${p.id}" aria-label="Delete ${esc(p.name || "plan")}">&times;</button></div>`).join("") : `<p class="abc-small" style="margin:0">No saved plans yet.</p>`;
    $("abc-mine-list").onclick = (e) => {
      const o = e.target.closest("[data-open]"), d = e.target.closest("[data-del]");
      if (o) { const p = loadPlans().find((x) => x.id === o.dataset.open); if (p) { current = p.id; setPlan(p); drawMine(); } }
      if (d) { savePlans(loadPlans().filter((x) => x.id !== d.dataset.del)); if (current === d.dataset.del) current = null; drawMine(); SF.toast("Plan deleted"); }
    };
  }
  function savePlan() {
    const p = getPlan();
    if (!p.name) { F("pf-name").focus(); SF.toast("Give the plan a name first"); return; }
    const list = loadPlans();
    if (current && list.some((x) => x.id === current)) {
      list.splice(list.findIndex((x) => x.id === current), 1, { ...p, id: current, saved: today() });
    } else {
      if (list.length >= MAX_PLANS) { SF.toast(`You have ${MAX_PLANS} plans. Delete one to save another.`); return; }
      current = `p${Date.now().toString(36)}`;
      list.unshift({ ...p, id: current, saved: today() });
    }
    if (!savePlans(list)) { SF.toast("This browser does not allow saving. Use Copy share link instead."); return; }
    F("abc-plan-state").textContent = "Saved plan";
    drawMine();
    SF.toast("Plan saved in this browser");
  }
  const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
  async function sharePlan() {
    const p = getPlan();
    if (!p.name && !p.state) { SF.toast("Add a name or an area first"); return; }
    const url = `${location.origin}${location.pathname}#plan=${b64(JSON.stringify(p))}`;
    try { await navigator.clipboard.writeText(url); SF.toast("Link copied"); }
    catch (e) { window.prompt("Copy this link", url); }
  }
  function openSharedPlan() {
    const m = location.hash.match(/^#plan=([\w-]+)/);
    if (!m) return;
    try {
      const p = JSON.parse(unb64(m[1]));
      current = null;
      setPlan(p);
      setTimeout(() => document.getElementById("plan").scrollIntoView({ block: "start" }), 50);
      SF.toast("Shared plan opened. Save it to keep a copy.");
    } catch (e) { SF.toast("This plan link could not be read"); }
  }

  /* ---------- notes and sources ---------- */
  function drawSources() {
    const notes = [
      `Figures come from different sources and dates. Use them to start a conversation in the area, not as a final answer.`,
      `${D.notes.population}${cite("pop")}`,
      `${D.notes.needs}${cite("needs")} National figures for 2026: ${big(D.national["2026"]?.pin)} people in need and ${big(D.national["2026"]?.targeted)} targeted, out of ${big(D.national["2026"]?.population)} people${cite("needs", "hnrp")}.`,
      `IDPs are from the IOM DTM master list of ${when(D.dtmDates.idps)}, and returnees from the master list of ${when(D.dtmDates.ret)}${cite("dtm")}.`,
      `Organisations present are those reporting activities to OCHA in the latest three months of the 3W, counted per locality and sector. Names are not shown on this page${cite("w3")}.`,
      `Sudan Humanitarian Fund projects are placed by reading the states and localities named in each project's title and description, so a few may be missed or misplaced. ${SHF.projects.filter((p) => !p._states.length).length} projects name no state and are not on the map${cite("shf")}.`,
      `Basic services: counts and reach come from OpenStreetMap through HeiGIT. Mapping is uneven across Sudan and does not show whether a facility is working${cite("heigit", "osm")}.`,
      `Food insecurity shows the IPC phase covering most of each locality in the FEWS NET projection for October 2026 to January 2027${cite("ipc")}.`,
      `Water sources cover Aj Jazirah only. In the state table, Sharg Al Jazirah shows a total of 794 while its sources by type add up to 802; this page uses the sum by type, so the state total is 3,553 rather than 3,545${cite("water")}.`,
    ];
    $("abc-notes").innerHTML = notes.map((n) => `<li>${n}</li>`).join("");
    $("abc-src").innerHTML = SRC.map((s, i) => `<li id="src-${s.k}"><span class="abc-src-n">${i + 1}</span><span><a href="${esc(s.url)}" ${/^https?:/.test(s.url) ? 'target="_blank" rel="noopener"' : ""}>${esc(s.title)}</a>${s.url2 ? ` · <a href="${esc(s.url2)}" target="_blank" rel="noopener">Education facilities</a>` : ""}. ${esc(s.org)}${s.date ? `, ${s.dl ? `${esc(s.dl)} ` : ""}${esc(when(s.date))}` : ""}.</span></li>`).join("");
  }

  /* ---------- start ---------- */
  async function init() {
    SF.renderHeader("");
    try {
      const [areas, geo, lg, hub, shf, water, pts] = await Promise.all([
        SF.loadJSON("data/abc/areas.json"), SF.loadJSON(SF.config.geoUrl), SF.loadJSON("data/abc/localities-geo.json"),
        SF.loadJSON(SF.config.dataUrl), SF.loadJSON("data/abc/ocha-projects.json").catch(() => ({ projects: [] })),
        SF.loadJSON("data/abc/aj-jazirah-water-sources-2026-08.json"), SF.loadJSON("data/abc/services-points.json").catch(() => null),
        SF.loadLogos(),
      ]);
      D = areas; GEO = geo; LG = lg; WATER = water; PTS = pts;
      HUB = { lastUpdated: hub.lastUpdated, projects: (hub.projects || []).map(SF.enrich) };
      SHF = shf;
      registerSources();
      buildAreas();
      placeProjects();
      drawTop();
      drawWhat();
      drawControls();
      drawMapBase();
      paint();
      drawRankControls();
      drawRank();
      drawForm();
      drawMine();
      drawContext();
      drawSources();
      openSharedPlan();
      document.addEventListener("sf-theme", () => paint());
    } catch (e) {
      console.error(e);
      $("main").insertAdjacentHTML("afterbegin", `<p class="card" style="padding:16px">The data for this page could not be loaded. Please refresh the page.</p>`);
    }
    SF.renderFooter(HUB.lastUpdated);
  }
  init();
})();
