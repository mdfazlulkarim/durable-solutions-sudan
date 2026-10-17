/* Shared settings and helpers for every page. */
"use strict";

const SF = (window.SF = {});

SF.config = {
  contactEmail: "dswg.sd@undp.org",
  dataUrl: "data/projects.json",
  geoUrl: "data/geo.json",
  githubUrl: "https://github.com/mdfazlulkarim",
  linkedinUrl: "https://www.linkedin.com/in/fazlulkarim/",
};

SF.CRITERIA = [
  { n: 1, name: "Safety and security", short: "Safety and security", ring: "Safety", color: "#2A78D6", hint: "Protection, social cohesion, mine action, disaster risk reduction" },
  { n: 2, name: "Adequate standard of living", short: "Standard of living", ring: "Standard of living", color: "#EB6834", hint: "Water, health, education, shelter and other basic services" },
  { n: 3, name: "Access to livelihoods and employment", short: "Livelihoods and employment", ring: "Livelihoods", color: "#1BAF7A", hint: "Jobs, skills, cash-for-work, markets" },
  { n: 4, name: "Housing, land and property", short: "Housing, land and property", ring: "Housing and land", color: "#EDA100", hint: "Restoring homes, land and property rights" },
  { n: 5, name: "Access to documentation", short: "Documentation", ring: "Documentation", color: "#E87BA4", hint: "Civil and legal documents, legal counselling" },
  { n: 6, name: "Family reunification", short: "Family reunification", ring: "Family reunification", color: "#008300", hint: "Tracing and reuniting separated families" },
  { n: 7, name: "Participation in public affairs", short: "Participation in public affairs", ring: "Participation", color: "#6250D6", hint: "Voice in local decisions, community groups" },
  { n: 8, name: "Access to effective remedies and justice", short: "Remedies and justice", ring: "Remedies and justice", color: "#E34948", hint: "Access to justice and redress for violations" },
];
SF.GAP_COLOR = "#D6D5CF";

SF.STATES = [
  "Aj Jazirah", "Blue Nile", "Central Darfur", "East Darfur", "Gedaref", "Kassala",
  "Khartoum", "North Darfur", "North Kordofan", "Northern", "Red Sea", "River Nile",
  "Sennar", "South Darfur", "South Kordofan", "West Darfur", "West Kordofan", "White Nile",
];

SF.INTERVENTION_TYPES = [
  "Basic services rehabilitation", "Livelihoods and cash-for-work", "Shelter and housing",
  "Legal aid and documentation", "Social cohesion and peacebuilding",
  "Local governance and urban planning", "Data, evidence and preparedness", "Family reunification support",
];
SF.ORG_TYPES = [
  { key: "UN agency", label: "UN agencies" },
  { key: "International NGO", label: "International NGOs" },
  { key: "National NGO", label: "National NGOs" },
  { key: "Other", label: "Other" },
];
SF.TARGET_GROUPS = [
  { key: "idps", label: "IDPs" },
  { key: "returnees", label: "Returnees" },
  { key: "refugees", label: "Refugees" },
  { key: "host", label: "Host community" },
  { key: "other", label: "Other" },
];
SF.COORDINATION_OPTIONS = [
  "Durable Solutions Working Group (DSWG)", "Area Durable Solutions Working Group (ADSWG)",
  "Information Management Working Group (IMWG)", "Protection Cluster", "Shelter Cluster",
  "Health Cluster", "Education Cluster", "WASH Cluster", "Food Security and Livelihoods Cluster",
  "Legal Aid Working Group", "Other",
];

/* ---------- dates ---------- */
SF.today = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); })();
SF.parseDate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
SF.addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, date.getDate());
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
SF.fmtMonth = (d) => (d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "");
SF.fmtDateLong = (d) => (d ? `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}` : "");

/* Prepare a project for display: dates as Date objects and status from the dates. */
SF.enrich = (p) => {
  p._start = SF.parseDate(p.start);
  p._end = SF.parseDate(p.end);
  p.status = SF.deriveStatus(p);
  p._endingSoon = p.status === "Ongoing" && p._end && p._end >= SF.today && p._end <= SF.addMonths(SF.today, 6);
  p._orgs = [p.lead, ...(p.partners || [])].filter(Boolean);
  return p;
};
SF.deriveStatus = (p) => {
  const t = SF.today;
  if (p.reportedStatus === "Pipeline" && (!p._start || p._start > t)) return "Pipeline";
  if (p._end && p._end < t) return "Ended";
  if (p._start && p._start > t) return "Pipeline";
  if (p._start || p._end) return "Ongoing";
  return p.reportedStatus || null;
};

