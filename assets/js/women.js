/* Women and girls page (git page only). Built for a busy reader: the message, three numbers and the ask first,
   then three key messages, then detail on demand. Data: data/women.json (figures and sources), data/stories.json
   (stories chosen by DSU), data/projects.json (the map) and the latest ReliefWeb reports through the back end. */
"use strict";
(() => {
  const esc = SF.esc;
  const $ = (id) => document.getElementById(id);
  const IC = SF.ICONS_THEME || {};
  const icon = (k) => IC[k] || "";
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const when = (d) => {
    const m = String(d || "").match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
    if (!m) return String(d || "");
    return m[3] ? `${Number(m[3])} ${MONTHS[m[2] - 1]} ${m[1]}` : m[2] ? `${MONTHS[m[2] - 1]} ${m[1]}` : m[1];
  };
  const trim = (t) => (t.includes(".") ? t.replace(/0+$/, "").replace(/\.$/, "") : t);
  const usd = (n) => (n >= 1e9 ? `US$${trim((n / 1e9).toFixed(2))} billion` : `US$${trim((n / 1e6).toFixed(1))} million`);
  const people = (n) => (n >= 1e6 ? `${trim((n / 1e6).toFixed(1))} million` : SF.fmtInt(n));

  let D, SRC;
  const ORDER = [];
  // Small numbered source marks; the numbered list sits at the bottom of the page
  const cite = (keys) => [].concat(keys || []).filter((k) => SRC[k]).map((k) => {
    if (!ORDER.includes(k)) ORDER.push(k);
    const n = ORDER.indexOf(k) + 1, s = SRC[k];
    return `<a class="w2-cite" href="#src-${esc(k)}" data-src="${esc(k)}" title="${esc(`Source: ${s.org}${s.date ? `, ${when(s.date)}` : ""}`)}">${n}</a>`;
  }).join("");

  function drawTop() {
    const h = D.hero;
    $("w2-kicker").textContent = `${h.kicker} · ${when(D.updated).replace(/^\d+ /, "")}`;
    $("w2-title").textContent = h.title;
    $("w2-sub").innerHTML = `${esc(h.sub)}${cite(h.subSrc)}`;
    $("w2-big").innerHTML = D.top.map((t) => `
      <div class="w2-big-c">
        <span class="w2-ico">${icon(t.icon)}</span>
        <div><div class="w2-big-v">${esc(t.value)}${cite(t.src)}</div>
        <div class="w2-big-l">${esc(t.label)}</div>
        <div class="w2-big-n">${esc(t.note)}</div></div>
      </div>`).join("");
    $("w2-ask").innerHTML = `
      <div class="w2-ask-h">${esc(D.ask.title)}</div>
      <ol>${D.ask.items.map((a) => `<li><b>${esc(a.b)}</b> ${esc(a.t)}</li>`).join("")}</ol>`;
  }

  function drawMessages() {
    $("w2-msgs").innerHTML = D.messages.map((m, i) => `
      <div class="card w2-msg">
        <div class="w2-msg-h"><span class="w2-n">${i + 1}</span><span class="w2-ico sm">${icon(m.icon)}</span><span class="w2-msg-s">${esc(m.stat)}</span></div>
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.text)}${cite(m.src)}</p>
      </div>`).join("");
  }

  const tile = (t) => `
    <div class="card w2-tile">
      <span class="w2-ico">${icon(t.icon)}</span>
      <div><div class="w2-tile-v">${esc(t.value)}${cite(t.src)}</div><div class="w2-tile-l">${esc(t.label)}</div></div>
    </div>`;

  function drawFace() {
    $("w2-face").innerHTML = D.face.map(tile).join("");
    $("w2-needs").innerHTML = D.needs.map((n) => `
      <div><h3>${esc(n.title)}</h3><ul>${n.points.map((p) => `<li>${esc(p.text)}${cite(p.src)}</li>`).join("")}</ul></div>`).join("");
  }

  // Pictogram: one figure stands for 5% of the people who need help
  const figures = (on, total) => `<div class="w2-figs" aria-hidden="true">${Array.from({ length: total }, (_, i) => `<span class="${i < on ? "on" : ""}">${icon("person-1")}</span>`).join("")}</div>`;
  function drawFunding() {
    const f = D.funding, g = f.gbv, u = f.unfpa, h = f.hnrp;
    const pct = (g.reached / 12400000) * 100;
    const funded = Math.round(((u.required - u.gapTotal) / u.required) * 100);
    $("w2-fund").innerHTML = `
      <div class="card w2-fund-c">
        <h3>Only about ${Math.round(pct)}% of people who need help after gender-based violence were reached</h3>
        ${figures(Math.max(1, Math.round(pct / 5)), 20)}
        <p class="w2-fig-cap"><b>${people(g.reached)}</b> reached from January to August 2026, out of <b>12.4 million</b> in need.${cite([g.reachedSrc, g.src])} Each figure is 5% of the people in need.</p>
      </div>
      <div class="w2-fund-2">
        <div class="card w2-fund-c">
          <h3>UNFPA's 2026 appeal for women's health and protection</h3>
          <div class="w2-bar" title="${funded}% funded"><i style="width:${funded}%"></i></div>
          <p class="w2-bar-l"><b>${usd(u.gapTotal)} missing</b> of ${usd(u.required)}${cite(u.src)}</p>
          <ul class="w2-gap">${u.gap.map((x) => `<li><span>${esc(x.label)}</span><b>${usd(x.value)}</b></li>`).join("")}</ul>
        </div>
        <div class="card w2-fund-c">
          <h3>Sudan's whole humanitarian appeal for 2026</h3>
          <div class="w2-bar" title="${h.pct}% funded"><i style="width:${h.pct}%"></i></div>
          <p class="w2-bar-l"><b>${h.pct}% funded</b>: ${usd(h.received)} of ${usd(h.required)}, as of ${esc(h.asOf)}${cite(h.src)}</p>
          <p class="w2-small" style="margin:10px 0 0">Women-led organisations are cut first: ${esc(f.wlo[1].text.charAt(0).toLowerCase() + f.wlo[1].text.slice(1))}${cite(f.wlo[1].src)}</p>
        </div>
      </div>`;
  }

  // Solutions: the return on investing in women (global evidence, each tied to Sudan), then what already works in Sudan
  function drawSolutions() {
    const r = D.roi;
    $("w2-roi").innerHTML = `
      <h3 class="w2-roi-h">${esc(r.title)}</h3>
      <div class="w2-roi-g">${r.items.map((i) => `
        <div class="w2-roi-c">
          <span class="w2-ico">${icon(i.icon)}</span>
          <div class="w2-roi-v">${esc(i.value)}${cite(i.src)}</div>
          <p class="w2-roi-l">${esc(i.label)}</p>
          <p class="w2-roi-s"><b>In Sudan:</b> ${esc(i.sudan)}${cite(i.sudanSrc)}</p>
        </div>`).join("")}</div>
      <p class="w2-roi-n">${esc(r.lead)}</p>`;
    $("w2-works-h").textContent = D.works.title;
    $("w2-works").innerHTML = D.works.items.map((i) => `
      <div class="card w2-tile w2-inv">
        <span class="w2-ico">${icon(i.icon)}</span>
        <div><div class="w2-tile-v">${esc(i.value)}</div><h3>${esc(i.title)}</h3><p>${esc(i.text)}${cite(i.src)}</p></div>
      </div>`).join("");
  }

  function drawVoices(st) {
    const items = ((st && st.items) || []).filter((x) => x.topic === "women")
      .sort((a, b) => (a.sort || 99) - (b.sort || 99) || String(b.date).localeCompare(String(a.date)));
    const theme = (s) => { const t = `${s.title} ${s.summary}`; return /midwi|pregnan|maternal|birth/i.test(t) ? "pregnant" : /farm|harvest|food/i.test(t) ? "agriculture" : /mutual aid|solidarity|kitchen/i.test(t) ? "partnership" : /peace|leader/i.test(t) ? "leadership" : "person-1"; };
    const card = (s) => `
      <article class="card w2-voice${s.photo ? " has-photo" : ""}">
        ${s.photo ? `<figure class="w2-ph"><img src="${esc(s.photo)}" alt="${esc(s.photoAlt || "")}" loading="lazy"><figcaption>${esc(s.photoCredit || "")}</figcaption></figure>`
          : `<div class="w2-ph w2-ph-none" aria-hidden="true">${icon(theme(s))}<span>${esc(s.place || s.org || "")}</span></div>`}
        <div class="w2-voice-b">
        ${s.quote ? `<blockquote>“${esc(s.quote.replace(/^["“]|["”]$/g, ""))}”</blockquote>${s.quoteBy ? `<p class="w2-by">${esc(s.quoteBy)}</p>` : ""}` : ""}
        <h3><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></h3>
        ${s.summary ? `<p>${esc(s.summary)}</p>` : ""}
        <p class="w2-small">${esc(s.org || "")}${s.date ? ` · ${esc(when(s.date))}` : ""}${s.place ? ` · ${esc(s.place)}` : ""}</p>
        </div>
      </article>`;
    const quoted = items.filter((s) => s.quote);
    const first = (quoted.length >= 2 ? quoted : items).slice(0, 2);
    const rest = items.filter((s) => !first.includes(s));
    $("w2-voices").innerHTML = first.length ? first.map(card).join("") : `<p class="w2-small">No stories yet.</p>`;
    $("w2-more-stories").innerHTML = rest.map(card).join("");
    $("w2-more-stories-wrap").hidden = !rest.length;
  }

  function drawActors() {
    $("w2-actors").innerHTML = `<thead><tr><th>Who</th><th>What they do</th><th>Latest results</th></tr></thead><tbody>${D.actors.map((a) => `
      <tr><th scope="row">${esc(a.name)}</th><td>${esc(a.what)}</td><td>${esc(a.figures[0])}${cite(a.src)}</td></tr>`).join("")}</tbody>`;
  }

  // A small map of Sudan with the project's states filled in
  let GEO = null, VIEW = "0 0 860 920";
  function miniMap(states) {
    if (!GEO) return "";
    const on = new Set(states || []);
    return `<svg class="w2-mini" viewBox="${VIEW}" role="img" aria-label="${esc(`Map of Sudan showing ${on.size} state${on.size === 1 ? "" : "s"}`)}">${
      GEO.states.map((st) => `<path d="${st.path}" class="${on.has(st.name) ? "on" : ""}"><title>${esc(st.name)}</title></path>`).join("")}</svg>`;
  }
  const years = (p) => { const a = String(p.start || "").slice(0, 4), b = String(p.end || "").slice(0, 4); return a && b && a !== b ? `${a} to ${b}` : a || b || ""; };
  const listStates = (st) => (st.length <= 3 ? st.join(", ") : `${st.slice(0, 2).join(", ")} and ${st.length - 2} more states`);

  function drawProjects(data) {
    const projects = (data && data.projects) || [];
    const rx = new RegExp(`\\b(${D.keywords})\\b`, "i");
    const focus = projects.filter((p) => rx.test(`${p.name || ""} ${p.description || ""} ${p.remarks || ""}`))
      .sort((a, b) => (b.budget || 0) - (a.budget || 0) || String(a.name).localeCompare(String(b.name)));
    const budget = focus.reduce((s, p) => s + (p.budget || 0), 0);
    const states = new Set(focus.flatMap((p) => p.states || []));
    const reporting = projects.filter((p) => p.femaleShare != null && p.people && p.people.total);
    $("w2-proj-sum").innerHTML = `<b>${focus.length} of ${projects.length}</b> projects on the map focus on women and girls${budget ? `: <b>${usd(budget)}</b>` : ""} in ${states.size} state${states.size === 1 ? "" : "s"}.
      <span class="w2-gapnote">${icon("report")}<span>${reporting.length ? `Only ${reporting.length} of ${projects.length} projects report` : `None of the ${projects.length} projects reports yet`} how many women and girls they reach. Partners can add it through <a href="add.html">Add your project</a>.</span></span>`;
    $("w2-proj").innerHTML = focus.map((p) => {
      const st = p.nationwide ? ["Nationwide"] : p.states || [];
      return `
      <article class="card w2-pc">
        <div class="w2-pc-top">
          <div class="w2-pc-head">
            <div class="w2-pc-org">${SF.logoImg(p.lead, "mark", "w2-pc-logo")}<span>${esc(p.lead || "")}</span></div>
            <h3>${esc(p.name)}</h3>
          </div>
          ${miniMap(p.nationwide ? GEO && GEO.states.map((x) => x.name) : p.states)}
        </div>
        <p class="w2-pc-meta">${[years(p), p.budget ? `US${SF.fmtMoney(p.budget)}` : "", p.people && p.people.total ? `${people(p.people.total)} people` : ""].filter(Boolean).map(esc).join(" · ")}</p>
        <p class="w2-pc-where">${esc(listStates(st))}</p>
        <a class="w2-pc-link" href="./#project=${encodeURIComponent(p.id)}">View on the map</a>
      </article>`; }).join("") || `<p class="w2-small">No projects yet.</p>`;
  }

  function drawAgencies() {
    const a = D.agencies;
    $("w2-agencies-h").textContent = a.title;
    $("w2-agencies").innerHTML = `<p class="w2-lead">${esc(a.lead)}</p>
      <ul class="w2-logos">${a.items.map((i) => { const l = SF.LOGOS[i.key];
        return `<li title="${esc(i.name)}">${l ? `<img src="${esc(l.full)}" alt="${esc(i.name)}" loading="lazy">` : `<span class="w2-logo-t">${esc(i.key)}<small>${esc(i.name !== i.key ? i.name : "")}</small></span>`}</li>`; }).join("")}</ul>`;
  }

  async function drawNews() {
    const host = $("w2-news");
    const api = SF.config.authUrl || SF.config.apiUrl;
    const more = `<a href="https://reliefweb.int/country/sdn" target="_blank" rel="noopener">See all reports on Sudan on ReliefWeb</a>`;
    try {
      if (!api) throw new Error("no back end");
      const j = await (await fetch(`${api}/api/news?topic=women`)).json();
      if (!j.items || !j.items.length) throw new Error("empty");
      host.innerHTML = `<ul class="w2-news-l">${j.items.slice(0, 5).map((n) => `
        <li><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a> <span class="w2-small">${esc(n.source)}${n.date ? `, ${esc(when(n.date))}` : ""}</span></li>`).join("")}</ul>
        <p class="w2-small" style="margin:8px 0 0">Updated automatically from ReliefWeb. ${more}.</p>`;
    } catch (e) {
      host.innerHTML = `<p class="w2-small" style="margin:0">${more}.</p>`;
    }
  }

  function drawSources() {
    Object.keys(SRC).forEach((k) => { if (!ORDER.includes(k)) ORDER.push(k); });
    $("w2-sources-sum").textContent = `Sources (${ORDER.length})`;
    $("w2-sources").innerHTML = ORDER.map((k) => { const s = SRC[k]; return `<li id="src-${esc(k)}">${esc(s.org)}, <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.date ? `, ${esc(when(s.date))}` : ""}.</li>`; }).join("");
    // a source number opens the list and jumps to the source
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a.w2-cite");
      if (!a) return;
      e.preventDefault();
      $("w2-sources-wrap").open = true;
      const li = $(`src-${a.dataset.src}`);
      li.scrollIntoView({ behavior: "smooth", block: "center" });
      li.classList.add("hl"); setTimeout(() => li.classList.remove("hl"), 1600);
    });
  }

  /* ---------- early access ----------
     While the page is under development, only people with early access can open it: the owners and the
     people a DSU admin adds as "Early access" on the Approved editors page. The list is kept on the back end,
     never in this file. Everyone else sees a short note with the contact for early access. */
  const ACCESS_EMAIL = "md.karim@un.org";
  const accessLink = `<a href="mailto:${ACCESS_EMAIL}?subject=${encodeURIComponent("Early access: Women and girls page")}">${ACCESS_EMAIL}</a>`;
  const signInOpts = {
    intro: "For people with early access to this page. We will email you a 6-digit code. No password needed.",
    refused: `This page is under development. For early access, please contact ${accessLink}.`,
  };
  let loaded = false;

  function gate(state, s) {
    const main = $("main");
    main.setAttribute("data-locked", "");
    const lock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
    const body = {
      checking: `<p class="w2-small" style="margin:0">Checking access…</p>`,
      out: `<p>For early access, please contact ${accessLink}.</p>
        <div class="w2-gate-act"><button type="button" class="btn btn-primary" id="w2-signin">${SF.icons.user}<span>Sign in</span></button></div>
        <p class="w2-small">Already have early access? Sign in with your work email. We will email you a 6-digit code.</p>`,
      denied: `<p>You are signed in as <b>${esc((s && s.email) || "")}</b>, which does not have early access yet. For early access, please contact ${accessLink}.</p>
        <div class="w2-gate-act"><button type="button" class="btn" id="w2-other">Sign in with a different email</button></div>`,
      offline: `<p>The page could not check your access. Please check your connection and reload the page.</p>
        <div class="w2-gate-act"><button type="button" class="btn" onclick="location.reload()">Reload</button></div>`,
    }[state];
    $("w2-gate").innerHTML = state === "checking" ? body : `<div class="card w2-gate-card">
        <span class="w2-gate-ico">${lock}</span>
        <p class="w2-kicker">Women and girls in Sudan</p>
        <h1>This page is under development</h1>
        ${body}</div>`;
    if ($("w2-signin")) $("w2-signin").addEventListener("click", () => SF.auth.open(signInOpts));
    if ($("w2-other")) $("w2-other").addEventListener("click", () => { SF.auth.clear(); SF.auth.drawButton(); SF.auth.open(signInOpts); });
  }

  // Asks the back end, so access cannot be given by changing anything in this browser
  async function hasAccess() {
    const s = SF.auth.get();
    if (!s || !SF.config.authUrl) return { state: "out" };
    let r;
    try { r = await fetch(SF.config.authUrl + "/api/auth/me", { headers: { Authorization: `Bearer ${s.token}` }, cache: "no-store" }); }
    catch (e) { return { state: "offline" }; }
    if (r.status === 401) { SF.auth.clear(); SF.auth.drawButton(); return { state: "out" }; }
    const j = await r.json().catch(() => ({}));
    if (!j.ok) return { state: "offline" };
    return (j.pages || []).includes("women") ? { state: "in" } : { state: "denied", s: j };
  }

  function load() {
    if (loaded) return;
    loaded = true;
    Promise.all([SF.loadJSON("data/women.json"), SF.loadJSON(SF.config.dataUrl).catch(() => null), SF.loadJSON("data/stories.json").catch(() => null),
      SF.loadJSON("data/geo.json").catch(() => null), SF.loadLogos()])
      .then(([d, data, stories, geo]) => {
        D = d; SRC = d.sources;
        if (geo && geo.states) {
          GEO = geo;
          const bb = geo.states.reduce((m, x) => [Math.min(m[0], x.bbox[0]), Math.min(m[1], x.bbox[1]), Math.max(m[2], x.bbox[2]), Math.max(m[3], x.bbox[3])], [1e9, 1e9, -1e9, -1e9]);
          VIEW = `${bb[0] - 6} ${bb[1] - 6} ${bb[2] - bb[0] + 12} ${bb[3] - bb[1] + 12}`;
        }
        // drawn in page order, so the source numbers run from the top of the page down
        drawTop(); drawMessages(); drawFace(); drawSolutions(); drawFunding(); drawVoices(stories); drawProjects(data); drawActors(); drawAgencies(); drawSources();
        drawNews();
        SF.renderFooter(data && data.lastUpdated);
        $("main").removeAttribute("data-locked");
      })
      .catch(() => { $("main").removeAttribute("data-locked"); $("main").insertAdjacentHTML("afterbegin", `<div class="note-box warn">The page data could not be loaded. Please reload the page.</div>`); });
  }

  async function check() {
    gate("checking");
    const a = await hasAccess();
    if (a.state === "in") load(); else gate(a.state, a.s);
  }

  SF.renderHeader("women");
  SF.renderFooter();
  document.addEventListener("sf-signed-in", check);
  // after Sign out, start again from a clean page, so nothing of the page stays behind
  document.addEventListener("sf-signed-out", () => { if (loaded) location.reload(); else check(); });
  check();
})();
