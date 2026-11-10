/* Durable Solutions Hub | Sudan: one header, one footer and one Display menu for every page.
   Pages call HUB.header({...}) and HUB.footer({...}). Change the menu here and every page follows.
   Display choices (background, text size, colour-blind friendly) are kept in this browser:
   the background in "sf-theme" (always white until the person picks Dark), the rest in "dsh-display". */
(function () {
  var ROOT = "sudan/"; // git copy: links are sent to the Hub by the page
  var MAIN = [
    { key: "overview", label: "Overview", href: ROOT },
    { key: "howwework", label: "How we work", href: ROOT + "howwework/" },
    { key: "mapping", label: "Solutions Mapping", href: ROOT + "mapping/" },
    { key: "profiles", label: "State profiles", href: ROOT + "state-profiles/" },
    // a dropdown, to keep the top menu short
    { key: "resources", label: "Resources", items: [
      { key: "documents", label: "Documents", href: ROOT + "documents/", note: "Reports, snapshots and tools, with search" },
      { key: "unoffices", label: "UN offices", href: ROOT + "un-offices/", note: "Where each UN entity works in Sudan" },
      { key: "membership", label: "Membership", href: ROOT + "membership/", note: "Join or update the working groups" }
    ] }
  ];
  // every page link, dropdown items included (footer, active state)
  var FLAT = [];
  MAIN.forEach(function (m) { if (m.items) m.items.forEach(function (i) { FLAT.push(i); }); else FLAT.push(m); });
  function isSignedIn() { try { var s = JSON.parse(get("sf-session", "null")); return !!(s && s.token && s.expires > Date.now()); } catch (e) { return false; } }
  var CONTACT = "dswg.sd@undp.org";
  var doc = document.documentElement;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- display: white background first, then whatever the person chose ---------- */
  var st = { size: "1", cb: "0" };
  try { var saved = JSON.parse(get("dsh-display", "{}")); if (saved && typeof saved === "object") { st.size = String(saved.size || "1"); st.cb = String(saved.cb || "0"); } } catch (e) {}
  doc.dataset.theme = get("sf-theme", "light") === "dark" ? "dark" : "light";
  doc.classList.toggle("cb", st.cb === "1");
  function applyDisplay() {
    doc.classList.toggle("cb", st.cb === "1");
    if (document.body) document.body.style.zoom = st.size === "1" ? "" : st.size;
    put("dsh-display", JSON.stringify(st));
    var p = document.getElementById("hx-disp");
    if (p) [].forEach.call(p.querySelectorAll(".hx-seg button"), function (b) {
      var k = b.parentNode.getAttribute("data-k"), v = b.getAttribute("data-v");
      b.setAttribute("aria-pressed", String(k === "theme" ? doc.dataset.theme === v : st[k] === v));
    });
  }
  function setTheme(t) {
    doc.dataset.theme = t; put("sf-theme", t);
    try { document.dispatchEvent(new CustomEvent("sf-theme", { detail: t })); } catch (e) {}
    applyDisplay();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyDisplay); else applyDisplay();
  function syncSignedIn() { var on = isSignedIn(); document.querySelectorAll("[data-signed-in]").forEach(function (a) { if (a.getAttribute("aria-current") !== "page") a.hidden = !on; }); }
  document.addEventListener("sf-signed-in", syncSignedIn);
  document.addEventListener("sf-signed-out", function () { setTimeout(syncSignedIn); });

  var ICON = {
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    a11y: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="6.2" r="1.7" fill="currentColor"/><path d="M6.5 9.2l5.5 1.1 5.5-1.1M12 10.3v4.2m0 0l-2.6 4.7M12 14.5l2.6 4.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- header ----------
     o.active: overview | howwework | mapping | profiles | documents | unoffices | membership
     o.title: the page name under "Durable Solutions Hub | Sudan"
     o.sub: { label, items: [{ key, label, href }], active, end: "html for the right of the bar" } (optional)
     o.sub.stick: true keeps the second bar on screen while scrolling (long pages)
     o.acct: true on pages that load the sign-in (common.js) and draw the account button into #acct */
  function header(o) {
    o = o || {};
    var el = document.getElementById(o.el || "hub-header") || document.getElementById("site-header");
    if (!el) return;
    var sub = o.sub;
    var acct = o.acct ? '<div class="dropdown hx-acct" id="acct"></div>' : signInLink();
    var html =
      '<a class="hx-skip" href="#main">Skip to content</a>' +
      '<div class="hx-r">' +
        '<a class="hx-brand" href="' + ROOT + '" aria-label="Durable Solutions Hub, Sudan, home"><img src="' + ROOT + 'assets/img/un-sudan.png" alt="United Nations Sudan" width="153" height="42">' +
        '<span class="hx-t"><span class="hx-k">Durable Solutions Hub | Sudan</span><span class="hx-n">' + esc(o.title || "") + "</span></span></a>" +
        '<button type="button" class="hx-menu-btn" aria-expanded="false" aria-controls="hx-nav"><span aria-hidden="true">&#9776;</span> Menu</button>' +
        '<nav class="hx-nav" id="hx-nav" aria-label="Site">' + MAIN.map(function (m) { return navItem(m, o.active); }).join("") + "</nav>" +
        '<div class="hx-tools"><button type="button" class="hx-btn" id="hx-disp-btn" aria-expanded="false" aria-controls="hx-disp"><b aria-hidden="true">Aa</b> Display</button>' + acct + "</div>" +
        '<div class="hx-disp" id="hx-disp" role="dialog" aria-label="Display options" hidden>' +
          '<p class="hx-dt">Display</p>' +
          '<div class="hx-dr"><span>Background</span><span class="hx-seg" data-k="theme"><button type="button" data-v="light">White</button><button type="button" data-v="dark">Dark</button></span></div>' +
          '<div class="hx-dr"><span>Text size</span><span class="hx-seg" data-k="size"><button type="button" data-v="1">Normal</button><button type="button" data-v="1.15">Larger</button><button type="button" data-v="1.3">Largest</button></span></div>' +
          '<div class="hx-dr"><span>Colour-blind friendly</span><span class="hx-seg" data-k="cb"><button type="button" data-v="0">Off</button><button type="button" data-v="1">On</button></span></div>' +
          '<p class="hx-dn">Kept in this browser for every page.</p>' +
        "</div>" +
      "</div>" +
      (sub ? '<div class="hx-sub"><div class="hx-r">' + (sub.label ? '<span class="hx-sl">' + esc(sub.label) + "</span>" : "") +
        '<nav class="hx-sn" aria-label="' + esc(sub.label || "Section") + '">' + (sub.items || []).map(function (i) { return '<a href="' + i.href + '"' + (i.key && i.key === sub.active ? ' aria-current="page"' : "") + ">" + esc(i.label) + "</a>"; }).join("") + "</nav>" +
        (sub.end ? '<div class="hx-se">' + sub.end + "</div>" : "") + "</div></div>" : "");
    var h = document.createElement("header");
    h.className = "hx" + (sub && sub.stick ? " hx-stick" : ""); h.id = el.id || "hub-header"; h.innerHTML = html;
    el.replaceWith(h);
    bindHeader(h);
    return h;
  }
  function navItem(m, active) {
    if (!m.items) return '<a href="' + m.href + '"' + (m.key === active ? ' aria-current="page"' : "") + ">" + m.label + "</a>";
    var on = m.items.some(function (i) { return i.key === active; });
    return '<div class="hx-dd' + (on ? " on" : "") + '"><button type="button" class="hx-dd-btn" aria-expanded="false" aria-controls="hx-dd-' + m.key + '"' + (on ? ' data-current=""' : "") + ">" + m.label +
      '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="hx-dd-menu" id="hx-dd-' + m.key + '" role="group" aria-label="' + esc(m.label) + '">' + m.items.map(function (i) {
        return '<a href="' + i.href + '"' + (i.key === active ? ' aria-current="page"' : "") + '><span class="hx-dd-t">' + esc(i.label) + "</span>" + (i.note ? '<span class="hx-dd-n">' + esc(i.note) + "</span>" : "") + "</a>";
      }).join("") + "</div></div>";
  }
  function signInLink() {
    var s = null;
    try { s = JSON.parse(get("sf-session", "null")); if (!(s && s.token && s.expires > Date.now())) s = null; } catch (e) { s = null; }
    if (!s) return '<a class="hx-btn hx-in" href="' + ROOT + 'mapping/?signin=1">' + ICON.user + "<span>Sign in</span></a>";
    var parts = (s.name ? String(s.name).split(/\s+/) : String(s.email || "").split("@")[0].split(/[._-]+/)).filter(Boolean);
    var ini = ((parts[0] || "?")[0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
    var to = s.role === "members" ? ROOT + "membership/manage.html" : ROOT + "mapping/manage.html#/projects";
    return '<a class="hx-btn hx-me" href="' + to + '" title="Signed in as ' + esc(s.name || s.email) + '"><span class="hx-av" aria-hidden="true">' + esc(ini) + "</span><span>" + esc(s.name ? s.name.split(/\s+/)[0] : "My account") + "</span></a>";
  }
  function bindHeader(h) {
    var btn = h.querySelector("#hx-disp-btn"), panel = h.querySelector("#hx-disp");
    function close() { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    btn.onclick = function (e) { e.stopPropagation(); var open = panel.hidden; panel.hidden = !open; btn.setAttribute("aria-expanded", String(open)); if (open) applyDisplay(); };
    [].forEach.call(panel.querySelectorAll(".hx-seg button"), function (b) {
      b.onclick = function () {
        var k = b.parentNode.getAttribute("data-k"), v = b.getAttribute("data-v");
        if (k === "theme") setTheme(v); else { st[k] = v; applyDisplay(); }
      };
    });
    document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { close(); btn.focus(); } });
    // dropdowns in the main menu: open on click, close on outside click or Escape
    [].forEach.call(h.querySelectorAll(".hx-dd"), function (dd) {
      var b = dd.querySelector(".hx-dd-btn");
      function set(open) { dd.classList.toggle("open", open); b.setAttribute("aria-expanded", String(open)); }
      b.onclick = function (e) { e.stopPropagation(); set(!dd.classList.contains("open")); };
      document.addEventListener("click", function (e) { if (!dd.contains(e.target)) set(false); });
      dd.addEventListener("keydown", function (e) { if (e.key === "Escape" && dd.classList.contains("open")) { set(false); b.focus(); } });
      dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) set(false); });
    });
    var mb = h.querySelector(".hx-menu-btn"), nav = h.querySelector(".hx-nav");
    mb.onclick = function () { var open = !h.classList.contains("hx-open"); h.classList.toggle("hx-open", open); mb.setAttribute("aria-expanded", String(open)); };
    if (!document.getElementById("main")) { var m = document.querySelector("main"); if (m) m.id = "main"; }
    applyDisplay();
  }

  /* ---------- footer: two lines ----------
     o.src: the page's own sources or note (html), shown after the Durable Solutions Unit line */
  function footer(o) {
    o = o || {};
    var el = document.getElementById(o.el || "hub-footer") || document.getElementById("site-footer");
    if (!el) return;
    var f = document.createElement("footer");
    f.className = "fx"; f.id = el.id || "hub-footer";
    f.innerHTML = '<div class="fx-r"><div class="fx-1"><nav class="fx-nav" aria-label="Footer">' + FLAT.map(function (m) { return '<a href="' + m.href + '">' + m.label + "</a>"; }).join("") +
      '<a href="mailto:' + CONTACT + '">' + CONTACT + "</a></nav>" +
      '<div class="fx-end"><a class="fx-top" href="#">Go to top</a><details class="fx-a11y"><summary>' + ICON.a11y + "Accessibility</summary>" +
      '<div class="fx-a11y-b"><p>These pages are built to work with screen readers and keyboards:</p><ul><li>A "Skip to content" link, clear headings and landmarks.</li><li>Charts have a text version with all the figures.</li><li>Photos and icons have a description, or are marked as decoration.</li><li>Text and colours meet the WCAG 2.1 AA contrast level.</li><li>Use <b>Display</b> at the top for a dark background, larger text or colour-blind friendly colours.</li></ul><p>Something does not work for you? Email <a href="mailto:' + CONTACT + '">' + CONTACT + "</a>.</p></div></details></div></div>" +
      '<div class="fx-2">Durable Solutions Unit, United Nations Resident Coordinator’s Office, Sudan.' + (o.src ? " " + o.src : "") + "</div></div>";
    el.replaceWith(f);
    f.querySelector(".fx-top").onclick = function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); };
    return f;
  }

  /* ---------- dropdowns with rounded corners ----------
     HUB.niceSelect(select): keeps the native select (value, change events) and shows a rounded list instead of the browser's own */
  function niceSelect(sel) {
    if (!sel || sel._nice) return;
    sel._nice = true;
    var w = document.createElement("div"); w.className = "hs-sel";
    var wd = sel.offsetWidth, ht = sel.offsetHeight;
    if (wd) w.style.minWidth = wd + "px";
    sel.parentNode.insertBefore(w, sel); w.appendChild(sel);
    sel.classList.add("hs-sel-n"); sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
    var base = sel.id || "hs" + Math.random().toString(36).slice(2), lid = base + "-list";
    var lab = sel.getAttribute("aria-label") || "";
    var fl = sel.id && document.querySelector('label[for="' + sel.id + '"]');
    if (!lab && fl) lab = fl.textContent.trim();
    if (!lab && sel.closest("label")) { var t = ""; sel.closest("label").childNodes.forEach(function (n) { if (n.nodeType === 3) t += n.textContent; }); lab = t.trim(); }
    var b = document.createElement("button");
    b.type = "button"; b.className = "hs-sel-b"; b.id = base + "-btn";
    b.setAttribute("aria-haspopup", "listbox"); b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", lid);
    if (ht) b.style.minHeight = ht + "px";
    b.innerHTML = '<span class="hs-sel-t"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (fl) fl.htmlFor = b.id;
    var l = document.createElement("ul");
    l.className = "hs-sel-l"; l.id = lid; l.setAttribute("role", "listbox"); l.tabIndex = -1; l.hidden = true;
    if (lab) l.setAttribute("aria-label", lab);
    w.appendChild(b); w.appendChild(l);
    var act = -1, typed = "", tt;
    var esc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    function sync() { var o = sel.options[sel.selectedIndex]; b.firstChild.textContent = o ? o.text : ""; b.setAttribute("aria-label", (lab ? lab + ": " : "") + (o ? o.text : "")); }
    function build() {
      l.innerHTML = Array.prototype.map.call(sel.options, function (o, i) {
        return '<li role="option" id="' + lid + "-" + i + '" data-i="' + i + '" aria-selected="' + (i === sel.selectedIndex) + '"' + (o.disabled ? ' aria-disabled="true"' : "") + (o.hidden ? " hidden" : "") + ">" + esc(o.text) + "</li>";
      }).join("");
    }
    function setAct(i) {
      var lis = l.children; if (!lis.length) return;
      act = Math.max(0, Math.min(lis.length - 1, i));
      for (var k = 0; k < lis.length; k++) lis[k].classList.toggle("on", k === act);
      l.setAttribute("aria-activedescendant", lis[act].id);
      var li = lis[act];
      if (li.offsetTop < l.scrollTop) l.scrollTop = li.offsetTop - 6;
      else if (li.offsetTop + li.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = li.offsetTop + li.offsetHeight - l.clientHeight + 6;
    }
    function outside(e) { if (!w.contains(e.target)) close(false); }
    function open() {
      build(); l.hidden = false; b.setAttribute("aria-expanded", "true"); w.classList.add("open");
      var r = b.getBoundingClientRect(), below = innerHeight - r.bottom;
      w.classList.toggle("up", below < 280 && r.top > below);
      setAct(Math.max(0, sel.selectedIndex)); l.focus({ preventScroll: true });
      document.addEventListener("mousedown", outside, true);
    }
    function close(f) { if (l.hidden) return; l.hidden = true; b.setAttribute("aria-expanded", "false"); w.classList.remove("open"); document.removeEventListener("mousedown", outside, true); if (f) b.focus(); }
    function pick(i) {
      var o = sel.options[i]; if (!o || o.disabled) return;
      var ch = sel.selectedIndex !== i; sel.selectedIndex = i; sync(); close(true);
      if (ch) sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    b.addEventListener("click", function () { if (l.hidden) open(); else close(true); });
    b.addEventListener("keydown", function (e) { if (["ArrowDown", "ArrowUp", "Enter", " "].indexOf(e.key) >= 0) { e.preventDefault(); open(); } });
    l.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowDown") { e.preventDefault(); setAct(act + 1); }
      else if (k === "ArrowUp") { e.preventDefault(); setAct(act - 1); }
      else if (k === "Home") { e.preventDefault(); setAct(0); }
      else if (k === "End") { e.preventDefault(); setAct(l.children.length - 1); }
      else if (k === "Enter" || k === " ") { e.preventDefault(); pick(act); }
      else if (k === "Escape") { e.preventDefault(); close(true); }
      else if (k === "Tab") close(false);
      else if (k.length === 1) {
        typed += k.toLowerCase(); clearTimeout(tt); tt = setTimeout(function () { typed = ""; }, 700);
        for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text.toLowerCase().indexOf(typed) === 0) { setAct(i); break; }
      }
    });
    l.addEventListener("click", function (e) { var li = e.target.closest("li"); if (li) pick(+li.dataset.i); });
    l.addEventListener("mousemove", function (e) { var li = e.target.closest("li"); if (li && +li.dataset.i !== act) setAct(+li.dataset.i); });
    l.addEventListener("focusout", function (e) { if (!w.contains(e.relatedTarget)) close(false); });
    // stay in step when the page sets the value or changes the options
    ["value", "selectedIndex"].forEach(function (p) {
      var d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, p);
      Object.defineProperty(sel, p, { configurable: true, get: function () { return d.get.call(sel); }, set: function (v) { d.set.call(sel, v); sync(); } });
    });
    sel.addEventListener("change", sync);
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, attributes: true });
    sync();
    return w;
  }

  window.HUB = { header: header, footer: footer, setTheme: setTheme, root: ROOT, niceSelect: niceSelect };
})();