/* ---------- numbers ---------- */
SF.fmtInt = (n) => (n == null ? "" : Math.round(n).toLocaleString("en-US"));
SF.fmtMoney = (v, opts = {}) => {
  if (v == null || isNaN(v)) return "";
  const a = Math.abs(v);
  if (a >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `$${(v / 1e6).toFixed(a >= 1e8 || opts.round ? 0 : 1)}M`;
  if (a >= 1e3) return `$${(v / 1e3).toFixed(a >= 1e5 || opts.round ? 0 : 1).replace(/\.0$/, "")}K`;
  return `$${Math.round(v).toLocaleString("en-US")}`;
};
SF.fmtUSD = (v) => (v == null ? "" : `$${Math.round(v).toLocaleString("en-US")}`);
SF.fmtPct = (s) => (s == null ? "" : `${Math.round(s * 100)}%`);

SF.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

SF.loadJSON = async (url) => {
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error(`Could not load ${url}`);
  return r.json();
};

/* ---------- header and footer, shared by all pages ---------- */
SF.icons = {
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.7.5.6 5.6.6 11.9c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.8C23.4 5.6 18.3.5 12 .5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>',
};

SF.renderHeader = (active, opts = {}) => {
  const el = document.getElementById("site-header");
  if (!el) return;
  const nav = [
    { key: "map", href: "index.html", label: "Map" },
    // Phase 2 and 3 views stay hidden until they are released:
    // { key: "projects", href: "projects.html", label: "Projects" },
    // { key: "gaps", href: "gaps.html", label: "Gaps" },
    { key: "about", href: "about.html", label: "About the data" },
  ];
  const download = opts.download
    ? `<div class="dropdown">
         <button class="btn" id="dl-btn" aria-haspopup="true" aria-expanded="false">${SF.icons.download}Download data</button>
         <div class="dropdown-menu" id="dl-menu" hidden>
           <div class="hint">Projects matching the current filters</div>
           <button type="button" data-dl="csv">CSV (.csv)</button>
           <button type="button" data-dl="xlsx">Excel (.xlsx)</button>
         </div>
       </div>`
    : "";
  const add = active === "add"
    ? `<a class="btn" href="index.html">Back to the map</a>`
    : `<a class="btn btn-primary" href="add.html">${SF.icons.plus}Add your project</a>`;
  el.className = "site-header";
  el.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="index.html" aria-label="Solutions Footprint home">
        <img src="assets/img/un-sudan-logo.png" alt="United Nations Sudan" width="153" height="42">
        <span class="brand-divider" aria-hidden="true"></span>
        <span>
          <span class="brand-kicker">Durable Solutions Hub | Sudan</span><br>
          <span class="brand-title">Solutions Footprint</span>
        </span>
      </a>
      <nav class="main-nav" aria-label="Views">
        ${nav.map((n) => `<a href="${n.href}"${n.key === active ? ' aria-current="page"' : ""}>${n.label}</a>`).join("")}
      </nav>
      <div class="header-actions">${download}${add}</div>
    </div>`;
};

SF.renderFooter = (lastUpdated) => {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.className = "site-footer";
  el.innerHTML = `
    <div class="footer-inner">
      <span class="grow">Solutions Footprint, Durable Solutions Hub | Sudan. Data reported by organisations to the Durable Solutions Working Group${lastUpdated ? `, last updated ${SF.fmtDateLong(SF.parseDate(lastUpdated))}` : ""}.</span>
      <span>Contact: <a href="mailto:${SF.config.contactEmail}">${SF.config.contactEmail}</a></span>
      <span class="social">
        <a href="${SF.config.githubUrl}" target="_blank" rel="noopener" aria-label="GitHub" title="GitHub">${SF.icons.github}</a>
        <a href="${SF.config.linkedinUrl}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn">${SF.icons.linkedin}</a>
      </span>
    </div>`;
};
