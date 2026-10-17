/* "My submissions": projects sent from this browser, kept in this browser only. */
"use strict";

(() => {
  const { esc } = SF;
  const $ = (id) => document.getElementById(id);
  let GEO = null, PUBLISHED = [];

  SF.renderHeader("mine");
  $("notice").innerHTML = `${SF.icons.info}<span><b>Saved only in this browser on this device.</b> If you clear your browser data, use a private window or switch to another device, this list will be empty. Your submissions are not lost: the Durable Solutions Unit has them and keeps the map up to date.</span>`;

  const isPublished = (a) => PUBLISHED.find((p) => p.name.trim().toLowerCase() === (a.name || "").trim().toLowerCase() && (p.lead || "").toLowerCase() === (a.lead || "").toLowerCase());

  function render() {
    const list = SF.render.loadSubmissions();
    const host = $("mine-list");
    if (list === null) {
      host.innerHTML = `<div class="card" style="padding:20px">This browser does not allow saving, so submissions cannot be listed here. Your submissions still reach the Durable Solutions Unit by email.</div>`;
      return;
    }
    if (!list.length) {
      host.innerHTML = `<div class="card" style="padding:24px;text-align:center"><p style="margin:0 0 12px">You have not sent any projects from this browser yet.</p><a class="btn btn-primary" href="add.html">${SF.icons.plus}Add your project</a></div>`;
      return;
    }
    host.innerHTML = list.map((e, i) => {
      const p = SF.render.fromAnswers(e.answers || {});
      const pub = isPublished(e.answers || {});
      const sent = new Date(e.savedAt);
      const status = pub ? `<span class="st-badge live">Published on the map</span>` : `<span class="st-badge sent">${e.correcting ? "Correction sent, awaiting review" : "Sent, awaiting review"}</span>`;
      return `<div class="card mine-item">
        ${SF.render.card(p)}
        <div class="meta">
          <div>${status}</div>
          <div>Sent on ${SF.fmtDateLong(sent)}</div>
          ${pub ? `<a class="btn" href="index.html#project=${encodeURIComponent(pub.id)}">${SF.icons.pin}View on the map</a>` : ""}
          <button type="button" class="btn" data-preview="${i}">See the preview</button>
          <button type="button" class="btn" data-copy="${i}">Copy the email text</button>
          <a class="btn" href="${esc(e.href)}">Open the email again</a>
          <button type="button" class="link-btn" data-remove="${esc(e.savedAt)}">Remove from this list</button>
        </div>
      </div>`;
    }).join("");
    host.querySelectorAll("[data-preview]").forEach((b) => b.addEventListener("click", () => openPreview(list[Number(b.dataset.preview)])));
    host.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
      const e = list[Number(b.dataset.copy)];
      const text = `Subject: ${e.subject}\n\n${e.body}`;
      try { await navigator.clipboard.writeText(text); SF.toast("Email text copied"); } catch { prompt("Copy this text:", text); }
    }));
    host.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => {
      if (confirm("Remove this project from the list in this browser? Your submission to the Durable Solutions Unit is not affected.")) {
        SF.render.removeSubmission(b.dataset.remove);
        render();
      }
    }));
  }

  function openPreview(e) {
    const p = SF.render.fromAnswers(e.answers || {});
    const d = $("detail");
    d.innerHTML = `<button type="button" class="modal-close" aria-label="Close" data-close>&times;</button>
      <div class="modal-scroll">
        <div class="hero">${SF.render.hero(p, { photoNote: "Your photos will appear here once the project is published" })}</div>
        ${SF.render.body(p, GEO, { titleId: "detail-title" })}
      </div>`;
    d.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => d.close()));
    d.onclick = (ev) => { if (ev.target === d) d.close(); };
    d.showModal();
  }

  Promise.all([SF.loadJSON(SF.config.dataUrl).catch(() => null), SF.loadJSON(SF.config.geoUrl).catch(() => null)]).then(([data, geo]) => {
    PUBLISHED = data ? data.projects : [];
    GEO = geo;
    SF.renderFooter(data && data.lastUpdated);
    render();
  });
})();
