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
    return `<a class="w2-cite" href="#src-${esc(k)}" data-src="${esc(k)}" title="${esc(`Source: ${s.org}, ${when(s.date)}`)}">${n}</a>`;
  }).join("");
  const mailto = () => `mailto:${SF.config.contactEmail}?subject=${encodeURIComponent("Supporting women and girls in Sudan")}`;

  function drawTop() {
    const h = D.hero;
    $("w2-kicker").textContent = `${h.kicker} · ${when(D.updated).replace(/^\d+ /, "")}`;
    $("w2-title").textContent = h.title;
    $("w2-sub").textContent = h.sub;
    $("w2-big").innerHTML = D.top.map((t) => `
      <div class="w2-big-c">
        <span class="w2-ico">${icon(t.icon)}</span>
        <div><div class="w2-big-v">${esc(t.value)}${cite(t.src)}</div>
        <div class="w2-big-l">${esc(t.label)}</div>
        <div class="w2-big-n">${esc(t.note)}</div></div>
      </div>`).join("");
    $("w2-ask").innerHTML = `
      <div class="w2-ask-h">${esc(D.ask.title)}</div>
      <ol>${D.ask.items.map((a) => `<li><b>${esc(a.b)}</b> ${esc(a.t)}</li>`).join("")}</ol>
      <a class="btn w2-ask-btn" href="${mailto()}">Contact the DSWG</a>`;
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

  function drawInvest() {
    const card = (i) => `
      <div class="card w2-tile w2-inv">
        <span class="w2-ico">${icon(i.icon)}</span>
        <div><div class="w2-tile-v">${esc(i.value)}</div><h3>${esc(i.title)}</h3><p>${esc(i.text)}${cite(i.src)}</p></div>
      </div>`;
    $("w2-invest").innerHTML = D.invest.filter((i) => D.investTop.includes(i.value)).map(card).join("");
    $("w2-invest-more").innerHTML = D.invest.filter((i) => !D.investTop.includes(i.value)).map(card).join("");
  }

  function drawVoices(st) {
    const items = ((st && st.items) || []).filter((x) => x.topic === "women")
      .sort((a, b) => (a.sort || 99) - (b.sort || 99) || String(b.date).localeCompare(String(a.date)));
    const card = (s) => `
      <article class="card w2-voice">
        ${s.quote ? `<blockquote>“${esc(s.quote.replace(/^["“]|["”]$/g, ""))}”</blockquote>${s.quoteBy ? `<p class="w2-by">${esc(s.quoteBy)}</p>` : ""}` : ""}
        <h3><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></h3>
        ${s.summary ? `<p>${esc(s.summary)}</p>` : ""}
        <p class="w2-small">${esc(s.org || "")}${s.date ? ` · ${esc(when(s.date))}` : ""}${s.place ? ` · ${esc(s.place)}` : ""}</p>
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

  function drawMap(data) {
    const projects = (data && data.projects) || [];
    const rx = new RegExp(`\\b(${D.keywords})\\b`, "i");
    const focus = projects.filter((p) => rx.test(`${p.name || ""} ${p.description || ""} ${p.remarks || ""}`));
    const budget = focus.reduce((s, p) => s + (p.budget || 0), 0);
    const states = new Set(focus.flatMap((p) => p.states || []));
    const reporting = projects.filter((p) => p.femaleShare != null && p.people && p.people.total);
    const reached = reporting.reduce((s, p) => s + p.people.total * p.femaleShare, 0);
    $("w2-map").innerHTML = `
      <div class="w2-map">
        <div class="card w2-tile"><span class="w2-ico">${icon("protection")}</span><div><div class="w2-tile-v">${focus.length} of ${projects.length}</div>
          <div class="w2-tile-l">projects on the map focus on women and girls: ${budget ? `$${trim((budget / 1e6).toFixed(1))} million` : "no budget reported"} in ${states.size} state${states.size === 1 ? "" : "s"}</div></div></div>
        <div class="card w2-tile w2-warn"><span class="w2-ico">${icon("report")}</span><div><div class="w2-tile-v">${reporting.length} of ${projects.length}</div>
          <div class="w2-tile-l">projects report how many women and girls they reach${reporting.length ? `: about ${people(Math.round(reached))}` : ""}. ${reporting.length < projects.length ? `Partners can add it through <a href="add.html">Add your project</a> or a correction.` : ""}</div></div></div>
      </div>
      ${focus.length ? `<details class="w2-more"><summary>See the ${focus.length} projects</summary><ul class="w2-proj">${focus.map((p) =>
        `<li><a href="./#project=${encodeURIComponent(p.id)}">${esc(p.name)}</a> <span class="w2-small">${esc(p.lead)}${p.budget ? `, ${esc(SF.fmtMoney(p.budget))}` : ""}</span></li>`).join("")}</ul>
        <p class="w2-small">Projects whose name or description mentions women, girls, gender, gender-based violence, female genital mutilation, midwives or maternal health.</p></details>` : ""}`;
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
    $("w2-sources").innerHTML = ORDER.map((k) => { const s = SRC[k]; return `<li id="src-${esc(k)}">${esc(s.org)}, <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>, ${esc(when(s.date))}.</li>`; }).join("");
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

  SF.renderHeader("women");
  Promise.all([SF.loadJSON("data/women.json"), SF.loadJSON(SF.config.dataUrl).catch(() => null), SF.loadJSON("data/stories.json").catch(() => null)])
    .then(([d, data, stories]) => {
      D = d; SRC = d.sources;
      drawTop(); drawMessages(); drawFace(); drawFunding(); drawInvest(); drawVoices(stories); drawActors(); drawMap(data); drawSources();
      drawNews();
      SF.renderFooter(data && data.lastUpdated);
      $("w2-contact").href = mailto();
    })
    .catch(() => { $("main").insertAdjacentHTML("afterbegin", `<div class="note-box warn">The page data could not be loaded. Please reload the page.</div>`); SF.renderFooter(); });
})();
