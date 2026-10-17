/* "Add your project" form. Builds an email to the DSWG mailbox; nothing is stored on this site. */
"use strict";

(() => {
  const { esc, CRITERIA, STATES } = SF;
  const form = document.getElementById("project-form");
  const $ = (id) => document.getElementById(id);
  let correcting = null;

  /* ---------- build the choice lists ---------- */
  $("itypes").innerHTML = SF.INTERVENTION_TYPES.map((t, i) =>
    `<label><input type="checkbox" name="itypes" value="${esc(t)}" id="it-${i}"> ${esc(t)}</label>`).join("");
  $("states").innerHTML = STATES.map((s, i) =>
    `<label><input type="checkbox" name="states" value="${esc(s)}" id="st-${i}"> ${esc(s)}</label>`).join("");
  $("criteria").innerHTML = CRITERIA.map((c) =>
    `<label class="crit-opt"><input type="checkbox" name="criteria" value="${c.n}"><i style="background:${c.color}"></i>
      <span><b>${c.n}. ${esc(c.name)}</b><small>${esc(c.hint)}</small></span></label>`).join("");
  $("coordination").innerHTML += SF.COORDINATION_OPTIONS.map((o) => `<option>${esc(o)}</option>`).join("");
  const PEOPLE = [{ key: "total", label: "Total" }, ...SF.TARGET_GROUPS];
  $("people").innerHTML = PEOPLE.map((g) =>
    `<div class="fld"><label for="pp-${g.key}">${g.label}</label><input class="input" id="pp-${g.key}" name="pp-${g.key}" inputmode="numeric"></div>`).join("");
  document.querySelectorAll(".contact-email").forEach((e) => (e.textContent = SF.config.contactEmail));
  document.querySelectorAll(".contact-link").forEach((a) => { a.href = `mailto:${SF.config.contactEmail}`; a.textContent = SF.config.contactEmail; });

  /* ---------- helpers ---------- */
  const num = (v) => {
    if (v == null) return null;
    const s = String(v).replace(/[,\s$]/g, "");
    if (s === "") return null;
    const n = Number(s);
    return isFinite(n) ? n : NaN;
  };
  const checked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);
  const scope = () => (form.querySelector('input[name="scope"]:checked') || {}).value || "";
  const monthOk = (v) => /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
  const fmtMonthValue = (v) => {
    if (!monthOk(v)) return v;
    const [y, m] = v.split("-").map(Number);
    return SF.fmtMonth(new Date(y, m - 1, 1));
  };

  function updateDS() {
    const b = num($("budget").value), s = num($("share").value);
    $("dsAmount").value = b > 0 && s >= 0 && s <= 100 ? SF.fmtUSD((b * s) / 100) : "Calculated automatically";
  }
  $("budget").addEventListener("input", updateDS);
  $("share").addEventListener("input", updateDS);

  function syncScope() {
    const nw = scope() === "nationwide";
    $("states-fld").style.opacity = nw ? 0.5 : 1;
    $("states-req").hidden = nw;
    form.querySelectorAll('input[name="states"]').forEach((i) => { i.disabled = nw; if (nw) i.checked = false; });
  }
  form.querySelectorAll('input[name="scope"]').forEach((r) => r.addEventListener("change", syncScope));

  /* ---------- validation ---------- */
  function validate() {
    const errors = [];
    const add = (f, msg) => errors.push({ f, msg });
    const v = (id) => $(id).value.trim();
    if (!v("name")) add("name", "Enter the project or programme name.");
    if (!checked("itypes").length) add("itypes", "Choose at least one intervention type.");
    if (!v("lead")) add("lead", "Enter the lead organisation.");
    if (!v("orgType")) add("orgType", "Choose the organisation type.");
    if (!v("fpName")) add("fpName", "Enter the focal point's name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("fpEmail"))) add("fpEmail", "Enter a valid focal point email address.");
    if (!scope()) add("scope", "Choose the geographic scope.");
    if (scope() === "states" && !checked("states").length) add("states", "Choose at least one state.");
    if (!checked("criteria").length) add("criteria", "Choose at least one IASC criterion.");
    if (!monthOk(v("start"))) add("start", "Enter the start month as YYYY-MM.");
    if (!monthOk(v("end"))) add("end", "Enter the end month as YYYY-MM.");
    if (monthOk(v("start")) && monthOk(v("end")) && v("end") < v("start")) add("end", "The end date must be after the start date.");
    if (!v("status")) add("status", "Choose the status.");
    const b = num(v("budget"));
    if (b == null || isNaN(b) || b <= 0) add("budget", "Enter the total budget in US dollars, as a number above 0.");
    const s = num(v("share"));
    if (s == null || isNaN(s) || s < 0 || s > 100) add("share", "Enter the share as a number from 0 to 100.");
    if (!v("donor")) add("donor", "Enter the donor or funding source.");
    let peopleErr = "";
    const pv = PEOPLE.map((g) => num($(`pp-${g.key}`).value));
    if (pv.some((x) => x != null && (isNaN(x) || x < 0 || !Number.isInteger(x)))) peopleErr = "People reached must be whole numbers.";
    else if (pv[0] != null && pv.slice(1).some((x) => x != null) && pv.slice(1).reduce((a, x) => a + (x || 0), 0) > pv[0]) peopleErr = "The groups add up to more than the total.";
    $("people-err").hidden = !peopleErr;
    $("people-err").textContent = peopleErr;
    if (peopleErr) add("people", peopleErr);
    if (!$("consent").checked) add("consent", "Confirm the information can be published.");

    form.querySelectorAll(".fld").forEach((f) => { f.classList.remove("has-err"); f.querySelector(".err[data-gen]")?.remove(); });
    form.querySelectorAll(".choice-pills").forEach((f) => f.classList.remove("has-err"));
    errors.forEach((e) => {
      const fld = form.querySelector(`[data-f="${e.f}"]`);
      if (!fld) return;
      fld.classList.add("has-err");
      fld.querySelector(".choice-pills")?.classList.add("has-err");
      const m = document.createElement("div");
      m.className = "err"; m.dataset.gen = "1"; m.textContent = e.msg;
      fld.appendChild(m);
    });
    const sum = $("error-summary");
    if (errors.length) {
      sum.innerHTML = `<strong>Please check ${errors.length} field${errors.length === 1 ? "" : "s"}:</strong><ul style="margin:6px 0 0;padding-left:20px">${errors.map((e) => `<li>${esc(e.msg)}</li>`).join("")}</ul>`;
      sum.hidden = false;
      sum.scrollIntoView({ behavior: "smooth", block: "start" });
    } else sum.hidden = true;
    return errors.length === 0;
  }

  /* ---------- email ---------- */
  function buildEmail() {
    const v = (id) => $(id).value.trim();
    const b = num(v("budget")), s = num(v("share"));
    const people = PEOPLE.map((g) => `${g.label}: ${v(`pp-${g.key}`)}`).join("; ");
    const lines = [
      correcting ? `SOLUTIONS FOOTPRINT: CORRECTION TO A PUBLISHED PROJECT` : `SOLUTIONS FOOTPRINT: NEW PROJECT SUBMISSION`,
      correcting ? `Published project: ${correcting.name} (ID ${correcting.id})` : null,
      "",
      "1. ABOUT THE PROJECT",
      `Project or programme name: ${v("name")}`,
      `Short description: ${v("description")}`,
      `Intervention type: ${checked("itypes").join("; ")}`,
      "",
      "2. WHO IS DOING IT",
      `Lead organisation: ${v("lead")}`,
      `Organisation type: ${v("orgType")}`,
      `Implementing partners: ${v("partners")}`,
      `Focal point name (not published): ${v("fpName")}`,
      `Focal point email (not published): ${v("fpEmail")}`,
      "",
      "3. WHERE",
      `Geographic scope: ${scope() === "nationwide" ? "Nationwide" : "One or more states"}`,
      `States: ${checked("states").join("; ")}`,
      `Localities: ${v("localities")}`,
      "",
      "4. IASC CRITERIA",
      `Criteria: ${checked("criteria").map((n) => `${n}. ${CRITERIA[n - 1].name}`).join("; ")}`,
      `Coordination mechanism or cluster: ${v("coordination")}`,
      "",
      "5. WHEN AND HOW MUCH",
      `Start date: ${fmtMonthValue(v("start"))}`,
      `End date: ${fmtMonthValue(v("end"))}`,
      `Status: ${v("status")}`,
      `Total budget (USD): ${SF.fmtUSD(b)}`,
      `Share towards durable solutions: ${s}%`,
      `Funding towards durable solutions (calculated): ${SF.fmtUSD((b * s) / 100)}`,
      `Donor or funding source: ${v("donor")}`,
      "",
      "6. PEOPLE REACHED, PLANNED",
      people,
      "",
      "7. ANYTHING ELSE",
      `Remarks: ${v("remarks")}`,
      "Consent to publish on the United Nations in Sudan website: Yes",
      "",
      `Sent from the Solutions Footprint form on ${SF.fmtDateLong(new Date())}.`,
    ].filter((l) => l !== null);
    const subject = `${correcting ? "Correction" : "New project"} for Solutions Footprint: ${v("name")}`.slice(0, 150);
    const body = lines.join("\r\n");
    const href = `mailto:${SF.config.contactEmail}?cc=${encodeURIComponent(v("fpEmail"))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { subject, body, href };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    const mail = buildEmail();
    $("done-subject").textContent = mail.subject;
    $("done-text").value = mail.body;
    $("reopen").href = mail.href;
    form.hidden = true;
    $("done").hidden = false;
    $("done").scrollIntoView({ behavior: "smooth", block: "start" });
    window.location.href = mail.href;
  });
  $("copy-btn").addEventListener("click", async () => {
    const t = $("done-text");
    try { await navigator.clipboard.writeText(t.value); }
    catch { t.select(); document.execCommand("copy"); }
    $("copy-btn").textContent = "Copied";
    setTimeout(() => ($("copy-btn").textContent = "Copy the text"), 2000);
  });
  $("edit-btn").addEventListener("click", () => { $("done").hidden = true; form.hidden = false; });

  /* ---------- "Suggest a correction": prefill from the published data ---------- */
  async function prefill(id) {
    let data;
    try { data = await SF.loadJSON(SF.config.dataUrl); } catch { return; }
    const p = data.projects.find((x) => x.id === id);
    if (!p) return;
    correcting = p;
    document.title = `Suggest a correction | Solutions Footprint`;
    $("form-title").textContent = "Suggest a correction";
    $("form-lede").innerHTML = `Change what is wrong or missing for <strong>${esc(p.name)}</strong>, then submit. DSU reviews every correction before it is published. Fields marked <span class="req">*</span> are required.`;
    const set = (id, v) => { if (v != null) $(id).value = v; };
    set("name", p.name); set("description", p.description); set("lead", p.lead);
    set("orgType", p.orgType || ""); set("partners", (p.partners || []).join(", "));
    set("localities", (p.localities || []).join(", "));
    if (p.coordination && ![...$("coordination").options].some((o) => o.value === p.coordination)) {
      $("coordination").insertAdjacentHTML("beforeend", `<option>${esc(p.coordination)}</option>`);
    }
    set("coordination", p.coordination || "");
    set("start", p.start ? p.start.slice(0, 7) : ""); set("end", p.end ? p.end.slice(0, 7) : "");
    const status = p.reportedStatus && ["Ongoing", "Pipeline", "Ended"].includes(p.reportedStatus) ? p.reportedStatus : "";
    set("status", status);
    set("budget", p.budget != null ? Math.round(p.budget).toLocaleString("en-US") : "");
    set("share", p.share != null ? Math.round(p.share * 1000) / 10 : "");
    set("donor", p.donor); set("remarks", p.remarks);
    PEOPLE.forEach((g) => set(`pp-${g.key}`, p.people && p.people[g.key] != null ? p.people[g.key] : ""));
    const tick = (name, vals) => form.querySelectorAll(`input[name="${name}"]`).forEach((i) => (i.checked = vals.includes(i.value)));
    tick("itypes", p.interventionTypes || []);
    tick("states", p.states || []);
    tick("criteria", (p.criteria || []).map(String));
    const sc = form.querySelector(`input[name="scope"][value="${p.nationwide ? "nationwide" : "states"}"]`);
    if (sc) sc.checked = true;
    syncScope();
    updateDS();
  }

  SF.renderHeader("add");
  SF.loadJSON(SF.config.dataUrl).then((d) => SF.renderFooter(d.lastUpdated)).catch(() => SF.renderFooter());
  const params = new URLSearchParams(location.search);
  if (params.get("correct")) prefill(params.get("correct"));
})();
