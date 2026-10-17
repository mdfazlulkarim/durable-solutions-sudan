/* Map explorer (Phase 1). Plain JavaScript, no libraries. */
"use strict";

(() => {
  const { CRITERIA, STATES, esc } = SF;
  const NATIONWIDE = "__nationwide";
  const SVGNS = "http://www.w3.org/2000/svg";
  const SEQ = ["#cfe0f5", "#a3c4ec", "#73a5e0", "#4485d2", "#1f5fa8"];
  const RING_R = 21, RING_IN = 13;
  const LABEL_POS = { Khartoum: "left", "Aj Jazirah": "left", "White Nile": "left", Sennar: "right", Gedaref: "right" };

  let ALL = [];
  let GEO = null;
  let LAST_UPDATED = null;

  const state = {
    search: "", criteria: new Set(), itypes: new Set(), orgTypes: new Set(), leadership: new Set(),
    orgName: "", status: new Set(), minShare: 0, includeUnreported: true, groups: new Set(),
    scope: new Set(), donors: new Set(), coord: new Set(),
    time: { mode: "all", from: null, to: null },
    colourBy: "projects",
    selected: null, // null = all of Sudan, NATIONWIDE, or a state name
    showAll: false,
  };

  /* ---------------- filtering ---------------- */
  const has = (arr, v) => Array.isArray(arr) && arr.includes(v);
  const GROUPS = {
    criteria: (p, set) => [...set].some((n) => has(p.criteria, n)),
    itypes: (p, set) => [...set].some((t) => has(p.interventionTypes, t)),
    orgTypes: (p, set) => set.has(p.orgType),
    leadership: (p, set) => [...set].some((l) => has(p.leadership, l)),
    status: (p, set) => [...set].some((s) => (s === "none" ? !p._start && !p._end : p.status === s)),
    groups: (p, set) => [...set].some((g) => p.people && p.people[g] > 0),
    scope: (p, set) => set.has(p.nationwide ? "nationwide" : "states"),
    donors: (p, set) => set.has(p.donor),
    coord: (p, set) => set.has(p.coordination),
  };

  function timeWindow() {
    const t = SF.today, y = t.getFullYear();
    switch (state.time.mode) {
      case "now": return [t, t];
      case "next6": return [t, SF.addMonths(t, 6)];
      case "year": return [new Date(y, 0, 1), new Date(y, 11, 31)];
      case "custom": return [new Date(state.time.from, 0, 1), new Date(state.time.to, 11, 31)];
      default: return null;
    }
  }
  function inWindow(p, w) {
    if (!w) return true;
    if (!p._start && !p._end) return false;
    const s = p._start || new Date(-8e15), e = p._end || new Date(8e15);
    return s <= w[1] && e >= w[0];
  }
  function matchSearch(p, q) {
    if (!q) return true;
    const hay = [p.name, p.lead, ...p.partners, p.donor, ...(p.states || []), ...(p.localities || []), p.remarks, p.coordination, p.description]
      .filter(Boolean).join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }
  function passes(p, except) {
    if (except !== "search" && !matchSearch(p, state.search)) return false;
    for (const g of Object.keys(GROUPS)) {
      if (g === except) continue;
      if (state[g].size && !GROUPS[g](p, state[g])) return false;
    }
    if (except !== "orgName" && state.orgName) {
      const q = state.orgName.toLowerCase();
      if (!p._orgs.some((o) => o.toLowerCase().includes(q))) return false;
    }
    if (except !== "minShare") {
      if (p.share == null) { if (!state.includeUnreported) return false; }
      else if (p.share * 100 < state.minShare) return false;
    }
    if (except !== "time" && !inWindow(p, timeWindow())) return false;
    return true;
  }
  const filtered = (except) => ALL.filter((p) => passes(p, except));

  /* ---------------- aggregation ---------------- */
  function emptyAgg() { return { projects: [], orgs: new Set(), funding: 0, fundingN: 0, crit: Array(9).fill(0), soon: 0 }; }
  function addTo(a, p, share = 1) {
    a.projects.push(p);
    p._orgs.forEach((o) => a.orgs.add(o));
    if (p.dsFunding != null) { a.funding += p.dsFunding * share; a.fundingN++; }
    p.criteria.forEach((c) => a.crit[c]++);
    if (p._endingSoon) a.soon++;
  }
  function aggregate(list) {
    const per = {};
    STATES.forEach((s) => (per[s] = emptyAgg()));
    for (const p of list) {
      if (p.nationwide) continue;
      const n = p.states.length || 1;
      for (const s of p.states) if (per[s]) addTo(per[s], p, 1 / n);
    }
    return per;
  }
  function aggOf(list) { const a = emptyAgg(); list.forEach((p) => addTo(a, p)); return a; }
  function valueOf(a) {
    if (state.colourBy === "orgs") return a.orgs.size;
    if (state.colourBy === "funding") return a.funding;
    return a.projects.length;
  }
  function niceStep(raw, money) {
    if (raw <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
    return money ? step : Math.max(1, Math.round(step));
  }
  function bins(max) {
    const money = state.colourBy === "funding";
    if (!money && max <= 5) {
      const out = [];
      for (let i = 1; i <= Math.max(max, 1); i++) out.push({ lo: i, hi: i, label: `${i}` });
      return out;
    }
    const step = niceStep(max / 5, money);
    const out = [];
    for (let i = 0; i < 5; i++) {
      const lo = money ? i * step : i * step + 1;
      const hi = (i + 1) * step;
      if (!money && lo > max) break;
      if (money && lo >= max && i > 0) break;
      const f = (v) => (money ? SF.fmtMoney(v, { round: true }) : SF.fmtInt(v));
      out.push({ lo, hi, label: money ? (i === 0 ? `Up to ${f(hi)}` : `${f(lo)} to ${f(hi)}`) : lo === hi ? `${lo}` : `${lo}-${hi}` });
    }
    return out;
  }
  function binColour(v, bs) {
    if (!(v > 0)) return "var(--map-none)";
    let idx = bs.findIndex((b) => v <= b.hi);
    if (idx < 0) idx = bs.length - 1;
    const offset = Math.max(0, SEQ.length - bs.length);
    return SEQ[Math.min(SEQ.length - 1, idx + offset)];
  }

  /* ---------------- filter panel ---------------- */
  function optionLists() {
    const count = (fn) => {
      const m = new Map();
      ALL.forEach((p) => fn(p).forEach((v) => v && m.set(v, (m.get(v) || 0) + 1)));
      return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map((e) => e[0]);
    };
    return {
      criteria: CRITERIA.map((c) => ({ v: c.n, label: c.short, crit: c })),
      itypes: SF.INTERVENTION_TYPES.map((t) => ({ v: t, label: t })),
      orgTypes: SF.ORG_TYPES.map((o) => ({ v: o.key, label: o.label })),
      leadership: SF.LEADERSHIP.map((o) => ({ v: o.key, label: o.label })),
      status: [{ v: "Ongoing", label: "Ongoing" }, { v: "Pipeline", label: "Pipeline" }, { v: "Ended", label: "Ended" }, { v: "none", label: "No dates reported" }],
      groups: SF.TARGET_GROUPS.map((g) => ({ v: g.key, label: g.label })),
      scope: [{ v: "nationwide", label: "Nationwide" }, { v: "states", label: "One or more states" }],
      donors: count((p) => [p.donor]).map((d) => ({ v: d, label: d })),
      coord: count((p) => [p.coordination]).map((d) => ({ v: d, label: d })),
    };
  }
  const GROUP_META = [
    { key: "criteria", title: "IASC criteria", open: true },
    { key: "itypes", title: "Intervention type", open: true, note: "Not yet reported for current projects. New submissions include it." },
    { key: "orgTypes", title: "Organisation", open: true, orgName: true },
    { key: "leadership", title: "Organisation leadership", open: false, note: "For national NGOs and other organisations, as reported by them." },
    { key: "status", title: "Status", open: true, note: "Status follows the dates: a project whose end date has passed shows as ended." },
    { key: "groups", title: "Target group", open: false, note: "Groups with at least one person planned or reached." },
    { key: "scope", title: "Geographic scope", open: false },
    { key: "donors", title: "Donor", open: false },
    { key: "coord", title: "Coordination mechanism", open: false },
  ];
  let OPTS = null;

  function buildFilterPanel() {
    OPTS = optionLists();
    const host = document.getElementById("filter-groups");
    host.innerHTML = GROUP_META.map((g) => {
      const opts = OPTS[g.key].map((o, i) => {
        const id = `f-${g.key}-${i}`;
        const sw = o.crit ? `<span class="sw" title="${o.crit.n}. ${esc(o.crit.name)}">${SF.critIcon(o.crit.n, o.crit.color)}</span>` : "";
        return `<label class="opt${o.crit ? "" : " no-sw"}" for="${id}">
          <input type="checkbox" id="${id}" data-g="${g.key}" data-v="${esc(o.v)}">
          ${sw}<span>${o.crit ? `<span class="cn">${o.crit.n}</span>` : ""}${esc(o.label)}</span><span class="num" data-count></span>
        </label>`;
      }).join("");
      const orgName = g.orgName
        ? `<label class="field-label" for="f-org" style="margin-top:10px;font-weight:400;color:var(--ink-2);font-size:13.5px">Lead organisation or implementing partner</label>
           <input class="input" id="f-org" type="search" list="org-list" placeholder="Type to search, for example IOM" autocomplete="off">
           <datalist id="org-list">${[...new Set(ALL.flatMap((p) => p._orgs))].sort().map((o) => `<option value="${esc(o)}">`).join("")}</datalist>`
        : "";
      return `<details class="filter-group"${g.open ? " open" : ""}>
        <summary>${g.title}</summary>
        <div class="options">${opts}</div>${orgName}
        ${g.note ? `<p class="group-note">${g.note}</p>` : ""}
      </details>`;
    }).join("");

    host.addEventListener("change", (e) => {
      const t = e.target;
      if (t.matches("input[type=checkbox][data-g]")) {
        const g = t.dataset.g;
        const v = g === "criteria" ? Number(t.dataset.v) : t.dataset.v;
        t.checked ? state[g].add(v) : state[g].delete(v);
        render();
      }
    });
    const share = document.getElementById("f-share");
    share.addEventListener("input", () => { state.minShare = Number(share.value); render(); });
    document.getElementById("f-share-unreported").addEventListener("change", (e) => { state.includeUnreported = e.target.checked; render(); });
    const org = document.getElementById("f-org");
    org.addEventListener("input", debounce(() => { state.orgName = org.value.trim(); render(); }, 200));
    const search = document.getElementById("f-search");
    search.addEventListener("input", debounce(() => { state.search = search.value.trim(); render(); }, 200));
    document.getElementById("clear-all").addEventListener("click", clearAll);
  }

  function updateFilterCounts() {
    for (const g of Object.keys(GROUPS)) {
      const base = filtered(g);
      document.querySelectorAll(`input[data-g="${g}"]`).forEach((input) => {
        const v = g === "criteria" ? Number(input.dataset.v) : input.dataset.v;
        const n = base.filter((p) => GROUPS[g](p, new Set([v]))).length;
        const label = input.closest(".opt");
        label.querySelector("[data-count]").textContent = n;
        label.classList.toggle("is-empty", n === 0 && !input.checked);
        input.checked = state[g].has(v);
      });
    }
    document.getElementById("f-share").value = state.minShare;
    document.getElementById("f-share-out").textContent = `${state.minShare}%`;
    document.getElementById("f-share-unreported").checked = state.includeUnreported;
    document.getElementById("f-org").value = state.orgName;
    document.getElementById("f-search").value = state.search;
  }

  function clearAll() {
    state.search = ""; state.orgName = ""; state.minShare = 0; state.includeUnreported = true;
    Object.keys(GROUPS).forEach((g) => state[g].clear());
    state.time = { mode: "all", from: null, to: null };
    render();
  }

  /* ---------------- active filter tags ---------------- */
  function timeLabel() {
    const m = state.time.mode, y = SF.today.getFullYear();
    if (m === "now") return "Active now";
    if (m === "next6") return "Next 6 months";
    if (m === "year") return `${y}`;
    if (m === "custom") return state.time.from === state.time.to ? `${state.time.from}` : `${state.time.from} to ${state.time.to}`;
    return "All years";
  }
  function renderTags() {
    const tags = [];
    const labelOf = (g, v) => (OPTS[g].find((o) => o.v === v) || { label: v }).label;
    if (state.search) tags.push({ label: `Search: "${state.search}"`, clear: () => (state.search = "") });
    for (const g of Object.keys(GROUPS)) {
      state[g].forEach((v) => tags.push({ label: g === "criteria" ? `${v}. ${labelOf(g, v)}` : labelOf(g, v), clear: () => state[g].delete(v) }));
    }
    if (state.orgName) tags.push({ label: `Organisation: ${state.orgName}`, clear: () => (state.orgName = "") });
    if (state.minShare > 0) tags.push({ label: `At least ${state.minShare}% towards durable solutions`, clear: () => (state.minShare = 0) });
    if (!state.includeUnreported) tags.push({ label: "Share reported", clear: () => (state.includeUnreported = true) });
    const el = document.getElementById("showing");
    el.innerHTML = `<span>Showing</span>`;
    const timeTag = document.createElement("span");
    timeTag.className = "tag";
    timeTag.innerHTML = `${esc(timeLabel())}${state.time.mode !== "all" ? '<button type="button" aria-label="Remove time window">&times;</button>' : ""}`;
    if (state.time.mode === "all") timeTag.style.paddingRight = "12px";
    timeTag.querySelector("button")?.addEventListener("click", () => { state.time = { mode: "all" }; render(); });
    el.appendChild(timeTag);
    tags.forEach((t) => {
      const s = document.createElement("span");
      s.className = "tag";
      s.innerHTML = `${esc(t.label)}<button type="button" aria-label="Remove filter: ${esc(t.label)}">&times;</button>`;
      s.querySelector("button").addEventListener("click", () => { t.clear(); render(); });
      el.appendChild(s);
    });
    const hint = document.createElement("span");
    hint.textContent = "Click a state for details";
    el.appendChild(hint);
  }

  /* ---------------- KPIs ---------------- */
  function renderKPIs(list, per) {
    const st = { Ongoing: 0, Pipeline: 0, Ended: 0, none: 0 };
    list.forEach((p) => (p.status && st[p.status] != null ? st[p.status]++ : st.none++));
    const leads = new Set(list.map((p) => p.lead).filter(Boolean));
    const partners = new Set(list.flatMap((p) => p.partners).filter((o) => !leads.has(o)));
    const covered = STATES.filter((s) => per[s].projects.length).length;
    const nationwide = list.filter((p) => p.nationwide).length;
    const fundingList = list.filter((p) => p.dsFunding != null);
    const ds = fundingList.reduce((a, p) => a + p.dsFunding, 0);
    const budget = list.reduce((a, p) => a + (p.budget || 0), 0);
    const soon = list.filter((p) => p._endingSoon).length;
    const statusParts = [`${st.Ongoing} ongoing`, `${st.Pipeline} pipeline`, `${st.Ended} ended`];
    if (st.none) statusParts.push(`${st.none} with no status`);
    const cards = [
      { l: "Projects", v: SF.fmtInt(list.length), s: statusParts.join(", ") },
      { l: "Organisations", v: SF.fmtInt(leads.size + partners.size), s: `${leads.size} lead organisation${leads.size === 1 ? "" : "s"}, plus ${partners.size} implementing partner${partners.size === 1 ? "" : "s"}` },
      { l: "States covered", v: `${covered} of 18`, s: `plus ${nationwide} nationwide project${nationwide === 1 ? "" : "s"}` },
      { l: "DS funding", v: SF.fmtMoney(ds) || "$0", s: `of ${SF.fmtMoney(budget) || "$0"} total budgets. ${fundingList.length} of ${list.length} projects report an amount` },
      { l: "Ending within 6 months", v: SF.fmtInt(soon), s: `end by ${SF.fmtMonth(SF.addMonths(SF.today, 6))}` },
    ];
    document.getElementById("kpis").innerHTML = cards.map((c) => `
      <div class="card kpi"><div class="kpi-label">${c.l}</div><div class="kpi-value">${c.v}</div><div class="kpi-sub">${c.s}</div></div>`).join("");
  }

  /* ---------------- map ---------------- */
  function el(name, attrs = {}, parent) {
    const n = document.createElementNS(SVGNS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  }
  function arcPath(r0, r1, a0, a1) {
    const p = (r, a) => [r * Math.cos(a), r * Math.sin(a)].map((v) => v.toFixed(2)).join(" ");
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${p(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)}Z`;
  }
  function drawRing(g, crit, total, r1 = RING_R, r0 = RING_IN) {
    g.innerHTML = "";
    el("circle", { r: r1 + 1.5, style: "fill:var(--ring-bg)", opacity: 0.95 }, g);
    const seg = (Math.PI * 2) / 8, pad = 0.05;
    CRITERIA.forEach((c, i) => {
      const a0 = -Math.PI / 2 + i * seg + pad, a1 = -Math.PI / 2 + (i + 1) * seg - pad;
      el("path", { d: arcPath(r0, r1, a0, a1), style: `fill:${crit[c.n] > 0 ? c.color : "var(--gap)"}` }, g);
    });
    el("circle", { r: r0 - 0.5, style: "fill:var(--ring-bg)" }, g);
    const t = el("text", { class: "ring-num" }, g);
    t.textContent = total;
  }

  const mapNodes = {};
  let gZoom = null, VB = null;
  function buildMap() {
    const svg = document.getElementById("map");
    VB = [0, 0, GEO.width, GEO.height];
    svg.setAttribute("viewBox", VB.join(" "));
    const defs = el("defs", {}, svg);
    const pat = el("pattern", { id: "hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    el("rect", { width: 6, height: 6, style: "fill:var(--hatch-b)" }, pat);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 6, style: "stroke:var(--hatch-a)", "stroke-width": 2 }, pat);

    el("rect", { class: "water", x: -2000, y: -2000, width: GEO.width + 4000, height: GEO.height + 4000 }, svg);
    const gLand = el("g", {}, svg);
    GEO.land.forEach((c) => el("path", { d: c.path, class: "land" }, gLand));
    const gCountryLbl = el("g", {}, svg);
    GEO.labels.forEach((l) => {
      const t = el("text", { x: l.x, y: l.y, class: "country-lbl", "text-anchor": l.anchor || "middle" }, gCountryLbl);
      t.textContent = l.name;
    });
    const gStates = el("g", {}, svg);
    if (GEO.undeterminedBoundary) el("path", { d: GEO.undeterminedBoundary, class: "border-undetermined" }, svg);
    const gRings = el("g", {}, svg);
    const gLabels = el("g", {}, svg);
    gZoom = el("g", {}, svg);
    if (GEO.abyei) {
      el("path", { d: GEO.abyei.path, class: "abyei" }, gStates);
      const t = el("text", { x: GEO.abyei.x, y: GEO.abyei.y + 22, class: "lbl lbl-abyei", "text-anchor": "middle", "font-size": 11 }, gLabels);
      t.textContent = "Abyei";
      mapNodes.__abyeiLabel = t;
    }
    GEO.states.forEach((s) => {
      const path = el("path", { d: s.path, class: "state", tabindex: 0, role: "button", "data-state": s.name }, gStates);
      const ring = el("g", { class: "ring", "data-state": s.name }, gRings);
      const label = el("text", { class: "lbl" }, gLabels);
      label.textContent = s.name;
      mapNodes[s.name] = { path, ring, label, s };
      const pick = () => selectState(s.name);
      [path, ring].forEach((n) => {
        n.addEventListener("click", pick);
        n.addEventListener("mousemove", (e) => showTip(e, s.name));
        n.addEventListener("mouseleave", hideTip);
      });
      path.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      path.addEventListener("focus", () => showTip(null, s.name));
      path.addEventListener("blur", hideTip);
    });

    const sample = document.getElementById("ring-sample");
    const sg = el("g", {}, sample);
    drawRing(sg, [0, 3, 5, 2, 0, 1, 0, 1, 0], 7, 21, 13);
    document.getElementById("crit-keys").innerHTML = CRITERIA.map((c) => `<span>${SF.critIcon(c.n, c.color)}<b>${c.n}</b> ${c.ring}</span>`).join("");
    document.getElementById("map-back").innerHTML = `${SF.icons.back}Back to all of Sudan`;
    document.getElementById("map-back").addEventListener("click", () => selectState(null));
  }

  /* zoom: animate the viewBox towards a state, or back to the whole map */
  let zoomAnim = null;
  function targetViewBox() {
    const W = GEO.width, H = GEO.height;
    if (!state.selected || state.selected === NATIONWIDE) return [0, 0, W, H];
    const s = mapNodes[state.selected].s;
    const [x0, y0, x1, y1] = s.bbox;
    const bw = x1 - x0, bh = (y1 - y0) + 150; // room for the agency badges
    let w = Math.max(bw * 1.5, bh * 1.35 * (W / H), 300);
    w = Math.min(w, W);
    const h = w * (H / W);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + 40;
    return [cx - w / 2, cy - h / 2, w, h];
  }
  function animateTo(target) {
    if (zoomAnim) cancelAnimationFrame(zoomAnim);
    const svg = document.getElementById("map");
    const from = VB.slice(), t0 = performance.now(), dur = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 480;
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const step = (now) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      VB = from.map((v, i) => v + (target[i] - v) * ease(k));
      svg.setAttribute("viewBox", VB.join(" "));
      placeOverlays();
      if (k < 1) zoomAnim = requestAnimationFrame(step);
    };
    zoomAnim = requestAnimationFrame(step);
  }
  const scaleK = () => GEO.width / VB[2];

  /* rings, labels and badges keep the same size on screen at any zoom */
  function placeOverlays() {
    const k = scaleK();
    const zoomed = state.selected && state.selected !== NATIONWIDE;
    STATES.forEach((name) => {
      const node = mapNodes[name];
      if (!node) return;
      const { x, y } = node.s;
      const n = PER ? PER[name].projects.length : 0;
      node.ring.setAttribute("transform", `translate(${x} ${y}) scale(${1 / k})`);
      const L = node.label;
      const pos = n > 0 ? LABEL_POS[name] || "below" : "center";
      const off = (RING_R + 5) / k;
      L.setAttribute("font-size", 11.5 / k);
      L.style.strokeWidth = `${3 / k}px`;
      if (pos === "left") { L.setAttribute("x", x - off); L.setAttribute("y", y + 4 / k); L.setAttribute("text-anchor", "end"); }
      else if (pos === "right") { L.setAttribute("x", x + off); L.setAttribute("y", y + 4 / k); L.setAttribute("text-anchor", "start"); }
      else if (pos === "below") { L.setAttribute("x", x); L.setAttribute("y", y + (RING_R + 13) / k); L.setAttribute("text-anchor", "middle"); }
      else { L.setAttribute("x", x); L.setAttribute("y", y + 4 / k); L.setAttribute("text-anchor", "middle"); }
      const isSel = zoomed && name === state.selected;
      node.ring.style.display = n > 0 && !isSel ? "" : "none";
      node.label.style.display = isSel ? "none" : "";
      node.label.classList.toggle("is-dim", zoomed && !isSel);
      if (zoomed && !isSel) node.ring.style.display = "none";
    });
    if (mapNodes.__abyeiLabel) { mapNodes.__abyeiLabel.setAttribute("font-size", 11 / k); mapNodes.__abyeiLabel.style.strokeWidth = `${3 / k}px`; }
    document.querySelectorAll("#map .country-lbl").forEach((t) => t.setAttribute("font-size", 11 / k));
    if (gZoom.firstChild && zoomed) {
      const s = mapNodes[state.selected].s;
      gZoom.firstChild.setAttribute("transform", `translate(${s.x} ${s.y}) scale(${1 / k})`);
    }
  }

  function agenciesIn(projects) {
    const m = new Map();
    projects.forEach((p) => { if (p.lead) m.set(p.lead, (m.get(p.lead) || []).concat(p)); });
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  }

  function renderZoomLayer() {
    gZoom.innerHTML = "";
    if (!state.selected || state.selected === NATIONWIDE) return;
    const name = state.selected, a = PER[name];
    const g = el("g", {}, gZoom);
    const title = el("text", { class: "zoom-title", y: -RING_R - 12, "font-size": 16 }, g);
    title.textContent = name;
    if (a.projects.length) {
      const ring = el("g", { class: "ring" }, g);
      drawRing(ring, a.crit, a.projects.length, 26, 16);
      ring.querySelector("text").setAttribute("font-size", 15);
    } else {
      const t = el("text", { class: "zoom-hint", y: 4, "font-size": 12.5 }, g);
      t.textContent = "No projects reported here with the current filters";
    }
    const ags = agenciesIn(a.projects);
    if (!ags.length) return;
    const size = 40, gap = 10, total = ags.length * size + (ags.length - 1) * gap;
    const row = el("g", { transform: `translate(${-total / 2 + size / 2} ${RING_R + 42})` }, g);
    const hint = el("text", { class: "zoom-hint", x: total / 2 - size / 2, y: size / 2 + 18, "font-size": 11 }, row);
    hint.textContent = "Select an agency to see its projects";
    ags.forEach(([org, list], i) => {
      const chip = el("g", { class: "agency-chip", transform: `translate(${i * (size + gap)} 0)`, tabindex: 0, role: "button", "aria-label": `${org}: ${list.length} project${list.length === 1 ? "" : "s"} in ${name}` }, row);
      const ttl = el("title", {}, chip); ttl.textContent = `${org}: ${list.length} project${list.length === 1 ? "" : "s"}`;
      el("circle", { class: "chip-bg", r: size / 2 }, chip);
      const logo = SF.LOGOS[org];
      if (logo) {
        const im = el("image", { href: logo.mark, x: -13, y: -13, width: 26, height: 26, preserveAspectRatio: "xMidYMid meet" }, chip);
        im.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", logo.mark);
      } else {
        const t = el("text", { class: "chip-text" }, chip); t.textContent = org.slice(0, 6);
      }
      el("circle", { class: "chip-badge", cx: size / 2 - 4, cy: -size / 2 + 4, r: 8 }, chip);
      const bt = el("text", { class: "chip-badge-t", x: size / 2 - 4, y: -size / 2 + 4 }, chip);
      bt.textContent = list.length;
      const open = () => openAgency(org, list, name);
      chip.addEventListener("click", open);
      chip.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }

  let PER = null;
  function renderMap(per) {
    const values = STATES.map((s) => valueOf(per[s]));
    const max = Math.max(0, ...values);
    const bs = bins(max);
    const zoomed = state.selected && state.selected !== NATIONWIDE;
    STATES.forEach((name) => {
      const node = mapNodes[name];
      if (!node) return;
      const a = per[name], n = a.projects.length;
      node.path.style.fill = binColour(valueOf(a), bs);
      node.path.classList.toggle("is-selected", state.selected === name);
      node.path.classList.toggle("is-dim", zoomed && state.selected !== name);
      node.path.setAttribute("aria-label", `${name}: ${n} project${n === 1 ? "" : "s"}, ${a.orgs.size} organisations`);
      if (n > 0) drawRing(node.ring, a.crit, n);
    });
    renderZoomLayer();
    placeOverlays();
    const target = targetViewBox();
    if (target.some((v, i) => Math.abs(v - VB[i]) > 0.5)) animateTo(target);
    const back = document.getElementById("map-back");
    back.hidden = !zoomed;

    const titles = { projects: "Number of projects", orgs: "Number of organisations", funding: "DS funding (USD)" };
    document.getElementById("legend-title").textContent = titles[state.colourBy];
    const offset = Math.max(0, SEQ.length - bs.length);
    const noneLabel = state.colourBy === "funding" ? "No funding reported" : "No projects reported";
    document.getElementById("legend-bins").innerHTML =
      bs.map((b, i) => `<span><i style="background:${SEQ[i + offset]}"></i>${b.label}</span>`).join("") +
      `<span><i style="background:var(--map-none);border:1px solid var(--line-2)"></i>${noneLabel}</span>`;
  }

  const tip = () => document.getElementById("map-tip");
  function showTip(e, name) {
    const a = PER[name];
    const t = tip();
    t.innerHTML = `<strong>${esc(name)}</strong>${a.projects.length} project${a.projects.length === 1 ? "" : "s"}, ${a.orgs.size} organisation${a.orgs.size === 1 ? "" : "s"}<br>DS funding: ${a.fundingN ? SF.fmtMoney(a.funding) : "not reported"}`;
    const wrap = document.getElementById("map-wrap").getBoundingClientRect();
    let x, y;
    if (e) { x = e.clientX - wrap.left; y = e.clientY - wrap.top; }
    else {
      const s = mapNodes[name].s, svg = document.getElementById("map").getBoundingClientRect();
      x = ((s.x - VB[0]) / VB[2]) * svg.width; y = ((s.y - VB[1]) / VB[3]) * svg.height - RING_R;
    }
    t.style.left = `${Math.max(90, Math.min(wrap.width - 90, x))}px`;
    t.style.top = `${Math.max(60, y)}px`;
    t.hidden = false;
  }
  function hideTip() { tip().hidden = true; }

  function renderNationwideBand(list) {
    const nw = list.filter((p) => p.nationwide);
    const leads = new Set(nw.map((p) => p.lead));
    const band = document.getElementById("nationwide-band");
    band.innerHTML = `${SF.icons.globe}<span class="grow"><strong>${nw.length} nationwide project${nw.length === 1 ? "" : "s"}</strong> ${nw.length === 1 ? "is" : "are"} not tied to one state, so ${nw.length === 1 ? "it is" : "they are"} listed here instead of being painted on every state.${nw.length ? ` Led by ${leads.size} organisation${leads.size === 1 ? "" : "s"}.` : ""}</span>
      ${nw.length ? '<button type="button" class="link-btn" id="nw-view">View list</button>' : ""}`;
    band.querySelector("#nw-view")?.addEventListener("click", () => selectState(NATIONWIDE, true));
  }

  /* ---------------- side panel ---------------- */
  function selectState(name, scroll) {
    state.selected = name;
    state.showAll = false;
    render();
    if (scroll || (name && window.innerWidth < 1280)) document.getElementById("state-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function statusChip(p) {
    if (p._endingSoon) return `<span class="chip soon">Ends ${SF.fmtMonth(p._end)}</span>`;
    if (!p.status) return "";
    return `<span class="chip ${p.status.toLowerCase()}">${p.status}</span>`;
  }
  function progressPct(p) {
    if (!p._start || !p._end) return null;
    return Math.max(0, Math.min(1, (SF.today - p._start) / (p._end - p._start)));
  }
  function progress(p) {
    const pct = progressPct(p);
    return pct == null ? "" : `<div class="progress" aria-hidden="true"><i style="width:${(pct * 100).toFixed(0)}%"></i></div>`;
  }
  function critDots(p) {
    return `<span class="crit-dots" aria-label="IASC criteria ${p.criteria.join(", ")}">${CRITERIA.map((c) => `<i style="background:${p.criteria.includes(c.n) ? c.color : "var(--gap)"}"></i>`).join("")}</span>`;
  }
  function dateRange(p) {
    return p._start || p._end ? `${SF.fmtMonth(p._start)}${p._start && p._end ? " to " : ""}${SF.fmtMonth(p._end)}` : "";
  }
  function projectCard(p) {
    const funding = p.dsFunding != null
      ? `<div class="f">${SF.fmtMoney(p.dsFunding)} towards durable solutions${p.share != null ? ` (${SF.fmtPct(p.share)} of budget)` : ""}</div>` : "";
    return `<button type="button" class="proj-card" data-id="${esc(p.id)}">
      <div class="t">${esc(p.name)}</div>
      <div class="o">${esc(p.lead)}${p.partners.length ? ` with ${esc(p.partners.join(", "))}` : ""}</div>
      <div class="d">${dateRange(p) ? `<span>${dateRange(p)}</span>` : ""}${statusChip(p)}${critDots(p)}</div>
      ${progress(p)}${funding}
    </button>`;
  }
  const ORDER = { Ongoing: 0, Pipeline: 1, null: 2, Ended: 3 };
  function sortForPanel(list) {
    return [...list].sort((a, b) => {
      const oa = ORDER[a.status] ?? 2, ob = ORDER[b.status] ?? 2;
      if (oa !== ob) return oa - ob;
      const ea = a._end ? a._end.getTime() : Infinity, eb = b._end ? b._end.getTime() : Infinity;
      return oa === 3 ? eb - ea : ea - eb;
    });
  }
  function orgTypeRows(projects) {
    const types = new Map();
    projects.forEach((p) => {
      if (p.lead) types.set(p.lead, types.get(p.lead) || p.orgType || "Type not reported");
      p.partners.forEach((o, i) => { if (!types.has(o)) types.set(o, p.partnerTypes[i] || "Type not reported"); });
    });
    const counts = {};
    types.forEach((t) => (counts[t] = (counts[t] || 0) + 1));
    const rows = SF.ORG_TYPES.map((o) => ({ l: o.label, n: counts[o.key] || 0 }));
    if (counts["Type not reported"]) rows.push({ l: "Type not reported", n: counts["Type not reported"] });
    return rows;
  }
  function agencyButtons(projects, area) {
    const ags = agenciesIn(projects);
    if (!ags.length) return "";
    return `<div class="sp-section">Lead agencies<small>Select one to see its projects</small></div>
      <div class="agency-row">${ags.map(([org, list]) => `<button type="button" class="agency-btn" data-org="${esc(org)}"><span class="lg">${SF.logoImg(org)}</span><b>${esc(org)}</b><em>${list.length}</em></button>`).join("")}</div>`;
  }

  function renderPanel(list, per) {
    const panel = document.getElementById("state-panel");
    const sel = state.selected;
    const isNW = sel === NATIONWIDE, isAll = !sel;
    const name = isAll ? "All of Sudan" : isNW ? "Nationwide" : sel;
    const projects = isAll ? list : isNW ? list.filter((p) => p.nationwide) : per[sel].projects;
    const a = isAll || isNW ? aggOf(projects) : per[sel];
    const orgRows = orgTypeRows(projects);
    const orgMax = Math.max(1, ...orgRows.map((r) => r.n));
    const critMax = Math.max(1, ...a.crit);
    const sorted = sortForPanel(projects);
    const shown = state.showAll ? sorted : sorted.slice(0, 3);
    const options = [`<option value=""${isAll ? " selected" : ""}>All of Sudan</option>`, `<option value="${NATIONWIDE}"${isNW ? " selected" : ""}>Nationwide</option>`]
      .concat(STATES.map((s) => `<option${s === sel ? " selected" : ""}>${s}</option>`)).join("");
    const kicker = isAll ? "Overview" : isNW ? "Not tied to one state" : "Selected state";

    panel.innerHTML = `
      <div class="sp-head">
        <div><div class="sp-kicker">${kicker}</div><h2 class="sp-name">${esc(name)}</h2></div>
        <div class="sp-select"><label for="sp-change">Change area</label><select id="sp-change">${options}</select></div>
      </div>
      <div class="mini-kpis">
        <div class="mini"><div class="l">Projects</div><div class="v">${projects.length}</div></div>
        <div class="mini"><div class="l">Organisations</div><div class="v">${a.orgs.size}</div></div>
        <div class="mini"><div class="l">DS funding</div><div class="v${a.fundingN ? "" : " small"}">${a.fundingN ? SF.fmtMoney(a.funding) : "None reported"}</div></div>
      </div>
      ${a.soon ? `<div class="alert-soon">${SF.icons.clock}${a.soon} project${a.soon === 1 ? "" : "s"} end${a.soon === 1 ? "s" : ""} within 6 months</div>` : ""}
      ${projects.length === 0 ? `<p class="empty-note">No projects reported here with the current filters. Every IASC criterion is a gap.</p>` : ""}
      ${agencyButtons(projects, name)}
      <div class="sp-section">Organisations here, by type</div>
      ${orgRows.map((r) => `<div class="bar-row"><span>${r.l}</span><span class="bar"><i style="width:${(r.n / orgMax) * 100}%;background:var(--brand)"></i></span><span class="n">${r.n}</span></div>`).join("")}
      <div class="sp-section">IASC criteria covered</div>
      ${CRITERIA.map((c) => `<div class="bar-row crit" title="${c.n}. ${esc(c.name)}">${SF.critIcon(c.n, c.color)}<span>${c.n}. ${c.short}</span>
          <span class="bar${a.crit[c.n] ? "" : " is-gap"}">${a.crit[c.n] ? `<i style="width:${(a.crit[c.n] / critMax) * 100}%;background:${c.color}"></i>` : ""}</span>
          <span class="n">${a.crit[c.n] || '<span class="gap-word">gap</span>'}</span></div>`).join("")}
      ${projects.length ? `<div class="sp-section">${state.showAll ? `All projects: ${esc(name)}` : "Projects ending soonest"}<small>Select a project for details</small></div>
      <div id="sp-cards">${shown.map(projectCard).join("")}</div>
      ${sorted.length > 3 ? `<div class="panel-more"><button type="button" class="link-btn" id="sp-more">${state.showAll ? "Show fewer" : `View all ${sorted.length} projects`}</button></div>` : ""}` : ""}`;

    panel.querySelector("#sp-change").addEventListener("change", (e) => selectState(e.target.value || null));
    panel.querySelector("#sp-more")?.addEventListener("click", () => { state.showAll = !state.showAll; render(); });
    panel.querySelectorAll(".proj-card").forEach((b) => b.addEventListener("click", () => openDetail(b.dataset.id)));
    panel.querySelectorAll(".agency-btn").forEach((b) => b.addEventListener("click", () => {
      const org = b.dataset.org;
      openAgency(org, projects.filter((p) => p.lead === org), name);
    }));
  }

  /* ---------------- dialogs ---------------- */
  function openModal(d) {
    if (!d.open) d.showModal();
    d.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => d.close()));
    d.onclick = (e) => { if (e.target === d) d.close(); };
  }

  function openAgency(org, list, area) {
    const d = document.getElementById("agency");
    const logo = SF.LOGOS[org];
    const sorted = sortForPanel(list);
    d.innerHTML = `
      <button type="button" class="modal-close" aria-label="Close" data-close>&times;</button>
      <div class="modal-scroll">
        <div class="agency-modal-head">
          <div class="logo-box">${SF.logoImg(org, "full")}</div>
          <div><h2 id="agency-title">${esc(logo ? logo.name : org)}</h2><p>${list.length} project${list.length === 1 ? "" : "s"} in ${esc(area)}, with the current filters</p></div>
        </div>
        <div class="agency-modal-body">${sorted.map(projectCard).join("")}</div>
        <div class="pop-nudge">Is your organisation working on durable solutions here? <a href="add.html">Add your project</a>.</div>
      </div>`;
    d.querySelectorAll(".proj-card").forEach((b) => b.addEventListener("click", () => { d.close(); openDetail(b.dataset.id); }));
    openModal(d);
  }

  function miniMap(p) {
    const on = new Set(p.states);
    return `<svg class="mini-map" viewBox="40 14 780 680" role="img" aria-label="${esc(p.nationwide ? "Nationwide" : p.states.join(", "))}">
      <rect class="bg" x="0" y="0" width="${GEO.width}" height="${GEO.height}"/>
      ${GEO.states.map((s) => `<path d="${s.path}" class="${p.nationwide || on.has(s.name) ? "on" : ""}"/>`).join("")}
    </svg>`;
  }

  function openDetail(id, opts = {}) {
    const p = ALL.find((x) => x.id === id);
    if (!p) return;
    const d = document.getElementById("detail");
    const logo = SF.LOGOS[p.lead];
    const photos = p.photos || [];
    const hero = photos.length
      ? `<img class="photo" src="${esc(photos[0])}" alt="Photo of ${esc(p.name)}">${photos.length > 1 ? `<button type="button" class="nav prev" aria-label="Previous photo">&#8249;</button><button type="button" class="nav next" aria-label="Next photo">&#8250;</button><div class="dots">${photos.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>` : ""}`
      : `<div class="logo-hero"><div class="logo-card">${SF.logoImg(p.lead, "full")}</div></div>`;
    const figs = [];
    if (p.dsFunding != null) figs.push({ ico: SF.icon("fund"), l: "Towards durable solutions", v: SF.fmtMoney(p.dsFunding), s: p.budget != null ? `of ${SF.fmtMoney(p.budget)} total budget` : "" });
    if (p.share != null) figs.push({ ico: SF.icon("fund"), l: "Share of budget", v: SF.fmtPct(p.share), s: "self-assessed" });
    if (p.people.total != null) figs.push({ ico: SF.icon("people"), l: "People reached, planned", v: SF.fmtInt(p.people.total), s: "" });
    if (p._start || p._end) {
      const pct = progressPct(p);
      figs.push({ ico: SF.icon("calendar"), l: "Dates", v: dateRange(p), s: pct != null ? `<div class="progress"><i style="width:${(pct * 100).toFixed(0)}%"></i></div>` : "" });
    }
    const groupMax = Math.max(1, ...SF.TARGET_GROUPS.map((g) => p.people[g.key] || 0));
    const groups = SF.TARGET_GROUPS.filter((g) => p.people[g.key] > 0);
    const details = [
      ["Donor or funding source", esc(p.donor)],
      ["Coordination mechanism", esc(p.coordination)],
      ["Intervention type", esc(p.interventionTypes.join(", "))],
      ["Organisation leadership", esc(p.leadership.map((k) => (SF.LEADERSHIP.find((x) => x.key === k) || { label: k }).label).join(", "))],
      ["Remarks", esc(p.remarks)],
      ["Contact", `<a href="mailto:${SF.config.contactEmail}?subject=${encodeURIComponent(`Solutions Footprint: ${p.name}`)}">${SF.config.contactEmail}</a>`],
    ].filter(([, v]) => v);
    d.innerHTML = `
      <button type="button" class="modal-close" aria-label="Close" data-close>&times;</button>
      <div class="modal-scroll">
        <div class="hero" id="hero">${hero}</div>
        <div class="pop-body">
          <div class="pop-chips">${statusChip(p)}${p.nationwide ? '<span class="chip">Nationwide</span>' : ""}</div>
          <h2 class="pop-title" id="detail-title">${esc(p.name)}</h2>
          <div class="pop-org"><span class="lg">${SF.logoImg(p.lead)}</span><span><b>${esc(logo ? `${p.lead}, ${logo.name}` : p.lead)}</b>${p.partners.length ? `<br>with ${esc(p.partners.join(", "))}` : ""}</span></div>
          ${p.description ? `<p style="margin:0 0 14px">${esc(p.description)}</p>` : ""}
          ${figs.length ? `<div class="figs">${figs.map((f) => `<div class="fig"><div class="l">${f.ico}${f.l}</div><div class="v">${f.v}</div>${f.s ? `<div class="s">${f.s}</div>` : ""}</div>`).join("")}</div>` : ""}
          <div class="pop-section">IASC criteria</div>
          <div class="crit-list">${p.criteria.map((n) => { const c = CRITERIA[n - 1]; return `<span class="crit-pill"><span class="ci" style="background:${c.color}">${SF.critIcon(n)}</span>${c.n}. ${esc(c.name)}</span>`; }).join("")}</div>
          <div class="pop-section">Where</div>
          <div class="where">${miniMap(p)}
            <dl><dt>States</dt><dd>${p.nationwide ? "Nationwide" : esc(p.states.join(", "))}</dd>
            ${p.localities.length ? `<dt>Localities</dt><dd>${esc(p.localities.join(", "))}</dd>` : ""}</dl>
          </div>
          ${groups.length ? `<div class="pop-section">People reached, planned, by group</div>
            <div class="people-bars">${groups.map((g) => `<div class="pb"><span>${g.label}</span><span class="bar"><i style="width:${(p.people[g.key] / groupMax) * 100}%;background:var(--brand)"></i></span><span class="n">${SF.fmtInt(p.people[g.key])}</span></div>`).join("")}</div>` : ""}
          ${details.length ? `<div class="pop-section">Details</div><dl class="pop-dl">${details.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>` : ""}
        </div>
        <div class="pop-actions">
          <button type="button" class="btn" id="pop-show">${SF.icons.pin}Show on map</button>
          <button type="button" class="btn" id="pop-link">${SF.icons.link}Copy link</button>
          <span class="spacer"></span>
          <a class="btn" href="add.html?correct=${encodeURIComponent(p.id)}">Suggest a correction</a>
        </div>
        <div class="pop-nudge">Is your organisation working on durable solutions in Sudan? <a href="add.html">Add your project</a> so others can see it.</div>
      </div>`;
    if (photos.length > 1) {
      let i = 0;
      const img = d.querySelector("#hero img"), dots = d.querySelectorAll("#hero .dots i");
      const go = (k) => { i = (i + k + photos.length) % photos.length; img.src = photos[i]; dots.forEach((x, j) => x.classList.toggle("on", j === i)); };
      d.querySelector(".nav.prev").addEventListener("click", () => go(-1));
      d.querySelector(".nav.next").addEventListener("click", () => go(1));
    }
    d.querySelector("#pop-show").addEventListener("click", () => { d.close(); showOnMap(p); });
    d.querySelector("#pop-link").addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#project=${encodeURIComponent(p.id)}`;
      try { await navigator.clipboard.writeText(url); SF.toast("Link copied"); }
      catch { prompt("Copy this link:", url); }
    });
    d.addEventListener("close", () => { if (location.hash.startsWith("#project=")) history.replaceState(null, "", location.pathname + location.search); }, { once: true });
    if (!opts.keepHash) history.replaceState(null, "", `#project=${encodeURIComponent(p.id)}`);
    openModal(d);
  }

  function showOnMap(p) {
    if (p.nationwide) { selectState(NATIONWIDE, true); return; }
    if (p.states.length === 1) { selectState(p.states[0]); document.getElementById("map-wrap").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    selectState(null);
    document.getElementById("map-wrap").scrollIntoView({ behavior: "smooth", block: "center" });
    p.states.forEach((s) => mapNodes[s]?.path.classList.add("is-flash"));
    setTimeout(() => p.states.forEach((s) => mapNodes[s]?.path.classList.remove("is-flash")), 3200);
  }

  /* ---------------- time window ---------------- */
  const YEARS = [];
  function buildTime() {
    const ys = ALL.flatMap((p) => [p._start, p._end]).filter(Boolean).map((d) => d.getFullYear());
    const minY = Math.min(...ys, SF.today.getFullYear()), maxY = Math.max(...ys, SF.today.getFullYear());
    for (let y = minY; y <= maxY; y++) YEARS.push(y);
    const from = document.getElementById("t-from"), to = document.getElementById("t-to");
    from.innerHTML = to.innerHTML = YEARS.map((y) => `<option>${y}</option>`).join("");
    document.getElementById("t-year").textContent = SF.today.getFullYear();
    document.querySelectorAll(".pill[data-t]").forEach((b) => b.addEventListener("click", () => { state.time = { mode: b.dataset.t }; render(); }));
    const onRange = () => {
      let f = Number(from.value), t = Number(to.value);
      if (f > t) [f, t] = [t, f];
      state.time = { mode: "custom", from: f, to: t };
      render();
    };
    from.addEventListener("change", onRange);
    to.addEventListener("change", onRange);
  }
  function renderTime() {
    const list = filtered("time");
    const w = timeWindow();
    document.querySelectorAll(".pill[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === state.time.mode)));
    const from = document.getElementById("t-from"), to = document.getElementById("t-to");
    from.value = w ? Math.max(YEARS[0], w[0].getFullYear()) : YEARS[0];
    to.value = w ? Math.min(YEARS[YEARS.length - 1], w[1].getFullYear()) : YEARS[YEARS.length - 1];
    const quarters = [];
    YEARS.forEach((y) => [0, 3, 6, 9].forEach((m) => quarters.push([new Date(y, m, 1), new Date(y, m + 3, 0)])));
    const counts = quarters.map((q) => list.filter((p) => (p._start || p._end) && inWindow(p, q)).length);
    const peakIn = Math.max(0, ...counts.filter((_, i) => !w || (quarters[i][0] <= w[1] && quarters[i][1] >= w[0])));
    const label = state.time.mode === "all" ? `All years, ${YEARS[0]} to ${YEARS[YEARS.length - 1]}` : `${timeLabel()}`;
    document.getElementById("time-sub").textContent = `${label}. Up to ${peakIn} project${peakIn === 1 ? "" : "s"} active at the same time.`;
    const svg = document.getElementById("time-chart");
    const W = 1000, H = 150, padB = 22, padT = 18;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";
    const max = Math.max(1, ...counts);
    const bw = W / quarters.length;
    quarters.forEach((q, i) => {
      const h = (counts[i] / max) * (H - padB - padT);
      const inside = !w || (q[0] <= w[1] && q[1] >= w[0]);
      const r = el("rect", { x: i * bw + 1.5, y: H - padB - h, width: Math.max(1, bw - 3), height: h, rx: 1.5, class: inside ? "bar-in" : "bar-out" }, svg);
      const t = el("title", {}, r);
      t.textContent = `Q${(q[0].getMonth() / 3) + 1} ${q[0].getFullYear()}: ${counts[i]} project${counts[i] === 1 ? "" : "s"}`;
    });
    el("line", { x1: 0, x2: W, y1: H - padB + 0.5, y2: H - padB + 0.5, style: "stroke:var(--line-2)" }, svg);
    YEARS.forEach((y, i) => { const t = el("text", { x: i * 4 * bw + 2, y: H - 5, class: "axis" }, svg); t.textContent = y; });
    const t0 = new Date(YEARS[0], 0, 1), t1 = new Date(YEARS[YEARS.length - 1] + 1, 0, 1);
    const tx = ((SF.today - t0) / (t1 - t0)) * W;
    el("line", { x1: tx, x2: tx, y1: padT - 4, y2: H - padB, class: "today", "stroke-dasharray": "3 3" }, svg);
    const tt = el("text", { x: tx + 5, y: padT + 4, class: "axis today-t" }, svg);
    tt.textContent = "Today";
  }

  /* ---------------- contributing agencies ---------------- */
  function renderAgencies() {
    const ags = agenciesIn(ALL.filter((p) => p.orgType === "UN agency"));
    const strip = document.getElementById("logo-strip");
    strip.innerHTML = ags.map(([org, list]) => `<button type="button" class="logo-tile" data-org="${esc(org)}" title="${esc(org)}: ${list.length} project${list.length === 1 ? "" : "s"}" aria-label="${esc(org)}, ${list.length} projects">${SF.logoImg(org, "full")}</button>`).join("") +
      `<a class="logo-tile is-add" href="add.html">${SF.icons.plus}<span style="color:inherit">Your organisation here?<br>Add your project</span></a>`;
    strip.querySelectorAll(".logo-tile[data-org]").forEach((b) => b.addEventListener("click", () => {
      const org = b.dataset.org;
      openAgency(org, ALL.filter((p) => p.lead === org), "Sudan");
    }));
  }

  /* ---------------- downloads ---------------- */
  function exportRows(list) {
    return list.map((p) => ({
      "Project or programme name": p.name,
      "Lead organisation": p.lead || "",
      "Organisation type": p.orgType || "",
      "Organisation leadership": p.leadership.join("; "),
      "Implementing partners": p.partners.join("; "),
      "Geographic scope": p.nationwide ? "Nationwide" : "One or more states",
      "States": p.states.join("; "),
      "Localities": p.localities.join("; "),
      "IASC criteria": p.criteria.map((n) => `${n}. ${CRITERIA[n - 1].name}`).join("; "),
      "Intervention type": p.interventionTypes.join("; "),
      "Description": p.description || "",
      "Coordination mechanism or cluster": p.coordination || "",
      "Start date": p.start || "",
      "End date": p.end || "",
      "Status": p.status || "",
      "Total budget (USD)": p.budget ?? "",
      "Share towards durable solutions (%)": p.share != null ? Math.round(p.share * 1000) / 10 : "",
      "Funding towards durable solutions (USD)": p.dsFunding ?? "",
      "Donor or funding source": p.donor || "",
      "People reached, planned: total": p.people.total ?? "",
      "IDPs": p.people.idps ?? "",
      "Returnees": p.people.returnees ?? "",
      "Refugees": p.people.refugees ?? "",
      "Host community": p.people.host ?? "",
      "Other": p.people.other ?? "",
      "Remarks": p.remarks || "",
      "Contact": SF.config.contactEmail,
      "Data last updated": LAST_UPDATED,
    }));
  }
  const NOT_EXHAUSTIVE = "This is not an exhaustive list of projects contributing to durable solutions in Sudan. It shows only projects that organisations have reported to the Durable Solutions Working Group.";
  function fileName(ext) { return `solutions-footprint-sudan-${new Date().toISOString().slice(0, 10)}.${ext}`; }
  function downloadCSV(rows) {
    const cols = Object.keys(rows[0] || { Project: "" });
    const q = (v) => { const s = String(v ?? ""); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = "﻿" + [cols.map(q).join(","), ...rows.map((r) => cols.map((c) => q(r[c])).join(","))].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = fileName("csv");
    document.body.appendChild(a); a.click(); a.remove();
  }
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  async function downloadXLSX(rows) {
    if (!window.XLSX) await loadScript("assets/vendor/xlsx.mini.min.js");
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.min(48, Math.max(10, k.length + 2)) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    const notes = XLSX.utils.aoa_to_sheet([
      ["Solutions Footprint, Durable Solutions Hub | Sudan"],
      [`Projects matching the filters on screen: ${rows.length}`],
      [`Data last updated: ${LAST_UPDATED}`],
      ["Source: projects reported by organisations to the Durable Solutions Working Group (DSWG)."],
      [NOT_EXHAUSTIVE],
      [`Contact: ${SF.config.contactEmail}`],
    ]);
    XLSX.utils.book_append_sheet(wb, notes, "About");
    XLSX.writeFile(wb, fileName("xlsx"));
  }
  function bindDownloads() {
    const host = document.getElementById("downloads");
    host.innerHTML = `${SF.icons.download}<span>Download filtered data:</span><button type="button" class="link-btn" data-dl="csv">CSV</button><button type="button" class="link-btn" data-dl="xlsx">Excel</button>`;
    host.addEventListener("click", async (e) => {
      const kind = e.target.dataset.dl;
      if (!kind) return;
      const rows = exportRows(filtered());
      try { kind === "csv" ? downloadCSV(rows) : await downloadXLSX(rows); }
      catch (err) { alert("The Excel download could not start. Please try the CSV download."); }
    });
  }

  /* ---------------- render ---------------- */
  function render() {
    const list = filtered();
    PER = aggregate(list);
    renderKPIs(list, PER);
    renderTags();
    updateFilterCounts();
    renderNationwideBand(list);
    renderMap(PER);
    renderPanel(list, PER);
    renderTime();
  }
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  async function init() {
    SF.renderHeader("map");
    try {
      const [data, geo] = await Promise.all([SF.loadJSON(SF.config.dataUrl), SF.loadJSON(SF.config.geoUrl)]);
      ALL = data.projects.map(SF.enrich);
      LAST_UPDATED = data.lastUpdated;
      GEO = geo;
    } catch (e) {
      document.getElementById("main").innerHTML = `<div class="card" style="padding:20px;grid-column:1/-1">The data could not be loaded. Please refresh the page. If the problem continues, contact <a href="mailto:${SF.config.contactEmail}">${SF.config.contactEmail}</a>.</div>`;
      return;
    }
    SF.renderFooter(LAST_UPDATED);
    document.getElementById("source-line").textContent =
      `Source: projects reported by organisations to the Durable Solutions Working Group. Last updated ${SF.fmtDateLong(SF.parseDate(LAST_UPDATED))}. Boundaries: OCHA via geoBoundaries, and Natural Earth, simplified.`;
    document.getElementById("not-exhaustive").innerHTML = `${SF.icons.info}<span>${NOT_EXHAUSTIVE} To add yours, use <a href="add.html">Add your project</a>.</span>`;
    buildFilterPanel();
    buildMap();
    buildTime();
    bindDownloads();
    renderAgencies();
    document.querySelectorAll("#colour-by button").forEach((b) => b.addEventListener("click", () => {
      state.colourBy = b.dataset.v;
      document.querySelectorAll("#colour-by button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    }));
    render();
    const m = location.hash.match(/^#project=(.+)$/);
    if (m) openDetail(decodeURIComponent(m[1]), { keepHash: true });
  }
  init();
})();
