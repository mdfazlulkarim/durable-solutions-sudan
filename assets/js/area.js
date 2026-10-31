/* Area by area: the simple version of the Area-based approaches and coordination page (git page only, not in the menu).
   Three steps: pick a place on the map, find where to start, plan together. The full version is abc.html.
   Data: data/abc/*.json (scripts/build_abc_data.py), data/projects.json, data/geo.json. */
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
  const ADSWG = ["Aj Jazirah", "Blue Nile", "Gedaref", "Kassala", "White Nile"];
  const PAL = { up: ["#dbe8f6", "#a6c6ec", "#6c9fdb", "#3a73bd", "#1b4a8a"], low: ["#9c3d14", "#d4612a", "#ef8a4c", "#f8b98a", "#fde3cf"] };
  // what a project does, and the IASC criteria it usually contributes to
  const TYPE_CRIT = {
    "Basic services rehabilitation": [2], "Livelihoods and cash-for-work": [3], "Shelter and housing": [4], "Legal aid and documentation": [5, 8],
    "Social cohesion and peacebuilding": [1], "Local governance and urban planning": [7], "Data, evidence and preparedness": [], "Family reunification support": [6],
  };

  let D, GEO, LG, HUB;
  /* ---------- sources ---------- */
  const SRC = [], SRCK = {};
  const addSrc = (k, s) => { if (!SRCK[k]) { SRC.push({ k, ...s }); SRCK[k] = SRC.length; } };
  const cite = (...keys) => keys.filter((k) => SRCK[k]).map((k) => `<a class="abc-cite" href="#src-${k}" title="${esc(SRC[SRCK[k] - 1].title)}">${SRCK[k]}</a>`).join("");
  function registerSources() {
    const s = D.sources;
    addSrc("parker", { title: "Humanitarian response to urban crises: a review of area-based approaches", org: "Elizabeth Parker and Victoria Maynard, IIED", date: "2015-07", url: "https://www.iied.org/sites/default/files/pdfs/migrate/10742IIED.pdf" });
    addSrc("uswg", { title: "Area-based approaches in urban settings: compendium of case studies", org: "Urban Settlements Working Group, Global Shelter Cluster", date: "2019-05", url: "https://reliefweb.int/report/world/area-based-approaches-urban-settings-compendium-case-studies-may-2019-edition" });
    addSrc("fsc", { title: "Handbook 10.4.2: area-based coordination", org: "Global Food Security Cluster", date: "2023-12", url: "https://handbook.fscluster.org/docs/1042-other-models-of-decentralised-coordination-area-based-coordination" });
    addSrc("reset", { title: "The Humanitarian Reset: Cluster Simplification, final proposal to the IASC Principals", org: "IASC Operational Policy and Advocacy Group", date: "2025-06-09", url: "https://www.nutritioncluster.net/sites/nutritioncluster.com/files/2025-07/Humanitarian%20Reset%20-%20Cluster%20Simplification%20final%20proposal.pdf" });
    addSrc("needs", { title: `${s.needs.title}: ${D.needsYear} locality figures and ${Object.keys(D.national).slice(-1)[0]} national figures`, org: "OCHA, on HDX", date: s.needs.updated, url: s.needs.url });
    addSrc("dtm", { title: `${s.dtm.title}: Displacement and Return Snapshot`, org: "IOM Displacement Tracking Matrix, on HDX", date: s.dtm.updated, url: s.dtm.url });
    addSrc("pop", { title: `${s.population.title} (${s.population.file})`, org: "UNFPA, on HDX", date: s.population.updated || "2025-12", url: s.population.url });
    addSrc("heigit", { title: `${s.heigit.title}: facilities and access to services`, org: "HeiGIT, from OpenStreetMap, on HDX", date: s.heigit.updated, url: s.heigit.url });
    addSrc("w3", { title: `${s.w3.title}: 2026 consolidated 3W`, org: "OCHA Sudan, on HDX", date: s.w3.updated, url: s.w3.url });
    addSrc("hub", { title: "Solutions Footprint: projects reported to the Durable Solutions Working Group", org: "Durable Solutions Working Group, Sudan", dl: "last updated", date: HUB.lastUpdated, url: "./" });
    addSrc("bounds", { title: "Sudan administrative boundaries (states and localities)", org: "OCHA, via geoBoundaries (CC BY 3.0 IGO)", date: "", url: SF.config.hdxAdminUrl });
  }

  /* ---------- areas ---------- */
  const LOC = new Map(), STATE = new Map(), byName = new Map();
  const key = (s, n) => `${s}|${n}`;
  function buildAreas() {
    const shapes = new Map(LG.localities.map((l) => [key(l.state, l.name), l]));
    D.areas.forEach((a) => {
      const area = { ...a, kind: "loc", id: key(a.s, a.n), g: shapes.get(key(a.s, a.n)), hub: [] };
      LOC.set(area.id, area);
      (byName.get(a.n) || byName.set(a.n, []).get(a.n)).push(area);
    });
    GEO.states.forEach((st) => {
      const locs = [...LOC.values()].filter((a) => a.s === st.name);
      const sum = (f) => (locs.some((a) => a[f] != null) ? locs.reduce((t, a) => t + (a[f] || 0), 0) : null);
      const wavg = (f) => { const ok = locs.filter((a) => a[f] != null && a.hPop); const w = ok.reduce((t, a) => t + a.hPop, 0); return w ? ok.reduce((t, a) => t + a[f] * a.hPop, 0) / w : null; };
      STATE.set(st.name, {
        kind: "state", id: st.name, n: st.name, s: st.name, g: st, locs,
        pop: sum("pop"), pin: sum("pin"), idps: sum("idps"), ret: sum("ret"), hosp: sum("hosp"), edu: sum("edu"),
        accHosp: wavg("accHosp"), w3: (D.states[st.name] || {}).w3 || null, hub: [], hubState: [],
      });
    });
    const findLoc = (s, n) => { const c = byName.get(n) || []; return c.length === 1 ? c[0] : c.find((a) => a.s === s) || null; };
    HUB.projects.forEach((p) => {
      const locs = [...new Set((p.localities || []).map((n) => findLoc((p.states || [])[0], n)).filter(Boolean))];
      p._locs = locs;
      locs.forEach((a) => a.hub.push(p));
      new Set([...(p.states || []), ...locs.map((a) => a.s)]).forEach((s) => {
        const st = STATE.get(s); if (!st) return;
        st.hub.push(p);
        if (!locs.some((a) => a.s === s)) st.hubState.push(p);
      });
    });
  }
  const areaOf = (id) => (id && id.includes("|") ? LOC.get(id) : STATE.get(id));

  /* ---------- top and plain words ---------- */
  function drawTop() {
    $("ar-sub").innerHTML = `Start from a place, not a sector. Look at everyone who lives there, what they need and who is already helping${cite("parker", "uswg")}, then agree one joined-up plan with the local authorities, communities and partners${cite("fsc")}.`;
    const two = [
      { tag: "ABA", cls: "", h: "Area-based approach", sub: "What we do", t: `Plan for a whole place and everyone in it (IDPs, returnees and host communities), across several sectors at once, with the people who live there${cite("parker", "uswg")}.` },
      { tag: "ABC", cls: "c", h: "Area-based coordination", sub: "How we do it together", t: `Everyone working in that place shares one picture of needs and gaps, and one plan, alongside the clusters and led locally where possible${cite("fsc", "reset")}.` },
    ];
    $("ar-two").innerHTML = two.map((c) => `
      <div class="card ar-card"><span class="abc-vs-tag ${c.cls}">${c.tag}</span><h3>${esc(c.h)}</h3><div class="ar-card-sub">${esc(c.sub)}</div><p>${c.t}</p></div>`).join("")
      + `<p class="ar-two-note">One without the other does not work: a joined-up plan needs everyone at the same table, and a shared table needs a plan for the whole place.</p>`;
  }

  /* ---------- map ---------- */
  const LAYERS = [
    { k: "pin", label: "People in need", src: "needs", get: (a) => a.pin, fmt: big, pal: "up" },
    { k: "ret", label: "Returnees", src: "dtm", get: (a) => a.ret, fmt: big, pal: "up" },
    { k: "accHosp", label: "Far from a hospital", src: "heigit", get: (a) => a.accHosp, fmt: pct, pal: "low", bins: [0.2, 0.4, 0.6, 0.8], legend: "Share of people within 1 hour of a hospital. Darker: fewer can reach one." },
    { k: "w3", label: "Partners present", src: "w3", get: (a) => a.w3, fmt: SF.fmtInt, pal: "up", legend: "Organisations reporting activities to OCHA in the last three months." },
  ];
  const S = { layer: "pin", focus: null, sel: null };
  const HOME = [40, 14, 780, 680];
  let VB = HOME.slice(), BR = [];
  const layer = () => LAYERS.find((l) => l.k === S.layer);
  function breaks(L, vals) {
    if (L.bins) return L.bins;
    const v = vals.filter((x) => x != null && x > 0).sort((a, b) => a - b);
    if (!v.length) return [];
    const q = (p) => v[Math.min(v.length - 1, Math.floor(p * v.length))];
    const nice = (x) => { if (x < 10) return Math.round(x); const m = 10 ** Math.floor(Math.log10(x)); return Math.round((x / m) * 2) / 2 * m; };
    return [...new Set([0.2, 0.4, 0.6, 0.8].map((p) => nice(q(p))))].filter((x) => x > 0);
  }
  const colour = (L, v) => {
    if (v == null || isNaN(v)) return "url(#ar-hatch)";
    if (v === 0 && L.pal === "up") return "var(--map-none)";
    let i = 0; while (i < BR.length && v >= BR[i]) i++;
    return PAL[L.pal][Math.min(i, 4)];
  };
  function drawMapBase() {
    const svg = $("ar-map");
    svg.setAttribute("viewBox", VB.join(" "));
    svg.innerHTML = `
      <defs><pattern id="ar-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--hatch-b)"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--hatch-a)" stroke-width="3"/></pattern></defs>
      <rect class="water" x="-2000" y="-2000" width="5000" height="5000"/>
      <g>${GEO.land.map((l) => `<path class="land" d="${l.path}"/>`).join("")}</g>
      <g>${GEO.labels.map((l) => `<text class="country-lbl" x="${l.x}" y="${l.y}" text-anchor="${l.anchor}">${esc(l.name)}</text>`).join("")}</g>
      <g id="ar-g-states">${GEO.states.map((s) => `<path class="abc-st" data-id="${esc(s.name)}" d="${s.path}" tabindex="0" role="button" aria-label="${esc(s.name)}"/>`).join("")}</g>
      ${GEO.abyei ? `<path class="abyei" d="${GEO.abyei.path}"/>` : ""}
      <g id="ar-g-locs">${LG.localities.map((l) => `<path class="abc-lc" data-id="${esc(key(l.state, l.name))}" d="${l.path}"/>`).join("")}</g>
      <path class="abc-mesh" d="${LG.mesh}"/>
      <g class="abc-stb">${GEO.states.map((s) => `<path d="${s.path}"/>`).join("")}</g>
      <path class="sudan-outline" d="${GEO.outline}"/>
      <path class="border-undetermined" d="${GEO.undeterminedBoundary}"/>
      <path class="hover-outline" id="ar-hover" d=""/>
      <path class="sel-outline" id="ar-sel" d=""/>
      <g id="ar-g-lbl"></g>`;
    svg.addEventListener("click", (e) => { const el = e.target.closest("[data-id]"); if (el) select(el.dataset.id); });
    svg.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset.id) { e.preventDefault(); select(e.target.dataset.id); } });
    svg.addEventListener("mousemove", hover);
    svg.addEventListener("mouseleave", () => { $("ar-tip").hidden = true; $("ar-hover").setAttribute("d", ""); });
    $("ar-back").addEventListener("click", () => { S.focus = null; S.sel = null; zoom(null); paint(); });
  }
  function paint() {
    const L = layer();
    const pool = S.focus ? [...LOC.values()].filter((a) => a.s === S.focus) : [...STATE.values()];
    BR = breaks(L, (S.focus ? [...LOC.values()] : pool).map(L.get));
    document.querySelectorAll("#ar-g-states .abc-st").forEach((el) => {
      const a = STATE.get(el.dataset.id);
      el.style.fill = S.focus ? "var(--map-land)" : colour(L, L.get(a));
      el.classList.toggle("is-dim", !!S.focus && a.id !== S.focus);
      el.style.pointerEvents = S.focus === a.id ? "none" : "";
    });
    document.querySelectorAll("#ar-g-locs .abc-lc").forEach((el) => {
      const a = LOC.get(el.dataset.id);
      const show = S.focus && a && a.s === S.focus;
      el.style.display = show ? "" : "none";
      if (show) el.style.fill = colour(L, L.get(a));
    });
    document.querySelector("#ar-map .abc-mesh").style.display = S.focus ? "" : "none";
    const k = VB[2] / HOME[2];
    $("ar-g-lbl").innerHTML = S.focus
      ? LG.localities.filter((l) => l.state === S.focus).map((l) => `<text class="lbl" x="${l.x}" y="${l.y + 4 * k}" text-anchor="middle" style="font-size:${11 * k}px;stroke-width:${3 * k}px">${esc(l.name)}</text>`).join("")
      : GEO.states.map((s) => `<text class="lbl" x="${s.x}" y="${s.y + 4}" text-anchor="middle" style="font-size:11px">${esc(s.name)}</text>`).join("");
    const sel = areaOf(S.sel);
    $("ar-sel").setAttribute("d", sel && sel.g ? sel.g.path : "");
    $("ar-map-kicker").textContent = S.focus ? `${S.focus} state` : "Sudan";
    $("ar-map-title").textContent = `${L.label}, by ${S.focus ? "locality" : "state"}`;
    $("ar-back").hidden = !S.focus;
    const f = L.fmt, edges = [null, ...BR, null];
    const bins = PAL[L.pal].slice(0, BR.length + 1).map((c, i) => {
      const lo = edges[i], hi = edges[i + 1];
      return `<span><i style="background:${c}"></i>${esc(lo == null ? `under ${f(hi)}` : hi == null ? `${f(lo)} or more` : `${f(lo)} to ${f(hi)}`)}</span>`;
    }).join("");
    $("ar-legend").innerHTML = `<div class="abc-leg-row"><b>${esc(L.label)}</b>${cite(L.src)}<span class="abc-leg-bins">${bins}</span></div>${L.legend ? `<div class="abc-leg-note">${esc(L.legend)}</div>` : ""}`;
    drawPanel(sel || (S.focus ? STATE.get(S.focus) : null));
  }
  function zoom(st) {
    const from = VB.slice();
    const to = st ? (() => {
      const [x0, y0, x1, y1] = st.bbox;
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
      $("ar-map").setAttribute("viewBox", VB.map((v) => v.toFixed(1)).join(" "));
      if (p < 1) requestAnimationFrame(step); else { VB = to; paint(); }
    };
    requestAnimationFrame(step);
  }
  function select(id, opts = {}) {
    const a = areaOf(id);
    if (!a) return;
    if (a.kind === "state") { if (S.focus !== a.id) { S.focus = a.id; zoom(a.g); } S.sel = a.id; }
    else { if (S.focus !== a.s) { S.focus = a.s; zoom(STATE.get(a.s).g); } S.sel = a.id; }
    paint();
    if (opts.scroll) $("pick").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function hover(e) {
    const el = e.target.closest("[data-id]"), tip = $("ar-tip");
    if (!el) { tip.hidden = true; return; }
    const a = areaOf(el.dataset.id), L = layer();
    if (!a) return;
    tip.innerHTML = `<strong>${esc(a.n)}</strong>${esc(L.label)}: <b>${esc(L.fmt(L.get(a)))}</b>`;
    const w = $("ar-map-wrap").getBoundingClientRect();
    tip.style.left = `${e.clientX - w.left}px`; tip.style.top = `${e.clientY - w.top}px`; tip.hidden = false;
    $("ar-hover").setAttribute("d", a.g ? a.g.path : "");
  }
  function drawLayers() {
    $("ar-layers").innerHTML = LAYERS.map((L) => `<button type="button" class="ar-layer" data-k="${L.k}" aria-pressed="${L.k === S.layer}">${esc(L.label)}</button>`).join("");
    $("ar-layers").addEventListener("click", (e) => {
      const b = e.target.closest("[data-k]"); if (!b) return;
      S.layer = b.dataset.k;
      $("ar-layers").querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      paint();
    });
  }

  /* ---------- the selected place ---------- */
  function drawPanel(a) {
    const P = $("ar-panel");
    if (!a) {
      P.innerHTML = `<div class="abc-kick">Start here</div><h3 class="abc-pn">Select a state on the map</h3>
        <p class="ar-p">Then a locality, to see who lives there, what they need and who is already helping.</p>
        <p class="ar-p">Not sure where to look? <a href="#start">See where to start</a>.</p>`;
      return;
    }
    const isLoc = a.kind === "loc";
    const hubN = a.hub.length;
    const needs = Object.entries(a.pinBy || {}).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([c]) => (D.clusters[c] || c).toLowerCase());
    P.innerHTML = `
      <div class="abc-kick">${isLoc ? `Locality in ${esc(a.s)}` : "State"}</div>
      <h3 class="abc-pn">${esc(a.n)}${isLoc && a.ar ? ` <span class="abc-ar" lang="ar" dir="rtl">${esc(a.ar)}</span>` : ""}</h3>
      <div class="abc-pk">
        <div class="mini"><div class="l">People</div><div class="v">${short(a.pop)}${cite("pop")}</div></div>
        <div class="mini"><div class="l">In need</div><div class="v">${short(a.pin)}${cite("needs")}</div></div>
        <div class="mini"><div class="l">Returnees</div><div class="v">${short(a.ret || 0)}${cite("dtm")}</div></div>
        <div class="mini"><div class="l">IDPs</div><div class="v">${short(a.idps || 0)}${cite("dtm")}</div></div>
      </div>
      ${needs.length ? `<p class="ar-p"><b>Biggest needs:</b> ${esc(needs.join(", "))}.</p>` : ""}
      <ul class="ar-facts">
        <li><b>${a.hosp ?? "n/a"}</b> hospitals and <b>${a.edu ?? "n/a"}</b> schools mapped${cite("heigit")}</li>
        <li><b>${pct(a.accHosp)}</b> of people within an hour of a hospital${cite("heigit")}</li>
        <li><b>${a.w3 ?? 0}</b> organisations working here${cite("w3")}</li>
        <li><b>${hubN}</b> durable solutions project${hubN === 1 ? "" : "s"} on the Solutions Footprint${isLoc ? " naming this locality" : ""}${isLoc && STATE.get(a.s).hubState.length ? `, plus ${STATE.get(a.s).hubState.length} across ${esc(a.s)}` : ""}${cite("hub")}</li>
      </ul>
      <button type="button" class="btn btn-primary abc-plan-here" id="ar-plan-here">Plan a project here</button>
      ${!isLoc ? `<p class="abc-small">Select a locality on the map for more detail.</p>` : ""}`;
    $("ar-plan-here").addEventListener("click", () => planAt(a));
  }

  /* ---------- where to start ---------- */
  const FACTORS = {
    need: (a) => a.pin, ret: (a) => a.ret || 0, idps: (a) => a.idps || 0,
    svc: (a) => (a.accHosp == null ? null : 1 - (a.accHosp + a.accPhc + a.accEdu) / 3),
    gap: (a) => (a.pin ? -((a.w3 || 0) / a.pin) : null), ds: (a) => -a.hub.length,
  };
  const PRESETS = [
    { l: "Return areas", w: { need: 1, ret: 3, idps: 0, svc: 2, gap: 1, ds: 2 } },
    { l: "Highest need", w: { need: 3, ret: 1, idps: 1, svc: 1, gap: 1, ds: 0 } },
    { l: "Least served", w: { need: 1, ret: 1, idps: 1, svc: 3, gap: 3, ds: 1 } },
  ];
  let preset = 0;
  function drawTop5() {
    $("ar-presets").innerHTML = PRESETS.map((p, i) => `<button type="button" class="pill" data-p="${i}" aria-pressed="${i === preset}">${esc(p.l)}</button>`).join("");
    $("ar-presets").onclick = (e) => { const b = e.target.closest("[data-p]"); if (!b) return; preset = Number(b.dataset.p); drawTop5(); };
    const pool = [...LOC.values()].filter((a) => ADSWG.includes(a.s) && a.pop && a.pin != null);
    const W = PRESETS[preset].w;
    const rank = {};
    Object.entries(FACTORS).forEach(([k, f]) => {
      const v = pool.map((a) => [a.id, f(a)]).filter(([, x]) => x != null).sort((x, y) => x[1] - y[1]);
      rank[k] = {};
      v.forEach(([id, x], i) => { let j = i; while (j > 0 && v[j - 1][1] === x) j--; rank[k][id] = v.length > 1 ? j / (v.length - 1) : 0.5; });
    });
    const ws = Object.values(W).reduce((t, x) => t + x, 0);
    const top = pool.map((a) => ({ a, s: Object.keys(FACTORS).reduce((t, k) => t + W[k] * (rank[k][a.id] ?? 0.5), 0) / ws })).sort((x, y) => y.s - x.s).slice(0, 5);
    const why = (a) => {
      const bits = [];
      if (a.ret) bits.push(`${short(a.ret)} returnees`);
      if (a.pin) bits.push(`${short(a.pin)} in need`);
      if (a.accHosp != null && a.accHosp < 0.6) bits.push(`only ${pct(a.accHosp)} within an hour of a hospital`);
      bits.push(a.hub.length ? `${a.hub.length} durable solutions project${a.hub.length === 1 ? "" : "s"}` : "no durable solutions project yet");
      return bits.join(" · ");
    };
    $("ar-top5").innerHTML = top.map(({ a }, i) => `
      <li class="card ar-pick">
        <span class="ar-pick-n">${i + 1}</span>
        <div class="ar-pick-b"><button type="button" class="link-btn ar-pick-name" data-id="${esc(a.id)}">${esc(a.n)}</button><span class="ar-pick-s">${esc(a.s)}</span>
        <div class="ar-pick-why">${esc(why(a))}</div></div>
        <button type="button" class="btn btn-sm" data-plan="${esc(a.id)}">Plan here</button>
      </li>`).join("");
    $("ar-top5").querySelectorAll(".ar-pick-name").forEach((b) => b.addEventListener("click", () => select(b.dataset.id, { scroll: true })));
    $("ar-top5").querySelectorAll("[data-plan]").forEach((b) => b.addEventListener("click", () => planAt(LOC.get(b.dataset.plan))));
    $("ar-top5-note").innerHTML = `Ranked among the ${pool.length} localities of Aj Jazirah, Blue Nile, Gedaref, Kassala and White Nile, using people in need${cite("needs")}, returnees and IDPs${cite("dtm")}, access to services${cite("heigit")}, partners present${cite("w3")} and durable solutions projects${cite("hub")}. A starting point for a conversation with the ADSWG, not a final answer. The <a href="abc.html#invest">full version</a> lets you set your own weights.`;
  }

  /* ---------- plan together ---------- */
  const KEY = "sf-abc-plans", MAX = 20;
  let current = null;
  const loadPlans = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const savePlans = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); return true; } catch (e) { return false; } };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  function drawForm() {
    $("ap-state").innerHTML = `<option value="">Choose a state</option>${GEO.states.map((s) => `<option>${esc(s.name)}</option>`).join("")}`;
    $("ap-types").innerHTML = SF.INTERVENTION_TYPES.map((t) => `<label class="abc-chip"><input type="checkbox" value="${esc(t)}"><span>${esc(t)}</span></label>`).join("");
    $("ap-state").addEventListener("change", () => { fillLocs(); drawResult(); });
    $("ar-form").addEventListener("input", (e) => { if (e.target.id !== "ap-state") drawResult(); });
    $("ar-form").addEventListener("submit", (e) => { e.preventDefault(); save(); });
    $("ap-new").addEventListener("click", () => { current = null; setPlan({}); });
    $("ap-share").addEventListener("click", share);
  }
  function fillLocs(sel = "") {
    const st = $("ap-state").value, el = $("ap-loc");
    el.disabled = !st;
    el.innerHTML = st ? `<option value="">Whole state</option>${[...LOC.values()].filter((a) => a.s === st).sort((a, b) => a.n.localeCompare(b.n)).map((a) => `<option ${a.n === sel ? "selected" : ""}>${esc(a.n)}</option>`).join("")}` : `<option value="">Choose a state first</option>`;
  }
  const getPlan = () => ({ name: $("ap-name").value.trim(), state: $("ap-state").value, locs: $("ap-loc").value ? [$("ap-loc").value] : [], types: [...$("ap-types").querySelectorAll("input:checked")].map((i) => i.value) });
  function setPlan(p) {
    $("ap-name").value = p.name || ""; $("ap-state").value = p.state || ""; fillLocs((p.locs || [])[0] || "");
    $("ap-types").querySelectorAll("input").forEach((i) => { i.checked = (p.types || []).includes(i.value); });
    drawResult(); drawMine();
  }
  function planAt(a) {
    const p = getPlan();
    p.state = a.s; p.locs = a.kind === "loc" ? [a.n] : [];
    setPlan(p);
    $("plan").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function drawResult() {
    const p = getPlan(), R = $("ar-result");
    if (!p.state) {
      R.innerHTML = `<div class="abc-kick">What your project adds</div><h3 class="abc-pn">Choose where it will work</h3><p class="ar-p">Or use <b>Plan here</b> on the map or in the list above.</p>`;
      return;
    }
    const st = STATE.get(p.state);
    const a = p.locs.length ? LOC.get(key(p.state, p.locs[0])) : st;
    const projects = a.kind === "loc" ? [...a.hub, ...st.hubState] : st.hub;
    const covered = new Set(projects.flatMap((h) => h.criteria));
    const mine = [...new Set(p.types.flatMap((t) => TYPE_CRIT[t] || []))];
    const fills = mine.filter((c) => !covered.has(c));
    const shares = projects.filter((h) => h.criteria.some((c) => mine.includes(c)) || (h.interventionTypes || []).some((t) => p.types.includes(t)));
    const join = (shares.length ? shares : projects).slice().sort((x, y) => (y.status === "Ongoing") - (x.status === "Ongoing")).slice(0, 3);
    const where = a.kind === "loc" ? `${a.n}, ${a.s}` : `${a.n} (whole state)`;
    R.innerHTML = `
      <div class="abc-kick">What your project adds</div>
      <h3 class="abc-pn">${esc(p.name || "Your project")}</h3>
      <div class="abc-small" style="margin:-2px 0 10px">${esc(where)}</div>
      <ol class="ar-say">
        <li><b>The people.</b> ${short(a.pin)} people in need${cite("needs")}, including ${short(a.ret || 0)} returnees and ${short(a.idps || 0)} IDPs${cite("dtm")}.</li>
        <li><b>Who is there.</b> ${a.w3 || 0} organisations${cite("w3")}. ${a.kind === "loc" ? `${a.hub.length > 1 ? `${a.hub.length} durable solutions projects name` : a.hub.length ? "1 durable solutions project names" : "No durable solutions project names"} ${esc(a.n)}${st.hubState.length ? `, and ${st.hubState.length} more work across ${esc(a.s)}` : ""}` : `${projects.length} durable solutions project${projects.length === 1 ? "" : "s"} in ${esc(a.n)}`}${cite("hub")}.</li>
        <li><b>The gap.</b> ${!mine.length ? "Tick what your project will do to see which gaps it fills."
          : fills.length ? `No project here covers ${fills.map((n) => `<span class="ar-crit"><i style="background:${SF.CRITERIA[n - 1].color}">${SF.critIcon(n)}</i>${esc(SF.CRITERIA[n - 1].short.toLowerCase())}</span>`).join(" or ")} yet. Your project would be the first.`
          : "Others already work on this here, so join up rather than start alone."}</li>
      </ol>
      ${join.length ? `<div class="abc-ps">Projects to join up with</div>${join.map((h) => `<button type="button" class="proj-card abc-pc" data-hub="${esc(h.id)}"><span class="t">${esc(h.name)}</span><span class="o">${esc(h.lead)}</span><span class="d">${SF.render.statusChip(h)}${h.criteria.length ? SF.render.critIcons(h) : ""}</span></button>`).join("")}` : ""}
      <div class="abc-next"><b>Next step:</b> take it to the ${ADSWG.includes(p.state) ? `${esc(p.state)} Area Durable Solutions Working Group` : "Durable Solutions Working Group"}, and when it starts, <a href="add.html">add it to the Solutions Footprint</a>.</div>`;
    R.querySelectorAll("[data-hub]").forEach((b) => b.addEventListener("click", () => openHub(b.dataset.hub)));
  }
  function openHub(id) {
    const p = HUB.projects.find((x) => x.id === id); if (!p) return;
    const d = $("detail");
    d.innerHTML = `<button type="button" class="modal-close" aria-label="Close" data-close>&times;</button>
      <div class="modal-scroll"><div class="hero">${SF.render.hero(p)}</div>${SF.render.body(p, GEO, { titleId: "detail-title" })}
      <div class="pop-actions"><a class="btn" href="./#project=${encodeURIComponent(p.id)}">Open on the Solutions Footprint map</a></div></div>`;
    d.querySelector("[data-close]").addEventListener("click", () => d.close());
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); }, { once: true });
    d.showModal();
  }
  function drawMine() {
    const l = loadPlans();
    $("ar-mine-count").textContent = `(${l.length} of ${MAX})`;
    $("ar-mine-list").innerHTML = l.length ? l.map((p) => `<div class="abc-mine-row${p.id === current ? " is-on" : ""}"><button type="button" class="link-btn" data-open="${p.id}">${esc(p.name || "Untitled plan")}</button><span class="abc-small">${esc([p.state, ...(p.locs || [])].filter(Boolean).join(", "))}</span><button type="button" class="abc-x" data-del="${p.id}" aria-label="Delete ${esc(p.name || "plan")}">&times;</button></div>`).join("") : `<p class="abc-small">No saved plans yet.</p>`;
    $("ar-mine-list").onclick = (e) => {
      const o = e.target.closest("[data-open]"), d = e.target.closest("[data-del]");
      if (o) { const p = loadPlans().find((x) => x.id === o.dataset.open); if (p) { current = p.id; setPlan(p); } }
      if (d) { savePlans(loadPlans().filter((x) => x.id !== d.dataset.del)); if (current === d.dataset.del) current = null; drawMine(); }
    };
  }
  function save() {
    const p = getPlan();
    if (!p.name) { $("ap-name").focus(); SF.toast("Give the plan a name first"); return; }
    const l = loadPlans();
    const i = current ? l.findIndex((x) => x.id === current) : -1;
    // keep fields this page does not show (from plans made on the full version)
    if (i >= 0) l[i] = { ...l[i], ...p, saved: today() };
    else { if (l.length >= MAX) { SF.toast(`You have ${MAX} plans. Delete one first.`); return; } current = `p${Date.now().toString(36)}`; l.unshift({ ...p, id: current, saved: today() }); }
    if (!savePlans(l)) { SF.toast("This browser does not allow saving. Use Copy share link."); return; }
    drawMine(); SF.toast("Plan saved in this browser");
  }
  const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
  async function share() {
    const p = getPlan();
    if (!p.name && !p.state) { SF.toast("Add a name or a place first"); return; }
    const url = `${location.origin}${location.pathname}#plan=${b64(JSON.stringify(p))}`;
    try { await navigator.clipboard.writeText(url); SF.toast("Link copied"); } catch (e) { window.prompt("Copy this link", url); }
  }
  function openShared() {
    const m = location.hash.match(/^#plan=([\w-]+)/); if (!m) return;
    try { setPlan(JSON.parse(unb64(m[1]))); setTimeout(() => $("plan").scrollIntoView({ block: "start" }), 50); SF.toast("Shared plan opened. Save it to keep a copy."); }
    catch (e) { SF.toast("This plan link could not be read"); }
  }

  function drawSources() {
    $("ar-note").innerHTML = `Figures come from different sources and dates: people in need by locality are from ${D.needsYear} (the latest with locality figures), returnees and IDPs from IOM DTM of ${when(D.dtmDates.ret)} and ${when(D.dtmDates.idps)}. Facilities are those mapped in OpenStreetMap; some are missing or not working.`;
    $("ar-src").innerHTML = SRC.map((s, i) => `<li id="src-${s.k}"><span class="abc-src-n">${i + 1}</span><span><a href="${esc(s.url)}" ${/^https?:/.test(s.url) ? 'target="_blank" rel="noopener"' : ""}>${esc(s.title)}</a>. ${esc(s.org)}${s.date ? `, ${s.dl ? `${esc(s.dl)} ` : ""}${esc(when(s.date))}` : ""}.</span></li>`).join("");
  }

  async function init() {
    SF.renderHeader("");
    try {
      const [areas, geo, lg, hub] = await Promise.all([SF.loadJSON("data/abc/areas.json"), SF.loadJSON(SF.config.geoUrl), SF.loadJSON("data/abc/localities-geo.json"), SF.loadJSON(SF.config.dataUrl), SF.loadLogos()]);
      D = areas; GEO = geo; LG = lg; HUB = { lastUpdated: hub.lastUpdated, projects: (hub.projects || []).map(SF.enrich) };
      registerSources(); buildAreas(); drawTop(); drawLayers(); drawMapBase(); paint(); drawTop5(); drawForm(); drawResult(); drawMine(); drawSources(); openShared();
      document.addEventListener("sf-theme", () => paint());
    } catch (e) {
      console.error(e);
      $("main").insertAdjacentHTML("afterbegin", `<p class="card" style="padding:16px">The data for this page could not be loaded. Please refresh the page.</p>`);
    }
    SF.renderFooter(HUB && HUB.lastUpdated);
  }
  init();
})();
