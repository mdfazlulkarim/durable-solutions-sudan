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

- `women.html`: **Women and girls**, with key figures and their sources (`data/women.json`), the funding gap, why investing in women pays off, who is doing what, projects on the map that focus on women and girls, stories chosen by DSU (`data/stories.json`, edited on the Stories page of the manage pages) and the latest ReliefWeb reports. When copying site code from `durablesolutionshub`, keep these files.
