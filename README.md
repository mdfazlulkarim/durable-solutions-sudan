# Solutions Footprint | Durable Solutions Hub | Sudan

A public dashboard of projects that contribute to durable solutions in Sudan, mapped against the eight IASC criteria. Built for the Durable Solutions Working Group (DSWG), with the Durable Solutions Unit (DSU), RCO Sudan, as product owner.

This repository holds **Phase 1: the map explorer** and the **"Add your project" form**, in English.

Live site (once GitHub Pages is on): `https://mdfazlulkarim.github.io/durable-solutions-sudan/`

Contact: [dswg.sd@undp.org](mailto:dswg.sd@undp.org)

## What is in Phase 1

- Map of the 18 states, shaded by projects, organisations or funding towards durable solutions, with a solutions ring per state (eight IASC segments, grey for a gap).
- Separate band for nationwide projects.
- Summary figures, a state panel, project details and "Suggest a correction".
- Filters: search, IASC criteria, intervention type, organisation type and name, status, minimum share towards durable solutions, target group, geographic scope, donor and coordination mechanism, with counts and removable tags.
- Time window with quick choices, a year range and a chart of projects active per quarter.
- Download of the filtered data as CSV or Excel.
- "Add your project" form, which opens a pre-filled email to dswg.sd@undp.org with a copy to the submitter.

The Projects and Gaps views (Phases 2 and 3) are not built yet. Their menu links are commented out in `assets/js/common.js` (`SF.renderHeader`).

## How it is built

A plain static site: HTML, CSS and JavaScript with no framework and no build step, so it stays light on slow connections and costs nothing to host.

```
index.html              Map explorer
add.html                "Add your project" form (also used for corrections)
about.html              About the data
assets/css/style.css    All styles
assets/js/common.js     Shared settings: contact email, IASC criteria and colours, states, lists, header and footer
assets/js/app.js        Map explorer logic
assets/js/form.js       Form logic and the email it builds
assets/vendor/          SheetJS (Excel download), loaded only when someone downloads Excel
assets/img/             UN Sudan logo (placeholder until the site moves to un.org) and favicon
data/projects.json      The published project data (public fields only)
data/geo.json           Pre-drawn state boundaries for the map
data/cleaning-log.md    Every change made to the source data before publication
data/boundaries/        Boundary source file used to build data/geo.json
scripts/build_data.py   Turns SharePoint exports into data/projects.json
scripts/build_geo.js    Turns a boundary file into data/geo.json
```

## Handover note

### Update the data

1. Export the SharePoint list "Sudan DS Interventions" to Excel.
2. Save the export in `data/source/`. This folder is excluded from the repository, because the export contains focal point names and emails.
3. Run:
   ```
   pip install openpyxl
   python3 scripts/build_data.py data/source/<export>.xlsx
   ```
   You can pass several files; later files fill in or update earlier ones.
4. Set `LAST_UPDATED` at the top of `scripts/build_data.py` to the date of the export before running it.
5. Check `data/cleaning-log.md`, then commit `data/projects.json` and `data/cleaning-log.md`. The site updates within a minute or two.

### Publish an approved project

Submissions arrive by email at dswg.sd@undp.org. Once DSU approves one:

- **Preferred:** add it to the SharePoint list and re-run the data update above.
- **Quick fix:** edit `data/projects.json` directly on GitHub. Copy an existing project block, give it a unique `id`, and fill in the fields. Leave unknown values as `null` or `[]`. `criteria` uses the numbers 1 to 8. Dates use `YYYY-MM-DD`. `share` is a fraction (0.4 means 40%).

Then tell the submitter the project is live.

### Change text

- Interface text is in the HTML files and in `assets/js/app.js` and `assets/js/form.js`.
- The contact email, IASC criteria names, colours and examples are in `assets/js/common.js` (`SF.config`, `SF.CRITERIA`).

### Add a filter option

Fixed lists (intervention types, organisation types, target groups, coordination mechanisms for the form) are in `assets/js/common.js`. Donor and coordination filters on the map are built automatically from the data. To add a new filter group, add an entry to `GROUP_META` and a matching test to `GROUPS` in `assets/js/app.js`.

### Replace the boundaries

The map uses geoBoundaries (gbOpen, CC BY 4.0), simplified, for illustration. To use the official OCHA boundaries, save the state-level (admin 1) GeoJSON in `data/boundaries/` and run:

```
npm install d3-geo topojson-server topojson-simplify topojson-client polylabel
node scripts/build_geo.js data/boundaries/<file>.geojson
```

State names are matched in `NAME_FIX` at the top of `scripts/build_geo.js`.

## Data rules

- States come from a fixed list of 18. Towns entered as states are recorded as localities.
- IASC criteria come from the fixed list of eight. Other entries are matched to the closest criterion (see `data/cleaning-log.md`).
- A project in several states counts once in each state; its funding is split equally across them for state totals.
- Nationwide projects are counted separately from state totals.
- Funding towards durable solutions is budget times share, unless the organisation gives an amount.
- Status follows the dates and is worked out in the browser each day.
- Fields that are not reported are left empty.
- Focal point names and emails are never published. Every project shows dswg.sd@undp.org as its contact.

## Publish with GitHub Pages

Settings, then Pages, then "Deploy from a branch", branch `main`, folder `/ (root)`.

To embed on sudan.un.org:

```html
<iframe src="https://mdfazlulkarim.github.io/durable-solutions-sudan/" title="Solutions Footprint" style="width:100%;height:1900px;border:0" loading="lazy"></iframe>
```

## Credits

- Boundaries: [geoBoundaries](https://www.geoboundaries.org), CC BY 4.0.
- Excel export: [SheetJS Community Edition](https://sheetjs.com), Apache 2.0.
- Typeface: IBM Plex Sans, SIL Open Font License.

The boundaries and names shown and the designations used on the map do not imply official endorsement or acceptance by the United Nations.
