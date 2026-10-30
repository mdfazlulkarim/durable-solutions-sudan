# Solutions Footprint | Durable Solutions Hub | Sudan

A public map of projects that contribute to durable solutions in Sudan, measured against the eight IASC criteria, for the Durable Solutions Working Group (DSWG).

Live site: https://mdfazlulkarim.github.io/durable-solutions-sudan/
Main site: https://durablesolutionshub.org/sudan/mapping/

Contact: [dswg.sd@undp.org](mailto:dswg.sd@undp.org)

## How this copy works

This repository is a second copy of the site in the [durablesolutionshub](https://github.com/mdfazlulkarim/durablesolutionshub) repository (folder `sudan/mapping/`). Both sites share one back end, one database, one approved-editors list, one review queue and one change log.

- **Data:** every change published from the manage pages (on either site) is committed to both repositories in the same moment, so `data/`, `assets/photos/` and `assets/img/logos/` stay identical. Do not edit the data files here by hand.
- **Code:** the site code is maintained in `durablesolutionshub` and copied here. The back end (Cloudflare Worker) and the full documentation are in that repository.
- **Signing in:** the Sign in button sends a 6-digit code to approved emails. DSU admins manage everything; agency admins see and edit their own agency's projects, and their changes wait for DSU review.

## Pages only on this site

- `women.html`: **Women and girls**, with key figures and their sources (`data/women.json`), the funding gap, why investing in women pays off, who is doing what, projects on the map that focus on women and girls, stories chosen by DSU (`data/stories.json`, edited on the Stories page of the manage pages) and the latest ReliefWeb reports. When copying site code from `durablesolutionshub`, keep these files. While it is under development, only the owners and the people added as **Early access** on the Approved editors page can open it; everyone else sees a short note with the contact for early access. The list is kept on the back end, never in this repository.
- `abc.html`: **Area-based approaches and coordination**, not linked from the menu. Area-based approaches (ABA) and area-based coordination (ABC) side by side, why they matter and how they work together (with sources), one map of Sudan by state and locality (population, people in need, IDPs, returnees, basic services, food insecurity, organisations present, and the projects on the Solutions Footprint and from the Sudan Humanitarian Fund), a ranking of localities for where to invest, and a project planner that keeps up to 20 plans in the browser and shares any plan as a link. Code: `assets/js/abc.js`, `assets/css/abc.css`. Data: `data/abc/`. When copying site code from `durablesolutionshub`, keep these files.

## Refreshing the area-based coordination data

The page reads `data/abc/*.json`, built from public sources: UNFPA population (COD-PS), OCHA people in need (HNRP), IOM DTM, OCHA 3W, HeiGIT access to services, OpenStreetMap facilities, FEWS NET and the Sudan Humanitarian Fund. To update them, open **Actions > Refresh area-based coordination data > Run workflow**. It downloads the latest files (`scripts/abc_fetch.py`), rebuilds the data (`scripts/build_abc_points.js`, `scripts/build_abc_data.py`) and commits `data/abc/` only if something changed.

- The Aj Jazirah water sources (`data/abc/aj-jazirah-water-sources-2026-08.json`) come from a state table in Arabic, digitised by hand. Replace the file when a new table arrives.
- Locality shapes for the page (`data/abc/localities-geo.json`) only need rebuilding when the boundary files change: `node scripts/build_abc_geo.js`.
