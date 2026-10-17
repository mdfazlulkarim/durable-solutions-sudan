"""Build data/projects.json from one or more exports of the SharePoint list
"Sudan DS Interventions".

Usage:
    python3 scripts/build_data.py data/source/export1.xlsx [data/source/export2.xlsx ...]

Later files win when the same project (same agency and name) appears twice,
but empty cells never overwrite filled ones.

Only public fields are written. Focal point names and email addresses are
never copied to the public data. Keep the raw exports in data/source/, which
is excluded from the repository by .gitignore.

The clean-up rules follow Annex B of the business requirements and are listed
in data/cleaning-log.md, which this script rewrites each time it runs.
"""

import datetime as dt
import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "projects.json"
LOG = ROOT / "data" / "cleaning-log.md"

LAST_UPDATED = "2026-10-10"  # date shown as "Last updated" on the site

STATES = [
    "Aj Jazirah", "Blue Nile", "Central Darfur", "East Darfur", "Gedaref", "Kassala",
    "Khartoum", "North Darfur", "North Kordofan", "Northern", "Red Sea", "River Nile",
    "Sennar", "South Darfur", "South Kordofan", "West Darfur", "West Kordofan", "White Nile",
]
STATE_FIX = {
    "al jazirah": "Aj Jazirah", "al jazeera": "Aj Jazirah", "gezira": "Aj Jazirah",
    "northern state": "Northern", "kassala sate": "Kassala",
}
# Towns entered as states: recorded as a locality, and the state they sit in is added
TOWN_TO_STATE = {"dongola": ("Northern", "Dongola")}
NATIONWIDE = {"all", "nationwide", "national"}

# Corrections to project names (spelling, and a donor entered as a project name)
NAME_FIX = {
    "Lietchenstein Contribution to Sudan CRP 2026": "Liechtenstein Contribution to Sudan CRP 2026",
    "Legal Assitance": "Legal Assistance",
    "Rehabilitation of two health center": "Rehabilitation of two health centres",
    "Sudan EU IGAD Platform programme-Kassala Sate": "Sudan EU IGAD Platform programme, Kassala State",
    "Mastercard Foundation": "UNHCR project funded by Mastercard Foundation",
}
DONOR_FIX = {"The Government of Netherlands": "Government of the Netherlands"}
DONOR_FROM_NAME = {"Mastercard Foundation": "Mastercard Foundation"}
PARTNER_FIX = {"UN HABITAT": "UN-Habitat"}
COORD_FIX = {"legal aid working group": "Legal Aid Working Group", "health": "Health Cluster"}

# The eight IASC criteria. Keywords are matched against what organisations entered.
CRITERIA = [
    (1, "Safety and security", ["safety", "security", "social cohesion", "protection", "disaster", "mine action"]),
    (2, "Adequate standard of living", ["standard of living", "education", "critical infrastructure",
                                        "reconstruction", "basic service", "health", "water"]),
    (3, "Access to livelihoods and employment", ["livelihood", "employment", "vocational"]),
    (4, "Housing, land and property", ["housing", "land and property", "hlp", "shelter"]),
    (5, "Access to documentation", ["documentation", "legal services", "legal counselling"]),
    (6, "Family reunification", ["family reunification", "family reunion"]),
    (7, "Participation in public affairs", ["participation", "grassroots", "public affairs"]),
    (8, "Access to effective remedies and justice", ["remedies", "justice"]),
]
STANDARD_LABELS = {c[1].lower() for c in CRITERIA} | {
    "access to livelihoods", "adequate standard of living", "safety and security",
    "access to documentation", "family reunification", "restoration of housing, land and property",
}

log = {"criteria": {}, "notes": []}


def clean_text(v):
    if v is None:
        return None
    s = re.sub(r"\s+", " ", str(v)).strip()
    if s.upper() in {"", "N/A", "NA", "NONE", "-"}:
        return None
    return s


