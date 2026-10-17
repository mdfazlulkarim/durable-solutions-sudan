/* Map explorer (Phase 1). Plain JavaScript, no libraries. */
"use strict";

(() => {
  const { CRITERIA, STATES, esc } = SF;
  const NATIONWIDE = "__nationwide";
  const SVGNS = "http://www.w3.org/2000/svg";
  const SEQ = ["#cfe0f5", "#a3c4ec", "#73a5e0", "#4485d2", "#1f5fa8"];
  const NONE_FILL = "#ebe9e3";
  const RING_R = 21, RING_IN = 13;
  // Where the state name sits relative to its ring, where states are crowded
  const LABEL_POS = { Khartoum: "left", "Aj Jazirah": "left", "White Nile": "left", Sennar: "right", Gedaref: "right" };

  let ALL = [];
  let GEO = null;
  let LAST_UPDATED = null;

  const state = {
    search: "",
    criteria: new Set(),
    itypes: new Set(),
    orgTypes: new Set(),
    orgName: "",
    status: new Set(),
    minShare: 0,
    groups: new Set(),
    scope: new Set(),
    donors: new Set(),
    coord: new Set(),
    time: { mode: "all", from: null, to: null },
    colourBy: "projects",
    selected: null,
    showAll: false,
  };

  /* ---------------- filtering ---------------- */
  const has = (arr, v) => Array.isArray(arr) && arr.includes(v);
  const GROUPS = {
    criteria: (p, set) => [...set].some((n) => has(p.criteria, n)),
    itypes: (p, set) => [...set].some((t) => has(p.interventionTypes, t)),
    orgTypes: (p, set) => set.has(p.orgType),
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
    const hay = [p.name, p.lead, ...(p.partners || []), p.donor, ...(p.states || []), ...(p.localities || []), p.remarks, p.coordination]
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
    if (except !== "minShare" && state.minShare > 0) {
      if (p.share == null || p.share * 100 < state.minShare) return false;
    }
    if (except !== "time" && !inWindow(p, timeWindow())) return false;
    return true;
  }
  const filtered = (except) => ALL.filter((p) => passes(p, except));

  /* ---------------- aggregation ---------------- */
  function aggregate(list) {
    const per = {};
    STATES.forEach((s) => (per[s] = { projects: [], orgs: new Set(), funding: 0, fundingN: 0, crit: Array(9).fill(0), soon: 0 }));
    for (const p of list) {
      if (p.nationwide) continue;
      const n = p.states.length || 1;
      for (const s of p.states) {
        const a = per[s];
        if (!a) continue;
        a.projects.push(p);
        p._orgs.forEach((o) => a.orgs.add(o));
        if (p.dsFunding != null) { a.funding += p.dsFunding / n; a.fundingN++; }
        p.criteria.forEach((c) => a.crit[c]++);
        if (p._endingSoon) a.soon++;
      }
    }
    return per;
  }
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
    if (!(v > 0)) return NONE_FILL;
    let idx = bs.findIndex((b) => v <= b.hi);
    if (idx < 0) idx = bs.length - 1;
    const offset = SEQ.length - bs.length;
    return SEQ[Math.min(SEQ.length - 1, Math.max(0, idx + Math.max(0, offset)))];
  }

  /* ---------------- filter panel ---------------- */
  function optionLists() {
    const count = (fn) => {
      const m = new Map();
      ALL.forEach((p) => fn(p).forEach((v) => v && m.set(v, (m.get(v) || 0) + 1)));
      return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map((e) => e[0]);
    };
    return {
      criteria: CRITERIA.map((c) => ({ v: c.n, label: c.short, sw: c.color })),
      itypes: SF.INTERVENTION_TYPES.map((t) => ({ v: t, label: t })),
      orgTypes: SF.ORG_TYPES.map((o) => ({ v: o.key, label: o.label })),
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
    { key: "status", title: "Status", open: true, note: "Status follows the dates: a project whose end date has passed shows as ended." },
    { key: "minShare", title: "Minimum share towards durable solutions", open: true, slider: true },
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
      if (g.slider) {
        return `<div class="filter-group">
          <div class="share-row"><label for="f-share">${g.title}</label><output id="f-share-out">0%</output></div>
          <input type="range" id="f-share" min="0" max="100" step="5" value="0" aria-describedby="f-share-note">
          <p class="group-note" id="f-share-note">Hides projects where only a small part of the budget goes to durable solutions, and projects that do not report a share.</p>
        </div>`;
      }
      const opts = OPTS[g.key].map((o, i) => {
        const id = `f-${g.key}-${i}`;
        return `<label class="opt${o.sw ? "" : " no-sw"}" for="${id}">
          <input type="checkbox" id="${id}" data-g="${g.key}" data-v="${esc(o.v)}">
          ${o.sw ? `<span class="sw" style="background:${o.sw}"></span>` : ""}
          <span>${esc(o.label)}</span><span class="num" data-count></span>
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
    share.addEventListener("input", () => {
      state.minShare = Number(share.value);
      document.getElementById("f-share-out").textContent = `${state.minShare}%`;
      render();
    });
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
    document.getElementById("f-org").value = state.orgName;
    document.getElementById("f-search").value = state.search;
  }

  function clearAll() {
    state.search = ""; state.orgName = ""; state.minShare = 0;
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
    const partners = new Set(list.flatMap((p) => p.partners || []).filter((o) => !leads.has(o)));
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
    el("circle", { r: r1 + 1.5, fill: "#fff", opacity: 0.95 }, g);
    const seg = (Math.PI * 2) / 8, pad = 0.05;
    CRITERIA.forEach((c, i) => {
      const a0 = -Math.PI / 2 + i * seg + pad, a1 = -Math.PI / 2 + (i + 1) * seg - pad;
      el("path", { d: arcPath(r0, r1, a0, a1), fill: crit[c.n] > 0 ? c.color : SF.GAP_COLOR }, g);
    });
    el("circle", { r: r0 - 0.5, fill: "#fff" }, g);
    const t = el("text", { class: "ring-num" }, g);
    t.textContent = total;
  }

  let mapNodes = {};
  function buildMap() {
    const svg = document.getElementById("map");
    svg.setAttribute("viewBox", `0 0 ${GEO.width} ${GEO.height}`);
    const defs = el("defs", {}, svg);
    const pat = el("pattern", { id: "hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    el("rect", { width: 6, height: 6, fill: "#f3f2ee" }, pat);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "#c9c7bf", "stroke-width": 2 }, pat);

    const gStates = el("g", {}, svg);
    const gRings = el("g", {}, svg);
    const gLabels = el("g", {}, svg);
    if (GEO.abyei) {
      el("path", { d: GEO.abyei.path, class: "abyei" }, gStates);
      const t = el("text", { x: GEO.abyei.x, y: GEO.abyei.y + 26, class: "lbl lbl-abyei" }, gLabels);
      t.textContent = "Abyei";
    }
    GEO.states.forEach((s) => {
      const path = el("path", { d: s.path, class: "state", tabindex: 0, role: "button", "data-state": s.name }, gStates);
      const ring = el("g", { class: "ring", transform: `translate(${s.x} ${s.y})`, "data-state": s.name }, gRings);
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

    // ring sample in the legend
    const sample = document.getElementById("ring-sample");
    const sg = el("g", {}, sample);
    drawRing(sg, [0, 3, 5, 2, 0, 1, 0, 1, 0], 7, 30, 20);
    sg.querySelector("text").style.fontSize = "16px";
    document.getElementById("crit-keys").innerHTML = CRITERIA.map((c) => `<span><i style="background:${c.color}"></i>${c.n} ${c.ring}</span>`).join("");
  }

  let PER = null;
  function renderMap(per) {
    const values = STATES.map((s) => valueOf(per[s]));
    const max = Math.max(0, ...values);
    const bs = bins(max);
    STATES.forEach((name) => {
      const node = mapNodes[name];
      if (!node) return;
      const a = per[name], v = valueOf(a), n = a.projects.length;
      node.path.setAttribute("fill", binColour(v, bs));
      node.path.classList.toggle("is-selected", state.selected === name);
      node.path.setAttribute("aria-label", `${name}: ${n} project${n === 1 ? "" : "s"}, ${a.orgs.size} organisations`);
      const { x, y } = node.s;
      if (n > 0) {
        node.ring.style.display = "";
        drawRing(node.ring, a.crit, n);
      } else {
        node.ring.style.display = "none";
      }
      const pos = n > 0 ? LABEL_POS[name] || "below" : "center";
      const L = node.label;
      if (pos === "left") { L.setAttribute("x", x - RING_R - 5); L.setAttribute("y", y + 4); L.style.textAnchor = "end"; }
      else if (pos === "right") { L.setAttribute("x", x + RING_R + 5); L.setAttribute("y", y + 4); L.style.textAnchor = "start"; }
      else if (pos === "below") { L.setAttribute("x", x); L.setAttribute("y", y + RING_R + 13); L.style.textAnchor = "middle"; }
      else { L.setAttribute("x", x); L.setAttribute("y", y + 4); L.style.textAnchor = "middle"; }
    });
    const titles = { projects: "Number of projects", orgs: "Number of organisations", funding: "Funding towards durable solutions (USD)" };
    document.getElementById("legend-title").textContent = titles[state.colourBy];
    const offset = SEQ.length - bs.length;
    const noneLabel = state.colourBy === "funding" ? "No funding reported" : "No projects reported";
    document.getElementById("legend-bins").innerHTML =
      bs.map((b, i) => `<span><i style="background:${SEQ[i + Math.max(0, offset)]}"></i>${b.label}</span>`).join("") +
      `<span><i style="background:${NONE_FILL};border:1px solid #dcdad3"></i>${noneLabel}</span>`;
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
      x = (s.x / GEO.width) * svg.width; y = (s.y / GEO.height) * svg.height - RING_R;
    }
    t.style.left = `${Math.max(90, Math.min(wrap.width - 90, x))}px`;
    t.style.top = `${y}px`;
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

  /* ---------------- state panel ---------------- */
  function selectState(name, scroll) {
    state.selected = name;
    state.showAll = false;
    render();
    if (scroll || window.innerWidth < 1280) document.getElementById("state-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function statusChip(p) {
    if (p._endingSoon) return `<span class="chip soon">Ends ${SF.fmtMonth(p._end)}</span>`;
    if (!p.status) return "";
    return `<span class="chip ${p.status.toLowerCase()}">${p.status}</span>`;
  }
  function progress(p) {
    if (!p._start || !p._end) return "";
    const pct = Math.max(0, Math.min(1, (SF.today - p._start) / (p._end - p._start)));
    return `<div class="progress" aria-hidden="true"><i style="width:${(pct * 100).toFixed(0)}%"></i></div>`;
  }
  function critDots(p) {
    return `<span class="crit-dots" aria-label="IASC criteria ${p.criteria.join(", ")}">${CRITERIA.map((c) => `<i style="background:${p.criteria.includes(c.n) ? c.color : SF.GAP_COLOR}"></i>`).join("")}</span>`;
  }
  function projectCard(p) {
    const dates = p._start || p._end ? `${SF.fmtMonth(p._start)}${p._start && p._end ? " to " : ""}${SF.fmtMonth(p._end)}` : "";
    const funding = p.dsFunding != null
      ? `<div class="f">${SF.fmtMoney(p.dsFunding)} towards durable solutions${p.share != null ? ` (${SF.fmtPct(p.share)} of budget)` : ""}</div>` : "";
    return `<button type="button" class="proj-card" data-id="${esc(p.id)}">
      <div class="t">${esc(p.name)}</div>
      <div class="o">${esc(p.lead)}${p.partners.length ? ` with ${esc(p.partners.join(", "))}` : ""}</div>
      <div class="d">${dates ? `<span>${dates}</span>` : ""}${statusChip(p)}${critDots(p)}</div>
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

  function renderPanel(list, per) {
    const panel = document.getElementById("state-panel");
    const isNW = state.selected === NATIONWIDE;
    const name = isNW ? "Nationwide" : state.selected;
    let projects, orgs, funding, fundingN, crit, soon;
    if (isNW) {
      projects = list.filter((p) => p.nationwide);
      orgs = new Set(projects.flatMap((p) => p._orgs));
      const fl = projects.filter((p) => p.dsFunding != null);
      funding = fl.reduce((a, p) => a + p.dsFunding, 0); fundingN = fl.length;
      crit = Array(9).fill(0); projects.forEach((p) => p.criteria.forEach((c) => crit[c]++));
      soon = projects.filter((p) => p._endingSoon).length;
    } else {
      const a = per[name];
      ({ projects, orgs, funding, fundingN, crit, soon } = a);
    }
    const leadTypes = {};
    const leadSet = new Set(projects.map((p) => p.lead));
    leadSet.forEach((l) => { const t = projects.find((p) => p.lead === l).orgType || "Not reported"; leadTypes[t] = (leadTypes[t] || 0) + 1; });
    const partnerCount = new Set(projects.flatMap((p) => p.partners).filter((o) => !leadSet.has(o))).size;
    const orgRows = [...SF.ORG_TYPES.map((o) => ({ l: o.label, n: leadTypes[o.key] || 0 })), { l: "Implementing partners", n: partnerCount }];
    const orgMax = Math.max(1, ...orgRows.map((r) => r.n));
    const critMax = Math.max(1, ...crit);
    const sorted = sortForPanel(projects);
    const shown = state.showAll ? sorted : sorted.slice(0, 3);
    const options = [`<option value="${NATIONWIDE}"${isNW ? " selected" : ""}>Nationwide</option>`]
      .concat(STATES.map((s) => `<option${s === name ? " selected" : ""}>${s}</option>`)).join("");

    panel.innerHTML = `
      <div class="sp-head">
        <div><div class="sp-kicker">${isNW ? "Not tied to one state" : "Selected state"}</div><h2 class="sp-name">${esc(name)}</h2></div>
        <div class="sp-select"><label for="sp-change">Change state</label><select id="sp-change">${options}</select></div>
      </div>
      <div class="mini-kpis">
        <div class="mini"><div class="l">Projects</div><div class="v">${projects.length}</div></div>
        <div class="mini"><div class="l">Organisations</div><div class="v">${orgs.size}</div></div>
        <div class="mini"><div class="l">DS funding</div><div class="v"${fundingN ? "" : ' style="font-size:13px;font-weight:500;color:var(--muted);padding-top:6px"'}>${fundingN ? SF.fmtMoney(funding) : "None reported"}</div></div>
      </div>
      ${soon ? `<div class="alert-soon">${SF.icons.clock}${soon} project${soon === 1 ? "" : "s"} end${soon === 1 ? "s" : ""} within 6 months</div>` : ""}
      ${projects.length === 0 ? `<p class="empty-note">No projects reported here with the current filters. Every IASC criterion is a gap.</p>` : ""}
      <div class="sp-section">Organisations here, by type</div>
      ${orgRows.map((r) => `<div class="bar-row"><span>${r.l}</span><span class="bar"><i style="width:${(r.n / orgMax) * 100}%;background:var(--brand)"></i></span><span class="n">${r.n}</span></div>`).join("")}
      <div class="sp-section">IASC criteria covered</div>
      ${CRITERIA.map((c) => `<div class="bar-row crit"><span class="idx">${c.n}</span><span>${c.short}</span>
          <span class="bar${crit[c.n] ? "" : " is-gap"}">${crit[c.n] ? `<i style="width:${(crit[c.n] / critMax) * 100}%;background:${c.color}"></i>` : ""}</span>
          <span class="n">${crit[c.n] || '<span class="gap-word">gap</span>'}</span></div>`).join("")}
      ${projects.length ? `<div class="sp-section">${state.showAll ? `All projects in ${esc(name)}` : "Projects ending soonest"}<small>Click a project for details</small></div>
      <div id="sp-cards">${shown.map(projectCard).join("")}</div>
      ${sorted.length > 3 ? `<div class="panel-more"><button type="button" class="link-btn" id="sp-more">${state.showAll ? "Show fewer" : `View all ${sorted.length} projects in ${esc(name)}`}</button></div>` : ""}` : ""}`;

    panel.querySelector("#sp-change").addEventListener("change", (e) => selectState(e.target.value));
    panel.querySelector("#sp-more")?.addEventListener("click", () => { state.showAll = !state.showAll; render(); });
    panel.querySelectorAll(".proj-card").forEach((b) => b.addEventListener("click", () => openDetail(b.dataset.id)));
  }

  /* ---------------- project detail ---------------- */
  function openDetail(id) {
    const p = ALL.find((x) => x.id === id);
    if (!p) return;
    const d = document.getElementById("detail");
    const where = p.nationwide ? "Nationwide" : p.states.join(", ");
    const people = SF.TARGET_GROUPS.map((g) => `<div>${g.label}<b>${p.people[g.key] != null ? SF.fmtInt(p.people[g.key]) : ""}</b></div>`).join("");
    const rows = [
      ["Lead organisation", esc(p.lead)],
      ["Organisation type", esc(p.orgType)],
      ["Implementing partners", esc(p.partners.join(", "))],
      ["Where", esc(where)],
      ["Localities", esc(p.localities.join(", "))],
      ["IASC criteria", `<div class="crit-list">${p.criteria.map((n) => { const c = CRITERIA[n - 1]; return `<span class="crit-pill"><i style="background:${c.color}"></i>${c.n}. ${c.name}</span>`; }).join("")}</div>`],
      ["Intervention type", esc(p.interventionTypes.join(", "))],
      ["Description", esc(p.description)],
      ["Dates", p._start || p._end ? `${SF.fmtMonth(p._start)} to ${SF.fmtMonth(p._end)}` : ""],
      ["Status", p.status ? statusChip(p) : ""],
      ["Total budget", SF.fmtUSD(p.budget)],
      ["Share towards durable solutions", SF.fmtPct(p.share)],
      ["Funding towards durable solutions", SF.fmtUSD(p.dsFunding)],
      ["Donor or funding source", esc(p.donor)],
      ["Coordination mechanism", esc(p.coordination)],
      ["People reached, planned", `${p.people.total != null ? `<b>${SF.fmtInt(p.people.total)}</b> in total` : ""}<div class="people-grid">${people}</div>`],
      ["Remarks", esc(p.remarks)],
      ["Contact", `<a href="mailto:${SF.config.contactEmail}?subject=${encodeURIComponent(`Solutions Footprint: ${p.name}`)}">${SF.config.contactEmail}</a>`],
    ];
    d.innerHTML = `
      <div class="detail-head"><h2 id="detail-title">${esc(p.name)}</h2><button type="button" class="icon-btn" aria-label="Close" data-close>&times;</button></div>
      <div class="detail-body"><dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v || ""}</dd>`).join("")}</dl></div>
      <div class="detail-foot">
        <a class="btn" href="add.html?correct=${encodeURIComponent(p.id)}">Suggest a correction</a>
        <button type="button" class="btn btn-primary" data-close>Close</button>
      </div>`;
    d.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => d.close()));
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); }, { once: true });
    d.showModal();
  }

  /* ---------------- time window ---------------- */
  let YEARS = [];
  function buildTime() {
    const ys = ALL.flatMap((p) => [p._start, p._end]).filter(Boolean).map((d) => d.getFullYear());
    const minY = Math.min(...ys, SF.today.getFullYear()), maxY = Math.max(...ys, SF.today.getFullYear());
    for (let y = minY; y <= maxY; y++) YEARS.push(y);
    const from = document.getElementById("t-from"), to = document.getElementById("t-to");
    from.innerHTML = to.innerHTML = YEARS.map((y) => `<option>${y}</option>`).join("");
    document.getElementById("t-year").textContent = SF.today.getFullYear();
    document.querySelectorAll(".pill[data-t]").forEach((b) => b.addEventListener("click", () => {
      state.time = { mode: b.dataset.t }; render();
    }));
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
      const r = el("rect", { x: i * bw + 1.5, y: H - padB - h, width: Math.max(1, bw - 3), height: h, rx: 1.5, fill: inside ? "#2a6fc9" : "#c8d8ee" }, svg);
      const t = el("title", {}, r);
      t.textContent = `Q${(q[0].getMonth() / 3) + 1} ${q[0].getFullYear()}: ${counts[i]} project${counts[i] === 1 ? "" : "s"}`;
    });
    el("line", { x1: 0, x2: W, y1: H - padB + 0.5, y2: H - padB + 0.5, stroke: "#d3d1c9" }, svg);
    YEARS.forEach((y, i) => {
      const t = el("text", { x: i * 4 * bw + 2, y: H - 5, class: "axis" }, svg);
      t.textContent = y;
    });
    const t0 = new Date(YEARS[0], 0, 1), t1 = new Date(YEARS[YEARS.length - 1] + 1, 0, 1);
    const tx = ((SF.today - t0) / (t1 - t0)) * W;
    el("line", { x1: tx, x2: tx, y1: padT - 4, y2: H - padB, stroke: "#1c2230", "stroke-dasharray": "3 3" }, svg);
    const tt = el("text", { x: tx + 5, y: padT + 4, class: "axis", fill: "#1c2230" }, svg);
    tt.textContent = "Today";
    tt.style.fill = "#1c2230"; tt.style.fontWeight = 600;
  }

  /* ---------------- downloads ---------------- */
  function exportRows(list) {
    return list.map((p) => ({
      "Project or programme name": p.name,
      "Lead organisation": p.lead || "",
      "Organisation type": p.orgType || "",
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
      [`Contact: ${SF.config.contactEmail}`],
    ]);
    XLSX.utils.book_append_sheet(wb, notes, "About");
    XLSX.writeFile(wb, fileName("xlsx"));
  }
  function bindDownloads() {
    const btn = document.getElementById("dl-btn"), menu = document.getElementById("dl-menu");
    const close = () => { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute("aria-expanded", String(!menu.hidden)); });
    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    menu.addEventListener("click", async (e) => {
      const kind = e.target.dataset.dl;
      if (!kind) return;
      const rows = exportRows(filtered());
      close();
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
    SF.renderHeader("map", { download: true });
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
      `Source: projects reported by organisations to the Durable Solutions Working Group. Last updated ${SF.fmtDateLong(SF.parseDate(LAST_UPDATED))}. Boundaries: geoBoundaries, simplified, for illustration only.`;
    const agg = aggregate(ALL);
    state.selected = STATES.slice().sort((a, b) => agg[b].projects.length - agg[a].projects.length)[0];
    buildFilterPanel();
    buildMap();
    buildTime();
    bindDownloads();
    document.querySelectorAll("#colour-by button").forEach((b) => b.addEventListener("click", () => {
      state.colourBy = b.dataset.v;
      document.querySelectorAll("#colour-by button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    }));
    render();
  }
  init();
})();
