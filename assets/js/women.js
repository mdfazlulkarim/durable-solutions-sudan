/* Women and girls page (git page only): evidence, funding gap, who is doing what, projects on the map,
   stories chosen by DSU (data/stories.json) and the latest ReliefWeb reports (through the back end). */
"use strict";
(() => {
  const esc = SF.esc;
  const $ = (id) => document.getElementById(id);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const when = (d) => {
    if (!d) return "";
    const m = String(d).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
    if (!m) return String(d);
    return m[3] ? `${Number(m[3])} ${MONTHS[m[2] - 1]} ${m[1]}` : m[2] ? `${MONTHS[m[2] - 1]} ${m[1]}` : m[1];
  };
  const shortWhen = (d) => { const m = String(d || "").match(/^(\d{4})(?:-(\d{2}))?/); return m ? (m[2] ? `${MONTHS[m[2] - 1].slice(0, 3)} ${m[1]}` : m[1]) : ""; };
  const trim = (t) => (t.includes(".") ? t.replace(/0+$/, "").replace(/\.$/, "") : t);
  const usd = (n) => n >= 1e9 ? `US$${trim((n / 1e9).toFixed(2))} billion` : `US$${trim((n / 1e6).toFixed(1))} million`;
  const people = (n) => n >= 1e6 ? `${trim((n / 1e6).toFixed(2))} million` : SF.fmtInt(n);

  let D, SRC, ORDER = [];
  // Every figure points to a numbered source at the bottom of the page
  const cite = (key) => {
    const s = SRC[key];
    if (!s) return "";
    if (!ORDER.includes(key)) ORDER.push(key);
    return `<a class="wm-src" href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(`${s.org}: ${s.title}`)}">${esc(s.org)}, ${esc(shortWhen(s.date))}</a>`;
  };

  function drawStats() {
    $("wm-stats").innerHTML = D.headline.map((h) => `
      <div class="card wm-stat${h.positive ? " is-positive" : ""}">
        <div class="wm-stat-v">${esc(h.value)}</div>
        <div class="wm-stat-l">${esc(h.label)}</div>
        ${cite(h.src)}
      </div>`).join("");
  }

  // Horizontal bars on one scale; the track is the whole, the fill the part
  const bar = (part, whole, label, title) => `
    <div class="wm-bar" role="img" aria-label="${esc(title)}" title="${esc(title)}">
      <div class="wm-bar-fill" style="width:${Math.max(1.5, Math.min(100, (part / whole) * 100)).toFixed(1)}%"></div>
    </div>${label ? `<div class="wm-bar-l">${label}</div>` : ""}`;

  function drawFunding() {
    const f = D.funding, h = f.hnrp, u = f.unfpa, g = f.gbv;
    const unfundedPct = Math.round((u.gapTotal / u.required) * 100);
    const gapMax = Math.max(...u.gap.map((x) => x.value));
    $("wm-fund").innerHTML = `
      <div class="wm-fund-row">
        <div class="wm-fund-h"><b>Sudan humanitarian appeal 2026</b><span>${h.pct}% funded</span></div>
        ${bar(h.received, h.required, `${usd(h.received)} received of ${usd(h.required)} needed, as of ${esc(h.asOf)}`, `${h.pct}% funded`)}
        ${cite(h.src)}
      </div>
      <div class="wm-fund-row">
        <div class="wm-fund-h"><b>UNFPA appeal for women's and girls' health and protection, 2026</b><span>about ${unfundedPct}% unfunded</span></div>
        ${bar(u.required - u.gapTotal, u.required, `${usd(u.gapTotal)} still needed of ${usd(u.required)}, as of ${esc(u.asOf)}. Still needed, by area:`, `${100 - unfundedPct}% funded`)}
        <div class="wm-gap">${u.gap.map((x) => `
          <div class="wm-gap-row"><span class="wm-gap-n">${esc(x.label)}</span>
            <span class="wm-gap-b" title="${esc(`${x.label}: ${usd(x.value)} still needed`)}"><i style="width:${((x.value / gapMax) * 100).toFixed(1)}%"></i></span>
            <span class="wm-gap-v">${usd(x.value)}</span></div>`).join("")}</div>
        ${cite(u.src)}
      </div>
      <div class="wm-fund-row">
        <div class="wm-fund-h"><b>Services after gender-based violence, 2026</b><span>${usd(g.required)} needed</span></div>
        <div class="wm-gap">
          ${[["People in need (response plan, March 2026)", 12400000], ["People the response plan targets", g.targeted], [`People reached, ${g.reachedAsOf}`, g.reached]].map(([l, v]) => `
          <div class="wm-gap-row"><span class="wm-gap-n">${esc(l)}</span>
            <span class="wm-gap-b" title="${esc(`${l}: ${people(v)}`)}"><i style="width:${Math.max(1.5, (v / 12400000) * 100).toFixed(1)}%"></i></span>
            <span class="wm-gap-v">${people(v)}</span></div>`).join("")}
        </div>
        <div class="wm-cites">${cite(g.src)} ${cite(g.reachedSrc)}</div>
      </div>
      <div class="wm-fund-row">
        <div class="wm-fund-h"><b>Women-led organisations are being cut first</b></div>
        <ul class="wm-list">${f.wlo.map((w) => `<li>${esc(w.text)} ${cite(w.src)}</li>`).join("")}</ul>
      </div>
      <div class="wm-cta">
        <div><b>Support women-led response in Sudan</b><br>To discuss funding for projects that reach women and girls, or to add your project to the map, contact the Durable Solutions Working Group.</div>
        <a class="btn btn-primary" href="mailto:${SF.config.contactEmail}?subject=${encodeURIComponent("Supporting women and girls in Sudan")}">Contact the DSWG</a>
      </div>`;
  }

  function drawInvest() {
    $("wm-invest").innerHTML = D.invest.map((i) => `
      <div class="card wm-inv">
        <div class="wm-inv-v">${esc(i.value)}</div>
        <h3>${esc(i.title)}</h3>
        <p>${esc(i.text)}</p>
        ${cite(i.src)}
      </div>`).join("");
  }

  function drawNeeds() {
    $("wm-needs").innerHTML = D.needs.map((n) => `
      <div class="wm-need">
        <h3>${esc(n.title)}</h3>
        <ul class="wm-list">${n.points.map((p) => `<li>${esc(p.text)} ${cite(p.src)}</li>`).join("")}</ul>
      </div>`).join("");
  }

  function drawActors() {
    $("wm-actors").innerHTML = D.actors.map((a) => `
      <div class="card wm-actor">
        <h3>${esc(a.name)}</h3>
        <p>${esc(a.what)}</p>
        <ul class="wm-list">${a.figures.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        ${cite(a.src)}
      </div>`).join("");
  }

  function drawMap(data) {
    const projects = (data && data.projects) || [];
    const rx = new RegExp(`\\b(${D.keywords})\\b`, "i");
    const focus = projects.filter((p) => rx.test(`${p.name || ""} ${p.description || ""} ${p.remarks || ""}`));
    const states = new Set(focus.flatMap((p) => (p.nationwide ? ["Nationwide"] : p.states || [])));
    const budget = focus.reduce((s, p) => s + (p.budget || 0), 0);
    const reporting = projects.filter((p) => p.femaleShare != null && p.people && p.people.total);
    const reached = reporting.reduce((s, p) => s + p.people.total * p.femaleShare, 0);
    const wlo = projects.filter((p) => (p.leadership || []).includes("WLO"));
    const leads = [...new Set(focus.map((p) => p.lead))];
    $("wm-map").innerHTML = `
      <div class="wm-map-kpis">
        <div><b>${focus.length}</b><span>of ${projects.length} projects on the map focus on women and girls</span></div>
        <div><b>${budget ? usd(budget).replace("US$", "$") : "0"}</b><span>total budget of these projects</span></div>
        <div><b>${states.has("Nationwide") ? "Nationwide" : states.size}</b><span>${states.has("Nationwide") ? "coverage" : `state${states.size === 1 ? "" : "s"} covered`}</span></div>
        <div><b>${reporting.length}</b><span>of ${projects.length} projects report how many women and girls they reach${reporting.length ? `, about ${people(Math.round(reached))} in total` : ""}</span></div>
        <div><b>${wlo.length}</b><span>projects led by women-led organisations</span></div>
      </div>
      ${reporting.length < projects.length ? `<p class="wm-note"><b>A data gap to close.</b> Organisations can now report the share of women and girls their projects reach, and the share of persons with disabilities. ${reporting.length ? "Only some" : "None"} of the projects on the map have done so yet. Partners can add these figures through <a href="add.html">Add your project</a>, or by suggesting a correction on any project.</p>` : ""}
      ${focus.length ? `<table class="wm-table"><thead><tr><th>Project</th><th>Lead</th><th>Where</th><th>Budget</th></tr></thead><tbody>
        ${focus.map((p) => `<tr><td><a href="./#project=${encodeURIComponent(p.id)}">${esc(p.name)}</a></td><td>${esc(p.lead)}</td>
          <td>${esc(p.nationwide ? "Nationwide" : `${(p.states || []).length} state${(p.states || []).length === 1 ? "" : "s"}`)}</td><td>${p.budget ? esc(SF.fmtMoney(p.budget)) : ""}</td></tr>`).join("")}
      </tbody></table>
      <p class="wm-small">Projects whose name or description mentions women, girls, gender, gender-based violence, female genital mutilation, midwives or maternal health. Lead organisations: ${esc(leads.join(", "))}.</p>` : ""}`;
  }

  function drawStories(st) {
    const items = ((st && st.items) || []).filter((x) => x.topic === "women").sort((a, b) => (a.sort || 99) - (b.sort || 99) || String(b.date).localeCompare(String(a.date)));
    $("wm-stories").innerHTML = items.length ? items.map((s) => `
      <article class="card wm-story">
        <div class="wm-story-meta">${esc(s.org || "")}${s.date ? ` · ${esc(when(s.date))}` : ""}${s.place ? ` · ${esc(s.place)}` : ""}</div>
        <h3><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></h3>
        ${s.summary ? `<p>${esc(s.summary)}</p>` : ""}
        ${s.quote ? `<blockquote>“${esc(s.quote.replace(/^["“]|["”]$/g, ""))}”${s.quoteBy ? `<cite>${esc(s.quoteBy)}</cite>` : ""}</blockquote>` : ""}
      </article>`).join("") : `<p class="muted">No stories yet.</p>`;
  }

  async function drawNews() {
    const host = $("wm-news");
    const api = SF.config.authUrl || SF.config.apiUrl;
    const more = `<a href="https://reliefweb.int/country/sdn" target="_blank" rel="noopener">See all reports on Sudan on ReliefWeb</a>`;
    if (!api) { host.innerHTML = `<p class="wm-small" style="margin:0">${more}.</p>`; return; }
    try {
      const r = await fetch(`${api}/api/news?topic=women`);
      const j = await r.json();
      if (!j.items || !j.items.length) {
        host.innerHTML = `<p class="wm-small" style="margin:0">${j.configured === false ? "The live list of reports from ReliefWeb is being set up." : "No reports could be loaded just now."} ${more}.</p>`;
        return;
      }
      host.innerHTML = `<ul class="wm-news-list">${j.items.slice(0, 8).map((n) => `
        <li><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a>
          <div class="wm-small">${esc(n.source)}${n.date ? ` · ${esc(when(n.date))}` : ""}</div>
          ${n.summary ? `<div class="wm-news-sum">${esc(n.summary)}…</div>` : ""}</li>`).join("")}</ul>
        <p class="wm-small" style="margin:10px 0 0">Updated automatically from ReliefWeb (OCHA), Sudan reports on gender. ${more}.</p>`;
    } catch (e) {
      host.innerHTML = `<p class="wm-small" style="margin:0">No reports could be loaded just now. ${more}.</p>`;
    }
  }

  function drawSources() {
    // numbered in the order they first appear on the page, then the rest
    Object.keys(SRC).forEach((k) => { if (!ORDER.includes(k)) ORDER.push(k); });
    $("wm-sources").innerHTML = ORDER.map((k) => { const s = SRC[k]; return `<li id="src-${esc(k)}">${esc(s.org)}, <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>, ${esc(when(s.date))}.</li>`; }).join("");
  }

  function csv() {
    const rows = [["Section", "Figure", "Source", "Source date", "Link"]];
    const src = (k) => [SRC[k] ? `${SRC[k].org}: ${SRC[k].title}` : "", SRC[k] ? SRC[k].date : "", SRC[k] ? SRC[k].url : ""];
    D.headline.forEach((h) => rows.push(["At a glance", `${h.value} ${h.label}`, ...src(h.src)]));
    const f = D.funding;
    rows.push(["Funding", `Sudan humanitarian appeal 2026: ${usd(f.hnrp.received)} received of ${usd(f.hnrp.required)} (${f.hnrp.pct}%), as of ${f.hnrp.asOf}`, ...src(f.hnrp.src)]);
    rows.push(["Funding", `UNFPA appeal 2026: ${usd(f.unfpa.gapTotal)} still needed of ${usd(f.unfpa.required)}, as of ${f.unfpa.asOf}`, ...src(f.unfpa.src)]);
    f.unfpa.gap.forEach((g) => rows.push(["Funding", `UNFPA still needed for ${g.label}: ${usd(g.value)}`, ...src(f.unfpa.src)]));
    rows.push(["Funding", `Services after gender-based violence: ${usd(f.gbv.required)} needed, ${people(f.gbv.targeted)} people targeted`, ...src(f.gbv.src)]);
    rows.push(["Funding", `Services after gender-based violence: ${people(f.gbv.reached)} people reached, ${f.gbv.reachedAsOf}`, ...src(f.gbv.reachedSrc)]);
    f.wlo.forEach((w) => rows.push(["Funding", w.text, ...src(w.src)]));
    D.invest.forEach((i) => rows.push(["Why invest in women", `${i.title}: ${i.text}`, ...src(i.src)]));
    D.needs.forEach((n) => n.points.forEach((p) => rows.push([n.title, p.text, ...src(p.src)])));
    D.actors.forEach((a) => a.figures.forEach((x) => rows.push([`Who is doing what: ${a.name}`, x, ...src(a.src)])));
    const q = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const blob = new Blob(["﻿" + rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `women-and-girls-sudan-figures-${D.updated}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  SF.renderHeader("women");
  Promise.all([SF.loadJSON("data/women.json"), SF.loadJSON(SF.config.dataUrl).catch(() => null), SF.loadJSON("data/stories.json").catch(() => null)])
    .then(([d, data, stories]) => {
      D = d; SRC = d.sources;
      $("wm-asof").textContent = `Figures as of ${when(d.updated)}. Each figure links to its source, listed at the bottom of the page.`;
      drawStats(); drawFunding(); drawInvest(); drawNeeds(); drawActors(); drawMap(data); drawStories(stories); drawSources();
      drawNews();
      SF.renderFooter(data && data.lastUpdated);
      $("wm-csv").addEventListener("click", csv);
      $("wm-print").addEventListener("click", () => window.print());
    })
    .catch(() => { $("main").insertAdjacentHTML("afterbegin", `<div class="note-box warn">The page data could not be loaded. Please reload the page.</div>`); SF.renderFooter(); });
})();