def to_number(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = clean_text(v)
    if s is None:
        return None
    s = s.replace("$", "").replace(",", "").replace("USD", "").strip()
    try:
        return float(s)
    except ValueError:
        return None


def to_date(v):
    if v is None:
        return None
    if isinstance(v, dt.datetime):
        return v.date()
    if isinstance(v, dt.date):
        return v
    s = clean_text(v)
    if not s:
        return None
    m = re.match(r"^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$", s)
    if m:
        a, b, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        day, month = (a, b) if b <= 12 else (b, a)  # 6.25.2026 is month first
        return dt.date(y, month, day)
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    return None


def split_multi(v, commas=True):
    s = clean_text(v)
    if not s:
        return []
    pattern = r";#|;|," if commas else r";#|;"  # criteria names contain commas
    return [p.strip() for p in re.split(pattern, s) if p.strip()]


def map_criteria(raw, project):
    found = set()
    for token in split_multi(raw, commas=False):
        main, _, sub = token.partition(":")
        hits = match_criteria(main) or match_criteria(sub)
        if token.lower() not in STANDARD_LABELS:
            log["criteria"].setdefault(token, set()).update(hits)
        if not hits:
            log["notes"].append(f"{project}: criterion '{token}' did not match any of the eight and was dropped.")
        found |= hits
    return sorted(found)


def match_criteria(text):
    t = text.lower().strip()
    if not t:
        return set()
    for num, label, keys in CRITERIA:  # exact label first
        if t == label.lower():
            return {num}
    return {num for num, _, keys in CRITERIA if any(k in t for k in keys)}


def parse_states(raw, project):
    states, localities, nationwide = [], [], False
    for token in split_multi(raw):
        key = token.lower()
        if key in NATIONWIDE:
            nationwide = True
            continue
        if key in TOWN_TO_STATE:
            st, town = TOWN_TO_STATE[key]
            states.append(st)
            localities.append(town)
            log["notes"].append(f"{project}: '{token}' was entered as a state; recorded as a locality in {st}.")
            continue
        st = STATE_FIX.get(key) or next((s for s in STATES if s.lower() == key), None)
        if st:
            if st != token:
                log["notes"].append(f"{project}: state '{token}' standardised to '{st}'.")
            states.append(st)
        else:
            log["notes"].append(f"{project}: unknown state '{token}' was dropped.")
    return sorted(set(states)), localities, nationwide


def parse_partners(raw, lead):
    s = clean_text(raw)
    if not s:
        return []
    parts = re.split(r",|;|&|\band\b", s)
    out = []
    for p in parts:
        p = p.strip(" .")
        if not p:
            continue
        p = PARTNER_FIX.get(p.upper(), p)
        if lead and p.lower() == lead.lower():
            continue
        if p not in out:
            out.append(p)
    return out


def status_text(v):
    s = clean_text(v)
    if not s:
        return None
    k = s.lower().replace(" ", "")
    return {"ongoing": "Ongoing", "ended": "Ended", "pipeline": "Pipeline"}.get(k, s)


def read_rows(path):
    wb = openpyxl.load_workbook(path, data_only=True)  # cached formula values
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    header = [clean_text(h) for h in rows[0]]
    for r in rows[1:]:
        rec = dict(zip(header, r))
        if clean_text(rec.get("Project / Programme Name")):
            yield rec


def merge(records):
    merged = {}
    for rec in records:
        key = (clean_text(rec.get("UN Agency")) or "", clean_text(rec.get("Project / Programme Name")).lower())
        if key not in merged:
            merged[key] = dict(rec)
        else:
            for k, v in rec.items():
                if clean_text(v) is not None:
                    merged[key][k] = v
    return list(merged.values())


def build(rec):
    raw_name = clean_text(rec["Project / Programme Name"])
    name = NAME_FIX.get(raw_name, raw_name)
    if name != raw_name:
        log["notes"].append(f"Project name '{raw_name}' changed to '{name}'.")
    lead = clean_text(rec.get("UN Agency"))
    states, localities, nationwide = parse_states(rec.get("State(s) Covered"), name)

    budget = to_number(rec.get("Total Budget (USD)"))
    share = to_number(rec.get("% of Budget Towards Durable Solutions"))
    ds = to_number(rec.get("Durable Solutions Amount (USD)"))
    if share is not None and share > 100 and budget is None:
        log["notes"].append(f"{name}: {share:,.0f} was entered as the share towards durable solutions; moved to total budget.")
        budget, share = share, None
    if share is not None and share > 1:
        share = share / 100
    if ds is None and budget is not None and share is not None:
        ds = budget * share
        log["notes"].append(f"{name}: funding towards durable solutions calculated as budget x share.")
    if share is None and ds is not None and budget:
        share = ds / budget

    people_cols = [("total", "Total Beneficiaries (Planned/Reached)"), ("idps", "# IDPs"),
                   ("returnees", "# Returnees"), ("refugees", "# Refugees"),
                   ("host", "# Host Community"), ("other", "# Other")]
    people = {k: to_number(rec.get(c)) for k, c in people_cols}
    if not any(v for v in people.values()):  # blank or all zero means not reported
        people = {k: None for k in people}

    donor = clean_text(rec.get("Funding Source / Donor")) or DONOR_FROM_NAME.get(raw_name)
    donor = DONOR_FIX.get(donor, donor)
    coord = clean_text(rec.get("Coordination Mechanism / Cluster"))
    coord = COORD_FIX.get((coord or "").lower(), coord)
    start, end = to_date(rec.get("Start Date")), to_date(rec.get("End Date"))

    pid = re.sub(r"[^a-z0-9]+", "-", f"{lead}-{name}".lower()).strip("-")[:70]
    return {
        "id": pid,
        "name": name,
        "description": None,
        "interventionTypes": [],
        "lead": lead,
        # The SharePoint column for the lead organisation is "UN Agency"
        "orgType": "UN agency" if lead else None,
        "partners": parse_partners(rec.get("Implementing Partner(s)"), lead),
        "nationwide": nationwide and not states,
        "states": states,
        "localities": localities,
        "criteria": map_criteria(rec.get(
            "IASC 8 criteria does your project/programme contribute to? (select all that apply)"), name),
        "coordination": coord,
        "start": start.isoformat() if start else None,
        "end": end.isoformat() if end else None,
        "reportedStatus": status_text(rec.get("Status")),
        "budget": round(budget, 2) if budget is not None else None,
        "share": round(share, 4) if share is not None else None,
        "dsFunding": round(ds, 2) if ds is not None else None,
        "donor": donor,
        "people": {k: (int(v) if v is not None else None) for k, v in people.items()},
        "remarks": clean_text(rec.get("Remarks / Notes")),
    }


def write_log(projects):
    lines = ["# Data clean-up log", "",
             f"Generated by `scripts/build_data.py`. {len(projects)} projects published. "
             f"Last updated date shown on the site: {LAST_UPDATED}.", "",
             "## Criteria entered outside the eight IASC criteria", "",
             "| Entered | Mapped to |", "|---|---|"]
    names = {c[0]: f"{c[0]}. {c[1]}" for c in CRITERIA}
    for token, hits in sorted(log["criteria"].items()):
        mapped = ", ".join(names[h] for h in sorted(hits)) or "Dropped"
        lines.append(f"| {token} | {mapped} |")
    lines += ["", "## Other changes", ""] + [f"- {n}" for n in dict.fromkeys(log["notes"])]
    LOG.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main(paths):
    records = [rec for p in paths for rec in read_rows(p)]
    projects = [build(r) for r in merge(records)]
    projects.sort(key=lambda p: (p["lead"] or "", p["name"]))
    OUT.write_text(json.dumps({"lastUpdated": LAST_UPDATED, "projects": projects},
                              ensure_ascii=False, indent=1), encoding="utf-8")
    write_log(projects)
    print(f"Wrote {OUT} with {len(projects)} projects; log in {LOG}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
